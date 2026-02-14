import { Fraction } from './fraction';

export type Matrix = Fraction[][];

export interface SolverStep {
  description: string;
  matrix: Matrix;
  highlightRow?: number;
  highlightCol?: number;
}

export interface SolverResult {
  steps: SolverStep[];
  solutionType: 'unique' | 'infinite' | 'none';
  solutionText: string[];
  rankA: number;
  rankAug: number;
  finalMatrix: Matrix;
}

// Clone matrix deep copy
const cloneMatrix = (m: Matrix): Matrix => m.map(row => row.map(val => new Fraction(val.numerator, val.denominator)));

export const solveSystem = (
  inputA: Matrix,
  inputB: Fraction[],
  useRREF: boolean
): SolverResult => {
  const n = inputA.length;
  // Construct augmented matrix
  let M: Matrix = inputA.map((row, i) => [...row, inputB[i]]);
  const steps: SolverStep[] = [];

  steps.push({
    description: "Initial Augmented Matrix [A|b]",
    matrix: cloneMatrix(M),
  });

  let pivotRow = 0;
  
  // --- Forward Elimination ---
  for (let col = 0; col < n && pivotRow < n; col++) {
    // 1. Find pivot
    let maxRow = pivotRow;
    // We look for non-zero, ideally simple pivot. 
    // Standard partial pivoting searches for max absolute value, but for exact arithmetic, just non-zero is fine.
    // However, for consistency and "human-like" solving, picking the first non-zero is standard, 
    // or picking 1 if available to avoid fractions.
    
    let foundPivot = false;
    for(let i = pivotRow; i < n; i++) {
        if (!M[i][col].isZero()) {
            maxRow = i;
            foundPivot = true;
            break;
        }
    }

    if (!foundPivot) {
      continue; // Column is all zeros, move to next col
    }

    // Swap if necessary
    if (pivotRow !== maxRow) {
      [M[pivotRow], M[maxRow]] = [M[maxRow], M[pivotRow]];
      steps.push({
        description: `Swap R${pivotRow + 1} ↔ R${maxRow + 1}`,
        matrix: cloneMatrix(M),
        highlightRow: pivotRow
      });
    }

    // Eliminate below
    const pivotVal = M[pivotRow][col];
    for (let i = pivotRow + 1; i < n; i++) {
      const targetVal = M[i][col];
      if (!targetVal.isZero()) {
        const factor = targetVal.div(pivotVal);
        const rowOp = [];
        for (let j = 0; j <= n; j++) {
          const valToSub = M[pivotRow][j].mul(factor);
          M[i][j] = M[i][j].sub(valToSub);
        }
        steps.push({
            description: `R${i + 1} → R${i + 1} - (${factor.toString()})R${pivotRow + 1}`,
            matrix: cloneMatrix(M),
            highlightRow: i
        });
      }
    }
    pivotRow++;
  }

  // --- RREF Phase (Optional but helpful for infinite solutions) ---
  if (useRREF) {
      steps.push({ description: "Beginning reduction to RREF...", matrix: cloneMatrix(M) });
      
      // We iterate backwards from the last pivot
      for (let i = n - 1; i >= 0; i--) {
          // Find pivot column for this row
          let pivotCol = -1;
          for(let j=0; j<n; j++) {
              if(!M[i][j].isZero()) {
                  pivotCol = j;
                  break;
              }
          }
          
          if(pivotCol === -1) continue; // All zero row

          // Normalize pivot to 1
          const pivotVal = M[i][pivotCol];
          if(!pivotVal.isOne()) {
              for(let j=0; j<=n; j++) {
                  M[i][j] = M[i][j].div(pivotVal);
              }
              steps.push({
                  description: `R${i + 1} → (1/${pivotVal.toString()})R${i + 1} (Normalize pivot)`,
                  matrix: cloneMatrix(M),
                  highlightRow: i
              });
          }

          // Eliminate above
          for(let k = i - 1; k >= 0; k--) {
              const factor = M[k][pivotCol];
              if(!factor.isZero()) {
                  for(let j=0; j<=n; j++) {
                      const subVal = M[i][j].mul(factor);
                      M[k][j] = M[k][j].sub(subVal);
                  }
                  steps.push({
                      description: `R${k + 1} → R${k + 1} - (${factor.toString()})R${i + 1}`,
                      matrix: cloneMatrix(M),
                      highlightRow: k
                  });
              }
          }
      }
  }

  // --- Rank Calculation & Classification ---
  let rankA = 0;
  let rankAug = 0;

  for (let i = 0; i < n; i++) {
    let rowIsZeroA = true;
    let rowIsZeroAug = true;
    
    // Check A part
    for (let j = 0; j < n; j++) {
      if (!M[i][j].isZero()) {
        rowIsZeroA = false;
        break;
      }
    }
    
    // Check Augmented part (including b)
    if (!rowIsZeroA || !M[i][n].isZero()) {
        rowIsZeroAug = false;
    }

    if (!rowIsZeroA) rankA++;
    if (!rowIsZeroAug) rankAug++;
  }

  let solutionType: 'unique' | 'infinite' | 'none' = 'unique';
  if (rankA < rankAug) {
    solutionType = 'none';
  } else if (rankA < n) {
    solutionType = 'infinite';
  }

  // --- Solution Extraction ---
  const solutionText: string[] = [];

  if (solutionType === 'none') {
      solutionText.push("System is inconsistent (0 ≠ c in a row).");
  } else if (solutionType === 'unique') {
      // Back substitution for unique solution
      // Even if we did RREF, this logic works. 
      // If RREF was OFF, we do full back sub. If ON, it's trivial.
      
      const x = new Array(n).fill(null);
      for (let i = n - 1; i >= 0; i--) {
          let sum = Fraction.zero();
          for (let j = i + 1; j < n; j++) {
              sum = sum.add(M[i][j].mul(x[j]));
          }
          // x[i] = (b[i] - sum) / A[i][i]
          const rhs = M[i][n].sub(sum);
          x[i] = rhs.div(M[i][i]);
          
          if (!useRREF) {
               // Generate step description for back sub if not in RREF
               let eq = `x_${i+1} = (${M[i][n].toString()}`;
               for(let j=i+1; j<n; j++) {
                   const coef = M[i][j];
                   if(!coef.isZero()) {
                        eq += ` - (${coef.toString()})(${x[j].toString()})`;
                   }
               }
               eq += `) / ${M[i][i].toString()}`;
               solutionText.unshift(`${eq} = ${x[i].toString()}`); // Prepend to show reverse order logically or append? Usually x1..xn is nice.
               // Let's just push formatted result for now
          }
      }
      
      // Clean final output
      const finalText = x.map((val, idx) => `x_${idx+1} = ${val.toString()}`);
      solutionText.length = 0; // Clear intermediate backsub steps for the final Summary
      solutionText.push(...finalText);

  } else {
      // Infinite solutions - Parametric form
      // Identify pivots
      const pivotCols = new Set<number>();
      for(let i=0; i<n; i++) {
          for(let j=0; j<n; j++) {
              if(!M[i][j].isZero()) {
                  pivotCols.add(j);
                  break; // First non-zero is pivot
              }
          }
      }
      
      const freeVars = [];
      const variableNames = ['x_1', 'x_2', 'x_3', 'x_4'];
      const parameters = ['t', 's', 'r', 'q'];
      let paramIndex = 0;

      // Assign parameters to free variables
      const assignment: (string | Fraction)[] = new Array(n).fill(null);
      
      for(let j=0; j<n; j++) {
          if(!pivotCols.has(j)) {
              const param = parameters[paramIndex++] || `p${paramIndex}`;
              assignment[j] = param;
              solutionText.push(`${variableNames[j]} = ${param} (free)`);
          }
      }
      
      // Express pivot variables
      // Iterate rows from bottom up
      for(let i = n - 1; i >= 0; i--) {
          let pivotCol = -1;
           for(let j=0; j<n; j++) {
              if(!M[i][j].isZero()) {
                  pivotCol = j;
                  break;
              }
          }
          
          if (pivotCol === -1) continue; // Zero row

          // Row equation: coeff*x_pivot + sum(other_coeffs * x_other) = constant
          // x_pivot = (constant - sum) / coeff
          
          const pivotVal = M[i][pivotCol];
          const constant = M[i][n];
          
          let expr = "";
          
          // If RREF, pivotVal is 1 usually.
          // We build a string expression for the parametric solution
          
          // term: constant/pivot
          const constTerm = constant.div(pivotVal);
          if (!constTerm.isZero()) expr += constTerm.toString();

          for(let j = pivotCol + 1; j < n; j++) {
              const coef = M[i][j];
              if(!coef.isZero()) {
                  // - (coef/pivot) * val
                  const factor = coef.div(pivotVal);
                  const val = assignment[j]; // This is either a param string or a Fraction (if solved already?) 
                                             // Actually in infinite case, subsequent pivots might depend on parameters.
                                             // For simplicity, we assume RREF-like structure where pivots only depend on free vars.
                  
                  // In RREF, pivot cols are cleared above/below, so x_pivot depends ONLY on non-pivot (free) columns.
                  // If not RREF, it's messy. We strongly suggest RREF for infinite solutions.
                  // But we will try to format: " - (coef)x_j"
                  
                  const sign = factor.numerator > 0 ? " - " : " + ";
                  const absFactor = factor.abs();
                  const factorStr = absFactor.isOne() ? "" : absFactor.toString();
                  
                  expr += `${sign}${factorStr}${val}`;
              }
          }
          
          if(expr === "") expr = "0";
          // Fix leading " + " if constant was zero
          if(expr.startsWith(" + ")) expr = expr.substring(3);
          
          assignment[pivotCol] = expr; // Store string representation
          solutionText.push(`${variableNames[pivotCol]} = ${expr}`);
      }
      // Reorder to x1...xn
      solutionText.sort((a,b) => {
          const idxA = parseInt(a.substring(2,3));
          const idxB = parseInt(b.substring(2,3));
          return idxA - idxB;
      });
  }

  return {
    steps,
    solutionType,
    solutionText,
    rankA,
    rankAug,
    finalMatrix: M
  };
};