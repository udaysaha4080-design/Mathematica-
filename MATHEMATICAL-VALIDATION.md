# Mathematical validation rules

## Numeric parsing

`parseNumber` accepts finite integers, decimals, scientific notation, and fractions with a nonzero denominator. `evaluateExpression` accepts finite arithmetic using `+ - * / ^` and parentheses. It rejects identifiers, function calls, and other characters; it does not execute JavaScript. The expression evaluator is intentionally limited and does not claim to parse arbitrary mathematics.

Default numeric comparison uses `|a − b| ≤ 10⁻⁸ + 10⁻⁸ |b|`. Callers may provide different absolute and relative tolerances to `close`.

## Structured answers

- Scalars compare numerical values, not substrings or keywords.
- Vectors parse comma-separated or whitespace-separated components and require the expected length.
- Matrices use semicolon or newline row separators and validate row/column counts and every entry.
- Systems in the current generated bank require the unique solution vector in `(x,y)` order.
- Generated eigen prompts expect `lambda;vx,vy;lambda;vx,vy`. Each pair must contain the required eigenvalue, have the requested dimension, satisfy `Av = lambda v` within residual tolerance, and have unit vector norm within tolerance. A missing pair or a zero/non-unit vector is rejected.
- Daily vector challenge evaluates the numeric dot product and angle interpretation as separate components.
- Conceptual free text beyond that explicit daily rubric is not auto-graded.

## Implemented algorithms and limits

The engine includes vector arithmetic; matrix transpose and multiplication; determinant, inverse, rank, and a unique square-system solver; symmetric 2×2 eigendecomposition; Gram–Schmidt; full-column-rank least squares; sample covariance/correlation; 2-variable PCA; 2×2 SVD; allele/genotype frequencies; Hardy–Weinberg expected frequencies; sex-ratio effective population size; and a simple Wright–Fisher-style drift sampler using an injectable random source.

PCA and SVD are small-matrix demonstrations, not tools for real genomic datasets. The drift simulation is a simplified neutral sampling model and does not include selection, mutation, migration, linkage, or empirical parameter fitting. Never interpret simulated outputs as observations or causal evidence.

## Verification

Run:

```text
node verify.js
node tests/mathematical-tests.js
node tests/data-validation-tests.js
```

The tests include hand-computed examples and controlled synthetic data. `verify.js` runs the correct answer for every generated problem through the production validator. The DOM-stub application test covers exam submission, journal CRUD, and timer controls; it does not replace visual or accessibility testing in a browser.
