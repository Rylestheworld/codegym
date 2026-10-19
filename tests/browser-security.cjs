const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CODEGYM_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
 const page=await browser.newPage();const requests=[];
 page.on('request',r=>requests.push(r.url()));
 await page.goto(process.env.CODEGYM_TEST_URL||'http://127.0.0.1:8765');
 const result=await page.evaluate(async()=>{
  localStorage.setItem('security-canary','never-send-this');
  const check=async(code,expected,language='JavaScript')=>{
   const results=await runWrittenCode({language,name:'probe',id:'security-probe',cases:[{args:[],expected}]},code);
   if(!results.every(x=>x.pass))throw Error(JSON.stringify(results));
  };
  await check(`async function probe(){
   const checks={};
   checks.origin=self.origin;
   try{await fetch('https://example.com/codegym-egress-test');checks.network='allowed'}catch{checks.network='blocked'}
   try{await fetch('${location.origin}/codegym-egress-test');checks.sameOrigin='allowed'}catch{checks.sameOrigin='blocked'}
   try{indexedDB.open('security-canary');checks.storage='allowed'}catch{checks.storage='blocked'}
   checks.socket=await new Promise(resolve=>{try{const socket=new WebSocket('wss://example.com/codegym-egress-test');socket.onopen=()=>{socket.close();resolve('allowed')};socket.onerror=()=>resolve('blocked');setTimeout(()=>{socket.close();resolve('timeout')},500)}catch{resolve('blocked')}});
   try{importScripts('https://example.com/codegym-import-test.js');checks.imports='allowed'}catch{checks.imports='blocked'}
   checks.dom=typeof document;checks.local=typeof localStorage;
   return checks;
  }`,{origin:'null',network:'blocked',sameOrigin:'blocked',storage:'blocked',socket:'blocked',imports:'blocked',dom:'undefined',local:'undefined'});
  await check('def probe():\n    import js\n    try:\n        js.indexedDB.open("security-canary")\n        return "allowed"\n    except Exception:\n        return str(js.origin)', 'null','Python');
  const running=runWrittenCode({language:'JavaScript',name:'probe',cases:[{args:[],expected:42}]},'async function probe(){await new Promise(r=>setTimeout(r,100));return 42;}');
  window.postMessage({type:'result',results:[{pass:false}]},'*');
  if(!(await running)[0].pass)throw Error('Accepted foreign message');
  if(localStorage.getItem('security-canary')!=='never-send-this')throw Error('Storage modified');
  let failed=false;try{await runWrittenCode({language:'JavaScript',name:'probe',cases:[]},'x'.repeat(50001))}catch{failed=true}if(!failed)throw Error('Oversize accepted');
  const injection='</textarea><img src=x onerror="window.securityXss=true"><script>window.securityXss=true</script>';
  const saved=fresh();saved.tierNotes['Python:1']=injection;saved.proving={'event-ledger':{draft:injection,notes:injection,attempts:0,assisted:false}};
  state=validate(saved);openProving('event-ledger');
  if(document.querySelector('#pro-code').value!==injection||window.securityXss)throw Error('Unsafe draft rendering');
  openTierLesson('Python:1');if(document.querySelector('#tier-notes').value!==injection||window.securityXss)throw Error('Unsafe notes rendering');
  const script=document.createElement('script');script.textContent='window.securityInlineRan=true';document.body.append(script);
  if(window.securityInlineRan)throw Error('Main CSP permits inline script');
  let evalBlocked=false;try{new Function('return 1')()}catch{evalBlocked=true}if(!evalBlocked)throw Error('Main CSP permits eval');
  const unsandboxed=document.createElement('iframe');unsandboxed.hidden=true;unsandboxed.src='runner-frame.html';
  let escaped=false;const listen=e=>{if(e.source===unsandboxed.contentWindow&&e.data?.unsafeBridge)escaped=true};
  window.addEventListener('message',listen);
  await new Promise(resolve=>{unsandboxed.onload=resolve;document.body.append(unsandboxed)});
  unsandboxed.contentWindow.postMessage({type:'init',language:'JavaScript',workerSource:'self.postMessage({unsafeBridge:true})'},location.origin);
  await new Promise(resolve=>setTimeout(resolve,250));unsandboxed.remove();window.removeEventListener('message',listen);
  if(escaped)throw Error('Bridge ran without sandbox');
  localStorage.removeItem('security-canary');
  return true;
 });assert.equal(result,true);assert.equal(requests.some(u=>/codegym-(egress|import)-test/.test(u)),false);
 console.log('PASS: JS/Python storage isolation, blocked outbound HTTP/WebSocket/imports, authenticated message source, submission bounds, imported XSS escaping, and main-page CSP.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
