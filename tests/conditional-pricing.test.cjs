const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {test} = require('node:test');
const vm = require('node:vm');
const path = require('node:path');
const asset = '../assets/conditional-pricing.js';
function setup() {
  let now = Date.now(), scheduled;
  class Clock extends Date { static now() { return now; } }
  const context = {window:{},Date:Clock,URL,Intl,setTimeout:fn=>{scheduled=fn;return 1;},clearTimeout:()=>{}};
  vm.runInNewContext(readFileSync(path.join(__dirname,asset),'utf8'),context);
  return {api:context.window.SGConditionalPricing, advance(ms) { now+=ms;scheduled?.(); }};
}
function quote() {
  const end=new Date(Date.now()+60000).toISOString();
  return {version:1,currency:'USD',total_cents:50075,regular_total_cents:53075,savings_cents:3000,
    next_offer_transition_at:end,
    purchases:[{purchase_id:'a',rider_index:0,regular_price_cents:50075,payable_price_cents:50075,conditional_beneficiary:false,qualifying_purchase:true},
      {purchase_id:'c',rider_index:1,regular_price_cents:3000,payable_price_cents:0,conditional_beneficiary:true,qualifying_purchase:false}],
    adjustments:[{beneficiary_purchase_id:'c',qualifying_purchase_id:'a',regular_price_cents:3000,promo_price_cents:0,discount_cents:3000,
      terms:['Buy the qualifying adult pass.'],source_url:'https://provider.example/rules',review_by:end}],unconfirmed_offers:[]};
}
test('exact cents and paid qualifying purchase survive the display contract',()=>{
  const {api}=setup();assert.equal(api.validate(quote(),500.75).total_cents,50075);
  assert.equal(api.requireContract(undefined),false);assert.equal(api.requireContract('conditional-v1'),true);
  assert.throws(()=>api.requireContract('conditional-v2'));
});
test('wrong totals, missing qualifier, unsafe links and expired rules fail closed',()=>{
  for(const corrupt of [q=>q.total_cents++,q=>q.savings_cents++,q=>q.purchases[0].payable_price_cents=0,
    q=>q.adjustments[0].qualifying_purchase_id='missing',q=>q.adjustments[0].source_url='javascript:alert(1)',
    q=>q.adjustments[0].review_by='2020-01-01',q=>q.next_offer_transition_at='2020-01-01',
    q=>q.purchases.push(q.purchases[0]),q=>q.adjustments=[]]) {
    const q=quote();corrupt(q);assert.throws(()=>setup().api.validate(q,500.75));
  }
});
test('unknown regular price never fabricates savings or a baseline',()=>{
  const q=quote();q.purchases[1].regular_price_cents=null;q.regular_total_cents=null;q.savings_cents=null;
  q.adjustments[0].regular_price_cents=null;q.adjustments[0].discount_cents=null;
  const {api}=setup();assert.equal(api.validate(q,500.75).regular_total_cents,null);
  q.savings_cents=3000;assert.throws(()=>api.validate(q,500.75));
});
test('active responses require a breakdown or explicit partial/limited status',()=>{
  const {api}=setup();assert.throws(()=>api.validateRows([{price:500}],true));
  api.validateRows([{price:500}],false);
  api.validateRows([{price:500,conditional_pricing_status:'standalone_partial_coverage'}],true);
});
test('expiry clears old quotes and a new result cancels the old deadline',()=>{
  const {api,advance}=setup();let expired=0;
  api.watch([{conditional_pricing:quote()}],()=>expired++);advance(61000);assert.equal(expired,1);
  api.watch([{conditional_pricing:quote()}],()=>expired++); // Already expired against the synthetic clock.
  assert.equal(expired,2);
  const second=setup();second.api.watch([{conditional_pricing:quote()}],()=>expired++);
  second.api.watch([],()=>expired++);second.advance(61000);assert.equal(expired,2);
});
