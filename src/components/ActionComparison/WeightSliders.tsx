import React from 'react';
import { useGrid } from '../../context/GridContext';
import { OptimizationWeights } from '../../types/grid';
import { RotateCcw } from 'lucide-react';

export const WeightSliders: React.FC = () => {
  const { optimizationWeights, updateWeights } = useGrid();

  const resetWeights = () => {
    updateWeights({
      gridSafety: 40,
      renewableUtilization: 30,
      batteryDegradation: 15,
      switchingCost: 15,
    });
  };

  const sliders: { key: keyof OptimizationWeights; label: string; desc: string }[] = [
    {
      key: 'gridSafety',
      label: 'GRID SAFETY & HEADROOM',
      desc: 'Penalizes statutory voltage and thermal overloads',
    },
    {
      key: 'renewableUtilization',
      label: 'RENEWABLE UTILIZATION',
      desc: 'Minimizes solar PV generation curtailment losses',
    },
    {
      key: 'batteryDegradation',
      label: 'BATTERY ASSET HEALTH',
      desc: 'Minimizes electrochemical cycling and thermal stress',
    },
    {
      key: 'switchingCost',
      label: 'SWITCHING MINIMIZATION',
      desc: 'Reduces mechanical distribution breaker operations',
    },
  ];

  const total =
    optimizationWeights.gridSafety +
    optimizationWeights.renewableUtilization +
    optimizationWeights.batteryDegradation +
    optimizationWeights.switchingCost;

  return (
    <div className="bg-ctrl-surface border border-ctrl-border rounded-panel p-4 shadow-card">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-ctrl-border">
        <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-ctrl-textPrimary">
          MULTI-OBJECTIVE WEIGHTING MATRIX
        </h3>
        <button
          onClick={resetWeights}
          className="text-[11px] font-mono text-ctrl-textSecondary hover:text-ctrl-accent flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3 text-ctrl-textTertiary" />
          <span>Reset Default (40/30/15/15)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sliders.map((s) => {
          const val = optimizationWeights[s.key];
          const pct = Math.round((val / (total || 1)) * 100);
          return (
            <div key={s.key} className="bg-ctrl-elevated p-3.5 rounded-card border border-ctrl-border flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-semibold text-ctrl-textSecondary uppercase">
                    {s.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-ctrl-textPrimary">
                    {val}% <span className="text-ctrl-textTertiary font-normal">({pct}% wt)</span>
                  </span>
                </div>
                <p className="text-[11px] text-ctrl-textTertiary mb-2.5 font-sans leading-snug">
                  {s.desc}
                </p>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={val}
                onChange={(e) => updateWeights({ [s.key]: Number(e.target.value) })}
                className="w-full h-1.5 bg-ctrl-border rounded-btn cursor-pointer accent-ctrl-accent"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
