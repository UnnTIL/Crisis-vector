'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const {createHash} = require('node:crypto');
const fsSync = require('node:fs');
const {execFileSync} = require('node:child_process');
const {acquire, makeQueries, validateTimestamp} = require('../scripts/data/fetch-world-bank.cjs');
const {stableStringify, sha256, buildBaseline, generateArtifacts, loadBundle} = require('../scripts/data/baseline.cjs');
const {TERMS_EXCERPTS, createWebEvidence, validateWebEvidence} = require('../scripts/data/web-evidence.cjs');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data/baseline');
const ARCHIVE = path.join(DATA, 'editions/1.0.0-pilot-2026-11-12');
const ARCHIVED_BASELINE_HASH = 'a4f8ca0d6aaaca2945ee4badcb17902d6e8e542ea56ccecbc0b82bb8deb52c10';
const CURRENT_BASELINE_HASH = '1f3c2e2f15a9ca7776ab87ab57ab63d6f81bc26bd74238760f37e282df5ed506';
const readConfig = (name, baseDir=DATA) => JSON.parse(fsSync.readFileSync(path.join(baseDir, name), 'utf8'));

// Values and responses built in these tests are synthetic fixtures only. They
// are never fetched from a provider or published as the real-country baseline.
const retrievedAt = '2026-11-12T12:00:00.000Z';
const fixtureCatalog = readConfig('catalog.json');
const fixtureCountries = readConfig('country-map.json');
const afterFreeze = catalog => new Date(Date.parse(catalog.freezeDate+'T00:00:00.000Z')+86400000).toISOString();
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function syntheticWebResponse(query) {
  const quotes=query.kind==='terms'?TERMS_EXCERPTS.map(v=>`<p>${v.text}</p>`).join(''):'';
  const body=Buffer.from('<!doctype html><html><head><title>Synthetic World Bank test document</title></head><body>'+quotes+
    '<div>SYNTHETIC_FULL_PAGE_SENTINEL '+('unretained fixture material '.repeat(400))+'</div></body></html>');
  return {status:'ok',httpStatus:200,proxyStatus:null,finalUrl:query.url,contentType:'text/html; charset=utf-8',errorCode:null,error:null,body};
}
async function temporary(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'crisis-baseline-test-'));
  t.after(()=>fs.rm(directory, {recursive:true, force:true}));
  return directory;
}

test('acquisition plans only the five-country WDI source-2 pilot and rejects malformed settings', () => {
  const queries = makeQueries(fixtureCatalog, fixtureCountries);
  assert.equal(queries.filter(q=>q.kind==='observations').length, 8);
  for (const query of queries.filter(q=>q.kind==='observations')) {
    const url = new URL(query.url);
    assert.equal(url.hostname, 'api.worldbank.org');
    assert.equal(url.searchParams.get('source'), '2');
    assert.equal(url.searchParams.get('date'), '1960:2026');
    assert.match(url.pathname, /PRT;DEU;USA;BRA;MWI/);
  }
  assert.throws(()=>makeQueries({...fixtureCatalog, sourceId:'1'}, fixtureCountries));
  assert.throws(()=>makeQueries(fixtureCatalog, {countries:[...fixtureCountries.countries.slice(0, 4), {iso3:'WLD',internalId:'WLD',sourceId:'WLD'}]}));
  assert.throws(()=>makeQueries(fixtureCatalog, {countries:fixtureCountries.countries.slice(1)}));
  assert.throws(()=>makeQueries({...fixtureCatalog, indicators:[{series:'../unsafe'}]}, fixtureCountries));
  assert.throws(()=>validateTimestamp('2026-02-30T12:00:00Z'));
  assert.throws(()=>validateTimestamp('not a date'));
});

