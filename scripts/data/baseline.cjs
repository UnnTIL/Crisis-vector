'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '../..');
const PILOT = ['PRT', 'DEU', 'USA', 'BRA', 'MWI'];
const SERIES = ['SP.POP.TOTL','SP.URB.TOTL.IN.ZS','NY.GDP.MKTP.CD','NY.GDP.PCAP.CD','GC.TAX.TOTL.GD.ZS','SH.MED.BEDS.ZS','GB.XPD.RSDV.GD.ZS','NE.TRD.GNFS.ZS'];
const UNITS = ['persons','percent_population','current_USD','current_USD_per_person','percent_GDP','beds_per_1000_people','percent_GDP','percent_GDP'];
const LEGACY_TERMS='https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets';
const DATASET_TERMS='https://www.worldbank.org/ext/en/legal/terms-conditions/datasets';
const termsUrl=catalog=>catalog.termsUrl??LEGACY_TERMS;
const UNIT_LABELS = {
  persons:['people','persons','number'], percent_population:['%','percent','percentage','% of total population'],
  current_USD:['current US$','current USD','USD','US$'],
  current_USD_per_person:['current US$','current USD','USD','US$','current US$ per capita','current USD per person'],
  percent_GDP:['%','percent','% of GDP','percent of GDP'],
  beds_per_1000_people:['per 1,000 people','per 1000 people','beds per 1,000 people','beds per 1000 people']
};
function calendarDate(value,label) {
  assert.equal(typeof value,'string',label);
  assert.match(value,/^\d{4}-\d{2}-\d{2}$/,label);
  assert.ok(Number.isFinite(Date.parse(value)),label);
  assert.equal(new Date(value).toISOString().slice(0,10),value,label);
}
function stableStringify(value) {
  function sort(v) {
    if (typeof v === 'number') assert.ok(Number.isFinite(v), 'Non-finite number');
    if (Array.isArray(v)) return v.map(sort);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])]));
    assert.notEqual(v, undefined, 'Undefined is not JSON data');
    return v;
  }
  return JSON.stringify(sort(value), null, 2) + '\n';
}
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const json = bytes => JSON.parse(Buffer.from(bytes).toString('utf8'));
function timestamp(value, label) {
  assert.equal(typeof value, 'string', label);
  assert.match(value, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/, label);
  assert.ok(Number.isFinite(Date.parse(value)), label);
  assert.equal(new Date(value).toISOString().slice(0,10), value.slice(0,10), label);
  return Date.parse(value);
}
function validateConfig(catalog, countryMap, licenseReview) {
  assert.equal(catalog.schemaVersion, 'baseline-v1');
  assert.equal(catalog.sourceId, '2');
  assert.match(catalog.dataVersion, /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/);
  calendarDate(catalog.freezeDate,'freezeDate');
  assert.equal(catalog.startYear, 1960);
  assert.deepEqual(catalog.indicators.map(i=>i.series), SERIES);
  assert.deepEqual(catalog.indicators.map(i=>i.unit), UNITS);
  assert.equal(new Set(catalog.indicators.map(i=>i.key)).size, 8);
  assert.deepEqual(countryMap.countries.map(c=>c.iso3), PILOT);
  assert.equal(countryMap.schemaVersion, 'baseline-country-map-v1');
  for (const c of countryMap.countries) {
    assert.equal(c.internalId, c.iso3); assert.equal(c.sourceId, c.iso3);
    assert.ok(c.name.length > 0);
  }
  assert.equal(licenseReview.schemaVersion, 'baseline-license-review-v1');
  assert.ok([LEGACY_TERMS,DATASET_TERMS].includes(termsUrl(catalog)),'Unknown dataset terms URL');
  if(termsUrl(catalog)===LEGACY_TERMS) {
    assert.equal(catalog.dataVersion,'1.0.0-pilot','Only the archived edition may use legacy terms');
    assert.equal(catalog.freezeDate,'2026-11-12');
    assert.ok(Object.values(licenseReview.series).every(r=>r.status!=='verified'),'Legacy website terms cannot clear dataset redistribution');
  }
  assert.equal(licenseReview.termsUrl,termsUrl(catalog));
  assert.deepEqual(Object.keys(licenseReview.series).sort(), [...SERIES].sort());
  for (const i of catalog.indicators) {
    assert.equal(i.min, 0);
    assert.equal(i.max, ['urbanization','research'].includes(i.key) ? 100 : null);
  }
}
function checkPage(payload, label) {
  assert.ok(Array.isArray(payload) && payload.length === 2, `${label}: API response must contain metadata and rows`);
  const [meta, rows] = payload;
  assert.equal(Number(meta.page), 1, `${label}: page`);
  assert.equal(Number(meta.pages), 1, `${label}: incomplete pagination`);
  assert.ok(Array.isArray(rows), `${label}: rows`);
  assert.equal(Number(meta.total), rows.length, `${label}: total`);
  return {meta, rows};
}
function validateAcquisition(acquisition, resources, catalog) {
  assert.equal(acquisition.schemaVersion, 'baseline-inputs-v1');
  assert.equal(acquisition.freezeDate, catalog.freezeDate);
  const cutoff = Date.parse(catalog.freezeDate + 'T23:59:59.999Z');
  assert.ok(timestamp(acquisition.startedAt,'startedAt') <= cutoff, 'Acquisition after freeze date requires a new version');
  assert.ok(timestamp(acquisition.completedAt,'completedAt') >= Date.parse(acquisition.startedAt));
  assert.ok(Date.parse(acquisition.completedAt) <= cutoff, 'Acquisition after freeze date');
  const ids = new Set();
  for (const q of acquisition.queries) {
    assert.match(q.id, /^[A-Za-z0-9._-]+$/);
    assert.ok(!ids.has(q.id), 'Duplicate query ID'); ids.add(q.id);
    assert.ok(['ok','blocked','error'].includes(q.status), 'Unknown query status');
    assert.ok(['source','countries','country-metadata','indicator-metadata','series-metadata','observations','terms','documentation'].includes(q.kind),'Unknown query kind');
    assert.ok(['indicator-metadata','series-metadata','observations'].includes(q.kind)?SERIES.includes(q.series):q.series===null,'Query series scope');
    const url = new URL(q.url);
    assert.equal(url.protocol, 'https:');
    assert.ok(['api.worldbank.org','www.worldbank.org','datahelpdesk.worldbank.org'].includes(url.hostname), 'Unexpected source host');
    assert.equal(url.username, ''); assert.equal(url.password, '');
    if(q.kind==='terms')assert.equal(q.url,termsUrl(catalog),'Terms evidence URL');
    if(q.kind==='documentation')assert.equal(q.url,'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation','Documentation URL');
    if(['source','countries','country-metadata','indicator-metadata','series-metadata','observations'].includes(q.kind)) {
      assert.equal(url.hostname,'api.worldbank.org');
      const countries=PILOT.join(';');
      const expected={source:'/v2/source/2',countries:`/v2/country/${countries}`,'country-metadata':`/v2/sources/2/country/${countries}/metadata`,
        'indicator-metadata':`/v2/indicator/${q.series}`,'series-metadata':`/v2/sources/2/series/${q.series}/metadata`,
        observations:`/v2/country/${countries}/indicator/${q.series}`};
      assert.equal(url.pathname,expected[q.kind],'Source query identity');
      assert.equal(url.searchParams.get('format'),'json');
      if(['indicator-metadata','observations'].includes(q.kind))assert.equal(url.searchParams.get('source'),'2');
      if(q.kind==='observations')assert.equal(url.searchParams.get('date'),`${catalog.startYear}:${catalog.freezeDate.slice(0,4)}`);
    }
    assert.equal(typeof q.attempted, 'boolean');
    if (q.attempted) {
      const start = timestamp(q.requestedAt,'requestedAt'), end = timestamp(q.completedAt,'completedAt');
      assert.ok(start >= Date.parse(acquisition.startedAt) && end >= start && end <= Date.parse(acquisition.completedAt));
    } else {
      assert.equal(q.requestedAt,null); assert.equal(q.completedAt,null);
      assert.notEqual(q.status,'ok');
    }
    if (q.status === 'ok') {
      assert.equal(q.attempted,true); assert.equal(q.httpStatus,200);
      assert.equal(typeof q.file,'string');
      assert.ok(!path.isAbsolute(q.file) && !q.file.split(/[\\/]/).includes('..'), 'Unsafe source path');
      assert.ok(resources[q.id], `Missing frozen input ${q.id}`);
      assert.equal(sha256(resources[q.id]), q.sha256, `Checksum mismatch: ${q.id}`);
      if(q.finalUrl) {
        const final=new URL(q.finalUrl);
        assert.equal(final.protocol,'https:');
        assert.ok(['api.worldbank.org','www.worldbank.org','worldbank.org','datahelpdesk.worldbank.org'].includes(final.hostname),'Unexpected final source host');
        if(q.kind==='terms' && termsUrl(catalog)===DATASET_TERMS)assert.equal(q.finalUrl,DATASET_TERMS,'Dataset terms redirected away from the dataset license');
      }
    } else {
      assert.equal(q.file,null); assert.equal(q.sha256,null);
      assert.ok(q.errorCode, 'Missing failure reason');
    }
    if(q.status==='blocked') {
      assert.equal(q.httpStatus,null,'Proxy refusal is not an upstream HTTP response');
      if(q.attempted) {
        assert.equal(q.errorCode,'proxy_connect_denied','Blocked request needs explicit denial evidence');
        assert.equal(q.proxyStatus,403);
      } else assert.equal(q.errorCode,'host_blocked_after_denial');
    }
  }
  for (const q of acquisition.queries.filter(q=>!q.attempted)) {
    const evidence = acquisition.queries.find(e=>e.id===q.evidenceRequestId);
    assert.ok(evidence && evidence.attempted && evidence.status==='blocked', 'Missing evidence for unattempted query');
    assert.equal(new URL(evidence.url).hostname,new URL(q.url).hostname);
  }
}
function queryFor(acquisition, kind, series=null) {
  const found = acquisition.queries.filter(q=>q.kind===kind && (q.series??null)===series);
  assert.equal(found.length,1, `Expected exactly one ${kind}/${series} query`);
  return found[0];
}
function parseSeriesMetadata(payload,series) {
  assert.equal(Number(payload.page),1,'Series metadata page');
  assert.equal(Number(payload.pages),1,'Incomplete series metadata');
  assert.ok(Array.isArray(payload.source) && payload.source.length===1,'Series metadata source');
  assert.equal(String(payload.source[0].id),'2','Series metadata must be WDI');
  const concepts=payload.source[0].concept;
  assert.ok(Array.isArray(concepts));
  const variables=concepts.filter(c=>c.id==='Series').flatMap(c=>c.variable??[]);
  assert.equal(variables.length,1,'Series metadata must identify one series');
  assert.equal(variables[0].id,series,'Series metadata identity');
  const fields=variables[0].metatype;
  assert.ok(Array.isArray(fields));
  assert.equal(Number(payload.total),fields.length,'Incomplete series metadata fields');
  const result={};
  for(const field of fields) {
    assert.equal(typeof field.id,'string');assert.equal(typeof field.value,'string');
    assert.ok(!Object.hasOwn(result,field.id),'Duplicate metadata field');
    Object.defineProperty(result,field.id,{value:field.value,enumerable:true});
  }
  return result;
}
function permitted(review, acquisition, resources, cutoff, series, modern=false) {
  assert.ok(['pending_review','verified','restricted'].includes(review.status), 'License review status');
  if (review.status !== 'verified') {
    assert.equal(review.commercialUse, 'not_cleared');
    return false;
  }
  assert.equal(review.commercialUse,'allowed');
  assert.equal(review.thirdPartyExceptionsReviewed,true, 'Third-party exceptions not reviewed');
  assert.ok(timestamp(review.reviewedAt,'license reviewedAt') <= cutoff);
  assert.ok(typeof review.licenseId==='string' && review.licenseId.length>0);
  assert.ok(typeof review.attribution==='string' && review.attribution.length>0);
  assert.ok(review.evidence.length>0, 'License approval lacks evidence');
  let termsEvidence=false,seriesEvidence=false,licenseEvidence=false;
  for (const evidence of review.evidence) {
    const q = acquisition.queries.find(q=>q.id===evidence.queryId);
    assert.ok(q && q.status==='ok' && ['terms','series-metadata','indicator-metadata'].includes(q.kind), 'License evidence not retrieved');
    assert.equal(evidence.sha256,q.sha256);
    assert.ok(evidence.excerpt && Buffer.from(resources[q.id]).toString('utf8').includes(evidence.excerpt), 'License excerpt not in frozen evidence');
    assert.ok(Date.parse(review.reviewedAt)>=Date.parse(q.completedAt),'License approval predates its evidence');
    if(q.kind==='terms')termsEvidence=true;
    else {
      assert.equal(q.series,series,'License evidence belongs to a different series');
      if(q.kind==='indicator-metadata')seriesEvidence=true;
      if(q.kind==='series-metadata') {
        const metadata=parseSeriesMetadata(json(resources[q.id]),series);
        assert.equal(metadata.License_Type,'CC BY-4.0','Source has not declared the reviewed license');
        assert.ok(['https://datacatalog.worldbank.org/public-licenses#cc-by','https://creativecommons.org/licenses/by/4.0/'].includes(metadata.License_URL),'License URL conflicts with the source label');
        assert.equal(review.licenseId,'CC-BY-4.0','Reviewed license conflicts with source');
        licenseEvidence=true;
      }
    }
  }
  assert.ok(termsEvidence && seriesEvidence,'License needs frozen terms and identity-checked metadata for this series');
  if(modern)assert.ok(licenseEvidence,'This edition requires the explicit series-level license declaration');
  return true;
}
function buildBaseline({catalog, countryMap, licenseReview, acquisition, resources}) {
  validateConfig(catalog,countryMap,licenseReview);
  validateAcquisition(acquisition,resources,catalog);
  const freezeYear=Number(catalog.freezeDate.slice(0,4)), cutoff=Date.parse(catalog.freezeDate+'T23:59:59.999Z');
  const sourceQuery=queryFor(acquisition,'source'), countryQuery=queryFor(acquisition,'countries');
  let source=null;
  if (sourceQuery.status==='ok') {
    const {rows}=checkPage(json(resources[sourceQuery.id]),'source');
    assert.equal(rows.length,1); assert.equal(String(rows[0].id),'2'); source=rows[0];
    if(source.lastupdated!==undefined && source.lastupdated!==null)calendarDate(source.lastupdated,'Source lastupdated');
  }
  if (countryQuery.status==='ok') {
    const {rows}=checkPage(json(resources[countryQuery.id]),'countries');
    assert.deepEqual(rows.map(c=>c.id).sort(), [...PILOT].sort(), 'Source country identities');
    for (const c of rows) assert.notEqual(c.region?.id,'NA','Aggregate country not allowed');
  }
  const normalized = new Map(), sourceRecords=[];
  let countryContext=null;
  const countryMetadataQuery=acquisition.queries.find(q=>q.kind==='country-metadata');
  if(countryMetadataQuery?.status==='ok') {
    const payload=json(resources[countryMetadataQuery.id]);
    assert.equal(Number(payload.page),1);assert.equal(Number(payload.pages),1);
    assert.equal(payload.source.length,1);assert.equal(String(payload.source[0].id),'2');
    const variables=payload.source[0].concept.filter(c=>c.id==='Country').flatMap(c=>c.variable??[]);
    assert.deepEqual(variables.map(c=>c.id).sort(),[...PILOT].sort(),'Country metadata identities');
    countryContext=variables.map(c=>({iso3:c.id,fields:Object.fromEntries(c.metatype.map(f=>{assert.equal(typeof f.value,'string');return [f.id,f.value];}))}));
  }
  for (const indicator of catalog.indicators) {
    const observations=queryFor(acquisition,'observations',indicator.series);
    const metadata=queryFor(acquisition,'indicator-metadata',indicator.series);
    const seriesMetadata=queryFor(acquisition,'series-metadata',indicator.series);
    const modern=termsUrl(catalog)===DATASET_TERMS;
    const review=licenseReview.series[indicator.series], cleared=permitted(review,acquisition,resources,cutoff,indicator.series,modern);
    const detailedMetadata=modern && seriesMetadata.status==='ok'?parseSeriesMetadata(json(resources[seriesMetadata.id]),indicator.series):null;
    let definition=null, version=null, dataRows=[];
    if (metadata.status==='ok') {
      const {rows}=checkPage(json(resources[metadata.id]),indicator.series+' metadata');
      assert.equal(rows.length,1); definition=rows[0];
      assert.equal(definition.id,indicator.series); assert.equal(String(definition.source?.id),'2');
      assert.ok(typeof definition.name==='string' && definition.name.length>0);
      for(const field of ['unit','sourceOrganization','sourceNote'])assert.ok(definition[field]===undefined || definition[field]===null || typeof definition[field]==='string',`Source ${field} must be text`);
      if(definition.unit)assert.ok([indicator.unit,...UNIT_LABELS[indicator.unit]].includes(definition.unit),'Contradictory or unrecognized source unit requires review');
    }
    if (observations.status==='ok') {
      const {meta,rows}=checkPage(json(resources[observations.id]),indicator.series);
      const url=new URL(observations.url);
      assert.equal(url.searchParams.get('source'),'2','Observations must use WDI/source 2');
      version=meta.lastupdated ?? source?.lastupdated ?? null;
      calendarDate(version,'Missing or invalid source revision/lastupdated');
      if(meta.sourceid!==undefined)assert.equal(String(meta.sourceid),'2','Wrong response source');
      const seen=new Set();
      for (const row of rows) {
        assert.ok(PILOT.includes(row.countryiso3code), 'Unknown ISO3 in observations');
        assert.equal(row.indicator?.id,indicator.series,'Wrong indicator series');
        assert.match(row.date,/^\d{4}$/,'Observation year');
        const year=Number(row.date);
        assert.ok(year>=catalog.startYear,'Year before requested range');
        const key=row.countryiso3code+'/'+row.date;
        assert.ok(!seen.has(key),'Duplicate country/year observation'); seen.add(key);
        assert.ok(row.value===null || (typeof row.value==='number' && Number.isFinite(row.value)), 'Invalid numeric value');
        assert.ok(row.obs_status===undefined || row.obs_status===null || typeof row.obs_status==='string','Invalid source quality status');
        if (row.value!==null) {
          assert.ok(row.value>=indicator.min && (indicator.max===null||row.value<=indicator.max),'Value outside unit bounds');
        }
        // Annual period identifiers are preserved; no fabricated day of observation.
        if(year<=freezeYear) dataRows.push(row);
      }
    }
    let commonReason=null;
    const failed=[sourceQuery,countryQuery,metadata,observations].find(q=>q.status!=='ok');
    if(failed) commonReason=failed.status==='blocked'?'network_access_denied':'source_request_failed';
    else if(version>catalog.freezeDate || source?.lastupdated>catalog.freezeDate) commonReason='source_revision_after_freeze';
    else if(!cleared) commonReason='license_not_cleared';
    const cells={};
    for(const country of countryMap.countries) {
      const candidates=dataRows.filter(row=>row.countryiso3code===country.iso3 && row.value!==null).sort((a,b)=>Number(b.date)-Number(a.date));
      const selected=candidates[0]??null, reason=commonReason??(selected?null:'no_non_null_observation');
      const available=reason===null;
      const sourceStatus=available?(selected.obs_status||null):null;
      const classification=available?(['observed','estimated','projected','imputed','synthetic'].includes(sourceStatus)?sourceStatus:'unclassified'):'unavailable';
      // No interpolation, unit conversion or readiness score is produced in D0–D2.
      cells[country.iso3]={
        series:indicator.series,value:available?selected.value:null,originalValue:available?selected.value:null,
        unit:indicator.unit,sourceUnit:definition?.unit||null,observationYear:available?Number(selected.date):null,
        status:available?'available':'unavailable',quality:{classification,sourceStatus},missingReason:reason,fallback:null,
        source:'World Bank — World Development Indicators',sourceId:'2',sourceCountryCode:country.sourceId,
        sourceUrl:observations.url,metadataUrl:metadata.url,publishedAt:null,
        retrievedAt:observations.attempted?observations.completedAt:null,
        datasetVersion:version,inputChecksum:observations.sha256,
        license:{status:review.status,licenseId:review.licenseId,commercialUse:review.commercialUse,termsUrl:licenseReview.termsUrl},
        transformation:{id:'identity_latest_non_null_at_cutoff',version:'1',imputed:false},
        stalenessYears:available?freezeYear-Number(selected.date):null
      };
    }
    normalized.set(indicator.key,cells);
    sourceRecords.push({series:indicator.series,name:definition?.name??null,unit:indicator.unit,sourceUnit:definition?.unit||null,
      sourceOrganization:definition?.sourceOrganization??null,sourceNote:definition?.sourceNote??null,
      datasetVersion:version,license:review,queries:[metadata,seriesMetadata,observations],...(modern?{seriesMetadata:detailedMetadata}:{})});
  }
  const baseline={schemaVersion:catalog.schemaVersion,dataVersion:catalog.dataVersion,freezeDate:catalog.freezeDate,
    layer:'ObservedData',integratedIntoGame:false,
    countries:countryMap.countries.map(c=>({...c,indicators:Object.fromEntries(catalog.indicators.map(i=>[i.key,normalized.get(i.key)[c.iso3]]))}))};
  const cells=baseline.countries.flatMap(c=>Object.values(c.indicators));
  const available=cells.filter(c=>c.status==='available').length;
  const sourceAvailable=sourceRecords.filter(s=>s.queries.find(q=>q.kind==='observations').status==='ok').length;
  const reasons=Object.fromEntries([...new Set(cells.map(c=>c.missingReason).filter(Boolean))].sort().map(reason=>[reason,cells.filter(c=>c.missingReason===reason).length]));
  const coverage={schemaVersion:'baseline-coverage-v1',totalCells:40,availableCells:available,unavailableCells:40-available,
    imputedCells:0,imputationPercent:0,coveragePercent:available/40*100,seriesResponsesRetrieved:sourceAvailable,missingReasons:reasons,
    byCountry:baseline.countries.map(c=>({iso3:c.iso3,available:Object.values(c.indicators).filter(v=>v.status==='available').length,total:8})),
    byIndicator:catalog.indicators.map(i=>({key:i.key,series:i.series,available:baseline.countries.filter(c=>c.indicators[i.key].status==='available').length,total:5}))};
  const sources={schemaVersion:'baseline-sources-v1',freezeDate:catalog.freezeDate,sourceId:'2',sourceMetadata:source,
    sourceQuery,countryQuery,series:sourceRecords,otherQueries:acquisition.queries.filter(q=>['terms','documentation'].includes(q.kind)),excludedCandidates:catalog.excludedCandidates};
  if(countryMetadataQuery)Object.assign(sources,{countryMetadataQuery,countryContext});
  const inputIndex=[['catalog.json',stableStringify(catalog),'canonical-json'],['country-map.json',stableStringify(countryMap),'canonical-json'],['license-review.json',stableStringify(licenseReview),'canonical-json'],['inputs/acquisition.json',stableStringify(acquisition),'canonical-json'],
    ...acquisition.queries.filter(q=>q.status==='ok').map(q=>['inputs/'+q.file,resources[q.id],'raw-bytes'])]
    .map(([file,bytes,representation])=>({file,representation,sha256:sha256(bytes)})).sort((a,b)=>a.file.localeCompare(b.file,'en'));
  return {baseline,coverage,sources,inputIndex};
}
function generateArtifacts(bundle) {
  const {baseline,coverage,sources,inputIndex}=bundle;
  const artifacts={'scenario-baseline-v1.json':stableStringify(baseline),'coverage.json':stableStringify(coverage),'sources.json':stableStringify(sources)};
  const keys=Object.keys(baseline.countries[0].indicators);
  const csvCell=value=>'"'+String(value??'').replaceAll('"','""')+'"';
  const rows=[['iso3','indicator','series','observationYear','value','unit','quality','status','missingReason','sourceUrl']];
  for(const c of baseline.countries)for(const key of keys){const v=c.indicators[key];rows.push([c.iso3,key,v.series,v.observationYear,v.value,v.unit,v.quality.classification,v.status,v.missingReason,v.sourceUrl]);}
  artifacts['coverage.csv']=rows.map(row=>row.map(csvCell).join(',')).join('\n')+'\n';
  const lines=['# BASELINE DATA V1 — Relatório D0–D2','',`Versão: ${baseline.dataVersion}. Corte: ${baseline.freezeDate}. Camada factual separada; **não integrada no jogo**.`,
    '',`Cobertura distribuível verificada: **${coverage.availableCells}/40 (${coverage.coveragePercent}%)**. Imputações: 0. Respostas de séries recolhidas: ${coverage.seriesResponsesRetrieved}/8.`,
    '',coverage.availableCells===40?'Piloto com valores disponíveis; rever qualidade/antiguidade por célula.':'**Entrega parcial:** indisponibilidades abaixo não são prova de lacunas estatísticas do Banco Mundial. Zero não foi usado para preencher ausências.',
    '','| Indicador (série) | PRT | DEU | USA | BRA | MWI |','| --- | --- | --- | --- | --- | --- |'];
  for(const key of keys){const first=baseline.countries[0].indicators[key];lines.push(`| ${key} (${first.series}) | `+baseline.countries.map(c=>{const v=c.indicators[key];return v.status==='available'?`${v.value} · ${v.observationYear} · ${v.unit} · ${v.quality.classification}`:`— (${v.missingReason})`;}).join(' | ')+' |');}
  lines.push('','## Interpretação e lacunas','',...Object.entries(coverage.missingReasons).map(([reason,count])=>`- ${reason}: ${count} células.`),
    '', 'Países com cobertura verificada: '+coverage.byCountry.map(c=>`${c.iso3} ${c.available}/${c.total}`).join('; ')+'.',
    '', 'Não foram gerados rankings de capacidade ou parâmetros de gameplay. Sem valores verificados, não existe comparação quantitativa legítima entre os cinco países. Mesmo quando disponíveis, PIB não é tesouraria; camas por mil habitantes não são vagas operacionais; comércio pode exceder 100% do PIB.',
    '', '## Termos e distribuição comercial','',
    ...sources.series.map(s=>`- ${s.series}: ${s.license.status}; autorização comercial ${s.license.commercialUse}; licença ${s.license.licenseId??'não verificada'}.`),
    '', 'Não se presume CC BY para séries agregadas/de terceiros. Valores só entram no pacote quando existe revisão por série, exceções verificadas e evidência congelada dos termos. Nenhum dado numérico não autorizado foi incorporado nesta entrega. SIPRI e dívida/FMI permanecem excluídos.',
    '', '## Proveniência e reprodução','',`SHA-256 de scenario-baseline-v1.json: \`${sha256(artifacts['scenario-baseline-v1.json'])}\`.`,
    '', 'Consultas, falhas, datas reais de obtenção e revisões constam de sources.json e inputs/acquisition.json; checksums em manifest.json. Uma recusa CONNECT 403 é bloqueio do proxy antes de qualquer resposta HTTP da fonte. As consultas não tentadas após essa recusa apontam para o pedido de evidência, sem inventar datas de obtenção.',
    '', 'Geração offline: node scripts/data/normalize-baseline.cjs. Validação: node scripts/data/validate-baseline.cjs. O manifesto não inclui o próprio hash. A antiguidade e a classificação da fonte são preservadas; códigos não interpretados mantêm qualidade unclassified. lastupdated não é data de publicação de cada observação.', '');
  artifacts['REPORT.md']=lines.join('\n');
  if(baseline.dataVersion!=='1.0.0-pilot') {
    const current=['# BASELINE DATA V1 — Relatório D0–D2', '',
      `Edição **${baseline.dataVersion}**, corte **${baseline.freezeDate}**. Camada factual separada, não integrada no motor. A edição 1.0.0-pilot de 12/11/2026 foi preservada em editions/1.0.0-pilot-2026-11-12.`, '',
      `**Cobertura efetiva: ${coverage.availableCells}/40 (${coverage.coveragePercent}%).** Séries com resposta de dados: ${coverage.seriesResponsesRetrieved}/8. Imputações pelo pipeline: 0.`, '',
      '| País | Indicadores disponíveis |', '| --- | ---: |',
      ...baseline.countries.map(c=>`| ${c.name} (${c.iso3}) | ${Object.values(c.indicators).filter(v=>v.status==='available').length}/8 |`), '',
      '## Valores originais e anos', '',
      'Cada célula indica valor e ano próprios; não são todos dados de 2026. Valores em USD são correntes, sem conversão ou arredondamento de gameplay. A classificação permanece unclassified quando o código da fonte não identifica a natureza da observação; a definição de população explicita estimativas de meio do ano.', '',
      '| Indicador / unidade | PRT | DEU | USA | BRA | MWI |', '| --- | --- | --- | --- | --- | --- |'];
    for(const key of keys) {
      const first=baseline.countries[0].indicators[key];
      current.push(`| ${key} (${first.unit}) | `+baseline.countries.map(c=>{const v=c.indicators[key];return v.status==='available'?`${v.value} (${v.observationYear})`:`— ${v.missingReason}`;}).join(' | ')+' |');
    }
    current.push('', '## Cobertura por indicador e antiguidade', '', '| Série | Cobertura | Anos disponíveis | Maior antiguidade |', '| --- | ---: | --- | ---: |');
    for(const key of keys) {
      const cells=baseline.countries.map(c=>c.indicators[key]),available=cells.filter(v=>v.status==='available');
      const age=available.length?Math.max(...available.map(v=>v.stalenessYears)):null;
      current.push(`| ${cells[0].series} | ${available.length}/5 | ${[...new Set(available.map(v=>v.observationYear))].sort().join(', ')||'—'} | ${age===null?'—':age+(age===1?' ano':' anos')} |`);
    }
    current.push('', '## Comparação e limites de interpretação', '',
      'Os números acima permitem comparar magnitudes publicadas, não prontidão, dificuldade ou resultados de campanha. Não há pontuações nem normalização de poder. PIB não é tesouraria; PIB por habitante não descreve desigualdade; camas por mil habitantes não medem vagas disponíveis, pessoal ou cuidados intensivos; comércio/PIB pode exceder 100%.', '',
      'Amostras antigas são mantidas com o ano original, sem preenchimento silencioso. A variação de anos impede tratar razões entre séries como se fossem medições contemporâneas. Os perfis dos cinco países são um teste de diversidade de escala e cobertura, não uma classificação de vencedores e perdedores.');
    if(sources.countryContext) {
      current.push('', 'Âmbito da contabilidade governamental segundo metadados WDI:', '',
        ...sources.countryContext.map(c=>`- ${c.iso3}: ${c.fields.GovernmentAccountingconcept??'não identificado'}.`), '',
        'Por isso, receita fiscal/PIB não representa necessariamente o mesmo perímetro administrativo nos cinco países. A diferença é documentada; não foi corrigida com uma estimativa.');
    }
    current.push('', '## Fontes, versões e direitos de utilização', '',
      '| Série | Revisão WDI | Licença declarada / revisão |', '| --- | --- | --- |',
      ...sources.series.map(s=>`| ${s.series} | ${s.datasetVersion??'desconhecida'} | ${s.seriesMetadata?.License_Type??'não obtida'} / ${s.license.status} |`), '',
      'Os metadados por série, origem, limitações estatísticas, evidência e atribuições estão em sources.json e license-review.json. A revisão técnica verificou os rótulos de licença e as exceções publicadas; não substitui aconselhamento jurídico nem autoriza outros datasets dos mesmos fornecedores.', '',
      'Uso comercial dos valores declarados CC BY 4.0 exige cumprir atribuição ao Banco Mundial e fornecedores, identificação de alterações, ligação aos termos e preservação das condições adicionais WB, incluindo mediação/arbitragem e ausência de endosso. Os termos específicos de datasets prevalecem sobre termos gerais em conflito. HTML/assets do site são evidência de desenvolvimento, não recursos licenciados para embutir no jogo. Ver ATTRIBUTION.md e docs/BASELINE_DATA_PIPELINE.md.', '',
      '## Proveniência e reprodução', '',
      `SHA-256 de scenario-baseline-v1.json: \`${sha256(artifacts['scenario-baseline-v1.json'])}\`.`, '',
      `Aquisição com datas reais em inputs/acquisition.json; URLs finais, tipos de conteúdo e hashes dos bytes congelados constam do manifesto. O corte é ${baseline.freezeDate}; lastupdated é revisão do dataset, não ano de observação ou data individual de publicação.`, '',
      'Geração e validação offline: node scripts/data/normalize-baseline.cjs e node scripts/data/validate-baseline.cjs. Usar --base-dir para a edição arquivada. O manifesto não inclui o próprio hash.', '',
      'Não houve integração D3, alterações ao motor/dados da Alpha, recalibração de regras, campanhas comparativas de 60/120 dias ou merge do PR.');
    if(Object.keys(coverage.missingReasons).length)current.push('', 'Motivos de indisponibilidade:', '', ...Object.entries(coverage.missingReasons).map(([reason,count])=>`- ${reason}: ${count} células.`));
    artifacts['REPORT.md']=current.join('\n')+'\n';
  }
  artifacts['manifest.json']=stableStringify({schemaVersion:'baseline-manifest-v1',dataVersion:baseline.dataVersion,freezeDate:baseline.freezeDate,
    inputs:inputIndex,outputs:Object.keys(artifacts).sort().map(file=>({file,sha256:sha256(artifacts[file])}))});
  return artifacts;
}
function loadBundle({baseDir=path.join(ROOT,'data/baseline'),inputDir=path.join(baseDir,'inputs')}={}) {
  const read=name=>json(fs.readFileSync(path.join(baseDir,name)));
  const acquisition=json(fs.readFileSync(path.join(inputDir,'acquisition.json'))),resources=Object.create(null);
  const realInput=fs.realpathSync(inputDir);
  for(const q of acquisition.queries.filter(q=>q.status==='ok')){
    assert.equal(typeof q.file,'string');
    const file=fs.realpathSync(path.resolve(inputDir,q.file));
    assert.ok(file.startsWith(realInput+path.sep),'Source path escapes inputs');
    resources[q.id]=fs.readFileSync(file);
  }
  return {catalog:read('catalog.json'),countryMap:read('country-map.json'),licenseReview:read('license-review.json'),acquisition,resources};
}
module.exports={ROOT,PILOT,SERIES,UNITS,stableStringify,sha256,validateConfig,checkPage,validateAcquisition,buildBaseline,generateArtifacts,loadBundle,parseSeriesMetadata};
