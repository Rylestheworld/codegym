// Targeted wording and accepted-answer corrections found during content review.
function revise(id,patch){const q=QUESTIONS.find(q=>q.id===id);if(!q)throw Error('Unknown reviewed question: '+id);Object.assign(q,patch)}
revise('pack-go-3-1',{
  title:'Use the Presence Result',
  code:'value, ok := m["key"]\nif ____ {\n    fmt.Println(value)\n}\n// Print only when the key exists.',
  answers:['ok','ok == true'],
  explanation:'The comma-ok lookup reports presence independently of the stored value. Test ok to distinguish a missing entry from a present zero value.'
});
revise('pack-r-1-1',{answers:['<-','=']});
revise('pack-r-1-2',{answers:['c','base::c']});
revise('pack-python-2-1',{answers:['n * n','n ** 2','pow(n, 2)']});
revise('pack-c-1-2',{answers:["'\\0'",'0']});
revise('pack-javascript-2-3',{answers:['x - y','(x - y)']});
for(const q of QUESTIONS) {
  q.source ||= REFERENCES[q.language] || TOOL_DOCS[q.language];
  if(q.language==='HTML' && !q.options && /^[a-z][a-z-]*$/.test(q.answers[0]))q.answers=[...new Set([...q.answers,q.answers[0].toUpperCase()])];
}
