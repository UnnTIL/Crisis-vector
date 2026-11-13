#!/usr/bin/env node
'use strict';

// Acquisition runs only at build time. curl uses the environment's proxy and CA
// trust; neither certificate verification nor proxy policy is bypassed.
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {execFile} = require('node:child_process');
const {promisify} = require('node:util');
const {createHash} = require('node:crypto');
const assert = require('node:assert/strict');
const {PILOT, SERIES} = require('./baseline.cjs');
const run = promisify(execFile);
const ROOT = path.resolve(__dirname, '../..');
const DEFAULT_BASE = path.join(ROOT, 'data/baseline');
const DEFAULT_INPUTS = path.join(DEFAULT_BASE, 'inputs');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

function makeQueries(catalog, countryMap) {
  if (catalog.sourceId !== '2') throw new Error('This pilot accepts WDI source 2 only.');
  if (typeof catalog.freezeDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(catalog.freezeDate)
      || !Number.isFinite(Date.parse(catalog.freezeDate)) || new Date(catalog.freezeDate).toISOString().slice(0,10) !== catalog.freezeDate) {
    throw new Error('Invalid calendar freezeDate.');
  }
  assert.deepEqual(countryMap.countries.map(c=>c.iso3), PILOT, 'Expected the five ordered pilot ISO3 countries.');
  assert.deepEqual(catalog.indicators.map(i=>i.series), SERIES, 'Expected the eight ordered pilot series.');
  for (const country of countryMap.countries) {
    if (country.sourceId !== country.iso3 || country.internalId !== country.iso3) throw new Error('Pilot country mapping must preserve ISO3 identity.');
  }
  const countries = countryMap.countries.map(c => c.sourceId);
  if (countries.length !== 5 || countries.some(c => !/^[A-Z]{3}$/.test(c)) || new Set(countries).size !== 5) {
    throw new Error('Expected five distinct ISO3 source country IDs.');
  }
  const countryList = countries.join(';');
  const api = 'https://api.worldbank.org/v2';
  const freezeYear = Number(catalog.freezeDate.slice(0, 4));
  if (!Number.isInteger(catalog.startYear) || catalog.startYear < 1960 || catalog.startYear > freezeYear) {
    throw new Error('Invalid startYear.');
  }
  const queries = [
    {id:'source-2', kind:'source', series:null, url:`${api}/source/2?format=json`},
    {id:'countries', kind:'countries', series:null, url:`${api}/country/${countryList}?format=json&per_page=100`}
  ];
  if(catalog.termsUrl)queries.push({id:'country-metadata',kind:'country-metadata',series:null,url:`${api}/sources/2/country/${countryList}/metadata?format=json&per_page=10000`});
  for (const indicator of catalog.indicators) {
    const series = indicator.series;
    if (typeof series !== 'string' || !/^[A-Z0-9.]+$/.test(series)) throw new Error('Invalid indicator series ID.');
    queries.push(
      {id:`metadata-${series}`, kind:'indicator-metadata', series, url:`${api}/indicator/${series}?source=2&format=json`},
      {id:`series-${series}`, kind:'series-metadata', series, url:`${api}/sources/2/series/${series}/metadata?format=json&per_page=10000`},
      {id:`observations-${series}`, kind:'observations', series, url:`${api}/country/${countryList}/indicator/${series}?source=2&date=${catalog.startYear}:${freezeYear}&format=json&per_page=20000`}
    );
  }
  const termsUrl = new URL(catalog.termsUrl || 'https://www.worldbank.org/en/about/legal/terms-of-use-for-datasets');
  if (termsUrl.protocol !== 'https:' || termsUrl.username || termsUrl.password || termsUrl.port
      || !(termsUrl.hostname === 'worldbank.org' || termsUrl.hostname.endsWith('.worldbank.org'))) {
    throw new Error('Dataset terms must use an official HTTPS World Bank URL.');
  }
  queries.push(
    {id:'terms', kind:'terms', series:null, url:termsUrl.toString()},
    {id:'documentation', kind:'documentation', series:null, url:'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation'}
  );
  return queries;
}

function validateTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error('Acquisition time must be a valid UTC ISO timestamp.');
  }
  if (new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)) throw new Error('Invalid calendar timestamp.');
  return new Date(value).toISOString();
}

async function curlRequest(url) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'crisis-wdi-'));
  const bodyFile = path.join(directory, 'body');
  try {
    let stdout = '', stderr = '', exitCode = 0;
    try {
      const result = await run('curl', [
        '--silent', '--show-error', '--fail-with-body', '--location',
        '--proto', '=https', '--proto-redir', '=https',
        '--connect-timeout', '20', '--max-time', '45', '--max-filesize', '20000000',
        '--output', bodyFile, '--write-out', '%{json}', url
      ], {maxBuffer:65536, timeout:50000});
      stdout = result.stdout; stderr = result.stderr;
    } catch (error) {
      stdout = String(error.stdout || ''); stderr = String(error.stderr || ''); exitCode = error.code || 'unknown';
    }
    let metadata = {};
    try { metadata = JSON.parse(stdout); } catch { /* Transport failure may have no final response metadata. */ }
    const code = Number.isInteger(metadata.http_code) ? metadata.http_code : 0;
    const httpStatus = code || null;
    let finalUrl = null;
    if (typeof metadata.url_effective === 'string' && metadata.url_effective) {
      try {
        const effective = new URL(metadata.url_effective);
        if (effective.protocol === 'https:' && !effective.username && !effective.password) finalUrl = effective.toString();
      } catch { /* Invalid effective URLs are never treated as evidence. */ }
    }
    const contentType = typeof metadata.content_type === 'string' && metadata.content_type ? metadata.content_type : null;
    if (/CONNECT tunnel failed, response 403/i.test(stderr)) {
      return {status:'blocked', httpStatus:null, proxyStatus:403, finalUrl:null, contentType:null,
        errorCode:'proxy_connect_denied', error:'The configured proxy rejected HTTPS CONNECT with HTTP 403.', body:null};
    }
    if (exitCode || httpStatus !== 200) {
      return {status:'error', httpStatus, proxyStatus:null, finalUrl, contentType, errorCode:httpStatus ? `http_${httpStatus}` : `curl_${String(exitCode)}`,
        error:httpStatus ? `Source request returned HTTP ${httpStatus}.` : `curl request failed (exit ${String(exitCode)}).`, body:null};
    }
    return {status:'ok', httpStatus, proxyStatus:null, finalUrl, contentType, errorCode:null, error:null, body:await fs.readFile(bodyFile)};
  } finally {
    await fs.rm(directory, {recursive:true, force:true});
  }
}

