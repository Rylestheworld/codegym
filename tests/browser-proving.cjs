const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CODEGYM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.CODEGYM_TEST_URL||'http://127.0.0.1:8765');
 await page.locator('#home-tab').click();assert.equal(await page.locator('[data-proving]').count(),3);
 const checks=await page.evaluate(async()=>{
   const report=[];
   for(const m of PROVING){
     const reference=await runWrittenCode({...m,checkUnchanged:true},m.solution);
     if(!reference.every(t=>t.pass))throw Error(m.id+JSON.stringify(reference));
     const bad=m.language==='Python'?'def investigate(events):\n    return []':`function ${m.name}(x) { return []; }`;
     if((await runWrittenCode({...m,checkUnchanged:true},bad)).every(t=>t.pass))throw Error('Accepted wrong '+m.id);
     const mutant=m.language==='Python'?m.solution.replace('return findings','events.clear()\n    return findings'):m.solution.replace('return counts;', 'rows.length = 0; return counts;').replace('return issues;', 'c.appPort = 0; return issues;');
     if((await runWrittenCode({...m,checkUnchanged:true},mutant)).every(t=>t.pass))throw Error('Accepted mutation '+m.id);
     report.push(m.id);
   }return report;
 });assert.equal(checks.length,3);console.log('PASS: all three reference solutions, incorrect solutions, and input mutation checks.');
 await page.locator('[data-proving="event-ledger"]').click();
 await page.locator('#pro-finish').click();assert.match(await page.locator('#pro-status').innerText(),/Pass the tests/);
 await page.locator('#pro-code').fill(await page.evaluate(()=>PROVING[0].solution));
 await page.locator('#pro-notes').fill('I validated rows before deduplicating IDs, counted only failures, and used a dictionary without inherited properties. The seen set and counts use linear space; the pass is linear in events.');
 await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
 await page.locator('#pro-review').check();await page.locator('#pro-finish').click();assert.match(await page.locator('#pro-status').innerText(),/Independent/);
 const xp=await page.evaluate(()=>state.xp);await page.locator('#pro-finish').click();assert.equal(await page.evaluate(()=>state.xp),xp);
 await page.locator('#pro-back').click();assert.equal(await page.locator('.achievement.earned').count(),2);
 await page.locator('[data-proving="deployment-plan"]').click();await page.locator('#pro-hint summary').click();await page.waitForFunction(()=>state.proving['deployment-plan'].assisted);
 await page.reload();await page.locator('#home-tab').click();await page.locator('[data-proving="deployment-plan"]').click();assert.equal(await page.locator('#pro-help').isChecked(),true);
 await page.locator('#pro-code').fill(await page.evaluate(()=>PROVING[1].solution));
 await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
 await page.locator('#pro-code').fill('function diagnose(c) { return []; }');assert.equal(await page.evaluate(()=>state.proving['deployment-plan'].passedDraft),null);
 await page.locator('#pro-code').fill(await page.evaluate(()=>PROVING[1].solution));await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
 await page.locator('#pro-notes').fill('The listener must bind to a reachable interface and both destination ports must match the application port. Probe status must determine health. Selectors and network policies still need separate verification.');
 await page.locator('#pro-review').check();await page.locator('#pro-finish').click();assert.match(await page.locator('#pro-status').innerText(),/Assisted/);
 await page.evaluate(()=>{
   const restored=validate(JSON.parse(JSON.stringify(state)));
   if(restored.proving['deployment-plan'].completionMode!=='assisted'||restored.proving['event-ledger'].completionMode!=='independent')throw Error('Lost completion');
   if(restored.proving['deployment-plan'].passedDraft!==null)throw Error('Trusted imported test result');
   if(Object.keys(validate({version:2,xp:0,days:[],records:{}}).proving).length)throw Error('Old progress migration');
   let rejected=false;try{validate({...state,proving:[]})}catch{rejected=true}if(!rejected)throw Error('Bad progress accepted');
 });console.log('PASS: completion gates, independent/assisted persistence, edit invalidation, no repeat rewards, import validation and older saves.');
 await page.setViewportSize({width:390,height:844});
 for(const view of ['mission','hub']){if(view==='hub')await page.locator('#pro-back').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)}
 await page.screenshot({path:'/private/tmp/codegym-proving-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);console.log('PASS: mobile layout and no browser errors.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
