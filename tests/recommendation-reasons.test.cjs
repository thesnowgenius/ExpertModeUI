const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const path = require('node:path');
const {test} = require('node:test');
const vm = require('node:vm');
const source = readFileSync(path.join(__dirname,'../assets/script.js'),'utf8');
const start=source.indexOf('  function buildRecommendationReasons(');
const end=source.indexOf('  function renderRecommendationExplanation(',start);
assert.ok(start>=0 && end>start);
const context={
  requestedDayCount:()=>2,getResultPassCount:r=>r.passes.length,getResultPrice:()=>530,
  getResultUnmet:r=>r.unmet || {},getResultPasses:r=>r.passes,
  constrainedResortCount:()=>0,pricingDetailsForResult:()=>[],toCurrency:n=>'$'+n,
  uniqueReasons:values=>values,
};
vm.createContext(context);vm.runInContext(source.slice(start,end),context);
function reasons(indexes){
 const result={strategy:'closest',passes:indexes.map(rider_index=>({rider_index})),unmet:{home:4}};
 return context.buildRecommendationReasons(result,0,[result],{riders:[{age:4},{age:10},{age:20},{age:33}]});
}
test('unpriced children do not become matched riders in partial family explanations',()=>{
 const actual=reasons([2,3]);
 assert.ok(actual.includes('Includes priced passes for 2 of 4 riders.'));
 assert.ok(!actual.some(s=>s.includes('Matched pricing for 4') || s.includes('4 of 4 riders')));
});
test('multiple purchases for one rider count once and index zero is retained',()=>{
 assert.ok(reasons([0,0,3]).includes('Includes priced passes for 2 of 4 riders.'));
 assert.ok(reasons([0,1,2,3]).includes('Includes priced passes for 4 of 4 riders.'));
});
test('missing or invalid rider assignments never fabricate matched rider counts',()=>{
 for(const indexes of [[],[undefined,null,-1,4,'0',0.5]]){
  assert.ok(!reasons(indexes).some(s=>s.includes('priced passes for')));
 }
});
