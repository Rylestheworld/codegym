const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=['questions.js','curriculum.js','extra-topics.js','lessons.js','lesson-tools.js','lesson-modern.js','paths.js','learning-engine.js','writing-data.js','transfer-data.js','content-quality.js','tier-lessons.js','missions-data.js'];
function load(){const ctx=vm.createContext({});for(const file of files)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});return {ctx,root,data:JSON.parse(vm.runInContext('JSON.stringify({questions:QUESTIONS,lessons:LESSONS,paths:PATHS,writing:WRITING,transfers:TRANSFERS,tiers:TIER_LESSONS,missions:MISSIONS})',ctx))}}
module.exports={load};
