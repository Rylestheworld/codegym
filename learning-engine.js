// Pure learning rules; no DOM, network, or submitted-code execution here.
const LearningEngine = (() => {
  const DAY = 86400000;
  const intervals = [3, 7, 21, 30];
  function tokens(source, language) {
    const text = String(source).trim();
    if (['Bash','Git','Docker','Podman'].includes(language)) {
      // Command words retain boundaries: -p differs from - p.
      return text.match(/(?:[^\s"']|"(?:\\.|[^"\\])*"|'[^']*')+/g) || [];
    }
    const result=[];
    const re=/\s+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[A-Za-z_$][\w$]*|(?:0[xX][\da-fA-F]+|\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|===|!==|=>|==|!=|<=|>=|&&|\|\||\?\?|\?\.|\*\*|<<|>>|\+\+|--|:=|->|::|[^\s]/g;
    for(const match of text.matchAll(re)) {
      let token=match[0];if(/^\s+$/.test(token))continue;
      if(['SQL','Assembly'].includes(language) && /^[A-Za-z_$]/.test(token))token=token.toLowerCase();
      result.push(token);
    }
    return result;
  }
  function matches(question, answer) {
    if(question.options)return question.answers.includes(answer);
    const actual=JSON.stringify(tokens(answer,question.language));
    return question.answers.some(expected=>actual===JSON.stringify(tokens(expected,question.language)));
  }
  function tierKey(topic,level) { return `${topic}:${level}`; }
  function newReview(now = Date.now()) { return {stage:0,dueAt:new Date(now+intervals[0]*DAY).toISOString(),lastPassedAt:null,lastCheckedAt:null}; }
  function due(review,now=Date.now()) { return !!review && Date.parse(review.dueAt)<=now; }
  function reviewResult(review,passed,now=Date.now()) {
    if(!due(review,now))return {...review};
    const next={...review,lastCheckedAt:new Date(now).toISOString()};
    if(passed) {
      next.stage=Math.min(4,(review.stage||0)+1);
      next.lastPassedAt=new Date(now).toISOString();
      next.dueAt=new Date(now+intervals[Math.min(next.stage,3)]*DAY).toISOString();
    } else {next.stage=0;next.dueAt=new Date(now+DAY).toISOString();}
    return next;
  }
  function practiced(state,q) { return !!state.records[q.id]?.practicedAt || (state.records[q.id]?.clean||0)>=2; }
  function queueTiers(state,questions,topics,now=Date.now()) {
    for(const topic of topics)for(let level=1;level<=5;level++) {
      const key=tierKey(topic,level),bank=questions.filter(q=>q.language===topic&&q.level===level);
      if(bank.length && bank.every(q=>practiced(state,q)) && !state.retention[key])state.retention[key]=newReview(now);
    }
  }
  function placementLevel(results) {
    let passed=0;
    for(let tier=1;tier<=5;tier++) {
      const answers=results.filter(r=>r.level===tier);
      if(answers.length<2 || !answers.every(r=>r.correct))break;
      passed=tier;
    }
    return Math.min(5,passed+1);
  }
  return {DAY,intervals,tokens,matches,tierKey,newReview,due,reviewResult,practiced,queueTiers,placementLevel};
})();
if(typeof module!=='undefined')module.exports=LearningEngine;
