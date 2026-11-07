/* Shared course registry, activation, and progress helpers. */
(function(root){'use strict';
 const config=root.CourseCatalogData;
 if(!config||!Array.isArray(config.courses))throw new Error('Course catalog data must load before the shared course engine.');
 const registry=config.courses.map(c=>({...c,sharedSystems:[...(c.sharedSystems||[])]}));
 const graph=config.prerequisites.map(e=>({...e}));
 const VALID_STATUS=new Set(['fully-implemented','in-development','coming-soon','completed']);
 function blank(){return root.MathStorage.defaults()}
 function normalize(raw){let input=raw&&typeof raw==='object'?raw:{};let platform;
  if(input.courses&&typeof input.courses==='object')platform={activeCourseId:input.activeCourseId||'linear-algebra',courses:{...input.courses},preferences:{dark:!!input.preferences?.dark,timeZone:input.preferences?.timeZone||'Asia/Dhaka'},enrolledCourseIds:Array.isArray(input.enrolledCourseIds)?[...new Set(input.enrolledCourseIds.filter(id=>registry.some(c=>c.id===id)))]:['linear-algebra']};
  else platform={activeCourseId:'linear-algebra',courses:{'linear-algebra':input},preferences:{dark:!!input.dark,timeZone:'Asia/Dhaka'},enrolledCourseIds:['linear-algebra']};
  for(const c of registry)if(!platform.courses[c.id])platform.courses[c.id]=blank();
  if(!registry.some(c=>c.id===platform.activeCourseId))platform.activeCourseId='linear-algebra';
  if(!platform.enrolledCourseIds.includes('linear-algebra'))platform.enrolledCourseIds.unshift('linear-algebra');
  return platform;
 }
 function activate(platform,id){const c=get(id);if(!c)throw new Error(`Unknown course ID: ${id}`);if(!platform.courses[id])platform.courses[id]=blank();if(!platform.enrolledCourseIds.includes(id))platform.enrolledCourseIds.push(id);platform.activeCourseId=id;return {course:c,progress:platform.courses[id]}}
 function get(id){return registry.find(x=>x.id===id)||null}
 function contentAdapter(id){return get(id)?.contentAdapter||null}
 function register(course){if(!course||typeof course.id!=='string'||!/^[a-z0-9-]+$/.test(course.id))throw new Error('Course configuration requires a lowercase slug ID.');if(get(course.id))throw new Error(`Course already registered: ${course.id}`);if(!VALID_STATUS.has(course.status))throw new Error('Course status is invalid.');if(typeof course.name!=='string'||!course.name.trim())throw new Error('Course name is required.');const entry={...course,contentAdapter:course.contentAdapter||null,sharedSystems:[...(course.sharedSystems||[])]};registry.push(entry);return entry}
 function summary(id,progress){return {course:get(id),solved:progress?.solved?.length||0,attempts:progress?.attempts?.length||0,days:Object.keys(progress?.activeDays||{}).length,learningStatus:progress?.courseCompleted?'Completed':(progress?.attempts?.length||progress?.solved?.length)?'In Progress':'Not Started'}}
 root.CourseEngine={registry,graph,VALID_STATUS,normalize,activate,get,contentAdapter,register,summary,blank};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.CourseEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
