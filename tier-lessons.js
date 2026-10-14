const TIER_NAMES=['Beginner','Intermediate','Proficient','Advanced','Expert'];
const TIER_GOALS=[
 'Build a reliable mental model for basic syntax, values, and operations.',
 'Connect individual operations to scope, mutability, and everyday failure cases.',
 'Reason about collections, lifetimes, state, and multi-step behavior.',
 'Find subtle failures at boundaries: asynchronous work, ownership, and operational state.',
 'Make assumptions explicit and reason about contracts, edge cases, and cross-system guarantees.'
];
const TIER_LESSONS={};
for(const topic of Object.keys(LESSONS))for(let level=1;level<=5;level++) {
  const concepts=QUESTIONS.filter(q=>q.language===topic&&q.level===level);
  const example=TRANSFERS.find(q=>q.language===topic&&q.level===level);
  TIER_LESSONS[`${topic}:${level}`]={topic,level,title:`${topic} · ${TIER_NAMES[level-1]}`,
    intro:TIER_GOALS[level-1]+' This lesson explains the five concepts tested in this tier.',
    concepts:concepts.map(q=>({title:q.title,explanation:q.explanation,code:q.code,source:q.source||REFERENCES[topic]||TOOL_DOCS[topic]})),
    example,task:concepts.find(q=>!q.extension.startsWith('Write a minimal'))?.extension||concepts[0].extension,
    writing:WRITING.find(e=>e.language===topic&&e.level===level)?.id};
}
