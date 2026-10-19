// Structural checks protect curriculum coverage and answer grading metadata.
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {ctx,data}=require('./tests/load-data.cjs').load();
const bank=data.questions;
assert.equal(bank.length,575);
assert.equal(new Set(bank.map(q=>q.id)).size,575,'Challenge IDs must be unique');
const topics = [...new Set(bank.map(q=>q.language))];
assert.equal(topics.length,23);
for(const topic of topics) {
  for(let level=1;level<=5;level++) assert.equal(bank.filter(q=>q.language===topic && q.level===level).length,5,`${topic}, tier ${level}`);
}
for(const q of bank) {
  for(const field of ['title','prompt','code','hint','explanation','extension']) assert.ok(q[field]?.trim(),`${q.id}: ${field}`);
  assert.ok(q.answers.length && q.answers.every(a=>typeof a==='string' && a.trim()),`${q.id}: answers`);
  if(q.options) {
    assert.equal(new Set(q.options).size,q.options.length,`${q.id}: duplicated choices`);
    assert.ok(q.options.includes(q.answers[0]),`${q.id}: accepted answer missing`);
    assert.ok(q.options.length>=3,`${q.id}: too few choices`);
  } else assert.ok(q.code.includes('____'),`${q.id}: missing blank`);
  if(q.source) assert.ok(q.source.startsWith('https://'),`${q.id}: reference URL`);
}
console.log('PASS: 575 unique challenges; 23 topics × 5 tiers × 5 questions; complete answer, explanation, hint, and follow-up metadata.');
const lessons = JSON.parse(vm.runInContext('JSON.stringify(LESSONS)',ctx));
assert.equal(Object.keys(lessons).length,topics.length);
for(const topic of topics) {
  const lesson=lessons[topic]; assert.ok(lesson,topic);
  for(const field of ['intro','code','exercise','solution','source']) assert.ok(lesson[field]?.trim(),`${topic}: ${field}`);
  assert.ok(lesson.concepts.length>=3 && lesson.concepts.every(c=>c.length===2 && c.every(s=>s.trim())),`${topic}: concepts`);
  assert.ok(lesson.walkthrough.length>=3,`${topic}: walkthrough`);
  assert.ok(lesson.pitfalls.length>=3,`${topic}: pitfalls`);
}
console.log('PASS: 23 introductions with key concepts, worked examples, explanations, pitfalls, exercises, solutions, and references.');
const paths=JSON.parse(vm.runInContext('JSON.stringify(PATHS)',ctx));
assert.equal(new Set(paths.map(p=>p.id)).size,paths.length);
assert.deepEqual([...new Set(paths.flatMap(p=>p.topics))].sort(),topics.slice().sort());
assert.ok(paths.every(p=>p.topics.length && p.topics.every(t=>topics.includes(t))));
console.log('PASS: 7 distinct training paths cover all 23 topics using existing curriculum.');

require('./tests/learning-engine.cjs');
console.log('PASS: 115 tier lessons and transfer examples, 14 written exercises, and 3 connected missions.');

require("./tests/proving.cjs");
