'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const {TERMS_EXCERPTS,createWebEvidence,validateWebEvidence,reviewedExcerpt}=require('../scripts/data/web-evidence.cjs');
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const ROOT=path.resolve(__dirname,'..');
const DATA=path.join(ROOT,'data/baseline');
const NOW='2026-11-13T12:00:00.000Z';
const LATER='2026-11-13T12:01:00.000Z';
function fixture(kind='terms') {
  const query={id:kind,kind,url:kind==='terms'?'https://www.worldbank.org/ext/en/legal/terms-conditions/datasets':'https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation',
    requestedAt:NOW,completedAt:LATER,httpStatus:200,contentType:'text/html; charset=utf-8'};
  const quotes=kind==='terms'?TERMS_EXCERPTS.map(e=>`<p>${e.text}</p>`).join(''):'';
  // This full page exists only as a synthetic, in-memory test transport body.
  const body=Buffer.from('<!doctype html><html><head><title>Synthetic evidence test</title></head><body>'+quotes+
    '<script>const unretained = "FULL_PAGE_ONLY_TEST_SENTINEL";</script>'+('unretained fixture text '.repeat(500))+'</body></html>');
  const response={status:'ok',httpStatus:200,finalUrl:query.url,contentType:query.contentType,body};
  const evidence=createWebEvidence({query,response,requestedAt:NOW,retrievedAt:LATER,preparedAt:LATER});
  Object.assign(query,{finalUrl:response.finalUrl,responseSha256:sha256(body),responseBytes:body.length,
    file:`evidence/${kind}.json`,representation:'minimal-web-evidence-v1'});
  return {query,response,evidence};
}

test('web evidence retains exact short citations and original-response metadata without the HTML body',()=>{
  for(const kind of ['terms','documentation']) {
    const {query,response,evidence}=fixture(kind);
    validateWebEvidence(evidence,query);
    assert.equal(evidence.schemaVersion,'baseline-web-evidence-v1');
    assert.equal(evidence.source.responseSha256,sha256(response.body));
    assert.equal(evidence.source.responseBytes,response.body.length);
    assert.equal(evidence.extraction.fullResponseRetained,false);
    assert.equal(evidence.excerpts.length,kind==='terms'?TERMS_EXCERPTS.length:0);
    let count=0;
    for(const quote of evidence.excerpts) {
      assert.ok(quote.text.length<=512);count+=quote.text.length;
      assert.equal(quote.sha256,sha256(quote.text));
      assert.equal(response.body.subarray(quote.byteOffset,quote.byteOffset+Buffer.byteLength(quote.text)).toString(),quote.text);
    }
    assert.ok(count<=2048);
    const minimal=JSON.stringify(evidence);
    assert.ok(!minimal.includes('FULL_PAGE_ONLY_TEST_SENTINEL'));
    assert.ok(!/<\/?(?:html|head|body|script)\b/i.test(minimal));
    assert.ok(minimal.length<response.body.length);
    assert.equal(Object.hasOwn(evidence,'body'),false);
    assert.equal(Object.hasOwn(evidence.source,'body'),false);
  }
});

test('preparing terms evidence fails when any required verbatim quote is absent',()=>{
  const {query,response}=fixture();
  for(const quote of TERMS_EXCERPTS) {
    const body=Buffer.from(response.body.toString().replace(quote.text,'quotation omitted in synthetic fixture'));
    assert.throws(()=>createWebEvidence({query,response:{...response,body},requestedAt:NOW,retrievedAt:LATER,preparedAt:LATER}),/quotation absent/);
  }
});