test('an explicit proxy denial is attempted once per host and preserves unavailable evidence', async t => {
  const outDir = await temporary(t), calls = [];
  const acquisition = await acquire({catalog:fixtureCatalog, countryMap:fixtureCountries, outDir, clock:()=>retrievedAt,
    request:async url=>{
      calls.push(url);
      return {status:'blocked', httpStatus:null, proxyStatus:403, errorCode:'proxy_connect_denied', error:'Synthetic test proxy denial.', body:null};
    }});
  assert.equal(calls.length, 3, 'API, terms and documentation hosts each get one probe');
  assert.equal(acquisition.queries.length, makeQueries(fixtureCatalog,fixtureCountries).length);
  assert.ok(acquisition.queries.every(q=>q.status==='blocked' && q.file===null && q.sha256===null));
  for (const query of acquisition.queries.filter(q=>q.attempted)) {
    assert.equal(query.httpStatus, null, 'proxy denial is not an upstream provider HTTP response');
    assert.equal(query.proxyStatus, 403);
  }
  for (const query of acquisition.queries.filter(q=>!q.attempted)) {
    assert.equal(query.requestedAt, null);
    assert.equal(query.completedAt, null);
    assert.ok(acquisition.queries.find(q=>q.id===query.evidenceRequestId && q.attempted));
  }
  const saved = JSON.parse(await fs.readFile(path.join(outDir, 'acquisition.json'), 'utf8'));
  assert.deepEqual(saved, acquisition);
});

test('acquisition freezes exact API bytes but retains only minimal citations for web pages', async t => {
  const outDir = await temporary(t), body = Buffer.from('{"synthetic-fixture":true}\n');
  const planned=makeQueries(fixtureCatalog,fixtureCountries);
  const acquisition = await acquire({catalog:fixtureCatalog, countryMap:fixtureCountries, outDir, clock:()=>retrievedAt,
    request:async url=>{
      const query=planned.find(q=>q.url===url);
      return ['terms','documentation'].includes(query.kind)?syntheticWebResponse(query):{status:'ok',httpStatus:200,errorCode:null,error:null,body};
    }});
  assert.equal(acquisition.queries.length, makeQueries(fixtureCatalog,fixtureCountries).length);
  for (const query of acquisition.queries) {
    const frozen = await fs.readFile(path.join(outDir, query.file));
    assert.equal(query.sha256, digest(frozen));
    if(['terms','documentation'].includes(query.kind)) {
      const original=syntheticWebResponse(query).body, evidence=JSON.parse(frozen);
      assert.equal(query.file,`evidence/${query.id}.json`);
      assert.equal(query.representation,'minimal-web-evidence-v1');
      assert.equal(query.responseSha256,digest(original));
      assert.equal(query.responseBytes,original.length);
      assert.equal(evidence.extraction.fullResponseRetained,false);
      assert.equal(evidence.excerpts.length,query.kind==='terms'?TERMS_EXCERPTS.length:0);
      assert.ok(!frozen.includes(Buffer.from('SYNTHETIC_FULL_PAGE_SENTINEL')));
      assert.ok(!frozen.toString().match(/<\/?(?:html|head|body|script)\b/i));
      validateWebEvidence(evidence,query);
    } else assert.deepEqual(frozen,body);
  }
  const collected=[];
  async function files(directory){for(const e of await fs.readdir(directory,{withFileTypes:true}))e.isDirectory()?await files(path.join(directory,e.name)):collected.push(path.join(directory,e.name));}
  await files(outDir);
  assert.ok(!collected.some(file=>/\.html?$/i.test(file)),'full HTML responses are never retained');
  let calls = 0;
  await assert.rejects(()=>acquire({catalog:fixtureCatalog, countryMap:fixtureCountries, outDir, clock:()=>retrievedAt,
    request:async()=>{calls++; throw new Error('must never be requested');}}), {code:'EEXIST'});
  assert.equal(calls, 0);
});

test('acquisition refuses an expired edition before contacting any source', async t => {
  const outDir=await temporary(t);
  let calls=0;
  await assert.rejects(()=>acquire({catalog:fixtureCatalog,countryMap:fixtureCountries,outDir,
    clock:()=>afterFreeze(fixtureCatalog),
    request:async()=>{calls++;return {status:'ok',httpStatus:200,body:Buffer.from('{}')};}}), /freeze|cutoff|corte/i);
  assert.equal(calls,0);
});

