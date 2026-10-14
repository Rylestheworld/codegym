const MISSIONS=[
 {id:'deployment',title:'The Unreachable Audit Service',topics:['Bash','Docker','Kubernetes'],brief:'A fictional team deployed a small audit API. The process is running, but clients cannot reach it, and the health script still says it is healthy. Trace each layer before changing configuration.',
  evidence:[{title:'Application Listener',code:'HOST=127.0.0.1\nPORT=8000\n# The HTTP process binds to HOST:PORT inside its container.'},{title:'Container Launch',code:'docker run -p 8080:8080 audit-api\n# Dockerfile includes EXPOSE 8000.'},{title:'Service Excerpt',code:'apiVersion: v1\nkind: Service\nspec:\n  selector: {app: audit}\n  ports:\n    - port: 80\n      targetPort: 8080\n# Selected Pods run the same API on port 8000.'},{title:'Health Script',code:'#!/usr/bin/env bash\ncurl -fsS "$URL"\necho "healthy"\n# errexit is disabled; curl failed in the observed run.'}],
  steps:[{id:'bind',title:'Fix the Listener',prompt:'Which bind address lets the application accept connections on the container’s IPv4 interfaces?',language:'Bash',answers:['0.0.0.0'],explanation:'Loopback inside the container is not the container’s network-facing interface. The app must listen on a reachable interface.'},{id:'publish',title:'Fix the Port Mapping',prompt:'Enter host:container ports to publish host 8080 to the actual app port.',language:'Docker',answers:['8080:8000'],explanation:'The host port is first; the container app listens on 8000.'},{id:'service',title:'Fix the Service Destination',prompt:'What should targetPort be?',language:'Kubernetes',answers:['8000'],explanation:'The Service destination is the selected Pods’ application port, not the host mapping.'},{id:'health',title:'Respect the Failed Check',prompt:'Which fix prevents a failed curl from being reported as healthy?',options:['Test curl’s status and exit nonzero on failure','Always echo healthy twice','Change EXPOSE to 8080'],answers:['Test curl’s status and exit nonzero on failure'],explanation:'For example: if ! curl -fsS "$URL"; then exit 1; fi; echo "healthy". This explicitly handles failure.'}],
  reflection:'Explain the difference between the listener address, published host port, Service targetPort, and health-script exit status.',rubric:['Distinguish container loopback from a reachable listener.','Map 8080 to 8000 and route the Service to 8000.','Explain how ignoring curl’s status creates a false healthy report.']},
 {id:'logins',title:'The Login Trail',topics:['KQL','Python'],brief:'A fictional login export contains activity around one suspicious address. Find the failures for Ada, correlate the subsequent success, and explain what the data can and cannot establish.',
  evidence:[{title:'Logins Table',code:'Time   User   Result   IP\n08:00  ada    Failure  198.51.100.7\n08:01  ada    Failure  198.51.100.7\n08:02  grace  Success  203.0.113.10\n08:03  ada    Success  198.51.100.7\n08:04  ada    Failure  198.51.100.7\n08:05  grace  Failure  203.0.113.11'},{title:'Analysis Boundary',code:'# All rows refer to the same fictional UTC date.\n# Documentation IP ranges are used.\n# A successful login is not by itself proof of malicious control.'}],
  steps:[{id:'count',title:'Count Ada’s Failures',prompt:'How many failed logins belong to ada?',language:'KQL',answers:['3'],explanation:'Ada has failures at 08:00, 08:01, and 08:04; Grace’s failure is separate.'},{id:'query',title:'Write the Filter',prompt:'Write a KQL query on Logins that selects ada’s Failure rows and ends with count. This local teaching runner supports where with == and and, repeated where operators, and count. Use double-quoted string literals.',query:true,language:'KQL',answers:['Logins | where User == "ada" and Result == "Failure" | count'],explanation:'Filter both the user and the result. Reversing predicate order or using two where operators is equally valid.'},{id:'success',title:'Correlate the Success',prompt:'At what time does ada first have a Success row from the same address? Enter HH:MM.',language:'KQL',answers:['08:03'],explanation:'The success at 08:03 shares ada and 198.51.100.7 with the earlier failures.'},{id:'script',title:'Summarize the Export in Python',prompt:'Implement failures(events) using the exercise’s user and ok fields. Passing the tests completes this step.',writingId:'py-log',answers:['tests pass'],explanation:'A small aggregation script should count failed events per user without including successful events.'}],
  reflection:'Summarize the sequence and your next investigation step. Distinguish an observed successful login from a conclusion that the account was compromised.',rubric:['Identify three ada failures and the shared address.','Mention the 08:03 success and later failure.','Explain that identity, authentication context, and session activity would be needed before concluding compromise.']},
 {id:'assembly',title:'Reconstruct the Tiny Function',topics:['Assembly','JavaScript'],brief:'You have a supplied fictional function listing rather than its source. Trace it, reconstruct its behavior for the stated input range, and test your explanation. No binary execution is needed.',
  evidence:[{title:'Listing',code:'; x86-64 Intel syntax, System V AMD64\n; Input n is an integer in the range 0..100.\nmov eax, edi\nlea eax, [rax + rax*2]\nadd eax, 2\nret'},{title:'Calling Convention',code:'; EDI contains the 32-bit integer input.\n; EAX contains the 32-bit integer result.\n; The input range avoids overflow in this example.'}],
  steps:[{id:'trace',title:'Trace a Concrete Input',prompt:'What result does the function return for n = 4?',language:'Assembly',answers:['14'],explanation:'The effective-address arithmetic computes 3*4, then adds two.'},{id:'register',title:'Name the Result Register',prompt:'Which 32-bit register contains the integer result?',language:'Assembly',answers:['eax'],explanation:'EAX is the 32-bit result register in this listing.'},{id:'reconstruct',title:'Write the Reconstructed Function',prompt:'Implement transform(n) in JavaScript for integer inputs 0..100.',writingId:'mission-transform',answers:['tests pass'],explanation:'The listing computes 3*n + 2 on the stated range.'}],
  reflection:'Explain each instruction, the reconstructed expression, and why the stated input range matters.',rubric:['Explain the copy from EDI to EAX.','Distinguish lea address arithmetic from a memory load.','Explain the final +2 and the bounded input/overflow assumption.']}
];
const MISSION_WRITING={id:'mission-transform',language:'JavaScript',level:3,title:'Reconstruct the Tiny Function',name:'transform',requirement:'Return the listing’s result for integer n in 0..100.',starter:'function transform(n) {\n  // Reconstruct the supplied listing.\n}',solution:'function transform(n) { return 3 * n + 2; }',cases:[{args:[0],expected:2},{args:[4],expected:14},{args:[7],expected:23},{args:[100],expected:302}],why:'Explain how lea and add produce the reconstructed expression.'};
const LOGIN_ROWS=[
 {Time:'08:00',User:'ada',Result:'Failure',IP:'198.51.100.7'},
 {Time:'08:01',User:'ada',Result:'Failure',IP:'198.51.100.7'},
 {Time:'08:02',User:'grace',Result:'Success',IP:'203.0.113.10'},
 {Time:'08:03',User:'ada',Result:'Success',IP:'198.51.100.7'},
 {Time:'08:04',User:'ada',Result:'Failure',IP:'198.51.100.7'},
 {Time:'08:05',User:'grace',Result:'Failure',IP:'203.0.113.11'}
];
function runTeachingKql(source,rows=LOGIN_ROWS) {
  const list=LearningEngine.tokens(source,'KQL');let i=0;
  const take=expected=>{if(list[i++]!==expected)throw Error(`Expected ${expected}.`)};
  take('Logins');let selected=rows.slice(),filtered=false;
  while(i<list.length) {
    take('|');const op=list[i++];
    if(op==='count'){if(i!==list.length)throw Error('count must be the final operator.');return {count:selected.length,rows:selected,filtered}}
    if(op!=='where')throw Error('This teaching runner supports where and count.');
    const predicates=[];
    do {
      const key=list[i++];if(!['User','Result','IP','Time'].includes(key))throw Error('Use a known Logins column.');
      take('==');const literal=list[i++];
      if(!/^"(?:\\.|[^"\\])*"$/.test(literal||''))throw Error('Use a double-quoted string value.');
      const value=JSON.parse(literal);predicates.push(row=>row[key]===value);
      if(list[i]!=='and')break;i++;
    }while(i<list.length);
    selected=selected.filter(row=>predicates.every(p=>p(row)));filtered=true;
  }
  throw Error('End the query with | count.');
}
function correctLoginQuery(source) {
  const result=runTeachingKql(source);
  return result.filtered && result.rows.length===3 && result.rows.every(row=>row.User==='ada'&&row.Result==='Failure');
}
