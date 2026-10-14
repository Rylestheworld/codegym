'use strict';
const KEY = 'code-gym-progress-v1';
const languages = [...new Set(QUESTIONS.map(q => q.language))];
const LEVELS = TIER_NAMES;
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fresh = () => ({version:2, xp:0, days:[], records:{}, levels:{}, lessons:[],retention:{},placement:{},written:{},missions:{},tierReads:[],tierNotes:{},issues:[]});
let state = fresh();
function validate(data) {
  if (!data || ![1,2].includes(data.version) || !Number.isSafeInteger(data.xp) || data.xp < 0 || !Array.isArray(data.days) || !data.records || typeof data.records !== 'object' || Array.isArray(data.records)) throw Error('Invalid progress file.');
  const result = fresh(); result.xp = data.xp;
  if(data.lessons !== undefined) {
    if(!Array.isArray(data.lessons)) throw Error('Invalid lesson history.');
    result.lessons = [...new Set(data.lessons.filter(topic=>languages.includes(topic)))];
  }
  if(data.levels !== undefined) {
    if(!data.levels || typeof data.levels !== 'object' || Array.isArray(data.levels)) throw Error('Invalid level history.');
    for(const topic of languages) {
      const level = data.levels[topic];
      if(level === undefined) continue;
      if(!Number.isInteger(level) || level < 1 || level > 5) throw Error('Invalid unlocked level.');
      result.levels[topic] = level;
    }
  }
  result.days = [...new Set(data.days.filter(d => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d))))].sort();
  for (const q of QUESTIONS) {
    const r = data.records[q.id];
    if (!r) continue;
    if (!['attempts','correct','clean','misses'].every(k => Number.isSafeInteger(r[k]) && r[k] >= 0) || r.correct + r.misses !== r.attempts || r.clean > Math.min(2,r.correct)) throw Error('Invalid challenge history.');
    result.records[q.id] = {attempts:r.attempts,correct:r.correct,clean:r.clean,misses:r.misses,review:r.review === true};
  }
  validateLearningProgress(data,result);
  return result;
}
try { const saved = localStorage.getItem(KEY); if (saved) state = validate(JSON.parse(saved)); }
catch { $('save-status').textContent = 'Storage unavailable · export to keep progress'; }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); $('save-status').textContent = 'Progress saved on this device'; }
  catch { $('save-status').textContent = 'Storage unavailable · export to keep progress'; }
}
function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
function dayStreak() {
  const days = new Set(state.days), d = new Date(); let count = 0;
  if (!days.has(dateKey(d))) d.setDate(d.getDate()-1);
  while(days.has(dateKey(d))) { count++; d.setDate(d.getDate()-1); }
  return count;
}
const record = q => state.records[q.id] || {attempts:0, correct:0, clean:0, misses:0, review:false};
function unlocked(language, level = 2) {
  if(level <= 1 || (state.levels[language] || 1) >= level) return true;
  return unlocked(language, level-1) && QUESTIONS.filter(q => q.language === language && q.level === level-1).every(q => record(q).clean >= 2);
}
function highestLevel(language) {
  return LEVELS.reduce((highest, _, index) => unlocked(language, index+1) ? index+1 : highest, 1);
}
function renderLadder() {
  const topic = $('language').value;
  $('ladder').innerHTML = LEVELS.map((name, i) => {
    const level = i+1;
    const questions = QUESTIONS.filter(q => q.level === level && (topic === 'all' ? pathTopics().includes(q.language) : q.language === topic));
    const done = questions.filter(q => LearningEngine.practiced(state,q)).length;
    const available = topic === 'all' ? pathTopics().some(lang => unlocked(lang, level)) : unlocked(topic, level);
    return `<div class="level-step ${done === questions.length ? 'complete' : available ? 'available' : 'locked'}"><span class="level-number">${done === questions.length ? '✓' : level}</span><div><strong>${name}</strong><span>${done}/${questions.length} practiced · ${available ? 'Open' : 'Locked'}</span></div></div>`;
  }).join('');
}
function stats() {
  LearningEngine.queueTiers(state,QUESTIONS,languages);
  for(const topic of languages) state.levels[topic] = highestLevel(topic);
  $('xp').textContent = state.xp;
  $('mastered').textContent = `${QUESTIONS.filter(q => LearningEngine.practiced(state,q)).length} / ${QUESTIONS.length}`;
  $('retained').textContent = `${Object.values(state.retention).filter(r=>r.stage>=2).length} / ${languages.length*5}`;
  $('streak').textContent = dayStreak();
  $('map').innerHTML = languages.map(lang => `<div class="map-row">${escapeHTML(lang)}<span>${QUESTIONS.filter(q => q.language === lang && LearningEngine.practiced(state,q)).length}/25 · L${highestLevel(lang)}</span></div>`).join('');
  renderLadder();
}
let session, current, selected = null, answered = false, hinted = false;
function start(options={}) {
  cancelCodeRun();
  featureToken++;featureExam=null;
  showView('practice');
  if(['writing','placement','retention'].includes($('mode').value))return startFeatureSession($('mode').value);
  session = {language:$('language').value, path:$('path').value, mode:$('mode').value, level:options.level||null, count:0, correct:0, xp:0, seen:[]};
  $('notice').textContent = '';
  next();
}
function choose() {
  let pool = QUESTIONS.filter(q => pathTopics(session.path).includes(q.language) && (session.language === 'all' || q.language === session.language) && (session.mode === 'review' ? record(q).review : unlocked(q.language, q.level) && (session.level ? q.level===session.level : q.level >= (state.placement[q.language]?.startLevel || 1))));
  // In learning mode, keep the round focused on unfinished concepts before
  // choosing completed practice material. Review retains previously seen tiers.
  if (session.mode === 'learn' && pool.some(q => record(q).clean < 2)) pool = pool.filter(q => record(q).clean < 2);
  if (!pool.length) return null;
  // Space repeats apart where the available challenge bank allows it.
  const rested = pool.filter(q => !session.seen.slice(-2).includes(q.id));
  if (rested.length) pool = rested;
  else { const different = pool.filter(q => q.id !== current?.id); if (different.length) pool = different; }
  const ranked = pool.map(q => {
    const r = record(q);
    const priority = r.review ? 30 : r.clean < 2 ? 20 : 0;
    return {q, score:priority + (r.attempts === 0 ? 15 : 0) - session.seen.filter(id => id === q.id).length * 4 + Math.random()*3};
  }).sort((a,b) => b.score-a.score);
  return ranked[0].q;
}
function next() {
  if (session.count >= 10) return summary();
  current = choose();
  if (!current) return summary();
  selected = null; answered = false; hinted = false;
  $('round-label').textContent = `REP ${String(session.count+1).padStart(2,'0')} / 10`;
  $('round-progress').style.width = `${session.count*10}%`;
  const q = current;
  $('challenge').innerHTML = `<div class="tags"><span class="tag">${escapeHTML(q.language)}</span><span class="tag">Level ${q.level} · ${LEVELS[q.level-1]}</span><span class="tag">${escapeHTML(q.type)}</span></div><h2 tabindex="-1" id="challenge-title">${escapeHTML(q.title)}</h2><p class="prompt">${escapeHTML(q.prompt)}</p><pre><code>${escapeHTML(q.code)}</code></pre><form id="answer-form"><label class="answer-label" ${q.options ? '' : 'for="answer"'}>${q.options ? 'Choose Your Answer' : 'Your Answer · Enter Only the Missing Code'}</label>${q.options ? `<div class="choices" role="group" aria-label="Answer choices">${q.options.map((option,i) => `<button type="button" class="choice" data-choice="${i}" aria-pressed="false">${escapeHTML(option)}</button>`).join('')}</div>` : '<textarea id="answer" spellcheck="false" autocapitalize="off" autocomplete="off" placeholder="Type the missing code…" required></textarea>'}<div class="actions"><button id="check" class="primary" type="submit" ${q.options ? 'disabled' : ''}>Check Answer ↗</button><button id="hint-button" class="quiet" type="button">Give Me a Hint</button><button id="reveal" class="quiet" type="button">Show & Learn</button></div></form><button type="button" class="quiet" data-study-current>Read the ${escapeHTML(q.language)} Tier Lesson →</button><p id="hint" class="hint" role="status"></p><div id="feedback" aria-live="polite"></div>`;
  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    if (answered) return;
    selected = q.options[Number(button.dataset.choice)];
    document.querySelectorAll('[data-choice]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    $('check').disabled = false;
  }));
  $('answer-form').addEventListener('submit', e => { e.preventDefault(); submit(false); });
  $('hint-button').addEventListener('click', () => {
    if (answered) return;
    hinted = true; $('hint').textContent = `${q.hint} Hint-assisted answers earn 5 XP and do not count toward practice completion.`;
    $('hint-button').disabled = true;
  });
  $('reveal').addEventListener('click', () => submit(true));
  $('answer')?.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); submit(false); } });
  if (session.count) $('challenge-title').focus();
}
function normalize(value) { return JSON.stringify(LearningEngine.tokens(value,current.language)); }
function submit(reveal) {
  if (answered) return;
  const answer = current.options ? selected : $('answer').value;
  if (!reveal && (!answer || !answer.trim())) return;
  answered = true;
  const correct = !reveal && LearningEngine.matches(current,answer);
  const r = {...record(current)};
  r.attempts++;
  if (correct) { r.correct++; if (!hinted) { r.clean = Math.min(2, r.clean+1); if(r.clean === 2) r.review = false; } }
  else { r.misses++; r.clean = 0; r.review = true; }
  state.records[current.id] = r;
  if(r.clean>=2&&!r.practicedAt)r.practicedAt=new Date().toISOString();
  const points = correct ? (hinted ? 5 : 5 + current.level * 5) : 0;
  state.xp += points; session.xp += points; session.count++; session.correct += Number(correct); session.seen.push(current.id);
  const today = dateKey(); if (!state.days.includes(today)) state.days.push(today);
  stats(); save();
  $('round-progress').style.width = `${session.count*10}%`;
  document.querySelectorAll('#answer-form button, #answer-form textarea').forEach(e => { e.disabled = true; });
  $('feedback').innerHTML = `<div class="feedback ${correct ? '' : 'wrong'}"><strong>${correct ? `Good rep. +${points} XP` : reveal ? 'Study rep. Let’s work through it.' : 'Keep going. Here’s the missing piece.'}</strong><p>Answer: <code>${escapeHTML(current.answers[0])}</code></p><p>${escapeHTML(current.explanation)}</p>${current.source ? `<p><a href="${escapeHTML(current.source)}" target="_blank" rel="noopener noreferrer">Read the Official Reference ↗</a></p>` : ""}<p><strong>Try It Yourself:</strong> ${escapeHTML(current.extension)}</p><p class="small">${r.clean >= 2 ? 'Practiced. Complete the tier to schedule its first delayed check in three days. Retained requires two successful delayed checks.' : correct && !hinted ? 'One more correct answer without a hint for practice completion.' : 'This concept stays in your practice rotation.'}</p></div><button class="secondary" id="next">${session.count >= 10 ? 'See Round Results' : 'Next Challenge →'}</button>${issueForm(current.id)}`;
  $('next').addEventListener('click',next); $('next').focus();
}
function summary() {
  $('round-label').textContent = 'ROUND COMPLETE'; $('round-progress').style.width = '100%';
  const empty = session.count === 0;
  $('challenge').innerHTML = `<div class="summary"><img class="round-mascot" src="assets/brand/codegym-flex.svg" alt=""><p class="eyebrow">${empty ? 'YOUR REVIEW QUEUE IS CLEAR' : 'PRACTICE BUILDS INSTINCT'}</p><h2 tabindex="-1" id="summary-title">${empty ? 'Nothing to Review Yet.' : 'A Little Sharper Already.'}</h2>${empty ? '' : `<strong>${session.correct} / ${session.count}</strong><p>Correct answers · ${session.xp} XP earned</p>`}<p>${empty ? 'Start a Learn & Level Up round to explore new concepts. Questions you miss or reveal will enter your review queue.' : 'Missed concepts will return in your practice rotation. Take one “Try it yourself” prompt and write the code from scratch before your next round.'}</p><button class="primary" id="again">${empty ? 'Start Learning ↗' : 'Another Round ↗'}</button><p class="small">Progress is stored in this browser. Export it to move devices or keep a backup.</p></div>`;
  $('again').addEventListener('click', () => { if (empty) $('mode').value = 'learn'; start(); });
  $('summary-title').focus();
}
$('start').addEventListener('click',start);
$('language').addEventListener('change',renderLadder);
$('export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}));
  const a = document.createElement('a'); a.href = url; a.download = `code-gym-progress-${dateKey()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url),1000);
});
$('import').addEventListener('change', async e => {
  const file = e.target.files[0]; if(!file) return;
  try {
    if(file.size > 5000000) throw Error('Progress file is too large.');
    const imported = validate(JSON.parse(await file.text()));
    state = imported; save(); stats(); start(); renderLesson(); $('notice').textContent = 'Imported progress replaces the previous history.';
  } catch { $('notice').textContent = 'Could not import that file. Choose a CodeGym progress export.'; }
  e.target.value = '';
});
$('language').innerHTML = '<option value="all">All Languages & Tools</option>' + languages.map(language => `<option>${escapeHTML(language)}</option>`).join('');
$('topics').textContent = languages.join(' / ');
stats(); start();
initLearning();
initHub();
initFeatures();
save();