function page(rows, extra={}) {
  return [{page:1, pages:1, total:rows.length, ...extra}, rows];
}
function fixture() {
  const catalog = structuredClone(fixtureCatalog), countryMap = structuredClone(fixtureCountries);
  const licenseReview = readConfig('license-review.json',ARCHIVE), resources = Object.create(null);
  licenseReview.termsUrl=catalog.termsUrl??licenseReview.termsUrl;
  const acquisition = {
    schemaVersion:'baseline-inputs-v1', freezeDate:catalog.freezeDate,
    startedAt:retrievedAt, completedAt:retrievedAt,
    queries:makeQueries(catalog, countryMap).map(q=>({...q, requestedAt:retrievedAt, completedAt:retrievedAt,
      status:'ok', attempted:true, httpStatus:200, proxyStatus:null, errorCode:null, error:null,
      file:`raw/${q.id}.${['terms','documentation'].includes(q.kind)?'html':'json'}`,
      sha256:null, evidenceRequestId:null}))
  };
  for (const query of acquisition.queries) {
    let payload;
    if (query.kind==='source') payload = page([{id:'2', name:'Synthetic WDI test fixture', lastupdated:'2026-10-01'}]);
    else if (query.kind==='countries') payload = page(countryMap.countries.map(c=>({id:c.iso3, name:c.name, region:{id:'TEST'}})));
    else if (query.kind==='country-metadata') payload = {page:1,pages:1,total:countryMap.countries.length,
      source:[{id:'2',concept:[{id:'Country',variable:countryMap.countries.map(c=>({id:c.iso3,
        metatype:[{id:'GovernmentAccountingconcept',value:'Synthetic test context'}]}))}]}]};
    else if (query.kind==='indicator-metadata') payload = page([{id:query.series, name:'Synthetic '+query.series, unit:'', source:{id:'2'}, sourceOrganization:'Test fixture', sourceNote:'Not actual country data.'}]);
    else if (query.kind==='series-metadata') payload = {page:1,pages:1,total:3,
      source:[{id:'2',concept:[{id:'Series',variable:[{id:query.series,metatype:[
        {id:'License_Type',value:'CC BY-4.0'},
        {id:'License_URL',value:'https://datacatalog.worldbank.org/public-licenses#cc-by'},
        {id:'Source',value:'Synthetic fixture, not an actual provider response.'}
      ]}]}]}]};
    else if (query.kind==='observations') {
      const indicator = catalog.indicators.find(i=>i.series===query.series);
      const base = ['urbanization','research'].includes(indicator.key)?20:1000;
      payload = page(countryMap.countries.flatMap((c, index)=>[
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2027', value:base+5, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2026', value:null, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2025', value:base+index, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2023', value:base-1, obs_status:'estimated'}
      ]), {lastupdated:'2026-10-01'});
    } else if(['terms','documentation'].includes(query.kind)) {
      const response=syntheticWebResponse(query);
      payload=createWebEvidence({query,response,requestedAt:retrievedAt,retrievedAt,preparedAt:retrievedAt});
      Object.assign(query,{file:`evidence/${query.id}.json`,representation:'minimal-web-evidence-v1',
        finalUrl:response.finalUrl,contentType:response.contentType,responseSha256:sha256(response.body),responseBytes:response.body.length});
    }
    resources[query.id] = Buffer.from(typeof payload==='string'?payload:JSON.stringify(payload));
    query.sha256 = sha256(resources[query.id]);
  }
  const terms = acquisition.queries.find(q=>q.kind==='terms');
  const termsExcerpt=TERMS_EXCERPTS.find(e=>e.id==='dataset_license');
  for (const [series, review] of Object.entries(licenseReview.series)) {
    const metadata=acquisition.queries.find(q=>q.kind==='indicator-metadata' && q.series===series);
    const detailed=acquisition.queries.find(q=>q.kind==='series-metadata' && q.series===series);
    Object.assign(review, {
      status:'verified', licenseId:'CC-BY-4.0', commercialUse:'allowed',
      thirdPartyExceptionsReviewed:true, reviewedAt:retrievedAt, attribution:'Synthetic test fixture only',
      evidence:[{queryId:terms.id,sha256:terms.sha256,excerptId:termsExcerpt.id,excerpt:termsExcerpt.text,responseSha256:terms.responseSha256},
        {queryId:metadata.id, sha256:metadata.sha256, excerpt:'Synthetic '+series},
        {queryId:detailed.id,sha256:detailed.sha256,excerpt:'License_Type'}]
    });
  }
  return {catalog, countryMap, licenseReview, acquisition, resources};
}
function queryOf(inputs, kind, series='SP.POP.TOTL') {
  return inputs.acquisition.queries.find(q=>q.kind===kind && (q.series===series || q.series===null));
}
function changePayload(inputs, kind, change, series='SP.POP.TOTL') {
  const query = queryOf(inputs, kind, series), payload = JSON.parse(inputs.resources[query.id]);
  change(payload);
  inputs.resources[query.id] = Buffer.from(JSON.stringify(payload));
  query.sha256 = sha256(inputs.resources[query.id]);
  // Keep otherwise-valid licensing evidence aligned when a test deliberately
  // changes a metadata payload, so schema checks fail for the intended reason.
  for (const review of Object.values(inputs.licenseReview.series)) for (const evidence of review.evidence) {
    if (evidence.queryId===query.id) evidence.sha256=query.sha256;
  }
}
function cell(bundle, key='population', country='PRT') {
  return bundle.baseline.countries.find(c=>c.iso3===country).indicators[key];
}

