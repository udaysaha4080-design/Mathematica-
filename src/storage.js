/* Versioned local-first platform and per-course records. */
(function(root){'use strict';
 const VERSION=3,KEY='mathematica-v3',LEGACY_V2='mathematica-v2',LEGACY_V1='mathematica-v1';
 const defaults=()=>({solved:[],wrong:[],minutes:0,activeDays:{},dailyDone:{},attempts:[],notes:'',papers:[],milestones:{},journal:'',journalEntries:[],dark:false,courseCompleted:false,sessions:[],practiceSeconds:0,exam:null});
 function cleanCourse(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Each course progress record must be an object.');const d=defaults();
  if(input.solved!==undefined&&(!Array.isArray(input.solved)||input.solved.some(x=>typeof x!=='string')))throw new Error('solved must be a list of problem IDs.');
  if(input.wrong!==undefined&&(!Array.isArray(input.wrong)||input.wrong.some(x=>typeof x!=='string')))throw new Error('wrong must be a list of problem IDs.');
  if(input.attempts!==undefined&&(!Array.isArray(input.attempts)||input.attempts.some(a=>!a||typeof a.id!=='string'||typeof a.date!=='string'||typeof a.correct!=='boolean')))throw new Error('attempts must contain problem IDs, dates, and boolean results.');
  if(input.minutes!==undefined&&(!Number.isFinite(input.minutes)||input.minutes<0))throw new Error('minutes must be a nonnegative finite number.');
  for(const field of ['activeDays','dailyDone'])if(input[field]!==undefined&&(!input[field]||typeof input[field]!=='object'||Array.isArray(input[field])))throw new Error(`${field} must be a date map.`);
  if(input.papers!==undefined&&(!Array.isArray(input.papers)||input.papers.some(p=>!p||typeof p.title!=='string'||typeof p.doi!=='string')))throw new Error('Each paper requires a title and DOI or URL.');
  if(input.milestones!==undefined&&(!input.milestones||typeof input.milestones!=='object'||Array.isArray(input.milestones)||Object.values(input.milestones).some(v=>typeof v!=='boolean')))throw new Error('milestones must contain boolean values.');
  for(const field of ['journal','notes'])if(input[field]!==undefined&&typeof input[field]!=='string')throw new Error(`${field} must be text.`);
  if(input.courseCompleted!==undefined&&typeof input.courseCompleted!=='boolean')throw new Error('courseCompleted must be boolean.');
  d.solved=[...new Set(input.solved||[])].slice(0,100000);d.wrong=[...new Set(input.wrong||[])].slice(0,100000);
  d.attempts=(input.attempts||[]).slice(-20000).map(a=>({id:a.id.slice(0,100),date:a.date.slice(0,10),correct:a.correct}));d.minutes=input.minutes||0;
  for(const field of ['activeDays','dailyDone'])d[field]=Object.fromEntries(Object.entries(input[field]||{}).filter(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&v===true));
  d.papers=(input.papers||[]).map(p=>({title:p.title.slice(0,1000),authors:String(p.authors||'').slice(0,1000),date:String(p.date||'').slice(0,100),doi:p.doi.slice(0,2000)}));
  d.milestones=input.milestones||{};d.journal=(input.journal||'').slice(0,200000);d.notes=(input.notes||'').slice(0,20000);d.dark=!!input.dark;d.courseCompleted=!!input.courseCompleted;
  d.practiceSeconds=Number.isFinite(input.practiceSeconds)&&input.practiceSeconds>=0?input.practiceSeconds:d.minutes*60;
  d.sessions=Array.isArray(input.sessions)?input.sessions.filter(x=>x&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)&&Number.isFinite(x.seconds)&&x.seconds>=0).slice(-10000):[];
  for(const [k,v] of Object.entries(input))if(/^case\d+$/.test(k)&&typeof v==='string')d[k]=v.slice(0,20000);
  if(input.journalEntries!==undefined){if(!Array.isArray(input.journalEntries)||input.journalEntries.some(e=>!e||typeof e.id!=='string'||typeof e.text!=='string'))throw new Error('journalEntries must contain entries with IDs and text.');d.journalEntries=input.journalEntries.map(e=>({id:e.id.slice(0,100),title:String(e.title||'').slice(0,500),category:String(e.category||'General').slice(0,100),text:e.text.slice(0,200000),date:String(e.date||'').slice(0,30),references:String(e.references||'').slice(0,5000)}))}
  if(input.exam!==undefined&&input.exam!==null){const e=input.exam;if(!e||!['active','review','submitted'].includes(e.status)||!Array.isArray(e.ids)||e.ids.length>50||e.ids.some(id=>typeof id!=='string'||!/^P[0-7]-\d+$/.test(id))||new Set(e.ids).size!==e.ids.length)throw new Error('Saved exam state is malformed.');const answers=e.answers||{};if(!answers||typeof answers!=='object'||Array.isArray(answers)||Object.entries(answers).some(([k,v])=>!e.ids.includes(k)||typeof v!=='string'))throw new Error('Saved exam answers are malformed.');if(!Number.isFinite(e.startedAt)||!Number.isFinite(e.deadline)||!Number.isInteger(e.selected)||e.selected<0||e.selected>=e.ids.length)throw new Error('Saved exam timing or selection is malformed.');d.exam={status:e.status,ids:e.ids.slice(),answers:Object.fromEntries(Object.entries(answers).map(([k,v])=>[k,v.slice(0,2000)])),startedAt:e.startedAt,deadline:e.deadline,selected:e.selected,topic:String(e.topic||'').slice(0,100),level:String(e.level||'').slice(0,20),minutes:Number.isFinite(e.minutes)?e.minutes:20,submittedAt:Number.isFinite(e.submittedAt)?e.submittedAt:null};}
  return d;
 }
 function migrateFlat(input){const progress=cleanCourse(input);return {activeCourseId:'linear-algebra',enrolledCourseIds:['linear-algebra'],preferences:{dark:!!input.dark},courses:{'linear-algebra':progress}}}
 function clean(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Backup root must be a JSON object.');
  if(!input.courses)return migrateFlat(input);
  if(typeof input.courses!=='object'||Array.isArray(input.courses))throw new Error('courses must be an ID-to-progress map.');
  if(input.activeCourseId!==undefined&&(typeof input.activeCourseId!=='string'||!/^[a-z0-9-]+$/.test(input.activeCourseId)))throw new Error('activeCourseId is invalid.');
  const courses={};for(const [id,progress] of Object.entries(input.courses)){if(!/^[a-z0-9-]+$/.test(id))throw new Error(`Invalid course ID: ${id}`);courses[id]=cleanCourse(progress)}
  if(!courses['linear-algebra'])courses['linear-algebra']=defaults();
  const activeCourseId=courses[input.activeCourseId]?input.activeCourseId:'linear-algebra';
  const enrolled=Array.isArray(input.enrolledCourseIds)?input.enrolledCourseIds.filter(id=>typeof id==='string'&&courses[id]):[];if(!enrolled.includes('linear-algebra'))enrolled.unshift('linear-algebra');if(!enrolled.includes(activeCourseId))enrolled.push(activeCourseId);
  let timeZone='Asia/Dhaka';if(input.preferences?.timeZone!==undefined){if(typeof input.preferences.timeZone!=='string'||input.preferences.timeZone.length>100)throw new Error('preferences.timeZone must be a valid timezone name.');try{new Intl.DateTimeFormat('en',{timeZone:input.preferences.timeZone})}catch{throw new Error('preferences.timeZone is not recognized.')}timeZone=input.preferences.timeZone}
  return {activeCourseId,enrolledCourseIds:[...new Set(enrolled)],preferences:{dark:!!input.preferences?.dark,timeZone},courses};
 }
 function decode(raw,expected){const obj=JSON.parse(raw);if(!obj||typeof obj!=='object')throw new Error('Saved data is malformed.');if(obj.schemaVersion!==expected)throw new Error(`Unsupported saved-data version ${obj.schemaVersion}.`);return clean(obj.data)}
 function load(v3,v2,v1){try{if(v3)return {data:decode(v3,VERSION),error:'',migrated:false,sourceVersion:VERSION};if(v2)return {data:decode(v2,2),error:'',migrated:true,sourceVersion:2};if(v1){const parsed=JSON.parse(v1);return {data:clean(parsed),error:'',migrated:true,sourceVersion:1}}return {data:clean({}),error:'',migrated:false,sourceVersion:0}}catch(e){return {data:clean({}),error:`Saved data could not be loaded safely: ${e.message}`,migrated:false,sourceVersion:0}}}
 function read(key,storage){try{return (storage||root.localStorage).getItem(key)}catch{return null}}
 function available(storage){try{const s=storage||root.localStorage;s.getItem(KEY);return true}catch{return false}}
 function save(data,storage=root.localStorage){const safe=clean(data);try{storage.setItem(KEY,JSON.stringify({schemaVersion:VERSION,data:safe,savedAt:new Date().toISOString()}))}catch(e){throw new Error(`Local records could not be saved: ${e.message}`)}return safe}
 function parseImport(raw){if(typeof raw!=='string'||raw.length>5_000_000)throw new Error('Backup must be text under 5 MB.');let obj;try{obj=JSON.parse(raw)}catch{throw new Error('File is not valid JSON.')}if(obj?.schemaVersion){if(obj.schemaVersion===VERSION)return clean(obj.data);if(obj.schemaVersion===2)return migrateFlat(obj.data);if(obj.schemaVersion===1)return clean(obj.data);throw new Error(`Unsupported backup version ${obj.schemaVersion}.`)}return clean(obj)}
 root.MathStorage={VERSION,KEY,LEGACY_V2,LEGACY_V1,defaults,cleanCourse,clean,migrateFlat,load,read,available,save,parseImport};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.MathStorage;
})(typeof globalThis!=='undefined'?globalThis:this);
