let featureToken=0,featureExam=null,activeWriting=null,writingMission=null;
const validDate=value=>typeof value==='string' && Number.isFinite(Date.parse(value));
const shortText=(value,max=50000)=>typeof value==='string'?value.slice(0,max):'';
function validateLearningProgress(data,result) {
  for(const key of ['retention','placement','written','missions','tierNotes'])if(data[key]!==undefined && (!data[key]||typeof data[key]!=='object'||Array.isArray(data[key])))throw Error('Invalid learning progress.');
  for(const q of QUESTIONS)if(result.records[q.id]) {
    const raw=data.records[q.id];
    if(raw.practicedAt && !validDate(raw.practicedAt))throw Error('Invalid practice date.');
    result.records[q.id].practicedAt=raw.practicedAt || (raw.clean>=2?new Date().toISOString():null);
  }
  for(const key of Object.keys(TIER_LESSONS)) {
    const r=data.retention?.[key];
    if(r) {
      if(!Number.isSafeInteger(r.stage)||r.stage<0||r.stage>4||!validDate(r.dueAt)||(r.lastPassedAt&&!validDate(r.lastPassedAt))||(r.lastCheckedAt&&!validDate(r.lastCheckedAt)))throw Error('Invalid review schedule.');
      result.retention[key]={stage:r.stage,dueAt:r.dueAt,lastPassedAt:r.lastPassedAt||null,lastCheckedAt:r.lastCheckedAt||null};
    }
    if(data.tierNotes?.[key])result.tierNotes[key]=shortText(data.tierNotes[key],10000);
  }
  if(data.tierReads!==undefined && !Array.isArray(data.tierReads))throw Error('Invalid lesson progress.');
  result.tierReads=[...new Set((data.tierReads||[]).filter(key=>Object.hasOwn(TIER_LESSONS,key)))];
  for(const topic of languages) {
    const p=data.placement?.[topic];if(!p)continue;
    if(!Number.isSafeInteger(p.startLevel)||p.startLevel<1||p.startLevel>5||!validDate(p.checkedAt)||!Number.isSafeInteger(p.correct)||!Number.isSafeInteger(p.attempted)||p.correct<0||p.correct>p.attempted||p.attempted>10)throw Error('Invalid placement result.');
    result.placement[topic]={startLevel:p.startLevel,correct:p.correct,attempted:p.attempted,checkedAt:p.checkedAt};
  }
  for(const exercise of [...WRITING,MISSION_WRITING]) {
    const r=data.written?.[exercise.id];if(!r)continue;
    if(!Number.isSafeInteger(r.attempts)||r.attempts<0)throw Error('Invalid written exercise history.');
    result.written[exercise.id]={draft:shortText(r.draft),explanation:shortText(r.explanation,10000),attempts:r.attempts,completed:r.completed===true,assisted:r.assisted===true};
  }
  for(const mission of MISSIONS) {
    const r=data.missions?.[mission.id];if(!r)continue;
    const steps={};for(const step of mission.steps)if(r.steps?.[step.id])steps[step.id]={solved:r.steps[step.id].solved===true,draft:shortText(r.steps[step.id].draft)};
    const reflection=shortText(r.reflection,10000);
    result.missions[mission.id]={steps,reflection,reviewed:r.reviewed===true,completed:r.completed===true && mission.steps.every(s=>steps[s.id]?.solved) && reflection.trim().length>=40 && r.reviewed===true};
  }
  if(data.issues!==undefined && !Array.isArray(data.issues))throw Error('Invalid content reports.');
  result.issues=(data.issues||[]).slice(-100).filter(r=>r&&typeof r.id==='string'&&typeof r.text==='string').map(r=>({id:r.id,text:shortText(r.text,2000),at:validDate(r.at)?r.at:new Date().toISOString()}));
}
function issueForm(id) { return `<details class="issue-form"><summary>Report an Ambiguous Question</summary><label for="issue-text">What Seems Wrong?</label><textarea id="issue-text" maxlength="2000" placeholder="Describe the wording or another valid answer…"></textarea><button class="quiet" data-report-issue="${escapeHTML(id)}">Save Report Locally</button><p class="small" id="issue-status" role="status"></p></details>`; }
function featureHeading(title,text) {
  $('round-label').textContent=title.toUpperCase();$('round-progress').style.width='0%';
  $('challenge').innerHTML=`<h2 tabindex="-1" id="feature-heading">${escapeHTML(title)}</h2><p class="prompt">${escapeHTML(text)}</p>`;
}
function startFeatureSession(mode) {
  featureExam=null;activeWriting=null;writingMission=null;
  session={kind:mode,path:$('path').value,language:$('language').value};
  if(mode==='writing')return renderWritingCatalog();
  if(mode==='placement')return renderPlacementChooser();
  return renderRetentionQueue();
}
function featureTopics(){return pathTopics().filter(topic=>$('language').value==='all'||topic===$('language').value)}
function renderWritingCatalog() {
  featureHeading('Write It Yourself','Implement and repair functions, then run real test cases. Written progress is separate from quick-rep practice and delayed retention.');
  const bank=WRITING.filter(e=>featureTopics().includes(e.language));
  $('challenge').innerHTML+=`<p class="small">JavaScript and Python run locally in disposable browser workers. Python loads the bundled runtime on first use. No submitted code runs on the web server.</p>${bank.length?`<div class="exercise-grid">${bank.map(e=>`<button class="lesson-card" data-write-id="${e.id}"><span class="tag">${e.language} · ${LEVELS[e.level-1]}</span><strong>${escapeHTML(e.title)}</strong><span>${state.written[e.id]?.completed?'✓ Tests Passed':'Implement, Test, Explain'}</span></button>`).join('')}</div>`:'<p>Written runners currently cover JavaScript and Python. Choose either topic, or open a connected mission in Training Grounds.</p>'}`;
}
function openWriting(id,missionContext=null) {
  cancelCodeRun();featureToken++;featureExam=null;
  activeWriting=id==='mission-transform'?MISSION_WRITING:WRITING.find(e=>e.id===id);
  if(!activeWriting)return;
  writingMission=missionContext;showView('practice');
  const e=activeWriting,r=state.written[id]||{draft:e.starter,explanation:'',attempts:0,completed:false,assisted:false};
  state.written[id]=r;
  featureHeading(e.title,e.requirement);
  $('challenge').innerHTML+=`<div class="tags"><span class="tag">${e.language}</span><span class="tag">${LEVELS[e.level-1]}</span><span class="tag">${r.completed?'Tests Passed':'Write It Yourself'}</span></div><label for="code-editor">Your Code</label><textarea id="code-editor" class="code-editor" spellcheck="false" autocapitalize="off">${escapeHTML(r.draft)}</textarea><label for="code-why">Why Does It Work?</label><p class="small">${escapeHTML(e.why)} ${e.level>=3?'Write at least 20 characters before recording completion. Your explanation is saved for reflection; it is not automatically judged for correctness.':'Optional reflection: explain your reasoning in your own words.'}</p><textarea id="code-why" placeholder="Describe the key idea…">${escapeHTML(r.explanation)}</textarea><div class="actions"><button class="primary" id="run-code">Run Tests ↗</button><button class="quiet" id="cancel-code" disabled>Cancel Run</button><button class="quiet" id="reset-code">Reset to Starter</button></div><div id="code-results" aria-live="polite"></div><details id="code-solution"><summary>Show One Possible Solution</summary><pre><code>${escapeHTML(e.solution)}</code></pre><p class="small">Revealing the solution marks this exercise assisted and earns no completion XP.</p></details><div class="actions"><button class="secondary" id="write-back">${writingMission?'Return to Mission':'All Written Exercises'}</button><button class="quiet" data-study-tier="${e.language}:${e.level}">Read the Tier Lesson</button></div>`;
  const persist=()=>{r.draft=$('code-editor').value;r.explanation=$('code-why').value;save()};
  $('code-editor').addEventListener('input',persist);$('code-why').addEventListener('input',persist);
  $('code-editor').addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const el=event.target,start=el.selectionStart,end=el.selectionEnd;el.setRangeText('    ',start,end,'end');persist()}});
  $('code-solution').addEventListener('toggle',()=>{if($('code-solution').open){r.assisted=true;save()}});
  $('cancel-code').addEventListener('click',cancelCodeRun);
  $('reset-code').addEventListener('click',()=>{$('code-editor').value=e.starter;persist()});
  $('write-back').addEventListener('click',()=>{const context=writingMission;cancelCodeRun();featureToken++;if(context)openMission(context.missionId);else renderWritingCatalog()});
  $('run-code').addEventListener('click',async()=>{
    persist();const token=++featureToken,context=writingMission;
    $('run-code').disabled=true;$('cancel-code').disabled=false;
    $('code-results').textContent='Loading the local runtime and running tests…';r.attempts++;save();
    try {
      const results=await runWrittenCode(e,r.draft);if(token!==featureToken)return;
      const passed=results.every(test=>test.pass),reflectionOK=e.level<3||r.explanation.trim().length>=20;
      let message=passed?'All tests passed.':'Some tests failed. Use the result to revise your code.';
      if(passed&&!reflectionOK)message+=' Add your explanation, then run again to record completion.';
      if(passed&&reflectionOK){
        if(!r.completed&&!r.assisted){state.xp+=30+e.level*5;markActiveDay()}
        r.completed=true;
        if(context){const progress=missionProgress(context.missionId);progress.steps[context.stepId]={solved:true,draft:r.draft}}
        stats();save();
      }
      const feedback=document.createElement('div');feedback.className=passed?'feedback':'feedback wrong';
      const heading=document.createElement('strong');heading.textContent=message;feedback.append(heading);
      const list=document.createElement('ol');
      results.forEach((test,i)=>{const item=document.createElement('li');item.textContent=`${test.pass?'✓':'×'} Test ${i+1}${test.pass?'':`: ${test.error||`expected ${test.expected}; received ${test.actual}`}`}`;list.append(item)});
      feedback.append(list);
      const note=document.createElement('p');note.className='small';note.textContent='Tests verify the authored requirements and edge cases; your reasoning remains a reflection to compare with the lesson.';feedback.append(note);
      $('code-results').replaceChildren(feedback);
    }catch(error){if(token===featureToken)$('code-results').textContent=error.message}
    finally{if(token===featureToken){$('run-code').disabled=false;$('cancel-code').disabled=true}}
  });
}
function markActiveDay(){const today=dateKey();if(!state.days.includes(today))state.days.push(today)}
function tierTabs(topic,selected) {
  return `<nav class="tier-tabs" aria-label="Lesson Difficulty"><button data-tier-intro="${escapeHTML(topic)}" aria-pressed="${selected===0}">Introduction</button>${LEVELS.map((label,i)=>`<button data-tier-lesson="${escapeHTML(topic)}:${i+1}" aria-pressed="${selected===i+1}">${label}</button>`).join('')}</nav>`;
}
function openTierLesson(key) {
  const lesson=TIER_LESSONS[key];if(!lesson)return;
  activeLesson=lesson.topic;activeTier=lesson.level;renderLesson();showView('learn');$('lesson-heading').focus();
}
function renderTierLesson(key) {
  const lesson=TIER_LESSONS[key],q=lesson.example,read=state.tierReads.includes(key),review=state.retention[key];
  $('learning').innerHTML=`<button class="quiet" data-lesson-topic="all">← All Topics</button>${tierTabs(lesson.topic,lesson.level)}<div class="lesson-mascot"><img src="assets/brand/codegym-flex.svg" alt=""></div><p class="eyebrow">${LEVELS[lesson.level-1].toUpperCase()} LESSON</p><h2 id="lesson-heading" tabindex="-1">${escapeHTML(lesson.title)}</h2><p class="lesson-intro">${escapeHTML(lesson.intro)}</p><h3>The Five Concepts</h3><div class="concept-grid">${lesson.concepts.map((concept,i)=>`<article class="concept"><h4>${escapeHTML(concept.title)}</h4><p>${escapeHTML(concept.explanation)}</p><details><summary>Inspect the Example</summary><pre><code>${escapeHTML(concept.code.replaceAll('____',QUESTIONS.filter(q=>q.language===lesson.topic&&q.level===lesson.level)[i].answers[0]))}</code></pre></details><a href="${escapeHTML(concept.source)}" target="_blank" rel="noopener noreferrer">Reference ↗</a></article>`).join('')}</div><h3>A Worked Transfer Example</h3><pre><code>${escapeHTML(q.code)}</code></pre><div class="feedback"><strong>Expected Behavior: ${escapeHTML(q.answers[0])}</strong><p>${escapeHTML(q.explanation)}</p><p>Trace the inputs, identify the governing rule, then connect the result to that rule.</p></div><section class="lesson-exercise"><h3>Practice the Idea</h3><p>${escapeHTML(lesson.task)}</p>${lesson.writing?`<button class="primary" data-write-id="${lesson.writing}">Write and Test This Tier’s Exercise →</button>`:'<p class="small">Try the task in your editor, then record the change you made and why the behavior differs. This reflection is saved, not automatically graded.</p>'}<label for="tier-notes">Your Notes and Explanation</label><textarea id="tier-notes">${escapeHTML(state.tierNotes[key]||'')}</textarea><button class="quiet" data-save-tier="${escapeHTML(key)}">Save Notes</button><p id="tier-status" role="status"></p></section><div class="lesson-actions"><button class="primary" data-practice-tier="${escapeHTML(key)}">${unlocked(lesson.topic,lesson.level)?'Practice This Tier':'Take Placement or Start Earlier'}</button><button class="secondary" data-read-tier="${escapeHTML(key)}" ${read?'disabled':''}>${read?'✓ Lesson Marked Read':'Mark Lesson as Read'}</button></div><p class="small">${review?`Delayed check: ${new Date(review.dueAt).toLocaleDateString()}. ${review.stage>=2?'Retained.':'Retention is still being built.'}`:'Completing tier practice schedules its first delayed check in three days.'} Reading does not grant practice or retention credit.</p>`;
}
function renderPlacementChooser() {
  featureHeading('Placement Check','Up to ten questions suggest a starting tier. Placement is provisional: it does not award practice or retention credit. Missed concepts go into review.');
  $('challenge').innerHTML+=`<div class="exercise-grid">${featureTopics().map(topic=>`<button class="lesson-card" data-place-topic="${escapeHTML(topic)}"><strong>${escapeHTML(topic)}</strong><span>${state.placement[topic]?`Suggested Tier: ${LEVELS[state.placement[topic].startLevel-1]}`:'Find Your Starting Tier'}</span></button>`).join('')}</div>`;
}
function startPlacement(topic) {
  featureToken++;featureExam={kind:'placement',topic,index:0,results:[],assisted:false,
    questions:Array.from({length:5},(_,i)=>QUESTIONS.filter(q=>q.language===topic&&q.level===i+1).slice(0,2)).flat()};
  showView('practice');renderExamQuestion();
}
function renderRetentionQueue() {
  LearningEngine.queueTiers(state,QUESTIONS,languages);save();
  featureHeading('Due Retention Checks','After tier practice, the first check is due in three days. A successful check schedules the next in seven days; two separate successful checks earn Retained. Later checks use 21- and 30-day intervals.');
  const entries=Object.entries(state.retention).filter(([key])=>featureTopics().includes(TIER_LESSONS[key].topic));
  $('challenge').innerHTML+=`${entries.length?`<div class="review-list">${entries.sort((a,b)=>Date.parse(a[1].dueAt)-Date.parse(b[1].dueAt)).map(([key,r])=>`<article><h3>${escapeHTML(TIER_LESSONS[key].title)}</h3><p class="small">${r.stage>=2?'Retained':QUESTIONS.filter(q=>q.language===TIER_LESSONS[key].topic&&q.level===TIER_LESSONS[key].level).every(q=>LearningEngine.practiced(state,q))?'Practiced · Building Retention':'Placed · Awaiting Retention Check'} · due ${new Date(r.dueAt).toLocaleDateString()} · ${r.stage>=2?'Follow-up Review':`${r.stage}/2 checks toward Retained`}</p><button class="${LearningEngine.due(r)?'primary':'quiet'}" data-start-retention="${escapeHTML(key)}" ${LearningEngine.due(r)?'':'disabled'}>${LearningEngine.due(r)?'Start Due Check':'Not Due Yet'}</button></article>`).join('')}</div>`:'<p>No tier checks are scheduled yet. Complete the five questions in a tier, or finish a placement check.</p>'}<p class="small">Each check has a new transfer example plus two tier questions. All three must be correct without help and with confident reasoning. A miss schedules another attempt tomorrow. These intervals are a practical starting schedule, not a scientifically established optimum for every learner.</p>`;
}
function startRetention(key) {
  if(!LearningEngine.due(state.retention[key]))return;
  const tier=TIER_LESSONS[key],r=state.retention[key];
  const bank=QUESTIONS.filter(q=>q.language===tier.topic&&q.level===tier.level);
  const offset=(r.stage*2)%bank.length;
  featureToken++;featureExam={kind:'retention',key,topic:tier.topic,index:0,results:[],assisted:false,questions:[tier.example,bank[offset],bank[(offset+1)%bank.length]]};
  showView('practice');renderExamQuestion();
}
function renderExamQuestion() {
  const exam=featureExam,q=exam.questions[exam.index];
  $('round-label').textContent=exam.kind==='placement'?`PLACEMENT · ${exam.index+1}/10`:`RETENTION · ${exam.index+1}/3`;
  $('round-progress').style.width=`${exam.index/exam.questions.length*100}%`;
  $('challenge').innerHTML=`<div class="tags"><span class="tag">${escapeHTML(q.language)}</span><span class="tag">${LEVELS[q.level-1]}</span><span class="tag">${exam.kind==='placement'?'Placement':'Delayed Check'}</span></div><h2>${escapeHTML(q.title)}</h2><p class="prompt">${escapeHTML(q.prompt)}</p><pre><code>${escapeHTML(q.code)}</code></pre><form id="exam-form">${q.options?`<label for="exam-answer">Your Answer</label><select id="exam-answer" required><option value="">Choose an answer…</option>${q.options.map(option=>`<option value="${escapeHTML(option)}">${escapeHTML(option)}</option>`).join('')}</select>`:'<label for="exam-answer">Missing Code</label><textarea id="exam-answer" required spellcheck="false"></textarea>'}${exam.kind==='retention'?'<label for="exam-confidence">How Did You Arrive at It?</label><select id="exam-confidence"><option value="confident">I can explain it without help</option><option value="unsure">I guessed or feel unsure</option><option value="help">I used help</option></select>':''}<button class="primary" type="submit">Submit Answer →</button></form><div id="exam-feedback" aria-live="polite"></div>`;
  $('exam-form').addEventListener('submit',event=>{
    event.preventDefault();const input=$('exam-answer').value;if(!input.trim())return;
    const correct=LearningEngine.matches(q,input),confidence=$('exam-confidence')?.value||'confident';
    exam.results.push({id:q.id,level:q.level,correct,confidence});
    if(!correct && QUESTIONS.some(item=>item.id===q.id)){
      const r={...record(q)};r.attempts++;r.misses++;r.review=true;state.records[q.id]=r;save();
    }
    $('exam-form').querySelectorAll('input,select,textarea,button').forEach(el=>el.disabled=true);
    $('exam-feedback').innerHTML=`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?'Correct.':'Review this concept.'}</strong><p>${escapeHTML(q.explanation)}</p></div><button class="secondary" id="exam-next">Continue →</button>`;
    $('exam-next').addEventListener('click',()=>{
      exam.index++;
      if(exam.kind==='placement' && exam.index%2===0 && !exam.results.slice(-2).every(r=>r.correct))return finishExam();
      if(exam.index>=exam.questions.length)return finishExam();
      renderExamQuestion();
    });
  });
}
function finishExam() {
  const exam=featureExam;let title,description;
  if(exam.kind==='placement') {
    const startLevel=LearningEngine.placementLevel(exam.results),correct=exam.results.filter(r=>r.correct).length;
    state.placement[exam.topic]={startLevel,correct,attempted:exam.results.length,checkedAt:new Date().toISOString()};
    state.levels[exam.topic]=Math.max(state.levels[exam.topic]||1,startLevel);
    for(let level=1;level<startLevel;level++){const key=LearningEngine.tierKey(exam.topic,level);if(!state.retention[key])state.retention[key]=LearningEngine.newReview()}
    title=`Start ${exam.topic} at ${LEVELS[startLevel-1]}`;
    description=`${correct}/${exam.results.length} correct. This is a starting recommendation, not mastery. Earlier missed concepts are in review; delayed checks will verify the tiers you placed past.`;
    markActiveDay();
  }else {
    const passed=!exam.assisted && exam.results.every(r=>r.correct&&r.confidence==='confident');
    state.retention[exam.key]=LearningEngine.reviewResult(state.retention[exam.key],passed);
    title=passed?'Delayed Check Passed':'A Little More Practice';
    description=passed?`${state.retention[exam.key].stage>=2?'This tier is now marked Retained.':'One successful delayed check recorded; one more is needed for Retained.'} Next check: ${new Date(state.retention[exam.key].dueAt).toLocaleDateString()}.`:'A wrong, unsure, or assisted answer schedules another attempt tomorrow. Practice credit and earned unlocks remain intact.';
    if(passed){state.xp+=25;markActiveDay()}
  }
  stats();save();
  featureHeading(title,description);$('round-progress').style.width='100%';
  $('challenge').innerHTML+=`<button class="primary" id="exam-done">${exam.kind==='placement'?'Practice at This Tier':'Back to Review Schedule'}</button>`;
  $('exam-done').addEventListener('click',()=>{
    if(exam.kind==='placement'){$('language').value=exam.topic;$('mode').value='learn';$('path').value='all';start()}
    else renderRetentionQueue();
  });
  featureExam=null;
}
function missionProgress(id) { return state.missions[id] ||= {steps:{},reflection:'',reviewed:false,completed:false}; }
function missionCards() {
  return `<section class="missions-section"><p class="eyebrow">CONNECTED MISSIONS</p><h3>Follow a Problem Across the Tools</h3><p class="prompt">Work through fictional evidence, repair the logic, and explain what happened.</p><div class="exercise-grid">${MISSIONS.map(m=>`<button class="lesson-card" data-mission-id="${m.id}"><span class="tag">${m.topics.join(' · ')}</span><strong>${escapeHTML(m.title)}</strong><span>${state.missions[m.id]?.completed?'✓ Completed':`${m.steps.length} Guided Steps + Debrief`}</span></button>`).join('')}</div></section>`;
}
function openMission(id) {
  const m=MISSIONS.find(m=>m.id===id);if(!m)return;
  const progress=missionProgress(id);showView('home');
  $('hub').innerHTML=`<button class="quiet" id="mission-back">← All Training Grounds</button><p class="eyebrow">FICTIONAL TRAINING MISSION</p><h2>${escapeHTML(m.title)}</h2><p class="lesson-intro">${escapeHTML(m.brief)}</p><h3>The Evidence</h3>${m.evidence.map(e=>`<details open><summary>${escapeHTML(e.title)}</summary><pre><code>${escapeHTML(e.code)}</code></pre></details>`).join('')}<h3>Work the Steps</h3>${m.steps.map((step,index)=>`<section class="mission-step"><h4>${index+1}. ${escapeHTML(step.title)} ${progress.steps[step.id]?.solved?'✓':''}</h4><p>${escapeHTML(step.prompt)}</p>${step.writingId?`<button class="primary" data-mission-write="${step.writingId}" data-mission="${id}" data-step="${step.id}">${progress.steps[step.id]?.solved?'Open Completed Exercise':'Write and Test the Function'}</button>`:`<form data-mission-step="${step.id}">${step.options?`<label for="mission-${step.id}">Your Answer</label><select id="mission-${step.id}" required><option value="">Choose an answer…</option>${step.options.map(option=>`<option>${escapeHTML(option)}</option>`).join('')}</select>`:`<label for="mission-${step.id}">${step.query?'Your Query':'Your Answer'}</label><textarea id="mission-${step.id}" required spellcheck="false">${escapeHTML(progress.steps[step.id]?.draft||'')}</textarea>`}<button class="secondary" type="submit">Check Step →</button></form><div id="mission-feedback-${step.id}" aria-live="polite"></div>`}</section>`).join('')}<section class="lesson-exercise"><h3>Your Debrief</h3><p>${escapeHTML(m.reflection)}</p><label for="mission-reflection">What Happened, and Why?</label><textarea id="mission-reflection" placeholder="Explain your reasoning using the evidence…">${escapeHTML(progress.reflection)}</textarea><details><summary>Compare With the Debrief Guide</summary><ul>${m.rubric.map(item=>`<li>${escapeHTML(item)}</li>`).join('')}</ul></details><label class="checkbox-label"><input id="mission-reviewed" type="checkbox" ${progress.reviewed?'checked':''}> I compared my explanation with the guide.</label><p class="small">Your debrief is saved, not automatically judged. Completing a mission requires every step, at least 40 characters of explanation, and this self-review.</p><button class="primary" id="mission-finish">${progress.completed?'Mission Completed ✓':'Complete Mission'}</button><p id="mission-status" role="status"></p></section>`;
  $('mission-back').addEventListener('click',()=>renderHub());
  document.querySelectorAll('[data-mission-step]').forEach(form=>form.addEventListener('submit',event=>{
    event.preventDefault();const step=m.steps.find(s=>s.id===form.dataset.missionStep),answer=$(`mission-${step.id}`).value;
    let correct=false,message=step.explanation;
    try{correct=step.query?correctLoginQuery(answer):LearningEngine.matches({...step,language:step.language||'JavaScript'},answer)}catch(error){message=error.message}
    progress.steps[step.id]={solved:correct,draft:answer};save();
    $(`mission-feedback-${step.id}`).innerHTML=`<div class="feedback ${correct?'':'wrong'}"><strong>${correct?'Step Verified.':'Try Again.'}</strong><p>${escapeHTML(message)}</p></div>`;
  }));
  const persist=()=>{progress.reflection=$('mission-reflection').value;progress.reviewed=$('mission-reviewed').checked;save()};
  $('mission-reflection').addEventListener('input',persist);$('mission-reviewed').addEventListener('change',persist);
  $('mission-finish').addEventListener('click',()=>{
    persist();if(!m.steps.every(step=>progress.steps[step.id]?.solved)||progress.reflection.trim().length<40||!progress.reviewed){$('mission-status').textContent='Finish every step, write your debrief, and compare it with the guide.';return}
    if(!progress.completed){state.xp+=100;markActiveDay()}
    progress.completed=true;stats();save();$('mission-finish').textContent='Mission Completed ✓';$('mission-status').textContent='Evidence steps verified and your debrief recorded. +100 XP on first completion.';
  });
}
function initFeatures() {
  document.addEventListener('click',event=>{
    const tier=event.target.closest('[data-tier-lesson]');if(tier)return openTierLesson(tier.dataset.tierLesson);
    const intro=event.target.closest('[data-tier-intro]');if(intro)return openLesson(intro.dataset.tierIntro);
    const readTier=event.target.closest('[data-read-tier]');if(readTier){if(!state.tierReads.includes(readTier.dataset.readTier))state.tierReads.push(readTier.dataset.readTier);save();renderLesson();return}
    const notes=event.target.closest('[data-save-tier]');if(notes){state.tierNotes[notes.dataset.saveTier]=$('tier-notes').value;save();$('tier-status').textContent='Notes saved on this device.';return}
    const practiceTier=event.target.closest('[data-practice-tier]');if(practiceTier){const l=TIER_LESSONS[practiceTier.dataset.practiceTier];$('language').value=l.topic;$('path').value='all';$('mode').value=unlocked(l.topic,l.level)?'learn':'placement';start({level:l.level});return}
    const shortcut=event.target.closest('[data-feature-mode]');if(shortcut){$('mode').value=shortcut.dataset.featureMode;start();return}
    const write=event.target.closest('[data-write-id]');if(write)return openWriting(write.dataset.writeId);
    const place=event.target.closest('[data-place-topic]');if(place)return startPlacement(place.dataset.placeTopic);
    const review=event.target.closest('[data-start-retention]');if(review)return startRetention(review.dataset.startRetention);
    const study=event.target.closest('[data-study-tier]');if(study){if(featureExam?.kind==='retention')featureExam.assisted=true;return openTierLesson(study.dataset.studyTier)}
    const mission=event.target.closest('[data-mission-id]');if(mission)return openMission(mission.dataset.missionId);
    const missionWrite=event.target.closest('[data-mission-write]');if(missionWrite)return openWriting(missionWrite.dataset.missionWrite,{missionId:missionWrite.dataset.mission,stepId:missionWrite.dataset.step});
    const report=event.target.closest('[data-report-issue]');if(report){const text=$('issue-text').value.trim();if(!text){$('issue-status').textContent='Describe the concern first.';return}state.issues.push({id:report.dataset.reportIssue,text,at:new Date().toISOString()});save();$('issue-status').textContent='Saved locally with your progress export.'}
  });
}