test('stable serialization is canonical, detects non-finite values, and uses standard SHA-256', () => {
  const value = {z:{b:2,a:1}, a:[3,{y:2,x:1}]}, before = structuredClone(value);
  assert.equal(stableStringify(value), stableStringify({a:[3,{x:1,y:2}],z:{a:1,b:2}}));
  assert.deepEqual(value, before);
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  for (const value of [NaN, Infinity, -Infinity, undefined]) assert.throws(()=>stableStringify({value}));
});

test('latest non-null value at the cutoff preserves original value, year, units and unknown quality', () => {
  const inputs = fixture(), bundle = buildBaseline(inputs), population = cell(bundle);
  assert.equal(bundle.coverage.availableCells, 40);
  assert.equal(population.value, 1000);
  assert.equal(population.originalValue, 1000);
  assert.equal(population.observationYear, 2025);
  assert.equal(population.unit, 'persons');
  assert.equal(population.quality.classification, 'unclassified', 'WDI values are not automatically observed');
  assert.equal(population.datasetVersion, '2026-10-01');
  assert.equal(population.publishedAt, null, 'source revision is not observation publication time');
  assert.equal(population.inputChecksum, queryOf(inputs, 'observations').sha256);
  assert.equal(bundle.baseline.layer, 'ObservedData');
  assert.equal(bundle.baseline.integratedIntoGame, false);
  assert.equal(cell(bundle, 'hospitalBeds').unit, 'beds_per_1000_people');
  assert.equal(bundle.sources.countryContext.find(c=>c.iso3==='MWI').fields.GovernmentAccountingconcept,'Synthetic test context');
});

test('zero remains a legitimate value while missing observations remain null without imputation', () => {
  const inputs = fixture();
  changePayload(inputs, 'observations', payload=>{
    for (const row of payload[1]) {
      if (row.countryiso3code==='PRT' && row.date==='2025') row.value=0;
      if (row.countryiso3code==='DEU') row.value=null;
    }
  });
  const bundle = buildBaseline(inputs), zero=cell(bundle), missing=cell(bundle, 'population', 'DEU');
  assert.equal(zero.value, 0); assert.equal(zero.observationYear, 2025); assert.equal(zero.status, 'available');
  assert.equal(missing.value, null); assert.equal(missing.originalValue, null); assert.equal(missing.observationYear, null);
  assert.equal(missing.missingReason, 'no_non_null_observation'); assert.equal(missing.fallback, null);
  assert.equal(bundle.coverage.availableCells, 39); assert.equal(bundle.coverage.imputedCells, 0);
});

test('known source quality is preserved and trade percentages above 100 are allowed', () => {
  const inputs = fixture();
  changePayload(inputs, 'observations', payload=>{payload[1].find(r=>r.countryiso3code==='PRT' && r.date==='2025').obs_status='estimated';});
  changePayload(inputs, 'observations', payload=>{payload[1].find(r=>r.countryiso3code==='PRT' && r.date==='2025').value=250;}, 'NE.TRD.GNFS.ZS');
  const bundle = buildBaseline(inputs);
  assert.equal(cell(bundle).quality.classification, 'estimated');
  assert.equal(cell(bundle, 'trade').value, 250);
  assert.equal(cell(bundle, 'trade').unit, 'percent_GDP');
});

