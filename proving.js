function provingProgress(id) {
  return state.proving[id] ||= {draft:PROVING.find(m=>m.id===id).starter,notes:'',attempts:0,assisted:false,passedDraft:null,completedAt:null,completionMode:null};
}
function validateProving(data,result) {
  if(data.proving!==undefined && (!data.proving||typeof data.proving!=='object'||Array.isArray(data.proving)))throw Error('Invalid Proving Grounds progress.');
  for(const m of PROVING) {
    const r=data.proving?.[m.id];if(!r)continue;
    if(typeof r!=='object'||!Number.isSafeInteger(r.attempts)||r.attempts<0 || (r.completedAt && !validDate(r.completedAt)))throw Error('Invalid mission record.');
    const completed=!!r.completedAt && ['assisted','independent'].includes(r.completionMode) && r.attempts>0;
    result.proving[m.id]={draft:shortText(r.draft),notes:shortText(r.notes,10000),attempts:r.attempts,assisted:r.assisted===true,passedDraft:null,completedAt:completed?r.completedAt:null,completionMode:completed?r.completionMode:null};
  }
}
function achievementSummary() {
  const practiced=QUESTIONS.filter(q=>LearningEngine.practiced(state,q)).length;
  const retained=Object.values(state.retention).filter(r=>r.stage>=2).length;
  const written=Object.values(state.written).filter(r=>r.completed).length;
  const guided=MISSIONS.filter(m=>state.missions[m.id]?.completed).length;
  const completed=PROVING.filter(m=>state.proving[m.id]?.completedAt).length;
  const independent=PROVING.filter(m=>state.proving[m.id]?.completionMode==='independent').length;
  return {practiced,retained,written,guided,completed,independent};
}
function achievementPanel() {
  const s=achievementSummary();
  const badges=[['First Rep',s.practiced>=1,`${s.practiced} Questions Practiced`],['Built to Last',s.retained>=1,`${s.retained} Tiers Retained`],['Function Builder',s.written>=1,`${s.written} Written Exercises Completed`],['Connected Thinking',s.guided>=1,`${s.guided}/${MISSIONS.length} Guided Missions`],['Proving Ground',s.completed>=1,`${s.completed}/${PROVING.length} Pro Missions`],['Independent Finisher',s.independent>=1,`${s.independent} Self-Reported Independent Finishes`]];
  return `<section class="achievement-section" aria-labelledby="achievement-heading"><p class="eyebrow">YOUR PERSONAL RECORD</p><h3 id="achievement-heading">Progress Worth Keeping</h3><p class="small">Achievements reflect distinct milestones, not repeated XP. Saved on this device; use Export Progress for a backup. These local records are not verified rankings.</p><div class="achievement-grid">${badges.map(([name,earned,detail])=>`<article class="achievement ${earned?'earned':''}"><span class="tag">${earned?'✓ Earned':'In Progress'}</span><h4>${name}</h4><p>${detail}</p></article>`).join('')}</div></section>`;
}
function provingCards() {
  return `<section class="proving-section" aria-labelledby="proving-heading"><div class="hub-heading"><div><p class="eyebrow">AFTER THE REPS. APPLY THE SKILL.</p><h3 id="proving-heading">Proving Grounds</h3><p>Original missions with edge cases, working code, and a debrief. No timer. Explore whenever you’re ready.</p></div><img class="hub-emblem" src="assets/brand/codegym-shield.svg" alt=""></div><div class="exercise-grid">${PROVING.map(m=>{
    const p=state.proving[m.id],ready=m.topics.every(t=>highestLevel(t)>=m.level);
    return `<button class="lesson-card" data-proving="${m.id}"><span class="tag">${m.category} · ${LEVELS[m.level-1]}</span><strong>${m.title}</strong><span>${m.topics.join(' · ')} · Estimated ${m.minutes} Minutes</span><span>${p?.completedAt?`✓ ${p.completionMode==='independent'?'Independent (Self-Reported)':'Assisted'} Completion`:p?.attempts?'Continue Mission':ready?'Your Unlocked Tiers Meet the Recommendation':'Suggested Preparation: '+LEVELS[m.level-1]+' in These Topics'}</span></button>`;
  }).join('')}</div><p class="small">Readiness uses unlocked tiers, including provisional placement; it is not a certification. Hints are always available. Tests and solutions are inspectable in this public app. Shared leaderboards are not enabled.</p></section>`;
}
function openProving(id) {
  const m=PROVING.find(m=>m.id===id);if(!m)return;
  cancelCodeRun();featureToken++;
  const r=provingProgress(id);showView('home');
  $('hub').innerHTML=`<button class="quiet" id="pro-back">← Training Grounds</button><p class="eyebrow">PROVING GROUNDS / ${m.category.toUpperCase()}</p><h2 id="pro-title" tabindex="-1">${m.title}</h2><div class="tags"><span class="tag">${LEVELS[m.level-1]}</span><span class="tag">${m.language}</span><span class="tag" id="pro-mode">${r.assisted?'Assisted Practice':'Independent Attempt'}</span></div><p class="lesson-intro">${escapeHTML(m.evidence)}</p><h3>Your Assignment</h3><p class="prompt">${escapeHTML(m.requirement)}</p><p class="small">Suggested ${m.minutes} minutes, with no time limit. JavaScript uses your browser; Python uses the bundled runtime. Passing tests checks this bounded task, not general proficiency.</p><details><summary>Inspect an Example Input and Expected Result</summary><pre><code>${escapeHTML(JSON.stringify(m.cases[1],null,2))}</code></pre></details><label for="pro-code">Your Implementation</label><textarea id="pro-code" class="code-editor" spellcheck="false" autocapitalize="off" autocomplete="off">${escapeHTML(r.draft)}</textarea><div class="actions"><button class="primary" id="pro-run">Run Mission Tests</button><button class="quiet" id="pro-cancel" disabled>Cancel Run</button></div><p id="pro-results" role="status">${r.completedAt?'Previously completed on '+new Date(r.completedAt).toLocaleDateString()+'. You can keep practicing.':'Your draft saves as you work.'}</p><details id="pro-hint"><summary>Show a Hint · Marks This Attempt Assisted</summary><p>${escapeHTML(m.hint)}</p></details><details id="pro-solution"><summary>Show a Reference Solution · Marks This Attempt Assisted</summary><pre><code>${escapeHTML(m.solution)}</code></pre></details><h3>Explain Your Findings</h3><ul>${m.rubric.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><label for="pro-notes">Your Debrief</label><textarea id="pro-notes" maxlength="10000">${escapeHTML(r.notes)}</textarea><label class="checkbox-label"><input id="pro-help" type="checkbox" ${r.assisted?'checked disabled':''}> I used outside help, a solution, or AI to solve this mission.</label><label class="checkbox-label"><input id="pro-review" type="checkbox"> I reviewed my explanation against all the points above.</label><p class="small">The debrief is self-reviewed, not automatically graded. Record completion after passing tests on your current code and writing at least 80 characters. Help remains marked across reloads; there is no penalty for learning with help. Independent completion is self-reported, not a competitive credential.</p><button class="primary" id="pro-finish">Record Completion</button><p id="pro-status" role="status"></p>`;
  $('pro-title').focus();
  const code=$('pro-code'),notes=$('pro-notes'),run=$('pro-run'),cancel=$('pro-cancel'),results=$('pro-results');
  const persist=()=>{if(r.draft!==code.value)r.passedDraft=null;r.draft=code.value;r.notes=notes.value;save()};
  code.addEventListener('input',persist);notes.addEventListener('input',persist);
  code.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();code.setRangeText('    ',code.selectionStart,code.selectionEnd,'end');persist()}});
  const assist=()=>{r.assisted=true;save();$('pro-mode').textContent='Assisted Practice';$('pro-help').checked=true;$('pro-help').disabled=true};
  for(const key of ['pro-hint','pro-solution'])$(key).addEventListener('toggle',()=>{if($(key).open)assist()});
  $('pro-help').addEventListener('change',assist);
  $('pro-back').addEventListener('click',()=>{cancelCodeRun();featureToken++;renderHub();$('hub-heading').focus()});
  cancel.addEventListener('click',cancelCodeRun);
  run.addEventListener('click',async()=>{
    persist();const submitted=r.draft;r.passedDraft=null;r.attempts++;save();run.disabled=true;cancel.disabled=false;results.textContent='Running isolated mission tests…';
    try {
      const tests=await runWrittenCode({...m,checkUnchanged:true},submitted);
      if(!run.isConnected)return;
      const passed=tests.every(t=>t.pass);
      if(passed&&r.draft===submitted)r.passedDraft=submitted;
      results.textContent=`${tests.filter(t=>t.pass).length}/${tests.length} tests passed. `+(passed?(r.draft===submitted?'Complete your debrief to record the mission.':'Your code changed during the run; test the new draft.'):'Revisit the requirements and boundary cases. Failed tests: '+tests.flatMap((t,i)=>t.pass?[]:[i+1]).join(', '));save();
    }catch(error){if(run.isConnected)results.textContent=error.message}
    finally{if(run.isConnected){run.disabled=false;cancel.disabled=true}}
  });
  $('pro-finish').addEventListener('click',()=>{
    persist();
    if(r.passedDraft!==r.draft||r.notes.trim().length<80||!$('pro-review').checked){$('pro-status').textContent='Pass the tests on your current code, write at least 80 characters, and review your debrief.';return}
    if(!r.completedAt){r.completedAt=new Date().toISOString();r.completionMode=r.assisted?'assisted':'independent';markActiveDay()}
    save();stats();$('pro-status').textContent=`Completion recorded: ${r.completionMode==='independent'?'Independent (Self-Reported)':'Assisted'}. Replays do not add achievements or XP. Your first completion record is preserved.`;
  });
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-proving]');if(button)openProving(button.dataset.proving)});
