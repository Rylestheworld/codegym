let activeLesson = 'all',activeTier=0;
function showView(view) {
  if(view==='learn' && featureExam?.kind==='retention')featureExam.assisted=true;
  const reading = view === 'learn';
  $('learning').hidden = !reading;
  $('practice-view').hidden = view !== 'practice';
  $('hub').hidden = view !== 'home';
  $('home-tab').setAttribute('aria-pressed',String(view === 'home'));
  $('learn-tab').setAttribute('aria-pressed',String(reading));
  $('practice-tab').setAttribute('aria-pressed',String(view === 'practice'));
  document.querySelectorAll('[data-main-view]').forEach(button=>button.setAttribute('aria-current',button.dataset.mainView===view?'page':'false'));
}
function openLesson(topic) {
  activeTier=0;
  activeLesson = LESSONS[topic] ? topic : 'all';
  renderLesson();
  showView('learn');
  $('lesson-heading').focus();
}
function renderLesson() {
  const done = state.lessons;
  if(activeLesson === 'all') {
    const path=PATHS.find(path=>path.id===$('path').value);
    $('learning').innerHTML = `<div class="lesson-mascot" aria-hidden="true"><img src="assets/brand/codegym-flex.svg" alt=""></div><p class="eyebrow">${path ? escapeHTML(path.tag) : 'UNDERSTAND FIRST. PRACTICE NEXT.'}</p><h2 id="lesson-heading" tabindex="-1">${path ? escapeHTML(path.name) : 'Your Learning Library'}</h2><p class="prompt">${path ? escapeHTML(path.description) : 'Pick a topic for a short introduction, an explained example, and a small exercise.'} ${done.length} of ${languages.length} intros marked read overall.</p><label class="sr-only" for="lesson-search">Search Topics in This Path</label><input id="lesson-search" class="lesson-search" type="search" placeholder="Find a Language or Tool…"><p id="search-status" class="small" role="status"></p><div class="lesson-grid">${pathTopics().map(topic => `<button class="lesson-card" data-lesson-topic="${escapeHTML(topic)}"><span class="eyebrow">${done.includes(topic) ? '✓ INTRO READ' : 'INTRODUCTION'}</span><strong>${escapeHTML(topic)}</strong><span>${escapeHTML(LESSONS[topic].intro.split('. ')[0])}.</span><span class="lesson-link">Start Learning →</span></button>`).join('')}</div>`;
    $('lesson-search').addEventListener('input',e=>{
      const term=e.target.value.trim().toLowerCase();let count=0;
      $('learning').querySelectorAll('[data-lesson-topic]').forEach(card=>{card.hidden=!card.dataset.lessonTopic.toLowerCase().includes(term);if(!card.hidden)count++});
      $('search-status').textContent = count ? `${count} topics available` : 'No matching topics. Try another search.';
    });
    return;
  }
  const topic = activeLesson, lesson = LESSONS[topic];
  if(activeTier)return renderTierLesson(`${topic}:${activeTier}`);
  $('learning').innerHTML = `<button class="quiet" data-lesson-topic="all">← All Introductions</button>${tierTabs(topic,0)}<div class="lesson-mascot" aria-hidden="true"><img src="assets/brand/codegym-flex.svg" alt=""></div><div class="tags"><span class="tag">${escapeHTML(topic)}</span><span class="tag">Introduction</span></div><h2 id="lesson-heading" tabindex="-1">Get to Know ${escapeHTML(topic)}</h2><p class="lesson-intro">${escapeHTML(lesson.intro)}</p><h3>The Ideas to Understand</h3><div class="concept-grid">${lesson.concepts.map(([title,text],i) => `<article class="concept"><span class="eyebrow">0${i+1}</span><h4>${escapeHTML(title)}</h4><p>${escapeHTML(text)}</p></article>`).join('')}</div><h3>A Worked Example</h3><pre><code>${escapeHTML(lesson.code)}</code></pre><ol class="walkthrough">${lesson.walkthrough.map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ol><section class="pitfalls"><h3>Watch for These Mistakes</h3><ul>${lesson.pitfalls.map(line => `<li>${escapeHTML(line)}</li>`).join('')}</ul></section><section class="lesson-exercise"><p class="eyebrow">WRITE A LITTLE CODE</p><h3>Try It Yourself</h3><p>${escapeHTML(lesson.exercise)}</p><details><summary>Show One Possible Solution</summary><pre><code>${escapeHTML(lesson.solution)}</code></pre></details><p class="small">Try this in your own editor. Reading and revealing a solution do not count as practice or retention credit.</p></section><div class="lesson-actions"><button class="primary" data-practice-topic="${escapeHTML(topic)}">Practice ${escapeHTML(topic)} ↗</button><button class="secondary" data-mark-read="${escapeHTML(topic)}" ${done.includes(topic) ? 'disabled' : ''}>${done.includes(topic) ? '✓ Intro Marked Read' : 'Mark Intro as Read'}</button><a href="${escapeHTML(lesson.source)}" target="_blank" rel="noopener noreferrer">Official Reference ↗</a></div><details class="lesson-roadmap"><summary>Your Path From Beginner to Expert</summary>${LEVELS.map((label,i) => `<section><h4>${label}</h4><ul>${QUESTIONS.filter(q=>q.language===topic && q.level===i+1).map(q=>`<li>${escapeHTML(q.title)}</li>`).join('')}</ul></section>`).join('')}</details>`;
}
function initLearning() {
  $('learn-tab').addEventListener('click',()=>openLesson($('language').value));
  $('study').addEventListener('click',()=>openLesson($('language').value));
  $('practice-tab').addEventListener('click',()=>showView('practice'));
  $('language').addEventListener('change',()=>{
    activeTier=0;
    activeLesson = $('language').value;
    renderLesson();
  });
  $('learning').addEventListener('click',e=>{
    const card = e.target.closest('[data-lesson-topic]');
    if(card) { openLesson(card.dataset.lessonTopic); return; }
    const practice = e.target.closest('[data-practice-topic]');
    if(practice) {
      $('language').value = practice.dataset.practiceTopic;
      $('mode').value = 'learn'; renderLadder(); start();
      $('challenge-title')?.focus(); return;
    }
    const mark = e.target.closest('[data-mark-read]');
    if(mark) {
      if(!state.lessons.includes(mark.dataset.markRead)) state.lessons.push(mark.dataset.markRead);
      save(); renderLesson();
    }
  });
  $('challenge').addEventListener('click',e=>{
    if(e.target.closest('[data-study-current]') && current) openTierLesson(`${current.language}:${current.level}`);
  });
  renderLesson(); showView('learn');
}