test('bad numeric values, unit bounds and incompatible country mappings are rejected', () => {
  for (const invalid of ['123', true, {}, -1]) {
    const inputs=fixture();
    changePayload(inputs, 'observations', payload=>{payload[1][2].value=invalid;});
    assert.throws(()=>buildBaseline(inputs), /numeric|bounds/);
  }
  for (const literal of ['1e400', '-1e400', 'NaN']) {
    const inputs=fixture(), query=queryOf(inputs, 'observations');
    inputs.resources[query.id]=Buffer.from(inputs.resources[query.id].toString().replace('"value":1000', '"value":'+literal));
    query.sha256=sha256(inputs.resources[query.id]);
    assert.throws(()=>buildBaseline(inputs));
  }
  const urban=fixture();
  changePayload(urban, 'observations', payload=>{payload[1][2].value=101;}, 'SP.URB.TOTL.IN.ZS');
  assert.throws(()=>buildBaseline(urban), /bounds/);
  const unit=fixture(); unit.catalog.indicators.find(i=>i.key==='hospitalBeds').unit='beds';
  assert.throws(()=>buildBaseline(unit));
  for (const [series, contradictoryUnit] of [['NY.GDP.MKTP.CD','constant 2015 US$'], ['SH.MED.BEDS.ZS','people']]) {
    const inputs=fixture();
    changePayload(inputs, 'indicator-metadata', payload=>{payload[1][0].unit=contradictoryUnit;}, series);
    assert.throws(()=>buildBaseline(inputs), /source unit/i);
  }
  const organization=fixture();
  changePayload(organization, 'indicator-metadata', payload=>{payload[1][0].sourceOrganization={untrusted:'not plain text'};});
  assert.throws(()=>buildBaseline(organization), /sourceOrganization must be text/);
  const mapping=fixture(); mapping.countryMap.countries[0].sourceId='WLD';
  assert.throws(()=>buildBaseline(mapping));
});

test('unknown ISO3, duplicate country-years, wrong series, wrong source and partial pages fail validation', () => {
  for (const change of [
    p=>{p[1][0].countryiso3code='WLD';},
    p=>{p[1].push({...p[1][0]});p[0].total++;},
    p=>{p[1][0].indicator.id='WRONG.SERIES';},
    p=>{p[0].pages=2;}, p=>{p[0].total++;}
  ]) {
    const inputs=fixture();changePayload(inputs, 'observations', change);
    assert.throws(()=>buildBaseline(inputs));
  }
  const source=fixture();changePayload(source, 'indicator-metadata', p=>{p[1][0].source.id='3';});
  assert.throws(()=>buildBaseline(source));
  const url=fixture();queryOf(url, 'observations').url=queryOf(url, 'observations').url.replace('source=2','source=3');
  assert.throws(()=>buildBaseline(url));
  const countryContext=fixture();
  changePayload(countryContext,'country-metadata',p=>{p.source[0].concept[0].variable[0].id='WLD';});
  assert.throws(()=>buildBaseline(countryContext), /Country metadata identities/);
});

test('future source revisions are not presented as a historical freeze and future retrieval dates reject', () => {
  const inputs=fixture();
  changePayload(inputs, 'observations', p=>{p[0].lastupdated=afterFreeze(inputs.catalog).slice(0,10);});
  const result=buildBaseline(inputs);
  assert.equal(cell(result).value, null);
  assert.equal(cell(result).missingReason, 'source_revision_after_freeze');
  const retrieved=fixture();retrieved.acquisition.completedAt=afterFreeze(retrieved.catalog);
  assert.throws(()=>buildBaseline(retrieved), /freeze/);
  const request=fixture();request.acquisition.queries[0].requestedAt=afterFreeze(request.catalog);
  assert.throws(()=>buildBaseline(request));
  const invalidDate=fixture();changePayload(invalidDate,'observations',p=>{p[0].lastupdated='2026-00-00';});
  assert.throws(()=>buildBaseline(invalidDate));
});

test('commercial redistribution requires per-series approval, third-party review and frozen evidence', () => {
  const pending=fixture();
  pending.licenseReview.series=readConfig('license-review.json',ARCHIVE).series;
  const result=buildBaseline(pending);
  assert.equal(result.coverage.availableCells, 0);
  assert.equal(result.coverage.missingReasons.license_not_cleared, 40);
  assert.equal(cell(result).originalValue, null, 'uncleared source values must not leak into distributable artifacts');
  for (const change of [
    r=>{r.thirdPartyExceptionsReviewed=false;}, r=>{r.evidence=[];},
    r=>{r.evidence[0].sha256='0'.repeat(64);}, r=>{r.evidence[0].excerpt='not present in evidence';},
    r=>{r.commercialUse='not_cleared';}, r=>{r.reviewedAt=afterFreeze(fixtureCatalog);}
  ]) {
    const inputs=fixture();change(inputs.licenseReview.series['SP.POP.TOTL']);
    assert.throws(()=>buildBaseline(inputs));
  }
});

