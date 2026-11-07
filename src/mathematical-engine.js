/* Reusable, dependency-free mathematical validators. Loaded before the app script. */
(function (root) {
  'use strict';
  const DEFAULT_TOLERANCE = { absolute: 1e-8, relative: 1e-8 };
  function parseNumber(input) {
    const s=String(input ?? '').trim().replace(/−/g,'-');
    if (!s) return {ok:false, reason:'A numeric value is required.'};
    const fraction=s.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))\s*\/\s*([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/);
    let n;
    if (fraction) { const den=Number(fraction[2]); if (!Number.isFinite(den)||den===0) return {ok:false,reason:'The fraction denominator must be finite and nonzero.'}; n=Number(fraction[1])/den; }
    else if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s)) n=Number(s);
    else return {ok:false,reason:'Enter one number, decimal, or fraction such as 3/4.'};
    return Number.isFinite(n)?{ok:true,value:n}:{ok:false,reason:'NaN and infinity are not valid answers.'};
  }
  function close(actual, expected, tolerance=DEFAULT_TOLERANCE) {
    if (!Number.isFinite(actual)||!Number.isFinite(expected)) return false;
    return Math.abs(actual-expected) <= tolerance.absolute+tolerance.relative*Math.abs(expected);
  }
  function parseVector(input, dimension) {
    let s=String(input ?? '').trim().replace(/−/g,'-');
    s=s.replace(/^[\[(]\s*/,'').replace(/\s*[\])]$/,'');
    if (!s) return {ok:false,reason:'Enter a vector.'};
    const parts=s.includes(',')?s.split(','):s.split(/\s+/);
    if (parts.length!==dimension) return {ok:false,reason:`Expected ${dimension} vector entries; received ${parts.length}.`};
    const values=[];
    for (const part of parts) { const n=parseNumber(part); if(!n.ok)return n; values.push(n.value); }
    return {ok:true,value:values};
  }
  function evaluateExpression(input){const s=String(input??'').replace(/−/g,'-').replace(/×/g,'*').replace(/÷/g,'/').trim();if(!s||s.length>200)return {ok:false,reason:'Enter a short arithmetic expression.'};const tokens=s.match(/(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[()+\-*/^]/gi)||[];if(tokens.join('')!==s.replace(/\s+/g,''))return {ok:false,reason:'Expression contains unsupported characters.'};let i=0;function atom(){const t=tokens[i++];if(t==='+')return atom();if(t==='-')return -atom();if(t==='('){const v=add();if(tokens[i++]!==')')throw Error('Missing closing parenthesis.');return v}const v=Number(t);if(!Number.isFinite(v))throw Error('Invalid number.');return v}function power(){let a=atom();if(tokens[i]==='^'){i++;a=Math.pow(a,power())}return a}function mul(){let a=power();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],b=power();a=op==='*'?a*b:a/b}return a}function add(){let a=mul();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=mul();a=op==='+'?a+b:a-b}return a}try{const value=add();if(i!==tokens.length||!Number.isFinite(value))return {ok:false,reason:'Expression is incomplete or does not evaluate to a finite value.'};return {ok:true,value}}catch(e){return {ok:false,reason:e.message}}
  }
  function parseMatrix(input,rows,cols){const s=String(input??'').trim().replace(/[\[\]]/g,'');const rowParts=s.split(/[;\n]+/).map(x=>x.trim()).filter(Boolean);if(rowParts.length!==rows)return {ok:false,reason:`Expected ${rows} matrix rows; received ${rowParts.length}.`};const value=[];for(const r of rowParts){const v=parseVector(r,cols);if(!v.ok)return v;value.push(v.value)}return {ok:true,value}}
  function checkNumber(input, expected, label='Value') {
    let parsed=parseNumber(input);if(!parsed.ok)parsed=evaluateExpression(input);
    return parsed.ok ? {ok:close(parsed.value,expected),components:[{name:label,ok:close(parsed.value,expected),actual:parsed.value,expected}],reason:close(parsed.value,expected)?'Numerically correct.':`Expected ${expected}.`} : {ok:false,components:[{name:label,ok:false,missing:!String(input??'').trim()}],reason:parsed.reason};
  }
  function checkVector(input, expected, label='Vector') {
    const p=parseVector(input,expected.length);
    if(!p.ok)return {ok:false,components:[{name:label,ok:false,missing:true}],reason:p.reason};
    const components=p.value.map((v,i)=>({name:`${label} entry ${i+1}`,actual:v,expected:expected[i],ok:close(v,expected[i])}));
    const ok=components.every(x=>x.ok);
    return {ok,components,reason:ok?'Vector entries and dimensions are correct.':'Check the vector dimensions and each corresponding entry.'};
  }
  function checkMatrix(input,expected,label='Matrix'){if(!Array.isArray(expected)||!expected.length)return {ok:false,reason:'Expected matrix is unavailable.',components:[]};const p=parseMatrix(input,expected.length,expected[0].length);if(!p.ok)return {ok:false,components:[{name:label,ok:false,missing:true}],reason:p.reason};const components=[];for(let i=0;i<expected.length;i++)for(let j=0;j<expected[i].length;j++)components.push({name:`${label} [${i+1},${j+1}]`,actual:p.value[i][j],expected:expected[i][j],ok:close(p.value[i][j],expected[i][j])});const ok=components.every(x=>x.ok);return {ok,components,reason:ok?'Matrix dimensions and entries are correct.':'Check matrix shape and corresponding entries.'}}
  function checkEigenpairs(input, matrix, expectedValues, dimension=2) {
    const raw=String(input??'').trim().replace(/−/g,'-');
    const chunks=raw.split(';').map(x=>x.trim()).filter(Boolean);
    const pairCount=dimension;
    if(chunks.length!==pairCount*2)return {ok:false,components:[{name:'Eigenpairs',ok:false,missing:true}],reason:`Supply ${pairCount} eigenpairs in the format λ;v1,v2;λ;v1,v2.`,missing:pairCount*2-chunks.length};
    const pairs=[];
    for(let i=0;i<chunks.length;i+=2){const l=parseNumber(chunks[i]),v=parseVector(chunks[i+1],dimension);if(!l.ok||!v.ok)return {ok:false,components:[{name:`Eigenpair ${pairs.length+1}`,ok:false,missing:true}],reason:l.reason||v.reason};pairs.push({lambda:l.value,vector:v.value});}
    const used=new Set(),components=[];
    for(let i=0;i<pairCount;i++){
      const pair=pairs[i],norm=Math.sqrt(pair.vector.reduce((s,x)=>s+x*x,0));
      const residual=matrix.map((row,r)=>row.reduce((s,x,c)=>s+x*pair.vector[c],0)-pair.lambda*pair.vector[r]);
      const residualNorm=Math.sqrt(residual.reduce((s,x)=>s+x*x,0));
      const eigenOk=residualNorm<=1e-8*(1+Math.abs(pair.lambda));
      const unitOk=close(norm,1,{absolute:1e-7,relative:1e-7});
      const match=expectedValues.findIndex((v,j)=>!used.has(j)&&close(pair.lambda,v));
      if(match>=0)used.add(match);
      components.push({name:`Eigenpair ${i+1} · eigenvalue`,ok:match>=0,actual:pair.lambda,expected:match>=0?expectedValues[match]:undefined});
      components.push({name:`Eigenpair ${i+1} · Av = λv`,ok:eigenOk,residualNorm});
      components.push({name:`Eigenpair ${i+1} · unit length`,ok:unitOk,norm});
    }
    for(let i=0;i<pairCount;i++) if(!used.has(i))components.push({name:`Required eigenvalue ${expectedValues[i]}`,ok:false,missing:true});
    const ok=components.every(c=>c.ok);
    return {ok,components,reason:ok?'All requested eigenvalues, eigenvectors, residual checks, and unit lengths are correct.':'At least one eigenvalue, eigenvector equation, unit-length condition, or requested pair is missing.'};
  }
  function validateGenerated(problem,input) {
    const family=Number(String(problem.id).slice(1).split('-')[0]);
    if(family===1||family===2||family===4){const expected=String(problem.answer).split(',').map(Number);return checkVector(input,expected,family===2?'Solution (x, y)':family===4?'Projection':'Matrix-vector product');}
    if(family===3){const m=String(problem.statement).match(/diag\((-?\d+),\s*(-?\d+)\)/);if(!m)return {ok:false,reason:'The generated matrix could not be read safely.',components:[]};const a=Number(m[1]),b=Number(m[2]);return checkEigenpairs(input,[[a,0],[0,b]],[a,b],2);}
    return checkNumber(input,Number(problem.answer),'Answer');
  }
  function validateDaily(input) {
    const s=String(input??'').trim();
    const match=s.match(/^[\s(]*([+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:\s*\/\s*[+-]?(?:\d+(?:\.\d*)?|\.\d+))?)/);
    const numeric=match?checkNumber(match[1],2,'Dot product'):checkNumber('',2,'Dot product');
    const hasAcute=/(\bacute\b|\bpositive\b)/i.test(s);
    const explanation={name:'Angle interpretation',ok:hasAcute,missing:!hasAcute};
    const components=[...numeric.components,explanation],ok=numeric.ok&&hasAcute;
    return {ok,components,reason:ok?'Both the dot product and its angle interpretation are correct.':!numeric.ok?'The dot product must equal 2.':'A positive dot product means the angle is acute.'};
  }
  function matrixShape(A){if(!Array.isArray(A)||!A.length||!Array.isArray(A[0])||!A[0].length||A.some(r=>!Array.isArray(r)||r.length!==A[0].length||r.some(x=>!Number.isFinite(x))))throw new Error('Expected a non-empty rectangular matrix of finite numbers.');return [A.length,A[0].length]}
  function vectorAdd(a,b){if(a.length!==b.length)throw new Error('Vector dimensions must match.');return a.map((x,i)=>x+b[i])}
  function scalarMultiply(s,v){if(!Number.isFinite(s)||!v.every(Number.isFinite))throw new Error('Inputs must be finite.');return v.map(x=>s*x)}
  function transpose(A){const [m,n]=matrixShape(A);return Array.from({length:n},(_,j)=>Array.from({length:m},(_,i)=>A[i][j]))}
  function matrixMultiply(A,B){const [m,n]=matrixShape(A),[p,q]=matrixShape(B);if(n!==p)throw new Error('Inner matrix dimensions must match.');return Array.from({length:m},(_,i)=>Array.from({length:q},(_,j)=>A[i].reduce((s,x,k)=>s+x*B[k][j],0)))}
  function determinant(A){const [m,n]=matrixShape(A);if(m!==n)throw new Error('Determinant requires a square matrix.');const M=A.map(r=>r.slice());let det=1;for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;if(Math.abs(M[p][k])<1e-14)return 0;if(p!==k){[M[k],M[p]]=[M[p],M[k]];det=-det}const pivot=M[k][k];det*=pivot;for(let i=k+1;i<n;i++){const f=M[i][k]/pivot;for(let j=k+1;j<n;j++)M[i][j]-=f*M[k][j]}}return det}
  function inverse(A){const [n,m]=matrixShape(A);if(n!==m)throw new Error('Inverse requires a square matrix.');const M=A.map((r,i)=>[...r,...Array.from({length:n},(_,j)=>i===j?1:0)]);for(let k=0;k<n;k++){let p=k;for(let i=k+1;i<n;i++)if(Math.abs(M[i][k])>Math.abs(M[p][k]))p=i;if(Math.abs(M[p][k])<1e-14)throw new Error('Matrix is singular.');[M[k],M[p]]=[M[p],M[k]];const v=M[k][k];M[k]=M[k].map(x=>x/v);for(let i=0;i<n;i++)if(i!==k){const f=M[i][k];M[i]=M[i].map((x,j)=>x-f*M[k][j])}}return M.map(r=>r.slice(n))}
  function solve(A,b){const [n,m]=matrixShape(A);if(n!==m||b.length!==n)throw new Error('Unique solve requires a square matrix and matching right-hand side.');return matrixMultiply(inverse(A),b.map(x=>[x])).map(r=>r[0])}
  function rank(A,tol=1e-10){const [m,n]=matrixShape(A),M=A.map(r=>r.slice());let r=0;for(let c=0;c<n&&r<m;c++){let p=r;for(let i=r+1;i<m;i++)if(Math.abs(M[i][c])>Math.abs(M[p][c]))p=i;if(Math.abs(M[p][c])<=tol)continue;[M[r],M[p]]=[M[p],M[r]];const v=M[r][c];for(let j=c;j<n;j++)M[r][j]/=v;for(let i=0;i<m;i++)if(i!==r){const f=M[i][c];for(let j=c;j<n;j++)M[i][j]-=f*M[r][j]}r++}return r}
  function eigenSymmetric2(A){const [n,m]=matrixShape(A);if(n!==2||m!==2||Math.abs(A[0][1]-A[1][0])>1e-10)throw new Error('Expected a symmetric 2×2 matrix.');const [a,b]=[A[0][0],A[0][1]],d=A[1][1],disc=Math.sqrt((a-d)**2+4*b*b),values=[(a+d+disc)/2,(a+d-disc)/2];if(disc<1e-14)return {values,vectors:[[1,0],[0,1]]};const vectors=values.map(l=>{let v=[b,l-a];if(Math.hypot(...v)<1e-14)v=[l-d,b];const norm=Math.hypot(...v);return v.map(x=>x/norm)});return {values,vectors}}
  function gramSchmidt(vectors,tol=1e-10){const basis=[];for(const v of vectors){let u=v.slice();for(const q of basis){const dot=u.reduce((s,x,i)=>s+x*q[i],0);u=u.map((x,i)=>x-dot*q[i])}const norm=Math.hypot(...u);if(norm<tol)throw new Error('Input vectors are linearly dependent.');basis.push(u.map(x=>x/norm))}return basis}
  function covariance(rows){const [n,p]=matrixShape(rows);if(n<2)throw new Error('At least two observations are required.');const means=Array.from({length:p},(_,j)=>rows.reduce((s,r)=>s+r[j],0)/n);return Array.from({length:p},(_,i)=>Array.from({length:p},(_,j)=>rows.reduce((s,r)=>s+(r[i]-means[i])*(r[j]-means[j]),0)/(n-1)))}
  function correlationMatrix(rows){const C=covariance(rows),sd=C.map((r,i)=>Math.sqrt(r[i]));if(sd.some(x=>x===0))throw new Error('Correlation is undefined for a constant variable.');return C.map((r,i)=>r.map((x,j)=>x/(sd[i]*sd[j])))}
  function leastSquares(A,b){const At=transpose(A),normal=matrixMultiply(At,A),rhs=matrixMultiply(At,b.map(x=>[x])).map(r=>r[0]);if(rank(A)<A[0].length)throw new Error('The design matrix does not have full column rank.');return solve(normal,rhs)}
  function pca2(rows){const C=covariance(rows);if(C.length!==2)throw new Error('This built-in PCA routine currently supports two variables.');const eig=eigenSymmetric2(C),total=eig.values.reduce((s,x)=>s+x,0);return {...eig,covariance:C,explainedVariance:eig.values.map(x=>total?x/total:0)}}
  function svd2(A){const [m,n]=matrixShape(A);if(m!==2||n!==2)throw new Error('This built-in SVD routine currently supports 2×2 matrices.');const AtA=matrixMultiply(transpose(A),A),e=eigenSymmetric2(AtA),singularValues=e.values.map(x=>Math.sqrt(Math.max(0,x))),V=e.vectors,U=[];for(let i=0;i<2;i++){if(singularValues[i]>1e-12){const av=matrixMultiply(A,V[i].map(x=>[x])).map(r=>r[0]);U.push(av.map(x=>x/singularValues[i]))}else U.push(i===0?[1,0]:[-U[0][1],U[0][0]])}return {U,singularValues,V}}
  function alleleFrequency(genotypes){if(!Array.isArray(genotypes)||!genotypes.length||genotypes.some(x=>![0,1,2].includes(x)))throw new Error('Genotypes must be a non-empty list of 0, 1, or 2 alternate allele copies.');return genotypes.reduce((s,x)=>s+x,0)/(2*genotypes.length)}
  function genotypeFrequencies(genotypes){if(!Array.isArray(genotypes)||!genotypes.length||genotypes.some(x=>![0,1,2].includes(x)))throw new Error('Genotypes must be a non-empty list of 0, 1, or 2.');return [0,1,2].map(g=>genotypes.filter(x=>x===g).length/genotypes.length)}
  function hardyWeinberg(p){if(!Number.isFinite(p)||p<0||p>1)throw new Error('Allele frequency p must lie in [0,1].');const q=1-p;return [p*p,2*p*q,q*q]}
  function effectivePopulationSize(males,females){if(!Number.isFinite(males)||!Number.isFinite(females)||males<=0||females<=0)throw new Error('Both breeding counts must be positive.');return 4*males*females/(males+females)}
  function drift(p,Ne,generations,rng=Math.random){if(!Number.isFinite(p)||p<0||p>1||!Number.isInteger(Ne)||Ne<1||!Number.isInteger(generations)||generations<0)throw new Error('Use p in [0,1], positive integer Ne, and nonnegative integer generations.');const history=[p],copies=2*Ne;for(let g=0;g<generations;g++){let n=0;for(let i=0;i<copies;i++)if(rng()<history[g])n++;history.push(n/copies)}return history}
  root.MathEngine={DEFAULT_TOLERANCE,parseNumber,parseVector,parseMatrix,evaluateExpression,close,checkNumber,checkVector,checkMatrix,checkEigenpairs,validateGenerated,validateDaily,vectorAdd,scalarMultiply,transpose,matrixMultiply,determinant,inverse,solve,rank,eigenSymmetric2,gramSchmidt,covariance,correlationMatrix,leastSquares,pca2,svd2,alleleFrequency,genotypeFrequencies,hardyWeinberg,effectivePopulationSize,drift};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.MathEngine;
})(typeof globalThis!=='undefined'?globalThis:this);
