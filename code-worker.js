// Disposable browser worker. No submitted code is run by the local web server.
let python;
const stable=value=>JSON.stringify(value,(_,v)=>v && typeof v==='object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])) : v);
function cacheCase(fn,scenario) {
  let calls=0;const wanted=scenario==='false'?false:0;
  const cached=fn(()=>{calls++;return wanted});
  const a=cached(1),b=cached(1);
  if(scenario==='keys'){cached(2);cached(1);return a===wanted&&b===wanted&&calls===2}
  return a===wanted&&b===wanted&&calls===1;
}
async function evaluateJS(job) {
  const fn=new Function('asyncDouble',`"use strict";\n${job.code}\nreturn ${job.name};`)(async n=>n*2);
  if(typeof fn!=='function')throw Error(`Define ${job.name} as a function.`);
  const results=[];
  for(const test of job.cases) {
    try {
      const args=JSON.parse(JSON.stringify(test.args));
      const before=stable(args);
      const actual=job.id==='js-cache'?cacheCase(fn,args[0]):await fn(...args);
      results.push({pass:stable(actual)===stable(test.expected)&&(!job.checkUnchanged||before===stable(args)),actual:stable(actual),expected:stable(test.expected)});
    } catch(error){results.push({pass:false,error:String(error.message||error).slice(0,500)})}
  }
  return results;
}
async function evaluatePython(job) {
  python.globals.set('submitted_code',job.code);
  python.globals.set('submitted_name',job.name);
  python.globals.set('exercise_id',job.id);
  python.globals.set('check_unchanged',job.checkUnchanged===true);
  python.globals.set('case_json',JSON.stringify(job.cases));
  const serialized=python.runPython(`
import json
scope = {}
exec(submitted_code, scope)
fn = scope.get(submitted_name)
if not callable(fn):
    raise ValueError("Define " + submitted_name + " as a function")
def same(a, b):
    if isinstance(a, bool) or isinstance(b, bool):
        return type(a) is type(b) and a == b
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return a == b
    if type(a) is not type(b):
        return False
    if isinstance(a, list):
        return len(a) == len(b) and all(same(x, y) for x, y in zip(a, b))
    if isinstance(a, dict):
        return a.keys() == b.keys() and all(same(a[k], b[k]) for k in a)
    return a == b
results = []
for case in json.loads(case_json):
    try:
        args = case["args"]
        before = json.dumps(args, sort_keys=True)
        if exercise_id == "py-default":
            if args[0] == "fresh":
                first, second = fn(1), fn(2)
                actual = first == [1] and second == [2] and first is not second
            else:
                bucket = [1]
                actual = fn(2, bucket) is bucket and bucket == [1, 2]
        elif exercise_id == "py-cache":
            calls = [0]
            wanted = False if args[0] == "false" else 0
            def source(key):
                calls[0] += 1
                return wanted
            cached = fn(source)
            a, b = cached(1), cached(1)
            if args[0] == "keys":
                cached(2)
                cached(1)
                actual = same(a, wanted) and same(b, wanted) and calls[0] == 2
            else:
                actual = same(a, wanted) and same(b, wanted) and calls[0] == 1
        else:
            actual = fn(*args)
        results.append({"pass": same(actual, case["expected"]) and (not check_unchanged or before == json.dumps(args, sort_keys=True)), "actual": repr(actual)[:500], "expected": repr(case["expected"])})
    except Exception as error:
        results.append({"pass": False, "error": str(error)[:500]})
json.dumps(results)
`);
  return JSON.parse(serialized);
}
self.onmessage=async event=>{
  const job=event.data;
  try {
    if(job.type==='init') {
      if(job.language==='Python') {
        importScripts('assets/pyodide/pyodide.js');
        python=await loadPyodide({indexURL:new URL('assets/pyodide/',self.location.href).href,stdout:()=>{},stderr:()=>{}});
      }
      self.postMessage({type:'ready'});return;
    }
    const results=job.language==='Python'?await evaluatePython(job):await evaluateJS(job);
    self.postMessage({type:'result',results});
  }catch(error){self.postMessage({type:'error',error:String(error.message||error).slice(0,1000)})}
};