test('license approval is tied to frozen terms and metadata for the same indicator', () => {
  const missingTerms=fixture();
  missingTerms.licenseReview.series['SP.POP.TOTL'].evidence.shift();
  assert.throws(()=>buildBaseline(missingTerms), /terms|evidence/i);
  const foreign=fixture(), other=queryOf(foreign,'indicator-metadata','NY.GDP.MKTP.CD');
  foreign.licenseReview.series['SP.POP.TOTL'].evidence[1]={queryId:other.id,sha256:other.sha256,excerpt:'Synthetic NY.GDP.MKTP.CD'};
  assert.throws(()=>buildBaseline(foreign), /series|indicator|evidence/i);
  const beforeEvidence=fixture();
  beforeEvidence.licenseReview.series['SP.POP.TOTL'].reviewedAt='2026-11-11T12:00:00.000Z';
  assert.throws(()=>buildBaseline(beforeEvidence), /evidence|review/i);
});

test('current edition requires an explicit same-series license and an unredirected dataset terms page', () => {
  const noDeclaration=fixture();
  noDeclaration.licenseReview.series['SP.POP.TOTL'].evidence.pop();
  assert.throws(()=>buildBaseline(noDeclaration), /series-level license/);
  const identity=fixture();
  changePayload(identity,'series-metadata', p=>{p.source[0].concept[0].variable[0].id='NY.GDP.MKTP.CD';});
  assert.throws(()=>buildBaseline(identity), /identity/);
  const license=fixture();
  changePayload(license,'series-metadata', p=>{p.source[0].concept[0].variable[0].metatype[0].value='Other license';});
  assert.throws(()=>buildBaseline(license), /declared|license/);
  const licenseUrl=fixture();
  changePayload(licenseUrl,'series-metadata', p=>{p.source[0].concept[0].variable[0].metatype[1].value='https://untrusted.example/license';});
  assert.throws(()=>buildBaseline(licenseUrl), /license|License/);
  const review=fixture();review.licenseReview.series['SP.POP.TOTL'].licenseId='CC0-1.0';
  assert.throws(()=>buildBaseline(review), /license conflicts/);
  const incomplete=fixture();changePayload(incomplete,'series-metadata', p=>{p.pages=2;});
  assert.throws(()=>buildBaseline(incomplete), /Incomplete/);
  const redirected=fixture();queryOf(redirected,'terms').finalUrl='https://www.worldbank.org/ext/en/legal';
  changePayload(redirected,'terms', p=>{p.source.finalUrl=queryOf(redirected,'terms').finalUrl;});
  assert.throws(()=>buildBaseline(redirected), /Dataset terms redirected/);
});

test('provenance URLs cannot silently change country scope, API path, format or cutoff', () => {
  for (const mutate of [
    url=>{url.pathname=url.pathname.replace('PRT;DEU;USA;BRA;MWI','WLD');},
    url=>{url.pathname='/v2/unrelated';},
    url=>{url.searchParams.set('date','1960:2030');},
    url=>{url.searchParams.set('format','xml');}
  ]) {
    const inputs=fixture(), query=queryOf(inputs,'observations'), url=new URL(query.url);
    mutate(url);query.url=url.href;
    assert.throws(()=>buildBaseline(inputs));
  }
  const duplicate=fixture();duplicate.acquisition.queries[1].id=duplicate.acquisition.queries[0].id;
  assert.throws(()=>buildBaseline(duplicate), /Duplicate/);
  for(const kind of ['terms','documentation']) {
    const inputs=fixture();queryOf(inputs,kind).url='https://www.worldbank.org/unrelated';
    assert.throws(()=>buildBaseline(inputs), /URL/);
  }
});

test('corrupt frozen input, unsafe source path and untrusted source host reject before output', () => {
  const corrupt=fixture(), q=queryOf(corrupt,'observations');
  corrupt.resources[q.id]=Buffer.from('altered without updating checksum');
  assert.throws(()=>buildBaseline(corrupt), /Checksum/);
  const unsafe=fixture();queryOf(unsafe,'observations').file='../outside.json';
  assert.throws(()=>buildBaseline(unsafe), /Unsafe/);
  const host=fixture();queryOf(host,'observations').url='https://untrusted.example/';
  assert.throws(()=>buildBaseline(host), /Unexpected source host/);
});

