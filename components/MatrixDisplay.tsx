import React from 'react';
import { Fraction } from '../utils/fraction';
import { Matrix } from '../utils/solver';

interface MatrixDisplayProps {
  matrix: Matrix;
  highlightRow?: number;
  label?: string;
}

export const MatrixDisplay: React.FC<MatrixDisplayProps> = ({ matrix, highlightRow, label }) => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const n = rows; // Square matrix size

  return (
    <div className="flex flex-col items-center my-4 overflow-x-auto">
        {label && <div className="mb-2 text-sm font-semibold text-slate-600">{label}</div>}
        <div className="relative flex items-center">
        {/* Left Bracket */}
        <div className="w-3 border-l-2 border-t-2 border-b-2 border-slate-800 absolute -left-1 top-0 bottom-0 rounded-l-md"></div>
        
        <div className="grid gap-x-4 gap-y-2 p-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(40px, auto))` }}>
            {matrix.map((row, i) => (
                <React.Fragment key={i}>
                    {row.map((val, j) => {
                        const isAugmentedLine = j === n; // The column index of b
                        return (
                            <div 
                                key={`${i}-${j}`} 
                                className={`
                                    relative flex justify-center items-center font-mono text-lg
                                    ${highlightRow === i ? 'text-blue-600 font-bold bg-blue-50 rounded px-1' : 'text-slate-800'}
                                    ${isAugmentedLine ? 'pl-4 border-l-2 border-slate-300' : ''}
                                `}
                            >
                                {val.toString()}
                            </div>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>

        {/* Right Bracket */}
        <div className="w-3 border-r-2 border-t-2 border-b-2 border-slate-800 absolute -right-1 top-0 bottom-0 rounded-r-md"></div>
        </div>
    </div>
  );
};