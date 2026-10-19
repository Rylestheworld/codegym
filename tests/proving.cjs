const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../proving-data.js'),'utf8'),ctx);
const missions=JSON.parse(vm.runInContext('JSON.stringify(PROVING)',ctx));
assert.equal(new Set(missions.map(m=>m.id)).size,3);
for(const m of missions){
 assert.ok(m.cases.length>=5&&m.rubric.length>=3&&m.hint&&m.solution);
 if(m.language!=='JavaScript')continue;
 for(const c of m.cases){
  const test=vm.createContext({args:JSON.parse(JSON.stringify(c.args))});
  const before=JSON.stringify(test.args);
  const output=vm.runInContext(`${m.solution}\n${m.name}(...args)`,test,{timeout:1000});
  assert.deepEqual(JSON.parse(JSON.stringify(output)),c.expected,m.id);
  assert.equal(JSON.stringify(test.args),before,m.id+' mutated input');
 }
}
console.log('PASS: Proving Grounds metadata and JavaScript reference cases. Python and browser state flows have a separate browser suite.');