test('full offline artifact generation repeats identical contents and manifest hashes', () => {
  const inputs=fixture();
  const fingerprint=value=>stableStringify({...value,resources:Object.fromEntries(Object.entries(value.resources).map(([id,bytes])=>[id,bytes.toString('base64')]))});
  const before=fingerprint(inputs);
  const a=generateArtifacts(buildBaseline(inputs)), b=generateArtifacts(buildBaseline(inputs));
  assert.deepEqual(a,b);
  assert.equal(fingerprint(inputs),before);
  const manifest=JSON.parse(a['manifest.json']);
  assert.equal(manifest.outputs.length, 5, 'manifest excludes its own checksum');
  for (const entry of manifest.outputs) assert.equal(entry.sha256, sha256(a[entry.file]));
  assert.equal(a['coverage.csv'].trim().split('\n').length, 41);
});

test('archived November 12 edition remains byte-identical with its original blocked coverage', () => {
  const inputs=loadBundle({baseDir:ARCHIVE}), bundle=buildBaseline(inputs), artifacts=generateArtifacts(bundle);
  assert.equal(bundle.baseline.dataVersion,'1.0.0-pilot');
  assert.equal(bundle.baseline.freezeDate,'2026-11-12');
  assert.equal(sha256(artifacts['scenario-baseline-v1.json']),ARCHIVED_BASELINE_HASH);
  assert.equal(bundle.baseline.countries.length,5);
  assert.equal(bundle.coverage.totalCells,40);
  assert.equal(bundle.coverage.availableCells,0);
  assert.equal(bundle.coverage.missingReasons.network_access_denied,40);
  for (const [name,bytes] of Object.entries(artifacts)) assert.equal(fsSync.readFileSync(path.join(ARCHIVE,name),'utf8'),bytes);
  for (const country of bundle.baseline.countries) for (const record of Object.values(country.indicators)) {
    assert.equal(record.value,null);assert.equal(record.observationYear,null);
    assert.equal(record.fallback,null);assert.equal(record.license.commercialUse,'not_cleared');
  }
});

test('current November 13 edition rebuilds from its own frozen responses with factual and license gates', () => {
  const inputs=loadBundle(), bundle=buildBaseline(inputs), artifacts=generateArtifacts(bundle);
  assert.equal(bundle.baseline.dataVersion,'1.1.0-pilot');
  assert.equal(bundle.baseline.freezeDate,'2026-11-13');
  assert.equal(sha256(artifacts['scenario-baseline-v1.json']),CURRENT_BASELINE_HASH);
  assert.equal(bundle.baseline.countries.length,5);
  assert.equal(bundle.coverage.totalCells,40);
  const observations=inputs.acquisition.queries.filter(q=>q.kind==='observations');
  assert.equal(observations.length,8);
  assert.equal(inputs.acquisition.queries.length,29);
  assert.ok(inputs.acquisition.queries.every(q=>q.status==='ok'));
  assert.equal(bundle.coverage.seriesResponsesRetrieved,8);
  assert.equal(bundle.coverage.availableCells,40);
  assert.equal(bundle.coverage.seriesResponsesRetrieved,observations.filter(q=>q.status==='ok').length);
  const cells=bundle.baseline.countries.flatMap(c=>Object.values(c.indicators));
  assert.equal(bundle.coverage.availableCells,cells.filter(v=>v.status==='available').length);
  assert.equal(bundle.coverage.unavailableCells,cells.filter(v=>v.status==='unavailable').length);
  assert.equal(bundle.coverage.availableCells+bundle.coverage.unavailableCells,40);
  assert.equal(bundle.coverage.imputedCells,0);
  for (const country of bundle.baseline.countries) for (const [key,record] of Object.entries(country.indicators)) {
    assert.equal(record.sourceId,'2');
    assert.equal(record.sourceCountryCode,country.iso3);
    assert.equal(record.unit,inputs.catalog.indicators.find(i=>i.key===key).unit);
    assert.equal(record.fallback,null);
    if(record.status==='available') {
      assert.equal(typeof record.value,'number');assert.ok(Number.isFinite(record.value));
      assert.equal(record.originalValue,record.value);
      assert.ok(Number.isInteger(record.observationYear)&&record.observationYear<=2026);
      assert.equal(record.license.commercialUse,'allowed');assert.equal(record.license.status,'verified');
      assert.equal(record.missingReason,null);
      const query=observations.find(q=>q.series===record.series);
      assert.equal(query.status,'ok');assert.equal(record.inputChecksum,query.sha256);
      const [,rows]=JSON.parse(inputs.resources[query.id]);
      const latest=rows.filter(r=>r.countryiso3code===country.iso3 && r.value!==null && Number(r.date)<=2026)
        .sort((a,b)=>Number(b.date)-Number(a.date))[0];
      assert.ok(latest,'an available value must originate in its frozen source response');
      assert.deepEqual([record.value,record.observationYear],[latest.value,Number(latest.date)]);
    } else {
      assert.equal(record.status,'unavailable');assert.equal(record.value,null);
      assert.equal(record.originalValue,null);assert.equal(record.observationYear,null);
      assert.ok(record.missingReason);
    }
  }
  for(const [name,bytes] of Object.entries(artifacts))assert.equal(fsSync.readFileSync(path.join(DATA,name),'utf8'),bytes);
});