async function acquire({catalog, countryMap, outDir=DEFAULT_INPUTS, replace=false, request=curlRequest, clock=()=>new Date().toISOString()}) {
  // Injectable clock exists for fixture transports only. Live acquisition always
  // records the actual wall clock; the CLI cannot backdate data to a freeze.
  const timestamp = () => validateTimestamp(request === curlRequest ? new Date().toISOString() : clock());
  const queries = makeQueries(catalog, countryMap);
  const acquisitionFile = path.join(outDir, 'acquisition.json');
  const manifest = {schemaVersion:'baseline-inputs-v1', freezeDate:catalog.freezeDate, startedAt:timestamp(), completedAt:null, queries:[]};
  if (manifest.startedAt.slice(0, 10) > catalog.freezeDate) {
    throw new Error('Acquisition date is after freezeDate; create a new data edition with a current cutoff.');
  }
  await fs.mkdir(outDir, {recursive:true});
  // Reserve the output before contacting any source, preventing accidental
  // overwrite and concurrent writers. --replace is an explicit refresh only.
  const handle = await fs.open(acquisitionFile, replace ? 'w' : 'wx');
  try {
    await handle.writeFile(JSON.stringify({...manifest, incomplete:true}, null, 2) + '\n');
    const blockedHosts = new Map();
    await fs.mkdir(path.join(outDir, 'raw'), {recursive:true});
    for (const query of queries) {
      const host = new URL(query.url).hostname;
      const evidenceRequestId = blockedHosts.get(host);
      const record = {...query, requestedAt:null, completedAt:null, status:'blocked', attempted:false,
        httpStatus:null, proxyStatus:null, finalUrl:null, contentType:null, errorCode:null, error:null, file:null, sha256:null, evidenceRequestId:null};
      if (evidenceRequestId) {
        record.errorCode = 'host_blocked_after_denial';
        record.error = 'Not retried: an earlier request to this host was explicitly denied by the configured proxy.';
        record.evidenceRequestId = evidenceRequestId;
      } else {
        record.attempted = true;
        record.requestedAt = timestamp();
        let response;
        try { response = await request(query.url); }
        catch { response = {status:'error', httpStatus:null, proxyStatus:null, errorCode:'request_failed', error:'The source request failed before completion.', body:null}; }
        record.completedAt = timestamp();
        if (!response || !['ok', 'blocked', 'error'].includes(response.status)) throw new Error('Invalid acquisition transport response.');
        let finalUrl = null;
        if (response.finalUrl !== undefined && response.finalUrl !== null) {
          const effective = new URL(response.finalUrl);
          if (effective.protocol !== 'https:' || effective.username || effective.password) throw new Error('Invalid final acquisition URL.');
          finalUrl = effective.toString();
        }
        Object.assign(record, {status:response.status, httpStatus:response.httpStatus, proxyStatus:response.proxyStatus ?? null,
          finalUrl, contentType:response.contentType ?? null, errorCode:response.errorCode, error:response.error});
        if (response.status === 'blocked') blockedHosts.set(host, query.id);
        if (response.status === 'ok') {
          if (!Buffer.isBuffer(response.body)) throw new Error('Successful transport must return exact bytes.');
          const extension = query.kind === 'terms' || query.kind === 'documentation' ? 'html' : 'json';
          record.file = `raw/${query.id}.${extension}`;
          record.sha256 = sha256(response.body);
          await fs.writeFile(path.join(outDir, record.file), response.body);
        }
      }
      manifest.queries.push(record);
    }
    manifest.completedAt = timestamp();
    await handle.truncate(0);
    await handle.write(JSON.stringify(manifest, null, 2) + '\n', 0, 'utf8');
  } finally {
    await handle.close();
  }
  return manifest;
}

function parseArguments(args) {
  const options = {};
  for (let i=0; i<args.length; i++) {
    if (args[i] === '--replace') options.replace = true;
    else if (args[i] === '--out-dir' || args[i] === '--base-dir') {
      const option = args[i];
      const value = args[++i];
      if (!value || value.startsWith('--')) throw new Error('Missing option value.');
      if (option === '--base-dir') options.baseDir = path.resolve(value);
      else options.outDir = path.resolve(value);
    } else throw new Error(`Unknown argument: ${args[i]}`);
  }
  return options;
}

async function main(args) {
  const options = parseArguments(args);
  const baseDir = options.baseDir || DEFAULT_BASE;
  const outDir = options.outDir || path.join(baseDir, 'inputs');
  const catalog = JSON.parse(await fs.readFile(path.join(baseDir, 'catalog.json'), 'utf8'));
  const countryMap = JSON.parse(await fs.readFile(path.join(baseDir, 'country-map.json'), 'utf8'));
  const manifest = await acquire({catalog, countryMap, outDir, replace:options.replace});
  const totals = Object.fromEntries(['ok', 'blocked', 'error'].map(status => [status, manifest.queries.filter(q=>q.status===status).length]));
  console.log(JSON.stringify({acquisition:path.join(outDir, 'acquisition.json'), ...totals}));
  return totals.blocked || totals.error ? 2 : 0;
}

module.exports = {makeQueries, validateTimestamp, curlRequest, acquire, parseArguments, main};
if (require.main === module) main(process.argv.slice(2)).then(code=>{process.exitCode=code;}).catch(error=>{
  console.error(error.code === 'EEXIST' ? 'Acquisition already exists; choose a new --out-dir or explicitly use --replace.' : error.message);
  process.exitCode=1;
});
