let activeRunner=null;
function cancelCodeRun() {
  if(activeRunner){activeRunner.worker.terminate();clearTimeout(activeRunner.timer);activeRunner.reject(Error('Run cancelled.'));activeRunner=null}
}
function runWrittenCode(exercise,code) {
  cancelCodeRun();
  return new Promise((resolve,reject)=>{
    const worker=new Worker('code-worker.js');
    const job={...exercise,type:'run',code};
    const finish=(error,results)=>{
      if(activeRunner?.worker!==worker)return;
      clearTimeout(activeRunner.timer);worker.terminate();activeRunner=null;
      if(error)reject(Error(error));else resolve(results);
    };
    const timer=setTimeout(()=>finish('The local runtime could not finish loading. Retry from the local web-server URL.'),45000);
    activeRunner={worker,timer,reject};
    worker.onerror=e=>finish(e.message||'Could not start the local runtime.');
    worker.onmessage=e=>{
      if(e.data.type==='ready'){
        clearTimeout(activeRunner.timer);
        activeRunner.timer=setTimeout(()=>finish('Execution exceeded three seconds. Check for an infinite loop or unresolved promise.'),3000);
        worker.postMessage(job);
      }else if(e.data.type==='error')finish(e.data.error);
      else if(e.data.type==='result')finish(null,e.data.results);
    };
    worker.postMessage({type:'init',language:exercise.language});
  });
}
