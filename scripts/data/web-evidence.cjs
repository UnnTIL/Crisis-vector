'use strict';
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const TERMS_EXCERPTS=Object.freeze([
  Object.freeze({id:'dataset_license',text:'Unless specifically labeled otherwise, these Datasets are provided to you under a Creative Commons Attribution 4.0 International License (CC BY 4.0)'}),
  Object.freeze({id:'dataset_terms_precedence',text:'these Dataset Terms shall prevail.'}),
  Object.freeze({id:'attribution',text:'You agree to provide attribution to The World Bank and its data providers'}),
  Object.freeze({id:'third_party_data',text:'Some datasets and indicators are provided by third parties'}),
  Object.freeze({id:'third_party_metadata',text:'Where applicable, these conditions are included in the dataset or indicator metadata.'}),
  Object.freeze({id:'additional_binding_terms',text:'mandatory and binding addition'})
]);
const hash=value=>assert.match(value,/^[a-f0-9]{64}$/,'Invalid evidence hash');
function fields(object,names,label) {
  assert.ok(object && typeof object==='object' && !Array.isArray(object),label);
  assert.deepEqual(Object.keys(object).sort(),[...names].sort(),label+' fields');
}
function date(value) {
  assert.equal(typeof value,'string');
  assert.match(value,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/);
  assert.ok(Number.isFinite(Date.parse(value)));
  assert.equal(new Date(value).toISOString().slice(0,19),value.slice(0,19));
  return Date.parse(value);
}
function documentTitle(body) {
  const match=body.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if(!match)return null;
  const title=match[1].replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  assert.ok(title.length<=200,'Document title exceeds minimal evidence scope');
  assert.ok(!/[<>]/.test(title),'HTML not allowed in document title');
  return title||null;
}
function validateWebEvidence(evidence,query) {
  fields(evidence,['schemaVersion','documentKind','source','extraction','excerpts'],'Web evidence');
  assert.equal(evidence.schemaVersion,'baseline-web-evidence-v1');
  assert.ok(['terms','documentation'].includes(query.kind),'Not a web-document query');
  assert.equal(evidence.documentKind,query.kind);
  const source=evidence.source;
  fields(source,['requestedUrl','finalUrl','requestedAt','retrievedAt','httpStatus','contentType','responseSha256','responseBytes','documentTitle','publisher','sourceVersion'],'Source evidence');
  assert.equal(source.requestedUrl,query.url);assert.equal(source.finalUrl,query.finalUrl??query.url);
  assert.equal(source.requestedAt,query.requestedAt);assert.equal(source.retrievedAt,query.completedAt);
  assert.ok(date(source.retrievedAt)>=date(source.requestedAt));
  assert.equal(source.httpStatus,200);assert.equal(source.httpStatus,query.httpStatus);
  assert.equal(source.contentType,query.contentType??null);
  assert.ok(source.contentType===null || (typeof source.contentType==='string' && source.contentType.length<=160),'Invalid MIME type');
  hash(source.responseSha256);assert.equal(source.responseSha256,query.responseSha256);
  assert.ok(Number.isSafeInteger(source.responseBytes)&&source.responseBytes>0&&source.responseBytes<=20000000,'Invalid source response size');
  assert.equal(source.responseBytes,query.responseBytes);
  assert.equal(source.publisher,'World Bank');assert.equal(source.sourceVersion,null);
  assert.ok(source.documentTitle===null || (typeof source.documentTitle==='string' && source.documentTitle.length<=200 && !/[<>]/.test(source.documentTitle)),'Invalid document title');
  fields(evidence.extraction,['method','preparedAt','fullResponseRetained'],'Extraction evidence');
  assert.equal(evidence.extraction.method,'curated-verbatim-excerpts-v1');
  assert.equal(evidence.extraction.fullResponseRetained,false);
  assert.ok(date(evidence.extraction.preparedAt)>=date(source.retrievedAt),'Evidence preparation predates source retrieval');
  assert.ok(Array.isArray(evidence.excerpts),'Excerpts must be an array');
  const required=query.kind==='terms'?TERMS_EXCERPTS:[];
  assert.equal(evidence.excerpts.length,required.length,'Unexpected number of document excerpts');
  let characters=0;
  for(let i=0;i<required.length;i++) {
    const excerpt=evidence.excerpts[i];
    fields(excerpt,['id','text','sha256','byteOffset'],'Excerpt');
    assert.equal(excerpt.id,required[i].id);assert.equal(excerpt.text,required[i].text,'Unexpected or excessive quotation');
    assert.ok(excerpt.text.length<=512&&!/[<>]/.test(excerpt.text),'HTML/excessive quotation not allowed');
    characters+=excerpt.text.length;
    hash(excerpt.sha256);assert.equal(excerpt.sha256,digest(Buffer.from(excerpt.text,'utf8')),'Excerpt checksum mismatch');
    assert.ok(Number.isSafeInteger(excerpt.byteOffset)&&excerpt.byteOffset>=0&&excerpt.byteOffset+Buffer.byteLength(excerpt.text,'utf8')<=source.responseBytes,'Excerpt offset outside original response');
  }
  assert.ok(characters<=2048,'Excessive quoted content');
  return evidence;
}
function createWebEvidence({query,response,requestedAt,retrievedAt,preparedAt}) {
  assert.ok(Buffer.isBuffer(response.body),'Original response bytes required for preparation');
  assert.equal(response.status,'ok');assert.equal(response.httpStatus,200);
  const source={requestedUrl:query.url,finalUrl:response.finalUrl??query.url,requestedAt,retrievedAt,httpStatus:response.httpStatus,
    contentType:response.contentType??null,responseSha256:digest(response.body),responseBytes:response.body.length,
    documentTitle:documentTitle(response.body.toString('utf8')),publisher:'World Bank',sourceVersion:null};
  const excerpts=(query.kind==='terms'?TERMS_EXCERPTS:[]).map(excerpt=>{
    const bytes=Buffer.from(excerpt.text,'utf8'),byteOffset=response.body.indexOf(bytes);
    assert.ok(byteOffset>=0,`Required dataset-terms quotation absent: ${excerpt.id}`);
    return {...excerpt,sha256:digest(bytes),byteOffset};
  });
  const evidence={schemaVersion:'baseline-web-evidence-v1',documentKind:query.kind,source,
    extraction:{method:'curated-verbatim-excerpts-v1',preparedAt,fullResponseRetained:false},excerpts};
  return validateWebEvidence(evidence,{...query,finalUrl:source.finalUrl,requestedAt,completedAt:retrievedAt,httpStatus:source.httpStatus,
    contentType:source.contentType,responseSha256:source.responseSha256,responseBytes:source.responseBytes});
}
function reviewedExcerpt(evidence,query,reference) {
  validateWebEvidence(evidence,query);
  const excerpt=evidence.excerpts.find(item=>item.id===reference.excerptId);
  assert.ok(excerpt && reference.excerpt===excerpt.text,'Reviewed excerpt is not a member of the frozen citation');
  assert.equal(reference.responseSha256,evidence.source.responseSha256,'Reviewed source response hash differs');
  return excerpt;
}
module.exports={TERMS_EXCERPTS,createWebEvidence,validateWebEvidence,reviewedExcerpt};
