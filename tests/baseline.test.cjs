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
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data/baseline');
const readConfig = name => JSON.parse(fsSync.readFileSync(path.join(DATA, name), 'utf8'));

// Values and responses built in these tests are synthetic fixtures only. They
// are never fetched from a provider or published as the real-country baseline.
const retrievedAt = '2026-11-12T12:00:00.000Z';
const fixtureCatalog = readConfig('catalog.json');
const fixtureCountries = readConfig('country-map.json');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
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
  assert.equal(acquisition.queries.length, 28);
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

test('acquisition freezes exact response bytes and refuses replacement before making requests', async t => {
  const outDir = await temporary(t), body = Buffer.from('{"synthetic-fixture":true}\n');
  const acquisition = await acquire({catalog:fixtureCatalog, countryMap:fixtureCountries, outDir, clock:()=>retrievedAt,
    request:async()=>({status:'ok', httpStatus:200, errorCode:null, error:null, body})});
  assert.equal(acquisition.queries.length, 28);
  for (const query of acquisition.queries) {
    const frozen = await fs.readFile(path.join(outDir, query.file));
    assert.deepEqual(frozen, body);
    assert.equal(query.sha256, digest(body));
  }
  let calls = 0;
  await assert.rejects(()=>acquire({catalog:fixtureCatalog, countryMap:fixtureCountries, outDir, clock:()=>retrievedAt,
    request:async()=>{calls++; throw new Error('must never be requested');}}), {code:'EEXIST'});
  assert.equal(calls, 0);
});

function page(rows, extra={}) {
  return [{page:1, pages:1, total:rows.length, ...extra}, rows];
}
function fixture() {
  const catalog = structuredClone(fixtureCatalog), countryMap = structuredClone(fixtureCountries);
  const licenseReview = readConfig('license-review.json'), resources = Object.create(null);
  const evidenceText = 'Synthetic test-only permission evidence; not a real provider license.';
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
    else if (query.kind==='indicator-metadata') payload = page([{id:query.series, name:'Synthetic '+query.series, unit:'', source:{id:'2'}, sourceOrganization:'Test fixture', sourceNote:'Not actual country data.'}]);
    else if (query.kind==='series-metadata') payload = {testOnly:true};
    else if (query.kind==='observations') {
      const indicator = catalog.indicators.find(i=>i.series===query.series);
      const base = ['urbanization','research'].includes(indicator.key)?20:1000;
      payload = page(countryMap.countries.flatMap((c, index)=>[
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2027', value:base+5, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2026', value:null, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2025', value:base+index, obs_status:''},
        {countryiso3code:c.iso3, indicator:{id:query.series}, date:'2023', value:base-1, obs_status:'estimated'}
      ]), {lastupdated:'2026-10-01'});
    } else payload = evidenceText;
    resources[query.id] = Buffer.from(typeof payload==='string'?payload:JSON.stringify(payload));
    query.sha256 = sha256(resources[query.id]);
  }
  const terms = acquisition.queries.find(q=>q.kind==='terms');
  for (const [series, review] of Object.entries(licenseReview.series)) {
    const metadata=acquisition.queries.find(q=>q.kind==='indicator-metadata' && q.series===series);
    Object.assign(review, {
      status:'verified', licenseId:'LicenseRef-SyntheticTestFixture', commercialUse:'allowed',
      thirdPartyExceptionsReviewed:true, reviewedAt:retrievedAt, attribution:'Synthetic test fixture only',
      evidence:[{queryId:terms.id, sha256:terms.sha256, excerpt:evidenceText},
        {queryId:metadata.id, sha256:metadata.sha256, excerpt:'Synthetic '+series}]
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
});

test('future source revisions are not presented as a historical freeze and future retrieval dates reject', () => {
  const inputs=fixture();
  changePayload(inputs, 'observations', p=>{p[0].lastupdated='2026-11-13';});
  const result=buildBaseline(inputs);
  assert.equal(cell(result).value, null);
  assert.equal(cell(result).missingReason, 'source_revision_after_freeze');
  const retrieved=fixture();retrieved.acquisition.completedAt='2026-11-13T00:00:00.000Z';
  assert.throws(()=>buildBaseline(retrieved), /freeze/);
  const request=fixture();request.acquisition.queries[0].requestedAt='2026-11-13T00:00:00.000Z';
  assert.throws(()=>buildBaseline(request));
  const invalidDate=fixture();changePayload(invalidDate,'observations',p=>{p[0].lastupdated='2026-00-00';});
  assert.throws(()=>buildBaseline(invalidDate));
});

test('commercial redistribution requires per-series approval, third-party review and frozen evidence', () => {
  const pending=fixture();
  pending.licenseReview.series=readConfig('license-review.json').series;
  const result=buildBaseline(pending);
  assert.equal(result.coverage.availableCells, 0);
  assert.equal(result.coverage.missingReasons.license_not_cleared, 40);
  assert.equal(cell(result).originalValue, null, 'uncleared source values must not leak into distributable artifacts');
  for (const change of [
    r=>{r.thirdPartyExceptionsReviewed=false;}, r=>{r.evidence=[];},
    r=>{r.evidence[0].sha256='0'.repeat(64);}, r=>{r.evidence[0].excerpt='not present in evidence';},
    r=>{r.commercialUse='not_cleared';}, r=>{r.reviewedAt='2026-11-13T00:00:00.000Z';}
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

test('checked-in pilot artifacts rebuild offline and explicitly document blocked coverage', () => {
  const inputs=loadBundle(), bundle=buildBaseline(inputs), artifacts=generateArtifacts(bundle);
  assert.equal(bundle.baseline.countries.length,5);
  assert.equal(bundle.coverage.totalCells,40);
  assert.equal(bundle.coverage.availableCells,0);
  assert.equal(bundle.coverage.missingReasons.network_access_denied,40);
  for (const [name,bytes] of Object.entries(artifacts)) assert.equal(fsSync.readFileSync(path.join(DATA,name),'utf8'),bytes);
  for (const country of bundle.baseline.countries) for (const record of Object.values(country.indicators)) {
    assert.equal(record.value,null);assert.equal(record.observationYear,null);
    assert.equal(record.fallback,null);assert.equal(record.license.commercialUse,'not_cleared');
  }
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
