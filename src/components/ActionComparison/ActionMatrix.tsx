import React from 'react';
import { useGrid } from '../../context/GridContext';
import { WeightSliders } from './WeightSliders';
import {
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';

export const ActionMatrix: React.FC = () => {
  const {
    candidates,
    winningActionId,
    selectedActionId,
    selectCandidate,
    applyAction,
    appliedActionState,
    explanation,
    gridState,
  } = useGrid();

  const activeViolation = gridState.activeViolations[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase text-ctrl-accent tracking-widest">
                DECISION OPTIMIZATION ENGINE
              </span>
              <span className="text-xs font-mono text-ctrl-textTertiary">
                • 5 Parallel Candidate Solvers
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
              Action Comparison & Dispatch Evaluation
            </h1>
            <p className="text-xs text-ctrl-textSecondary mt-1 max-w-3xl font-sans">
              Parallel AC power-flow evaluation across statutory grid safety, renewable preservation, battery asset health, and breaker switching costs.
            </p>
          </div>

          {activeViolation && (
            <div className="bg-ctrl-tintRose border border-ctrl-tintRoseBorder p-3 rounded-card flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-btn bg-white flex items-center justify-center text-ctrl-tintRoseText shadow-sm">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-ctrl-tintRoseText uppercase font-bold">TARGET INCIDENT</div>
                <div className="text-sm font-mono font-bold text-ctrl-textPrimary">{activeViolation.assetName}</div>
                <div className="text-[11px] font-mono text-ctrl-warning">
                  {activeViolation.currentValue.toFixed(3)} pu (Limit: {activeViolation.limitValue.toFixed(3)})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multi-Objective Weight Adjustment Matrix */}
      <WeightSliders />

      {/* Action Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {candidates.map((cand, idx) => {
          const isWinner = cand.id === winningActionId;
          const isSelected = cand.id === selectedActionId;
          const isApplied = appliedActionState && isSelected;

          return (
            <div
              key={cand.id}
              onClick={() => selectCandidate(cand.id)}
              className={`bg-ctrl-surface rounded-card p-4 border transition-all duration-150 cursor-pointer flex flex-col justify-between relative shadow-card ${
                isWinner
                  ? 'border-l-4 border-l-ctrl-accent border-ctrl-accentBorder bg-ctrl-tintGreen'
                  : isSelected
                  ? 'border-l-4 border-l-ctrl-textSecondary border-ctrl-border bg-ctrl-elevated'
                  : 'border-ctrl-border hover:border-ctrl-accentBorder'
              }`}
            >
              {/* Recommended Badge (Styled after Nutri-score green pill) */}
              {isWinner && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-btn bg-ctrl-accent text-white text-[9px] font-mono font-bold uppercase shadow-sm">
                  RECOMMENDED
                </div>
              )}

              <div>
                <div className="mb-2">
                  <span className="text-[10px] font-mono text-ctrl-textTertiary uppercase">
                    STRATEGY {idx + 1}
                  </span>
                  <h4 className="font-mono font-bold text-sm text-ctrl-textPrimary leading-snug mt-0.5">
                    {cand.name}
                  </h4>
                </div>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className={`text-xl font-mono font-bold ${isWinner ? 'text-ctrl-tintGreenText' : 'text-ctrl-textPrimary'}`}>
                    {cand.scores.totalWeighted}
                  </span>
                  <span className="text-[10px] font-mono text-ctrl-textTertiary uppercase">/ 100 PTS</span>
                </div>

                <p className="text-[11px] text-ctrl-textSecondary mb-3 font-sans line-clamp-2">
                  {cand.description}
                </p>

                {/* Score Breakdown Box */}
                <div className="space-y-1.5 mb-3 bg-white p-2.5 rounded-btn border border-ctrl-border text-[11px] font-mono shadow-sm">
                  <div className="flex justify-between text-[10px] text-ctrl-textTertiary mb-1">
                    <span>METRICS</span>
                    <span className="text-ctrl-textPrimary font-semibold">VALUE</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ctrl-textTertiary">Voltage:</span>
                    <span className={`font-semibold ${cand.voltageAfter <= 1.050 ? 'text-ctrl-accent' : 'text-ctrl-critical'}`}>
                      {cand.voltageBefore.toFixed(3)} → {cand.voltageAfter.toFixed(3)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ctrl-textTertiary">Renewables:</span>
                    <span className="font-semibold text-ctrl-textPrimary">
                      {cand.renewablePreservedPct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ctrl-textTertiary">Battery Wear:</span>
                    <span className="text-ctrl-textSecondary">
                      {cand.batteryWear}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-ctrl-textTertiary">Switching:</span>
                    <span className="text-ctrl-textSecondary">
                      {cand.switchingOperations} ops
                    </span>
                  </div>
                </div>

                {/* Feasibility Flag */}
                <div className="mb-3">
                  {cand.isFeasible ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-ctrl-accent font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>AC Power-Flow Feasible</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-ctrl-critical font-medium">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      <span>Infeasible</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <button
                disabled={!cand.isFeasible}
                onClick={(e) => {
                  e.stopPropagation();
                  applyAction(cand.id);
                }}
                className={`w-full py-2 px-3 rounded-btn text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 ${
                  !cand.isFeasible
                    ? 'bg-ctrl-elevated text-ctrl-textTertiary cursor-not-allowed border border-ctrl-border'
                    : isApplied
                    ? 'bg-ctrl-accent text-white font-semibold shadow-sm'
                    : isWinner
                    ? 'bg-ctrl-accent hover:bg-ctrl-accentHover text-white font-semibold shadow-sm'
                    : 'bg-white hover:bg-ctrl-elevated text-ctrl-textPrimary border border-ctrl-border'
                }`}
              >
                {isApplied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Applied & Validated</span>
                  </>
                ) : (
                  <>
                    <span>{isWinner ? 'Apply Recommended' : 'Apply Action'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Decision Rationale & Engineering Explainability */}
      {explanation && (
        <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-ctrl-border">
            <div>
              <span className="text-[10px] font-mono text-ctrl-accent uppercase font-semibold tracking-wider">
                DECISION LOGIC & RATIONALE
              </span>
              <h3 className="text-base font-mono font-bold text-ctrl-textPrimary mt-0.5">
                {explanation.headline}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-ctrl-textTertiary">CONFIDENCE:</span>
              <span className="px-2 py-0.5 rounded-btn bg-ctrl-tintGreen text-ctrl-tintGreenText border border-ctrl-tintGreenBorder text-xs font-mono font-semibold">
                HIGH (AC BFS Physics Validated)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Why Bullets */}
            <div className="lg:col-span-2 space-y-2.5">
              <h4 className="text-xs font-mono font-semibold text-ctrl-textSecondary uppercase tracking-wider">
                ENGINEERING RATIONALE
              </h4>
              <div className="space-y-2">
                {explanation.whyBullets.map((bullet, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-ctrl-textPrimary font-sans">
                    <span className="text-ctrl-accent font-bold shrink-0 mt-0.5">•</span>
                    <span className="leading-relaxed">{bullet}</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-card bg-ctrl-elevated border border-ctrl-border mt-3 text-xs text-ctrl-textSecondary font-sans">
                <strong className="text-ctrl-textPrimary font-mono">Trade-off Assessment: </strong>
                {explanation.tradeOffSummary}
              </div>
            </div>

            {/* Expected Result & Constraint Headroom */}
            <div className="space-y-3 bg-ctrl-elevated p-4 rounded-card border border-ctrl-border">
              <h4 className="text-xs font-mono font-semibold text-ctrl-textSecondary uppercase tracking-wider">
                POST-DISPATCH RESULTS
              </h4>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-ctrl-textTertiary">Voltage Profile:</span>
                  <span className="text-ctrl-accent font-bold">{explanation.expectedResult.voltageChange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textTertiary">Renewable Preserved:</span>
                  <span className="text-ctrl-textPrimary font-semibold">{explanation.expectedResult.renewableUtilization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textTertiary">Battery Wear:</span>
                  <span className="text-ctrl-textSecondary">{explanation.expectedResult.batteryImpact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textTertiary">Breaker Operations:</span>
                  <span className="text-ctrl-textSecondary">{explanation.expectedResult.switchingOps} ops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ctrl-textTertiary">Thermal Relief:</span>
                  <span className="text-ctrl-textSecondary">{explanation.expectedResult.thermalRelief}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-ctrl-border">
                <div className="text-[10px] font-mono text-ctrl-textTertiary uppercase mb-2">
                  HEADROOM TO CONSTRAINT LIMITS
                </div>
                <div className="space-y-1.5">
                  {explanation.constraintHeadroom.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-ctrl-textSecondary truncate max-w-[140px]">{h.name}</span>
                      <span className="text-ctrl-accent font-medium">{h.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
