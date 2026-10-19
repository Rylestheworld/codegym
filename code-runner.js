// The trusted page loads only fixed, local runtime assets. Learner code receives
// no app state and runs in an opaque-origin frame's CSP-restricted blob worker.
let activeRunner=null,runnerAssetPromise=null;
function cancelCodeRun() { if(activeRunner)activeRunner.finish('Run cancelled.'); }
async function runnerAssets(language) {
  const read=async path=>{const response=await fetch(path,{credentials:'omit',redirect:'error'});if(!response.ok)throw Error('Could not load the local runtime.');return response.arrayBuffer()};
  const source=new TextDecoder().decode(await read('code-worker.js'));
  if(language!=='Python')return {source,assets:{}};
  if(!runnerAssetPromise)runnerAssetPromise=Promise.all(['pyodide.js','pyodide.asm.mjs','pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'].map(async name=>[name,await read('assets/pyodide/'+name)])).then(Object.fromEntries).catch(error=>{runnerAssetPromise=null;throw error});
  return {source,assets:await runnerAssetPromise};
}
function runWrittenCode(exercise,code) {
  cancelCodeRun();
  if(typeof code!=='string'||code.length>50000)return Promise.reject(Error('Keep submissions under 50,000 characters.'));
  if(!['JavaScript','Python'].includes(exercise.language))return Promise.reject(Error('Unsupported runner language.'));
  return new Promise((resolve,reject)=>{
    const frame=document.createElement('iframe');
    frame.sandbox='allow-scripts';frame.hidden=true;frame.title='Isolated Code Runner';frame.referrerPolicy='no-referrer';
    frame.src='runner-frame.html';
    const run={frame,timer:null,finish:null};
    const finish=(error,results)=>{
      if(activeRunner!==run)return;
      clearTimeout(run.timer);window.removeEventListener('message',receive);frame.remove();activeRunner=null;
      if(error)reject(Error(error));else resolve(results);
    };
    run.finish=finish;activeRunner=run;
    const receive=event=>{
      if(event.source!==frame.contentWindow||event.origin!=='null'||!event.data)return;
      const data=event.data;
      if(data.type==='ready'){
        clearTimeout(run.timer);run.timer=setTimeout(()=>finish('Execution exceeded three seconds. Check for an infinite loop or unresolved promise.'),3000);
        frame.contentWindow.postMessage({...exercise,type:'run',code},'*');
      }else if(data.type==='error')finish(String(data.error||'Execution failed.').slice(0,1000));
      else if(data.type==='result'){
        if(!Array.isArray(data.results)||data.results.length!==exercise.cases.length)return finish('Invalid test result.');
        const results=data.results.map(t=>({pass:t?.pass===true,actual:String(t?.actual??'').slice(0,1000),expected:String(t?.expected??'').slice(0,1000),error:t?.error?String(t.error).slice(0,1000):undefined}));
        finish(null,results);
      }
    };
    window.addEventListener('message',receive);
    run.timer=setTimeout(()=>finish('The isolated runtime could not finish loading. Retry from the website.'),45000);
    frame.addEventListener('load',async()=>{
      try {const {source,assets}=await runnerAssets(exercise.language);if(activeRunner===run)frame.contentWindow.postMessage({type:'init',workerSource:source,language:exercise.language,assets},'*')}
      catch(error){finish(error.message)}
    },{once:true});
    document.body.append(frame);
  });
}
