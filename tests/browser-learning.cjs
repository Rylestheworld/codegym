const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const url=process.env.CODEGYM_TEST_URL||'http://127.0.0.1:8765';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CODEGYM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url);
 assert.equal(await page.locator('#learning').isVisible(),true);
 assert.equal(await page.locator('[data-lesson-topic]').count(),23);
 assert.equal(await page.evaluate(()=>Object.keys(TIER_LESSONS).length),115);
 await page.locator('#lesson-search').fill('python');
 assert.equal(await page.locator('[data-lesson-topic]:visible').count(),1);
 assert.equal(await page.evaluate(()=>document.querySelectorAll('[data-mission-id][hidden]').length),0);
 await page.locator('#lesson-search').fill('');
 const old={version:1,xp:20,days:[],levels:{JavaScript:2},records:{js1:{attempts:2,correct:2,clean:2,misses:0,review:false}}};
 await page.locator('#import').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});
 await page.waitForFunction(()=>state.xp===20);
 assert.equal(await page.evaluate(()=>state.version),2);
 assert.equal(await page.evaluate(()=>!!state.records.js1.practicedAt),true);
 assert.equal(await page.evaluate(()=>Object.values(state.retention).filter(r=>r.stage>=2).length),0);
 assert.equal(await page.evaluate(()=>state.levels.JavaScript),2);
 const tierCount=await page.evaluate(()=>{
   let count=0;for(const topic of languages)for(let level=1;level<=5;level++){
     openTierLesson(`${topic}:${level}`);
     if(document.querySelectorAll('.concept').length!==5)throw Error('Missing tier concepts');
     if(!document.querySelector('#tier-notes'))throw Error('Missing tier task');count++;
   }return count;
 });assert.equal(tierCount,115);
 await page.evaluate(()=>openTierLesson('Python:5'));
 await page.locator('#tier-notes').fill('Check membership so zero and False are cached instead of recomputed.');
 await page.locator('[data-save-tier]').click();await page.locator('[data-read-tier]').click();
 await page.reload();assert.equal(await page.evaluate(()=>state.tierReads.includes('Python:5')),true);
 assert.match(await page.evaluate(()=>state.tierNotes['Python:5']),/membership/);
 await page.evaluate(()=>{
   state=fresh();for(const q of QUESTIONS.filter(q=>q.language==='JavaScript'&&q.level===1&&q.id!=='pack-javascript-1-1'))state.records[q.id]={attempts:2,correct:2,clean:2,misses:0,review:false};
   document.querySelector('#language').value='JavaScript';document.querySelector('#mode').value='learn';start({level:1});
 });
 await page.locator('#answer').fill('le t');await page.locator('#check').click();
 assert.match(await page.locator('#feedback').innerText(),/Keep going/);
 await page.evaluate(()=>start({level:1}));await page.locator('#answer').fill('let');await page.locator('#check').click();
 assert.match(await page.locator('#feedback').innerText(),/Good rep/);
 await page.locator('.issue-form summary').click();await page.locator('#issue-text').fill('An alternate valid spelling deserves review.');await page.locator('[data-report-issue]').click();
 assert.equal(await page.evaluate(()=>state.issues.length),1);
 await page.reload();assert.match(await page.evaluate(()=>state.issues[0].text),/alternate/);
 console.log('PASS: old-save migration, all 115 tier lessons, notes/read persistence, and live token-aware grading.');
 const workers=await page.evaluate(async()=>{
   const results=[];
   for(const exercise of [...WRITING,MISSION_WRITING]){
     const tests=await runWrittenCode(exercise,exercise.solution);
     if(!tests.every(t=>t.pass))throw Error(exercise.id+': '+JSON.stringify(tests));
     results.push(exercise.id);
   }
   const js=WRITING.find(e=>e.id==='js-even');const negative=await runWrittenCode(js,'function countEvens(values) { return 0; }');
   if(negative.every(t=>t.pass))throw Error('Wrong JS passed');
   const py=WRITING.find(e=>e.id==='py-default');const broken=await runWrittenCode(py,py.starter);
   if(broken.every(t=>t.pass))throw Error('Shared Python default passed');
   let timeout=false;try{await runWrittenCode(js,'function countEvens(values) { while (true) {} }')}catch(e){timeout=e.message.includes('three seconds')}
   if(!timeout)throw Error('JS infinite loop did not time out');
   const pyLoop=WRITING.find(e=>e.id==='py-even');timeout=false;
   try{await runWrittenCode(pyLoop,'def count_evens(values):\n    while True:\n        pass')}catch(e){timeout=e.message.includes('three seconds')}
   if(!timeout)throw Error('Python infinite loop did not time out');
   return results.length;
 });assert.equal(workers,15);
 console.log('PASS: all 14 written reference solutions plus RE reconstruction, negative implementations, and JavaScript/Python loop timeouts.');
 await page.evaluate(()=>{state=fresh();stats();openWriting('js-async')});
 await page.locator('#code-editor').fill(await page.evaluate(()=>activeWriting.solution));
 await page.locator('#code-why').fill('Promise.all resolves the mapped promises and preserves the order of the input array.');
 await page.locator('#run-code').click();await page.waitForFunction(()=>state.written['js-async'].completed,{},{timeout:45000});
 const xp=await page.evaluate(()=>state.xp);
 await page.locator('#run-code').click();await page.waitForFunction(()=>!document.querySelector('#run-code').disabled,{},{timeout:45000});
 assert.equal(await page.evaluate(()=>state.xp),xp,'Written completion XP is awarded once');
 await page.evaluate(()=>{state=fresh();stats();startPlacement('JavaScript')});
 await page.evaluate(()=>{
   while(featureExam){
     const q=featureExam.questions[featureExam.index],input=document.querySelector('#exam-answer');
     input.value=featureExam.index===6?(q.options?q.options.find(o=>!q.answers.includes(o)):'wrong'):q.answers[0];
     document.querySelector('#exam-form').requestSubmit();document.querySelector('#exam-next').click();
   }
 });
 assert.equal(await page.evaluate(()=>state.placement.JavaScript.startLevel),4);
 assert.equal(await page.evaluate(()=>QUESTIONS.filter(q=>LearningEngine.practiced(state,q)).length),0,'Placement is not practice credit');
 assert.equal(await page.evaluate(()=>Object.keys(state.retention).length),3);
 await page.locator('#exam-done').click();assert.equal(await page.evaluate(()=>current.level),4);
 console.log('PASS: written completion/reflection flow and once-only XP; placement suggests a tier, queues earlier checks, and starts at the recommended tier.');
 const clock=Date.UTC(2026,9,14,12);
 async function setTime(ms){await page.evaluate(ms=>{globalThis.__nativeDate ||= Date;globalThis.Date=class extends __nativeDate{constructor(...args){super(...(args.length?args:[ms]))}static now(){return ms}}},ms)}
 await setTime(clock);
 await page.evaluate(()=>{state=fresh();state.retention['Python:1']=LearningEngine.newReview(Date.now()-3*LearningEngine.DAY);stats();startRetention('Python:1')});
 async function completeReview(uncertain=false){await page.evaluate(uncertain=>{
   let first=true;while(featureExam){const q=featureExam.questions[featureExam.index];document.querySelector('#exam-answer').value=q.answers[0];if(uncertain&&first)document.querySelector('#exam-confidence').value='unsure';document.querySelector('#exam-form').requestSubmit();document.querySelector('#exam-next').click();first=false}
 },uncertain)}
 await completeReview();assert.equal(await page.evaluate(()=>state.retention['Python:1'].stage),1);
 await page.evaluate(()=>startRetention('Python:1'));assert.equal(await page.evaluate(()=>featureExam===null),true,'Early retakes are blocked');
 await setTime(clock+7*86400000);await page.evaluate(()=>startRetention('Python:1'));await completeReview();
 assert.equal(await page.evaluate(()=>state.retention['Python:1'].stage),2);
 assert.match(await page.locator('#retained').innerText(),/^1 \/ 115$/);
 await setTime(clock+28*86400000);await page.evaluate(()=>startRetention('Python:1'));await completeReview(true);
 assert.equal(await page.evaluate(()=>state.retention['Python:1'].stage),0);
 assert.equal(await page.evaluate(()=>Date.parse(state.retention['Python:1'].dueAt)-Date.now()),86400000);
 console.log('PASS: delayed checks, blocked same-day retakes, Retained after two due checks, confidence gating, and next-day retry.');
 for(const missionId of ['deployment','logins','assembly']){
   await page.evaluate(id=>openMission(id),missionId);
   const steps=await page.evaluate(id=>MISSIONS.find(m=>m.id===id).steps,missionId);
   for(const step of steps){
     if(step.writingId){
       await page.locator(`[data-mission-write="${step.writingId}"]`).click();
       await page.locator('#code-editor').fill(await page.evaluate(()=>activeWriting.solution));
       await page.locator('#code-why').fill('I traced the supplied input, applied the governing operation, and checked the edge cases against the required result.');
       await page.locator('#run-code').click();
       await page.waitForFunction(({id,step})=>state.missions[id].steps[step]?.solved,{id:missionId,step:step.id},{timeout:45000});
       await page.locator('#write-back').click();
     }else{
       const answer=step.query?'Logins | where Result == "Failure" | where User == "ada" | count':step.answers[0];
       if(step.options)await page.locator(`#mission-${step.id}`).selectOption(answer);else await page.locator(`#mission-${step.id}`).fill(answer);
       await page.locator(`[data-mission-step="${step.id}"] button`).click();
       assert.equal(await page.evaluate(({id,step})=>state.missions[id].steps[step].solved,{id:missionId,step:step.id}),true);
     }
   }
   await page.locator('#mission-reflection').fill('I followed the supplied evidence across each layer, explained the cause, and compared the result with the guide and the stated limitations.');
   await page.locator('#mission-reviewed').check();await page.locator('#mission-finish').click();
   assert.equal(await page.evaluate(id=>state.missions[id].completed,missionId),true);
   const points=await page.evaluate(()=>state.xp);await page.locator('#mission-finish').click();assert.equal(await page.evaluate(()=>state.xp),points);
 }
 await page.reload();assert.equal(await page.evaluate(()=>Object.values(state.missions).filter(m=>m.completed).length),3);
 assert.equal(await page.evaluate(()=>state.written['py-log'].completed),true);
 console.log('PASS: all three missions, equivalent KQL queries, Python/JS reconstruction steps, debrief gate, once-only mission XP, and reload persistence.');
 // Version-2 export/import must retain the new feature state.
 const saved=await page.evaluate(()=>JSON.stringify(state));
 await page.locator('#import').setInputFiles({name:'v2.json',mimeType:'application/json',buffer:Buffer.from(saved)});
 await page.waitForFunction(()=>state.missions.assembly?.completed);
 await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(saved.replace('"version":2','"version":9'))});
 await page.waitForFunction(()=>document.querySelector('#notice').textContent.includes('Could not import'));
 assert.equal(await page.evaluate(()=>state.missions.assembly.completed),true);
 await page.evaluate(()=>{$('notice').textContent='';openWriting('py-even')});await page.screenshot({path:path.resolve(__dirname,'../writing-preview.png'),fullPage:true});
 const mobile=await browser.newPage({viewport:{width:390,height:844}});await mobile.goto(url);
 for(const action of [()=>mobile.evaluate(()=>openTierLesson('Python:4')),()=>mobile.evaluate(()=>openWriting('js-even')),()=>mobile.evaluate(()=>openMission('deployment'))]){
   await action();assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 }
 await mobile.screenshot({path:path.resolve(__dirname,'../mission-mobile-preview.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: version-2 import/export, invalid import preserves progress, mobile lesson/editor/mission layouts, and no page errors.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
