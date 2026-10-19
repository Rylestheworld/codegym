function pathTopics(pathId = $('path').value) {
  return PATHS.find(path=>path.id === pathId)?.topics || languages;
}
function renderHub() {
  const total = QUESTIONS.filter(q=>LearningEngine.practiced(state,q)).length;
  const review = QUESTIONS.filter(q=>record(q).review).length;
  const attempted = QUESTIONS.find(q=>record(q).attempts > 0 && record(q).clean < 2);
  const topic = attempted?.language || 'Python';
  $('hub').innerHTML = `<div class="hub-heading"><div><p class="eyebrow">WELCOME TO YOUR TRAINING GROUNDS</p><h2 tabindex="-1" id="hub-heading">Build Skill. One Rep at a Time.</h2><p class="prompt">Learn the idea, read the code, then test your judgment. Pick a path or train a single topic.</p></div><img class="hub-emblem" src="assets/brand/codegym-shield.svg" alt=""></div><div class="next-rep"><div><p class="eyebrow">YOUR NEXT REP</p><h3>${escapeHTML(topic)} · ${LEVELS[highestLevel(topic)-1]}</h3><p>${total ? `${total} questions practiced. Keep building the ones still in progress.` : 'Start with a short introduction, then try a ten-question round.'}</p></div><div><button class="primary" data-hub-practice="${escapeHTML(topic)}">Train ${escapeHTML(topic)} ↗</button><button class="quiet" data-hub-lesson="${escapeHTML(topic)}">Read the Introduction First</button></div></div><div class="path-title"><h3>Choose Your Training Path</h3><span>${PATHS.length} paths · ${languages.length} topics · ${QUESTIONS.length} challenges</span></div><div class="path-grid">${PATHS.map((path,index)=>{
    const bank=QUESTIONS.filter(q=>path.topics.includes(q.language));
    const done=bank.filter(q=>LearningEngine.practiced(state,q)).length;
    return `<article class="path-card"><p class="eyebrow">PATH 0${index+1} / ${path.tag}</p><div class="path-card-title">${['security','systems'].includes(path.id) ? '<img src="assets/brand/codegym-shield.svg" alt="">' : ''}<h3>${escapeHTML(path.name)}</h3></div><p>${escapeHTML(path.description)}</p><div class="path-topics">${path.topics.map(topic=>`<span>${escapeHTML(topic)}</span>`).join('')}</div><div class="path-meter" aria-label="${done} of ${bank.length} questions practiced"><span style="width:${done/bank.length*100}%"></span></div><p class="small">${done}/${bank.length} questions practiced · five difficulty tiers</p><div class="path-actions"><button data-path-learn="${path.id}" class="secondary">Explore Path →</button><button data-path-train="${path.id}" class="quiet">Start a Round</button></div></article>`;
  }).join('')}</div>${achievementPanel()}${missionCards()}<section class="gym-loop"><p class="eyebrow">THE CODEGYM TRAINING LOOP</p><div><span><b>01</b> Learn the concept</span><span><b>02</b> Write and test</span><span><b>03</b> Check retention later</span></div><p>Two unaided answers complete practice. Five practiced concepts open the next tier. Two successful delayed checks earn Retained. Your earned unlocks stay open.</p>${review ? `<button class="quiet" id="hub-review">Review ${review} Missed Concepts →</button>` : ''}</section>`;
}
function activatePath(pathId) {
  $('path').value = PATHS.some(path=>path.id===pathId) ? pathId : 'all';
  $('language').value = 'all'; activeLesson = 'all';
  renderLadder(); renderLesson();
}
function initHub() {
  $('path').innerHTML = '<option value="all">All Training Paths</option>' + PATHS.map(path=>`<option value="${path.id}">${escapeHTML(path.name)}</option>`).join('');
  $('home-tab').addEventListener('click',()=>{renderHub();showView('home')});
  $('home-link').addEventListener('click',()=>{renderHub();showView('home');$('hub-heading').focus()});
  $('learn-link').addEventListener('click',()=>openLesson($('language').value));
  $('train-link').addEventListener('click',()=>showView('practice'));
  $('path').addEventListener('change',()=>{ $('language').value='all';activeLesson='all';renderLadder();renderLesson() });
  $('language').addEventListener('change',()=>{
    if($('language').value!=='all' && !pathTopics().includes($('language').value)) {$('path').value='all';renderLesson();renderLadder()}
  });
  $('hub').addEventListener('click',e=>{
    const explore=e.target.closest('[data-path-learn]');
    if(explore){activatePath(explore.dataset.pathLearn);openLesson('all');return}
    const train=e.target.closest('[data-path-train]');
    if(train){activatePath(train.dataset.pathTrain);$('mode').value='learn';start();return}
    const practice=e.target.closest('[data-hub-practice]');
    if(practice){$('path').value='all';$('language').value=practice.dataset.hubPractice;$('mode').value='learn';renderLadder();start();return}
    const read=e.target.closest('[data-hub-lesson]');
    if(read){$('path').value='all';$('language').value=read.dataset.hubLesson;openLesson(read.dataset.hubLesson);return}
    if(e.target.closest('#hub-review')){activatePath('all');$('mode').value='review';start()}
  });
  renderHub();showView('learn');
}