test('editions cannot silently reuse an acquisition frozen under a different cutoff', () => {
  const archived=loadBundle({baseDir:ARCHIVE}), currentFixture=fixture();
  assert.throws(()=>buildBaseline({...archived,catalog:currentFixture.catalog}));
  assert.throws(()=>buildBaseline({...currentFixture,catalog:archived.catalog}));
  assert.notEqual(generateArtifacts(buildBaseline(currentFixture))['scenario-baseline-v1.json'],
    generateArtifacts(buildBaseline(archived))['scenario-baseline-v1.json']);
  const downgrade=fixture();
  downgrade.catalog.termsUrl='https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets';
  downgrade.licenseReview.termsUrl=downgrade.catalog.termsUrl;
  queryOf(downgrade,'terms').url=downgrade.catalog.termsUrl;
  assert.throws(()=>buildBaseline(downgrade), /legacy|Legacy|edition|archiv/i);
});

test('offline CLI builds reproducibly in separate output directories and detects artifact tampering', async t => {
  const directory=await temporary(t), first=path.join(directory,'first'), second=path.join(directory,'second');
  for (const outDir of [first,second]) execFileSync(process.execPath, ['scripts/data/normalize-baseline.cjs','--out-dir',outDir], {cwd:ROOT});
  const files=(await fs.readdir(first)).sort();
  assert.equal(files.length,6);
  for (const name of files) assert.deepEqual(await fs.readFile(path.join(first,name)),await fs.readFile(path.join(second,name)));
  execFileSync(process.execPath, ['scripts/data/validate-baseline.cjs','--out-dir',first], {cwd:ROOT});
  await fs.appendFile(path.join(first,'scenario-baseline-v1.json'),'corrupt');
  assert.throws(()=>execFileSync(process.execPath, ['scripts/data/validate-baseline.cjs','--out-dir',first], {cwd:ROOT,stdio:'pipe'}));
  const historical=path.join(directory,'historical');
  execFileSync(process.execPath,['scripts/data/normalize-baseline.cjs','--base-dir',ARCHIVE,'--out-dir',historical],{cwd:ROOT});
  assert.equal(sha256(await fs.readFile(path.join(historical,'scenario-baseline-v1.json'))),ARCHIVED_BASELINE_HASH);
  execFileSync(process.execPath,['scripts/data/validate-baseline.cjs','--base-dir',ARCHIVE,'--out-dir',historical],{cwd:ROOT});
});

test('frozen source symlinks cannot escape the input directory', async t => {
  const baseDir=await temporary(t), inputDir=path.join(baseDir,'inputs'), inputs=fixture();
  await fs.mkdir(path.join(inputDir,'raw'),{recursive:true});
  for (const [name,value] of [['catalog.json',inputs.catalog],['country-map.json',inputs.countryMap],['license-review.json',inputs.licenseReview]]) {
    await fs.writeFile(path.join(baseDir,name),JSON.stringify(value));
  }
  await fs.writeFile(path.join(inputDir,'acquisition.json'),JSON.stringify(inputs.acquisition));
  const outside=path.join(baseDir,'outside.json');
  await fs.writeFile(outside,inputs.resources['source-2']);
  await fs.symlink(outside,path.join(inputDir,'raw/source-2.json'));
  assert.throws(()=>loadBundle({baseDir,inputDir}), /escapes/);
});
