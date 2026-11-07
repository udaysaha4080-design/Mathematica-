/* Course metadata only. Learning content lives in its course adapter. */
(function(root){'use strict';
 root.CourseCatalogData={
  courses:[
   {id:'linear-algebra',name:'Linear Algebra',status:'in-development',contentAdapter:'linear-algebra-v1',sharedSystems:['academy','arena','daily','biology-lab','research','studio','playground'],description:'The first active course: 16 modules, original practice, assessment, research tools, and a population-genetics lab. Lesson and higher-dimensional lab coverage is still being expanded.'},
   {id:'calculus',name:'Calculus',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'probability',name:'Probability Theory',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'statistics',name:'Mathematical Statistics',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'differential-equations',name:'Differential Equations',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'discrete-mathematics',name:'Discrete Mathematics',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'optimization',name:'Optimization',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'},
   {id:'mathematical-biology',name:'Mathematical Biology',status:'coming-soon',contentAdapter:null,sharedSystems:[],description:'Course registered. Modules, lessons, problem bank, assessments, applied laboratory, and research resources have not been implemented.'}
  ],
  prerequisites:[
   {from:'linear-algebra',to:'pca',label:'Linear Algebra → PCA'},
   {from:'calculus',to:'optimization',label:'Calculus → Optimization'},
   {from:'probability',to:'statistics',label:'Probability → Mathematical Statistics'},
   {from:'probability',to:'coalescent-theory',label:'Probability → Coalescent Theory'},
   {from:'differential-equations',to:'population-dynamics',label:'Differential Equations → Population Dynamics'},
   {from:'optimization',to:'maximum-likelihood',label:'Optimization → Maximum Likelihood Estimation'}
  ]
 };
 if(typeof module!=='undefined'&&module.exports)module.exports=root.CourseCatalogData;
})(typeof globalThis!=='undefined'?globalThis:this);
