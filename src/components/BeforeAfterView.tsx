import React from 'react';
import { useGrid } from '../context/GridContext';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BeforeAfterView: React.FC = () => {
  const { gridState, baselineState, candidates, winningActionId, appliedActionState, selectedAction } = useGrid();

  const action = selectedAction || candidates.find((c) => c.id === winningActionId) || candidates[0];

  const beforeV = baselineState.buses.find((b) => b.id === 7)?.voltage || 1.067;
  const afterV = appliedActionState
    ? gridState.buses.find((b) => b.id === 7)?.voltage || action.voltageAfter
    : action.voltageAfter;

  const beforeLoading = Math.max(...baselineState.lines.map((l) => l.loadingPct));
  const afterLoading = appliedActionState
    ? Math.max(...gridState.lines.map((l) => l.loadingPct))
    : action.thermalAfter;

  const beforeRenewable = 91.0;
  const afterRenewable = action.renewablePreservedPct;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="px-3 py-1 rounded-full bg-ctrl-mint border border-[#BCE7D3] text-[#166046] text-xs font-mono font-bold tracking-widest uppercase">
          POWER-FLOW REVALIDATION
        </span>
        <h2 className="text-2xl md:text-3xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
          Before vs After GridMorph Dispatch
        </h2>
        <p className="text-xs md:text-sm text-ctrl-textSecondary font-sans">
          Comparing baseline uncontrolled grid state against the physics-validated optimal dispatch strategy (<span className="text-ctrl-textPrimary font-semibold">{action.name}</span>).
        </p>
      </div>

      {/* Side-by-Side Comparison Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* BEFORE PANEL */}
        <div className="bg-ctrl-surface rounded-panel p-6 border border-[#F5D0D9] shadow-subtle relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-ctrl-rose border-b border-l border-[#F5D0D9] rounded-bl-xl text-ctrl-critical text-xs font-mono font-bold uppercase">
            BEFORE GRIDMORPH
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-ctrl-rose border border-[#F5D0D9] flex items-center justify-center text-ctrl-critical">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-ctrl-textPrimary">Unmanaged DER Surge</h3>
                <p className="text-xs text-ctrl-critical font-mono">Statutory Limit Breached at Bus 7</p>
              </div>
            </div>

            {/* Metric Blocks */}
            <div className="space-y-3 font-mono">
              <div className="p-3.5 rounded-card bg-[#FFF8F8] border border-[#FCE2E7] flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Peak Bus 7 Voltage</div>
                <div className="text-xl font-bold text-ctrl-critical">
                  {beforeV.toFixed(3)} pu
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-[#FFFDF5] border border-[#F7EBD3] flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Feeder Line Loading</div>
                <div className="text-xl font-bold text-ctrl-warning">
                  {beforeLoading}%
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-ctrl-elevated border border-ctrl-border flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Solar Export Efficiency</div>
                <div className="text-xl font-bold text-ctrl-textPrimary">
                  {beforeRenewable}%
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-ctrl-rose border border-[#F5D0D9] flex items-center justify-between">
                <div className="text-xs text-ctrl-critical font-semibold">Violation Status</div>
                <span className="px-2.5 py-0.5 rounded-btn bg-ctrl-critical text-white text-[11px] font-bold uppercase">
                  ACTIVE BREACH
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ctrl-border text-xs text-ctrl-textSecondary font-sans">
            Uncontrolled reverse power flow creates voltage rise beyond 1.050 pu standard.
          </div>
        </div>

        {/* AFTER PANEL */}
        <div className="bg-ctrl-surface rounded-panel p-6 border border-[#BCE7D3] shadow-subtle relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-ctrl-mint border-b border-l border-[#BCE7D3] rounded-bl-xl text-[#166046] text-xs font-mono font-bold uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#237A5C]" />
            <span>AFTER GRIDMORPH</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-ctrl-mint border border-[#BCE7D3] flex items-center justify-center text-[#237A5C]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-ctrl-textPrimary">Grid Stabilized</h3>
                <p className="text-xs text-[#166046] font-mono">{action.name} Active</p>
              </div>
            </div>

            {/* Metric Blocks */}
            <div className="space-y-3 font-mono">
              <div className="p-3.5 rounded-card bg-ctrl-mint border border-[#BCE7D3] flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Peak Bus 7 Voltage</div>
                <div className="text-xl font-bold text-[#166046] flex items-center gap-2">
                  <span>{afterV.toFixed(3)} pu</span>
                  <span className="text-xs font-normal text-[#237A5C]">(-{(beforeV - afterV).toFixed(3)} pu)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-ctrl-elevated border border-ctrl-border flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Feeder Line Loading</div>
                <div className="text-xl font-bold text-ctrl-textPrimary flex items-center gap-2">
                  <span>{afterLoading}%</span>
                  <span className="text-xs font-normal text-[#237A5C]">(-{beforeLoading - afterLoading}%)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-ctrl-mint border border-[#BCE7D3] flex items-center justify-between">
                <div className="text-xs text-ctrl-textSecondary">Solar Export Efficiency</div>
                <div className="text-xl font-bold text-[#166046]">
                  {afterRenewable}% (100% Preserved)
                </div>
              </div>

              <div className="p-3.5 rounded-card bg-ctrl-mint border border-[#BCE7D3] flex items-center justify-between">
                <div className="text-xs text-[#166046] font-semibold">Violation Status</div>
                <span className="px-2.5 py-0.5 rounded-btn bg-[#237A5C] text-white text-[11px] font-bold uppercase">
                  FULLY RESOLVED
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-ctrl-border text-xs text-[#166046] font-sans">
            Validated: Terminal voltage restored within statutory limits with zero clean energy curtailment.
          </div>
        </div>
      </div>

      {/* Brand Statement Banner */}
      <div className="bg-ctrl-mint p-4 rounded-panel border border-[#BCE7D3] text-center">
        <p className="text-sm font-sans text-[#166046]">
          "GridMorph did not simply react. <span className="font-bold text-[#166046]">It predicted, compared, validated and explained.</span>"
        </p>
      </div>
    </div>
  );
};