test('source URL, response hash, dates, size and title tampering invalidate web evidence',()=>{
  for(const mutate of [
    e=>{e.source.requestedUrl='https://www.worldbank.org/unrelated';},
    e=>{e.source.finalUrl='https://www.worldbank.org/unrelated';},
    e=>{e.source.responseSha256='0'.repeat(64);},
    e=>{e.source.responseBytes++;},
    e=>{e.source.retrievedAt='2026-11-13T11:00:00.000Z';},
    e=>{e.extraction.preparedAt=NOW;},
    e=>{e.source.documentTitle='<script>not a title</script>';},
    e=>{e.source.documentTitle='a'.repeat(201);},
    e=>{e.source.publisher='Unverified publisher';},
    e=>{e.source.body='Full page must not be retained';}
  ]) {
    const {query,evidence}=fixture();mutate(evidence);
    assert.throws(()=>validateWebEvidence(evidence,query));
  }
  const oversized=fixture();oversized.evidence.source.responseBytes=oversized.query.responseBytes=20000001;
  assert.throws(()=>validateWebEvidence(oversized.evidence,oversized.query),/size/);
});

test('oversized, arbitrary, HTML or rehashed quotations cannot expand the curated evidence',()=>{
  for(const mutate of [
    e=>{e.excerpts[0].text='x'.repeat(513);e.excerpts[0].sha256=sha256(e.excerpts[0].text);},
    e=>{e.excerpts[0].text='<html>full page excerpt</html>';e.excerpts[0].sha256=sha256(e.excerpts[0].text);},
    e=>{e.excerpts[0].text='Arbitrary replacement text';e.excerpts[0].sha256=sha256(e.excerpts[0].text);},
    e=>{e.excerpts[0].sha256='0'.repeat(64);},
    e=>{e.excerpts[0].byteOffset=e.source.responseBytes;},
    e=>{e.excerpts.push({...e.excerpts[0]});},
    e=>{e.extraction.fullResponseRetained=true;}
  ]) {
    const {query,evidence}=fixture();mutate(evidence);
    assert.throws(()=>validateWebEvidence(evidence,query));
  }
});

test('license citation must identify an exact frozen excerpt and its original response hash',()=>{
  const {query,evidence}=fixture();
  const quote=evidence.excerpts.find(e=>e.id==='dataset_license');
  const reference={excerptId:quote.id,excerpt:quote.text,responseSha256:evidence.source.responseSha256};
  assert.deepEqual(reviewedExcerpt(evidence,query,reference),quote);
  for(const change of [
    r=>{r.excerptId='nonexistent';},r=>{r.excerpt='Creative Commons';},
    r=>{r.excerpt='World Bank';},r=>{r.excerpt='publisher';},
    r=>{r.responseSha256='0'.repeat(64);}
  ]) {
    const invalid={...reference};change(invalid);
    assert.throws(()=>reviewedExcerpt(evidence,query,invalid));
  }
});

test('current frozen inputs and tracked baseline files contain no retained HTML pages',()=>{
  const acquisition=JSON.parse(fs.readFileSync(path.join(DATA,'inputs/acquisition.json'),'utf8'));
  for(const query of acquisition.queries.filter(q=>q.status==='ok'&&['terms','documentation'].includes(q.kind))) {
    assert.equal(query.file,`evidence/${query.id}.json`);
    assert.equal(query.representation,'minimal-web-evidence-v1');
    const bytes=fs.readFileSync(path.join(DATA,'inputs',query.file));
    assert.equal(sha256(bytes),query.sha256);
    validateWebEvidence(JSON.parse(bytes),query);
    assert.ok(!/<\/?(?:html|head|body|script)\b/i.test(bytes.toString()));
  }
  function walk(directory) {
    for(const e of fs.readdirSync(directory,{withFileTypes:true})) {
      const name=path.join(directory,e.name);
      if(e.isDirectory())walk(name);
      else assert.ok(!/\.html?$/i.test(name),`Retained HTML input: ${name}`);
    }
  }
  walk(path.join(DATA,'inputs'));
  const tracked=execFileSync('git',['ls-files','-z','--','data/baseline'],{cwd:ROOT,encoding:'utf8'}).split('\0').filter(Boolean);
  for(const file of tracked.filter(file=>/\.html?$/i.test(file))) {
    assert.equal(fs.existsSync(path.join(ROOT,file)),false,`Tracked full web page still present: ${file}`);
  }
});
