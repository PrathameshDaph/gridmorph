import React from 'react';
import { useGrid } from '../context/GridContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const ViolationPanel: React.FC = () => {
  const { gridState, setActiveTab, setSelectedBusId } = useGrid();
  const violations = gridState.activeViolations;

  if (violations.length === 0) {
    return (
      <div className="bg-ctrl-tintGreen rounded-panel p-4 border border-ctrl-tintGreenBorder shadow-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-btn bg-white border border-ctrl-tintGreenBorder flex items-center justify-center text-ctrl-tintGreenText shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-semibold text-ctrl-tintGreenText uppercase tracking-wider">
              ALL ASSETS WITHIN STATUTORY LIMITS
            </h4>
            <p className="text-[12px] text-ctrl-textSecondary mt-0.5 font-sans">
              12 Buses: 0.950 ≤ V ≤ 1.050 pu • Line loading &lt; 85% • Zero active violations
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('forecast')}
          className="px-3 py-1.5 bg-white hover:bg-ctrl-elevated text-ctrl-tintGreenText font-semibold text-xs font-mono rounded-btn border border-ctrl-tintGreenBorder transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>Forecast Horizon</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ctrl-critical" />
          <h3 className="text-xs font-mono font-bold text-ctrl-textPrimary uppercase tracking-wider">
            ACTIVE INCIDENTS ({violations.length})
          </h3>
        </div>
        <span className="text-[11px] font-mono text-ctrl-textTertiary">
          Requires Multi-Action Evaluation
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {violations.map((viol) => {
          const isHigh = viol.severity === 'HIGH' || viol.severity === 'CRITICAL';
          return (
            <div
              key={viol.id}
              className="bg-ctrl-tintRose rounded-card p-4 border border-ctrl-tintRoseBorder flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded-btn text-[10px] font-mono font-bold uppercase ${
                        isHigh ? 'bg-white text-ctrl-tintRoseText border border-ctrl-tintRoseBorder' : 'bg-white text-ctrl-tintPeachText border border-ctrl-tintPeachBorder'
                      }`}
                    >
                      {viol.severity}
                    </span>
                    <span className="text-xs font-mono font-semibold text-ctrl-textPrimary">
                      {viol.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-ctrl-textTertiary">
                    Predicted: ~{viol.predictedTimeMinutes} min
                  </span>
                </div>

                <div className="text-xs font-mono text-ctrl-textSecondary mb-2">
                  Asset: <span className="text-ctrl-textPrimary font-semibold">{viol.assetName}</span>
                </div>

                {/* Quantitative Metric Readout */}
                <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-btn border border-ctrl-tintRoseBorder text-[11px] font-mono mb-2.5 shadow-sm">
                  <div>
                    <div className="text-[9px] text-ctrl-textTertiary uppercase">CURRENT</div>
                    <div className="font-bold text-ctrl-tintRoseText">
                      {viol.currentValue.toFixed(3)} {viol.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-ctrl-textTertiary uppercase">LIMIT</div>
                    <div className="font-semibold text-ctrl-textSecondary">
                      {viol.limitValue.toFixed(3)} {viol.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-ctrl-textTertiary uppercase">EXCESS</div>
                    <div className="font-bold text-ctrl-warning">
                      +{viol.excessValue.toFixed(3)} {viol.unit}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-ctrl-textSecondary leading-relaxed mb-3 font-sans">
                  {viol.explanation}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-ctrl-tintRoseBorder/60">
                <button
                  onClick={() => {
                    if (typeof viol.assetId === 'number') setSelectedBusId(viol.assetId);
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-ctrl-elevated text-ctrl-textSecondary hover:text-ctrl-textPrimary text-xs font-mono rounded-btn border border-ctrl-tintRoseBorder transition-colors shadow-sm"
                >
                  Locate Node
                </button>
                <button
                  onClick={() => setActiveTab('actions')}
                  className="flex-1 py-1.5 px-3 bg-ctrl-accent hover:bg-ctrl-accentHover text-white font-mono font-semibold text-xs rounded-btn transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Evaluate Response →</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
