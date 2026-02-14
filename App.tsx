import React, { useState } from 'react';
import { Fraction } from './utils/fraction';
import { solveSystem, Matrix, SolverResult } from './utils/solver';
import { MatrixDisplay } from './components/MatrixDisplay';
import { Play, RotateCcw, Calculator, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [size, setSize] = useState<number>(3);
  // Matrix A state: mapped by row, col
  const [matrixA, setMatrixA] = useState<string[][]>(Array(4).fill(Array(4).fill("")));
  // Vector B state
  const [vectorB, setVectorB] = useState<string[]>(Array(4).fill(""));
  
  const [result, setResult] = useState<SolverResult | null>(null);
  const [useRREF, setUseRREF] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults on load or resize
  React.useEffect(() => {
    resetMatrix(size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetMatrix = (n: number) => {
    const newA = Array(n).fill(0).map(() => Array(n).fill("0"));
    const newB = Array(n).fill("0");
    // Identity matrix default for convenience
    for(let i=0; i<n; i++) newA[i][i] = "1";
    
    setMatrixA(newA);
    setVectorB(newB);
    setResult(null);
    setError(null);
  };

  const handleResize = (n: number) => {
    setSize(n);
    resetMatrix(n);
  };

  const updateMatrixA = (row: number, col: number, val: string) => {
    const newA = matrixA.map(r => [...r]);
    newA[row][col] = val;
    setMatrixA(newA);
  };

  const updateVectorB = (row: number, val: string) => {
    const newB = [...vectorB];
    newB[row] = val;
    setVectorB(newB);
  };

  const handleSolve = () => {
    setError(null);
    try {
      // Parse inputs
      const parsedA: Matrix = matrixA.map(row => 
        row.map(val => Fraction.fromString(val))
      );
      const parsedB: Fraction[] = vectorB.map(val => Fraction.fromString(val));

      const res = solveSystem(parsedA, parsedB, useRREF);
      setResult(res);
    } catch (e) {
      setError("Invalid input. Please check your numbers.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center font-sans">
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: Controls & Input */}
        <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-blue-600" />
                        Linear Solver
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gaussian Elimination & RREF</p>
                </header>

                {/* Size Selector */}
                <div className="mb-6">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2 block">System Size (N)</label>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {[1, 2, 3, 4].map(n => (
                            <button
                                key={n}
                                onClick={() => handleResize(n)}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                                    size === n 
                                    ? 'bg-white text-blue-600 shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {n}×{n}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Matrix Input */}
                <div className="mb-6 overflow-x-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Matrix A</span>
                        <span className="flex-1"></span>
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Vector b</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* A */}
                        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
                            {matrixA.map((row, i) => (
                                row.map((val, j) => (
                                    <input
                                        key={`a-${i}-${j}`}
                                        type="text"
                                        value={val}
                                        onChange={(e) => updateMatrixA(i, j, e.target.value)}
                                        className="w-12 h-10 md:w-14 md:h-12 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-slate-700 bg-slate-50"
                                        placeholder="0"
                                    />
                                ))
                            ))}
                        </div>
                        {/* Vertical Separator */}
                        <div className="w-px h-auto bg-slate-300 self-stretch"></div>
                        {/* b */}
                        <div className="grid gap-2">
                            {vectorB.map((val, i) => (
                                <input
                                    key={`b-${i}`}
                                    type="text"
                                    value={val}
                                    onChange={(e) => updateVectorB(i, e.target.value)}
                                    className="w-12 h-10 md:w-14 md:h-12 text-center border border-blue-100 bg-blue-50/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-slate-700"
                                    placeholder="0"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Options */}
                <div className="flex items-center justify-between mb-6 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-3">
                        <Settings2 className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">RREF Mode</span>
                    </div>
                    <button 
                        onClick={() => setUseRREF(!useRREF)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${useRREF ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition transition-transform ${useRREF ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={handleSolve}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-medium transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                    >
                        <Play className="w-4 h-4 fill-current" /> Solve
                    </button>
                    <button 
                        onClick={() => resetMatrix(size)}
                        className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-3 px-4 rounded-xl font-medium transition-all"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 animate-fade-in">
                        {error}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT PANEL: Output */}
        <div className="lg:col-span-8">
            {!result ? (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                    <Calculator className="w-12 h-12 mb-4 opacity-20" />
                    <p>Enter matrix values and press Solve</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Solution Summary Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-slide-up">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Result Analysis</h2>
                        
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-600">
                                Rank(A) = <span className="font-mono font-bold text-slate-900">{result.rankA}</span>
                            </div>
                            <div className="px-3 py-1 bg-slate-100 rounded-md text-sm text-slate-600">
                                Rank([A|b]) = <span className="font-mono font-bold text-slate-900">{result.rankAug}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-md text-sm font-bold border ${
                                result.solutionType === 'unique' ? 'bg-green-50 text-green-700 border-green-200' :
                                result.solutionType === 'infinite' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-red-50 text-red-700 border-red-200'
                            }`}>
                                {result.solutionType === 'unique' && 'Unique Solution'}
                                {result.solutionType === 'infinite' && 'Infinitely Many Solutions'}
                                {result.solutionType === 'none' && 'No Solution'}
                            </div>
                        </div>

                        {/* Final Answers */}
                        {result.solutionText.length > 0 && (
                             <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                <h3 className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">Solution Set</h3>
                                <div className="space-y-1 font-mono text-lg text-slate-800">
                                    {result.solutionText.map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Step by Step Log */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 animate-slide-up" style={{animationDelay: '100ms'}}>
                        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                             Step-by-Step Procedure
                             <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{result.steps.length} Steps</span>
                        </h2>
                        
                        <div className="space-y-8 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                            {result.steps.map((step, idx) => (
                                <div key={idx} className="relative pl-10">
                                    {/* Step Number Bubble */}
                                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs z-10">
                                        {idx + 1}
                                    </div>
                                    
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                        <p className="text-sm font-medium text-blue-700 mb-3 font-mono">{step.description}</p>
                                        <div className="bg-white rounded-lg p-2 shadow-sm border border-slate-200 inline-block">
                                            <MatrixDisplay matrix={step.matrix} highlightRow={step.highlightRow} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default App;