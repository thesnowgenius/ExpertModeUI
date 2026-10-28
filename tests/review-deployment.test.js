const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const deployment = require('../assets/review-deployment.js');
const good = {mode:'review',apiOrigin:'https://sa.example.com',localTest:false};
test('pins a canonical origin and returns immutable routing', () => {
  const config = deployment.validate(good,good.apiOrigin);
  assert.equal(config.apiUrl,'https://sa.example.com/score_pass');
  assert.ok(Object.isFrozen(config));
});
test('missing, conflicting, unsafe or production configuration fails closed', () => {
  for (const value of [undefined,{}, {...good,mode:'production'}, {...good,apiOrigin:'https://elsewhere.example.com'},
    {...good,apiOrigin:'https://pass-picker-expert-mode-multi.onrender.com'},
    {...good,apiOrigin:'https://pass-picker-expert-mode-multi.onrender.com.'},
    {...good,apiOrigin:'https://api.snow-genius.com'}, {...good,apiOrigin:'https://user:secret@sa.example.com'},
    {...good,apiOrigin:'https://sa.example.com/path'}, {...good,apiOrigin:'http://127.0.0.1:8007'}]) {
    assert.throws(()=>deployment.validate(value,good.apiOrigin));
  }
});
test('production aliases cannot pass even with matching meta', () => {
  for (const apiOrigin of ['https://pass-picker-expert-mode-multi.onrender.com.','https://api.snow-genius.com']) {
    assert.throws(()=>deployment.validate({...good,apiOrigin},apiOrigin));
  }
});
test('loopback requires explicit local-only build', () => {
  const apiOrigin='http://127.0.0.1:8007';
  assert.throws(()=>deployment.validate({...good,apiOrigin},apiOrigin));
  assert.equal(deployment.validate({...good,apiOrigin,localTest:true},apiOrigin).apiOrigin,apiOrigin);
});
test('preview provider links do not reuse production redirects', () => {
  assert.equal(deployment.providerUrl('https://passes.example.com/buy'),'https://passes.example.com/buy');
  for (const value of [undefined,'javascript:alert(1)','http://passes.example.com','https://pass-picker-expert-mode-multi.onrender.com/outbound/token']) assert.equal(deployment.providerUrl(value),'');
});
for (const scenario of ['missing helper','missing config','conflicting origin']) {
  test('application makes zero requests with '+scenario, () => {
    const notice={hidden:true,textContent:''};const button={disabled:false};let requests=0;
    const context={document:{documentElement:{dataset:{sgDeployment:'review'}},querySelector:()=>({content:good.apiOrigin}),getElementById:()=>notice,querySelectorAll:()=>[button]},
      window:{SnowGeniusReviewDeployment:scenario==='missing helper'?undefined:deployment,SnowGeniusReviewConfig:scenario==='missing config'?undefined:{...good,apiOrigin:'https://wrong.example.com'}},fetch:()=>{requests++;throw Error('Must not fetch');}};
    vm.runInNewContext(fs.readFileSync(require.resolve('../assets/script.js'),'utf8'),context);
    assert.equal(requests,0);assert.equal(button.disabled,true);assert.equal(notice.hidden,false);
    assert.match(notice.textContent,/missing or invalid/);
  });
}
