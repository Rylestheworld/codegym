const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CODEGYM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.CODEGYM_TEST_URL||'http://127.0.0.1:8765');
 assert.equal(await page.locator('.level-step').count(),5);
 assert.equal(await page.locator('.level-step.locked').count(),4);
 const old={version:1,xp:20,days:[],records:{js1:{attempts:2,correct:2,clean:2,misses:0,review:false}}};
 await page.locator('#import').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(old))});
 await page.waitForFunction(()=>state.xp===20);
 assert.equal(await page.evaluate(()=>state.records.js1.clean),2);
 assert.equal(await page.evaluate(()=>unlocked('JavaScript',2)),false,'Added Beginner questions must be completed');
 const result=await page.evaluate(()=>{
   const fail=message=>{throw Error(message)};
   state=fresh();stats();save();
   const seen=new Set();
   function answer(useHint=false,wrong=false) {
     const q=current;seen.add(q.id);
     if(useHint)document.querySelector('#hint-button').click();
     if(q.options) {
       const wanted=wrong?q.options.find(x=>x!==q.answers[0]):q.answers[0];
       [...document.querySelectorAll('[data-choice]')].find(b=>b.textContent===wanted).click();
     } else document.querySelector('#answer').value=wrong?'incorrect':q.answers[0];
     document.querySelector('#check').click();
     if(!answered)fail('Answer not submitted: '+q.id);
     const text=document.querySelector('#feedback').textContent;
     if(!text.includes(wrong?'Keep going':'Good rep'))fail('Grading failed: '+q.id);
     document.querySelector('#next').click();
   }
   document.querySelector('#language').value='JavaScript';start();answer(true);
   if(state.xp!==5)fail('Hint score');
   if(Object.values(state.records)[0].clean!==0)fail('Hint practice credit');
   answer(false,true);
   if(!Object.values(state.records).some(r=>r.review))fail('Miss queue');
   document.querySelector('#reveal').click();
   if(!document.querySelector('#feedback').textContent.includes('Study rep'))fail('Reveal');
   state=fresh();stats();save();seen.clear();
   for(const topic of languages) {
     document.querySelector('#language').value=topic;
     document.querySelector('#mode').value='learn';
     for(let tier=1;tier<=5;tier++) {
       if(!unlocked(topic,tier))fail('Expected open tier: '+topic+' '+tier);
       if(tier<5 && unlocked(topic,tier+1))fail('Premature tier: '+topic+' '+tier);
       start();
       for(let rep=0;rep<10;rep++) {
         if(current.level!==tier)fail('Wrong tier: '+current.id);
         answer();
       }
       if(session.count!==10||session.correct!==10)fail('Round counts');
       if(!QUESTIONS.filter(q=>q.language===topic&&q.level===tier).every(q=>record(q).clean===2))fail('Incomplete tier: '+topic+' '+tier);
       const expectedXP=10*(5+tier*5);
       if(session.xp!==expectedXP)fail('Tier XP');
     }
   }
   if(seen.size!==575)fail('Missing question coverage: '+seen.size);
   const fullyPracticed=QUESTIONS.every(q=>record(q).clean===2);
   if(!fullyPracticed)fail('Missing practice');
   // Remediation must not remove an earned tier milestone.
   state.records.js1.clean=0;state.records.js1.review=true;stats();save();
   if(!unlocked('JavaScript',5))fail('Unlock regressed after review miss');
   document.querySelector('#language').value='JavaScript';
   document.querySelector('#mode').value='review';start();
   if(current.id!=='js1')fail('Review selection');
   answer();answer();
   if(record(QUESTIONS.find(q=>q.id==='js1')).review)fail('Review not cleared');
   return {covered:seen.size,xp:state.xp,tiers:languages.length*5};
 });
 await page.reload();assert.equal(await page.evaluate(()=>state.levels.JavaScript),5);
 assert.equal(await page.evaluate(()=>QUESTIONS.filter(q=>record(q).clean===2).length),575);
 await page.locator('#language').selectOption('Rust');
 assert.equal(await page.locator('.level-step.complete').count(),5);
 await page.evaluate(()=>{state=fresh();save();stats()});await page.reload();
 await page.locator('#language').selectOption('Python');await page.locator('#start').click();
 await page.screenshot({path:require('node:path').resolve(__dirname,'../preview.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:require('node:path').resolve(__dirname,'../curriculum-mobile-preview.png'),fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('PASS: '+JSON.stringify(result)+'; all 115 tier unlocks, 575 accepted-answer paths, tier XP, hints/reveal/misses, persistent unlocks, review clearing, old save migration, reload persistence, and mobile layout.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
