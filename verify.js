const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
for(const [,src] of html.matchAll(/<script src="([^"]+)"/g))if(!fs.existsSync(path.join(__dirname,src)))throw Error(`Missing application script: ${src}`);
const match = html.match(/<script>([\s\S]*?)<\/script>/);
if (!match) throw new Error('Main application script was not found.');
const script = match[1];
new Function(script); // Syntax check, including the inline application code.

const start = script.indexOf('function problem(id)');
const end = script.indexOf('function getProblem(id)', start);
if (start < 0 || end < 0) throw new Error('Problem generator was not found.');
const familyCode = script.slice(start, end);
const makeProblem = new Function('topics', `${familyCode}; return problem;`)([
  'Vectors', 'Matrix calculations', 'Linear systems', 'Eigenvalues',
  'Projections', 'Population genetics', 'PCA', 'Determinants'
]);

const seen = new Set();
const M = require('./src/mathematical-engine.js');
for (let family=0; family<8; family++) for (let k=0; k<64; k++) {
  const p = makeProblem(`P${family}-${k}`);
  if (!p.statement || !p.answer || !p.solution || !p.hint) throw new Error(`Incomplete problem ${p.id}`);
  if (seen.has(p.statement)) throw new Error(`Duplicate statement ${p.id}`);
  seen.add(p.statement);
  if (p.topic !== ['Vectors','Matrix calculations','Linear systems','Eigenvalues','Projections','Population genetics','PCA','Determinants'][family]) throw new Error(`Incorrect topic for ${p.id}`);

  const a=k%8+1, b=Math.floor(k/8)+1, c=(k*5)%7+1, d=(k*2)%5+1;
  let expected;
  switch(family) {
    case 0: expected=String(a*c-b*d); break;
    case 1: expected=`${2*a*b},${c*b+d*a}`; break;
    case 2: expected=`${k%8+1},${Math.floor(k/8)-3}`; break;
    case 3: expected=`${a},${-b}`; break;
    case 4: expected=`${a},0`; break;
    case 5: expected=(a/(2*(a+b))).toFixed(3); break;
    case 6: expected=(100*Math.max(k+1,64-k)/65).toFixed(1); break;
    case 7: expected=String(a*d-b*c); break;
  }
  if (p.answer !== expected) throw new Error(`Incorrect generated answer for ${p.id}: ${p.answer} != ${expected}`);
  const submission=family===3?(()=>{const pair=p.statement.match(/diag\((-?\d+),\s*(-?\d+)\)/);if(!pair)throw Error(`Could not read eigenvalues from ${p.id}`);return `${pair[1]};1,0;${pair[2]};0,1`})():p.answer;
  if(!M.validateGenerated(p,submission).ok)throw new Error(`Validator rejected the correct answer for ${p.id}`);
}
if (seen.size !== 512) throw new Error(`Expected 512 unique problems, got ${seen.size}.`);
console.log(`PASS: application JavaScript parses; ${seen.size} unique problems have complete prompts and verified expected answers.`);
