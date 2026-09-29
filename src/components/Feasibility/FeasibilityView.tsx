import React from 'react';
import { useGrid } from '../../context/GridContext';
import { AlertOctagon, ShieldAlert, ShieldCheck } from 'lucide-react';

export const FeasibilityView: React.FC = () => {
  const { selectScenario, feasibilityReport, activeScenarioId } = useGrid();

  const isExtremeActive = activeScenarioId === 'extreme';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] tracking-wider">
                FEASIBILITY BOUNDARY ENGINE
              </span>
              <span className="text-xs font-mono text-ctrl-textTertiary">
                • Physical Infeasibility & Constraint Saturation
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
              Feasibility Limits & Unresolvable Grid States
            </h1>
            <p className="text-xs text-ctrl-textSecondary mt-1 max-w-3xl font-sans">
              When compounding physical saturation constraints prevent autonomous resolution, GridMorph provides transparent diagnostic attribution and triggers Emergency Operating Procedures (EOP).
            </p>
          </div>

          <button
            onClick={() => selectScenario('extreme')}
            className={`px-4 py-2.5 rounded-btn text-xs font-mono font-bold tracking-wider uppercase transition-colors shrink-0 flex items-center gap-2 shadow-subtle ${
              isExtremeActive
                ? 'bg-ctrl-critical text-white'
                : 'bg-ctrl-rose text-ctrl-critical border border-[#F5D0D9] hover:bg-[#FADCE3]'
            }`}
          >
            <AlertOctagon className="w-4 h-4" />
            <span>{isExtremeActive ? 'Extreme Scenario Active' : 'Load Infeasible Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Main Diagnostic Dashboard */}
      {feasibilityReport ? (
        <div className="space-y-5">
          {/* Diagnostic Summary */}
          <div className="p-5 rounded-panel bg-ctrl-rose border-l-4 border-l-ctrl-critical border border-[#F5D0D9] shadow-subtle">
            <h3 className="font-sans font-bold text-sm text-ctrl-critical">
              {feasibilityReport.headline}
            </h3>
            <p className="text-xs text-ctrl-textPrimary mt-1.5 leading-relaxed font-sans">
              {feasibilityReport.summary}
            </p>
          </div>

          {/* Physical Constraint Analysis */}
          <div>
            <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase tracking-wider mb-3">
              PHYSICAL CONSTRAINT SATURATION ATTRIBUTION
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {feasibilityReport.bottlenecks.map((bn, i) => (
                <div
                  key={i}
                  className="bg-ctrl-surface p-4 rounded-panel border border-[#F5D0D9] shadow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-sans font-bold text-sm text-ctrl-textPrimary">
                        {bn.component}
                      </span>
                      <span className="px-2 py-0.5 rounded-btn bg-ctrl-rose text-ctrl-critical text-[10px] font-mono font-bold uppercase border border-[#F5D0D9]">
                        {bn.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-ctrl-elevated p-2.5 rounded-card border border-ctrl-border text-[11px] font-mono mb-3">
                      <div>
                        <span className="text-ctrl-textTertiary">State:</span>{' '}
                        <strong className="text-ctrl-critical font-bold">{bn.currentVal}</strong>
                      </div>
                      <div>
                        <span className="text-ctrl-textTertiary">Limit:</span>{' '}
                        <strong className="text-ctrl-textSecondary font-semibold">{bn.limitVal}</strong>
                      </div>
                    </div>

                    <p className="text-xs text-ctrl-textSecondary leading-relaxed font-sans">
                      {bn.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Remaining Violation & Operator Escalation Action */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="bg-ctrl-surface p-5 rounded-panel border border-[#F5D0D9] shadow-subtle space-y-3">
              <h4 className="font-mono font-bold text-xs text-ctrl-critical uppercase tracking-wider">
                UNRESOLVABLE RESIDUAL
              </h4>

              <div className="bg-ctrl-rose p-3.5 rounded-card border border-[#F5D0D9] space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-ctrl-textSecondary">Asset:</span>
                  <span className="text-ctrl-textPrimary font-bold">{feasibilityReport.remainingViolation.bus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textSecondary">Actual:</span>
                  <span className="text-ctrl-critical font-extrabold">{feasibilityReport.remainingViolation.actualVoltage.toFixed(3)} pu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textSecondary">Statutory Limit:</span>
                  <span className="text-ctrl-textPrimary font-semibold">{feasibilityReport.remainingViolation.limitVoltage.toFixed(3)} pu</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#F5D0D9]">
                  <span className="text-ctrl-textSecondary font-semibold">Residual Delta:</span>
                  <span className="text-ctrl-critical font-extrabold">+{feasibilityReport.remainingViolation.unresolvedDelta.toFixed(3)} pu</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-ctrl-surface p-5 rounded-panel border border-ctrl-border shadow-subtle flex flex-col justify-between">
              <div>
                <h4 className="font-mono font-bold text-xs text-[#9E5D10] uppercase tracking-wider mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#C97B1A]" />
                  <span>EMERGENCY OPERATING PROCEDURE (EOP)</span>
                </h4>
                <p className="text-xs text-ctrl-textPrimary leading-relaxed font-sans mb-3 font-medium">
                  {feasibilityReport.recommendedOperatorAction}
                </p>
                <div className="p-3 bg-ctrl-sand rounded-card border border-[#F2E5C8] text-xs font-mono text-[#78540E] space-y-1">
                  <div>• Authorization: <strong className="text-[#523A0B]">Control Room Supervisor (Level 3)</strong></div>
                  <div>• Action: <strong className="text-[#523A0B]">Transformer OLTC Tap -1 Step & Manual PV Shedding</strong></div>
                  <div>• Response Target: <strong className="text-[#523A0B]">&lt; 5 Minutes</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-ctrl-border mt-3 flex items-center justify-end">
                <span className="text-[11px] font-mono text-ctrl-textTertiary">
                  GRID CODE PROTOCOL LOGGED • AUDIT READY
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-ctrl-surface p-8 rounded-panel border border-ctrl-border shadow-subtle text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-ctrl-mint border border-[#BCE7D3] flex items-center justify-center text-[#237A5C] mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-sans font-bold text-base text-ctrl-textPrimary">
            CURRENT SCENARIO IS AUTONOMOUSLY FEASIBLE
          </h3>
          <p className="text-xs text-ctrl-textSecondary max-w-lg mx-auto font-sans leading-relaxed">
            Sufficient reactive power and battery headroom exist to clear active violations. To demonstrate GridMorph's honest infeasibility detection, load the extreme constrained scenario below.
          </p>
          <button
            onClick={() => selectScenario('extreme')}
            className="px-4 py-2 bg-ctrl-elevated hover:bg-ctrl-border text-ctrl-textPrimary text-xs font-mono font-bold rounded-btn border border-ctrl-border transition-colors shadow-subtle"
          >
            Demonstrate Infeasible Boundary Case
          </button>
        </div>
      )}
    </div>
  );
};

