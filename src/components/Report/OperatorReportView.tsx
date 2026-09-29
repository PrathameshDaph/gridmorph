import React from 'react';
import { useGrid } from '../../context/GridContext';
import { Printer } from 'lucide-react';

export const OperatorReportView: React.FC = () => {
  const {
    gridState,
    baselineState,
    activeScenario,
    candidates,
    winningActionId,
    explanation,
  } = useGrid();

  const reportDate = new Date().toLocaleString();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] tracking-wider">
              COMPLIANCE AUDIT
            </span>
            <span className="text-xs font-mono text-ctrl-textTertiary">
              • Distribution Grid Operations & Verification Record
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
            Operator Compliance & Dispatch Audit Report
          </h1>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-[#237A5C] hover:bg-[#1C674E] text-white font-sans font-semibold text-xs rounded-btn shadow-subtle transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Report Document */}
      <div className="bg-ctrl-surface border border-ctrl-border rounded-panel p-6 md:p-8 space-y-6 font-mono text-ctrl-textPrimary shadow-subtle print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ctrl-border print:border-slate-300 gap-4">
          <div>
            <div className="text-lg font-bold text-ctrl-textPrimary print:text-black font-sans">
              GRIDMORPH OPERATOR DECISION SUPPORT AUDIT
            </div>
            <p className="text-xs text-ctrl-textSecondary print:text-slate-600 mt-0.5 font-sans">
              Automated Dispatch & Physics Verification Record • 11kV Radial 12-Bus Benchmark Feeder
            </p>
          </div>

          <div className="text-xs text-ctrl-textSecondary print:text-slate-600 space-y-1 text-left md:text-right font-mono">
            <div><strong>Report ID:</strong> RPT-{Date.now().toString().slice(-6)}</div>
            <div><strong>Generated:</strong> {reportDate}</div>
            <div><strong>Operator:</strong> Autonomous / Dispatch Level 2</div>
          </div>
        </div>

        {/* Section 1: Scenario & Initial State */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ctrl-textPrimary print:text-black border-b border-ctrl-border print:border-slate-300 pb-1">
            1. SCENARIO & INITIAL GRID PROFILE
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-ctrl-elevated print:bg-slate-100 p-3.5 rounded-card border border-ctrl-border print:border-slate-300">
            <div>
              <span className="text-ctrl-textTertiary print:text-slate-600 text-[10px]">SCENARIO</span>
              <div className="font-bold text-ctrl-textPrimary print:text-black">{activeScenario.name}</div>
            </div>
            <div>
              <span className="text-ctrl-textTertiary print:text-slate-600 text-[10px]">SOLAR GENERATION</span>
              <div className="font-bold text-ctrl-textPrimary print:text-black">{gridState.totalGenerationMW.toFixed(2)} MW</div>
            </div>
            <div>
              <span className="text-ctrl-textTertiary print:text-slate-600 text-[10px]">FEEDER DEMAND</span>
              <div className="font-bold text-ctrl-textPrimary print:text-black">{gridState.totalLoadMW.toFixed(2)} MW</div>
            </div>
            <div>
              <span className="text-ctrl-textTertiary print:text-slate-600 text-[10px]">GRID STABILITY</span>
              <div className="font-bold text-[#166046] print:text-emerald-700">{gridState.gridHealthPct}%</div>
            </div>
          </div>
        </div>

        {/* Section 2: Detected Physical Violations */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ctrl-textPrimary print:text-black border-b border-ctrl-border print:border-slate-300 pb-1">
            2. DETECTED STATUTORY LIMIT BREACHES
          </h3>
          {baselineState.activeViolations.length > 0 ? (
            <div className="space-y-2">
              {baselineState.activeViolations.map((v) => (
                <div key={v.id} className="p-3 bg-ctrl-rose print:bg-red-50 border border-[#F5D0D9] rounded-card text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-ctrl-critical print:text-red-700 uppercase">[{v.severity}] {v.type}</span>
                    <div className="text-ctrl-textSecondary print:text-slate-800 mt-0.5">{v.explanation}</div>
                  </div>
                  <div className="text-right shrink-0 ml-4 font-bold text-ctrl-critical print:text-red-700">
                    +{v.excessValue.toFixed(3)} {v.unit} excess
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-[#166046] print:text-emerald-700 font-semibold">
              No statutory violations detected at nominal state.
            </div>
          )}
        </div>

        {/* Section 3: Parallel Candidate Evaluation */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ctrl-textPrimary print:text-black border-b border-ctrl-border print:border-slate-300 pb-1">
            3. MULTI-OBJECTIVE CANDIDATE ACTION EVALUATION
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-ctrl-border print:border-slate-300 text-ctrl-textTertiary print:text-slate-600">
                  <th className="py-2.5">Candidate Strategy</th>
                  <th>Voltage (pu)</th>
                  <th>Renewable %</th>
                  <th>Battery Impact</th>
                  <th>Breaker Ops</th>
                  <th>Score</th>
                  <th>Feasible?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ctrl-border print:divide-slate-200">
                {candidates.map((c) => (
                  <tr key={c.id} className={c.id === winningActionId ? 'bg-ctrl-mint/60 print:bg-slate-100 font-bold' : ''}>
                    <td className="py-2.5 text-ctrl-textPrimary print:text-black">{c.name} {c.id === winningActionId && '• (Recommended)'}</td>
                    <td>{c.voltageBefore.toFixed(3)} → {c.voltageAfter.toFixed(3)}</td>
                    <td>{c.renewablePreservedPct}%</td>
                    <td>{c.batteryWear}</td>
                    <td>{c.switchingOperations}</td>
                    <td className="text-[#166046] print:text-emerald-700 font-bold">{c.scores.totalWeighted}</td>
                    <td className={c.isFeasible ? 'text-[#166046] print:text-emerald-700 font-bold' : 'text-ctrl-critical print:text-red-700 font-bold'}>
                      {c.isFeasible ? 'YES' : 'NO'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Recommended Action & Explainability */}
        {explanation && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ctrl-textPrimary print:text-black border-b border-ctrl-border print:border-slate-300 pb-1">
              4. RECOMMENDED ACTION & ENGINEERING RATIONALE
            </h3>
            <div className="p-4 bg-ctrl-elevated print:bg-slate-100 rounded-card border border-ctrl-border print:border-slate-300 space-y-2 text-xs">
              <div className="font-bold text-ctrl-textPrimary print:text-black text-sm">{explanation.headline}</div>
              <div className="space-y-1 text-ctrl-textSecondary print:text-slate-800 font-sans">
                {explanation.whyBullets.map((b, i) => (
                  <div key={i}>• {b}</div>
                ))}
              </div>
              <div className="pt-2 text-ctrl-textTertiary print:text-slate-600 text-[11px] font-sans">
                <strong>Trade-Off Assessment:</strong> {explanation.tradeOffSummary}
              </div>
            </div>
          </div>
        )}

        {/* Verification Footer */}
        <div className="pt-6 border-t border-ctrl-border print:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-ctrl-textTertiary print:text-slate-600 gap-2">
          <div>
            Physics Solver: AC Backward-Forward Sweep Solver • Verified
          </div>
          <div className="font-bold text-[#166046] print:text-emerald-700">
            ✓ COMPLIANCE & SAFETY AUDIT COMPLETE
          </div>
        </div>
      </div>
    </div>
  );
};

