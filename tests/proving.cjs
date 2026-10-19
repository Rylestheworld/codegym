const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const path=require('node:path');
const ctx=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../proving-data.js'),'utf8'),ctx);
const solutions=require('./proving-solutions.json');
const missions=JSON.parse(vm.runInContext('JSON.stringify(PROVING)',ctx));
assert.equal(new Set(missions.map(m=>m.id)).size,9);
for(const tier of ['Advanced','Expert','Hardcore'])assert.equal(missions.filter(m=>m.tier===tier).length,3);
for(const m of missions){
 assert.equal(m.starter,'');
 assert.ok(m.cases.length>=5&&m.rubric.length>=3&&solutions[m.id]&&!m.hint&&!m.solution);
 if(m.language!=='JavaScript')continue;
 for(const c of m.cases){
  const test=vm.createContext({args:JSON.parse(JSON.stringify(c.args))});
  const before=JSON.stringify(test.args);
  const output=vm.runInContext(`${solutions[m.id]}\n${m.name}(...args)`,test,{timeout:1000});
  assert.deepEqual(JSON.parse(JSON.stringify(output)),c.expected,m.id);
  assert.equal(JSON.stringify(test.args),before,m.id+' mutated input');
 }
}
console.log('PASS: Proving Grounds metadata and JavaScript reference cases. Python and browser state flows have a separate browser suite.');
// Reject plausible semantic bugs, not only empty implementations.
for(const [id,from,to] of [
 ['coverage-union','Math.max(a,end)','a'],
 ['lru-replay','cache.delete(key);cache.set(key,found);',''],
 ['frame-decoder','end>=stream.length','end>stream.length'],
 ['byte-machine','pc+=','pc+=1+']
]){
 const m=missions.find(m=>m.id===id), source=solutions[id].replace(from,to);
 assert.notEqual(source,solutions[id]);
 assert.ok(m.cases.some(c=>{
  try {const output=vm.runInNewContext(`${source}\n${m.name}(...args)`,{args:JSON.parse(JSON.stringify(c.args))},{timeout:1000});assert.deepEqual(JSON.parse(JSON.stringify(output)),c.expected);return false;}catch{return true;}
 }),id+' failed to detect semantic regression');
}
console.log('PASS: interval, cache-recency, framing-boundary, and instruction-counter semantic regressions rejected.');
