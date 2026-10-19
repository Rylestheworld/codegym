const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const solutions=require('./proving-solutions.json');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CODEGYM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.CODEGYM_TEST_URL||'http://127.0.0.1:8765');
 await page.locator('#home-tab').click();assert.equal(await page.locator('#hub [data-proving]').count(),0);
 await page.locator('#proving-link').click();assert.equal(await page.locator('[data-proving]').count(),9);
 assert.equal(await page.locator('.workspace').isVisible(),false);
 const initialProgress=await page.evaluate(()=>JSON.stringify({xp:state.xp,days:state.days,records:state.records,retention:state.retention}));
 const checks=await page.evaluate(async(solutions)=>{
   const report=[];
   for(const m of PROVING){
     const reference=await runWrittenCode({...m,checkUnchanged:true},solutions[m.id]);
     if(!reference.every(t=>t.pass))throw Error(m.id+JSON.stringify(reference));
     const bad=m.language==='Python'?`def ${m.name}(input):\n    return []`:`function ${m.name}(input) { return []; }`;
     if((await runWrittenCode({...m,checkUnchanged:true},bad)).every(t=>t.pass))throw Error('Accepted wrong '+m.id);
     const mutant=m.language==='Python'?solutions[m.id]+`\noriginal = ${m.name}\ndef ${m.name}(input):\n    result = original(input)\n    if isinstance(input, list):\n        input.append(None)\n    else:\n        input["mutation_probe"] = 1\n    return result`:solutions[m.id]+`\nconst original=${m.name}; ${m.name}=function(input){const result=original(input); if(Array.isArray(input))input.push(null);else input.mutation_probe=1;return result;};`;
     if((await runWrittenCode({...m,checkUnchanged:true},mutant)).some(t=>t.pass))throw Error('Accepted mutation '+m.id);
     report.push(m.id);
   }return report;
 },solutions);assert.equal(checks.length,9);console.log('PASS: all nine reference solutions, incorrect solutions, and input mutation checks.');
 await page.locator('[data-proving="event-ledger"]').click();
 await page.locator('#pro-finish').click();assert.match(await page.locator('#pro-status').innerText(),/Pass the tests/);
 await page.locator('#pro-code').fill(solutions['event-ledger']);
 await page.locator('#pro-notes').fill('I validated rows before deduplicating IDs, counted only failures, and used a dictionary without inherited properties. The seen set and counts use linear space; the pass is linear in events.');
 await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
 await page.locator('#pro-review').check();await page.locator('#pro-finish').click();assert.match(await page.locator('#pro-status').innerText(),/Independent/);
 const xp=await page.evaluate(()=>state.xp);await page.locator('#pro-finish').click();assert.equal(await page.evaluate(()=>state.xp),xp);
 assert.equal(await page.evaluate(()=>JSON.stringify({xp:state.xp,days:state.days,records:state.records,retention:state.retention})),initialProgress);
 await page.locator('#pro-back').click();
 await page.evaluate(()=>{provingProgress('deployment-plan').assisted=true;save()});
 await page.reload();await page.locator('#proving-link').click();await page.locator('[data-proving="deployment-plan"]').click();
 assert.equal(await page.locator('#pro-hint, #pro-solution, #pro-help').count(),0);
 assert.equal(await page.locator('#pro-code').inputValue(),'');
 assert.match(await page.locator('#pro-mode').innerText(),/Previously Assisted/);
 await page.locator('#pro-code').fill(solutions['deployment-plan']);
 await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
 await page.locator('#pro-code').fill('function diagnose(c) { return []; }');assert.equal(await page.evaluate(()=>state.proving['deployment-plan'].passedDraft),null);
 await page.locator('#pro-code').fill(solutions['deployment-plan']);await page.locator('#pro-run').click();await page.waitForFunction(()=>document.querySelector('#pro-results').textContent.includes('5/5'));
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
 for(const view of ['mission','catalog']){if(view==='catalog')await page.locator('#pro-back').click();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true)}
 await page.screenshot({path:require('node:path').join(require('node:os').tmpdir(),'codegym-proving-mobile.png'),fullPage:true});
 await page.locator('#learn-link').click();assert.equal(await page.locator('#learning').isVisible(),true);assert.equal(await page.locator('#proving-view').isVisible(),false);
 assert.deepEqual(errors,[]);console.log('PASS: mobile layout and no browser errors.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
