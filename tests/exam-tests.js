const assert=require('node:assert/strict');
const E=require('../src/exam-engine.js');
const a=E.select(Array.from({length:20},(_,i)=>i),7,()=>.25);assert.equal(a.length,7);assert.equal(new Set(a).size,7);assert.ok(a.every(x=>Number.isInteger(x)&&x>=0&&x<20));
const results=[
 {answer:'2',result:{ok:true},p:{topic:'Vectors',level:1}},
 {answer:'bad',result:{ok:false},p:{topic:'Vectors',level:2}},
 {answer:'',result:{ok:false},p:{topic:'PCA',level:2}}
];
const r=E.summarize(results);assert.equal(r.total,3);assert.equal(r.correct,1);assert.equal(r.incorrect,1);assert.equal(r.unanswered,1);assert.equal(r.score,33);assert.deepEqual(r.weakAreas,['Vectors','PCA']);assert.equal(r.difficulties['2'].total,2);
console.log('PASS: exam selection is randomized without replacement; score/topic/difficulty summaries distinguish wrong and blank responses.');
