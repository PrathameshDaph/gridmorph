import React from 'react';
import { ArrowRight } from 'lucide-react';

export const ConventionalVsGridMorph: React.FC = () => {
  return (
    <div className="bg-ctrl-surface border border-ctrl-border rounded-panel p-5 shadow-card">
      <div className="mb-4">
        <h2 className="text-sm font-sans font-bold text-ctrl-textPrimary tracking-tight">
          From monitoring to decision support
        </h2>
        <p className="text-xs text-ctrl-textSecondary mt-0.5">
          How GridMorph evolves the digital twin from passive alerting to active closed-loop grid optimization
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ctrl-border gap-6 md:gap-0">
        {/* Left: Traditional Digital Twin */}
        <div className="md:pr-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-semibold text-ctrl-textTertiary tracking-wider">
              TRADITIONAL DIGITAL TWIN
            </span>
            <span className="text-[11px] font-mono text-ctrl-textTertiary">
              Passive Monitoring
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-ctrl-textSecondary">
            <span className="px-2.5 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Observe</span>
            <ArrowRight className="w-3.5 h-3.5 text-ctrl-textTertiary" />
            <span className="px-2.5 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Detect</span>
            <ArrowRight className="w-3.5 h-3.5 text-ctrl-textTertiary" />
            <span className="px-2.5 py-1 rounded-btn bg-ctrl-tintRose border border-ctrl-tintRoseBorder text-ctrl-tintRoseText font-semibold">Alert</span>
          </div>

          <p className="text-xs text-ctrl-textSecondary leading-relaxed font-sans">
            Detects problems only after physical thresholds are breached. Operator is left to manually troubleshoot and guess corrective setpoints.
          </p>
        </div>

        {/* Right: GridMorph Adaptive Twin */}
        <div className="pt-4 md:pt-0 md:pl-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-semibold text-ctrl-accent tracking-wider">
              GRIDMORPH ADAPTIVE TWIN
            </span>
            <span className="text-[11px] font-mono text-ctrl-accent font-semibold">
              Active Decision Engine
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-ctrl-textPrimary">
            <span className="px-2 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Forecast</span>
            <ArrowRight className="w-3 h-3 text-ctrl-accent shrink-0" />
            <span className="px-2 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Simulate</span>
            <ArrowRight className="w-3 h-3 text-ctrl-accent shrink-0" />
            <span className="px-2 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Compare</span>
            <ArrowRight className="w-3 h-3 text-ctrl-accent shrink-0" />
            <span className="px-2 py-1 rounded-btn bg-ctrl-accent text-white font-semibold shadow-sm">Optimize</span>
            <ArrowRight className="w-3 h-3 text-ctrl-accent shrink-0" />
            <span className="px-2 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border">Validate</span>
            <ArrowRight className="w-3 h-3 text-ctrl-accent shrink-0" />
            <span className="px-2 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border text-ctrl-textSecondary">Explain</span>
          </div>

          <p className="text-xs text-ctrl-textSecondary leading-relaxed font-sans">
            Predicts impending breaches ahead of time, evaluates candidate strategies in parallel using AC power-flow physics, and validates the optimal response.
          </p>
        </div>
      </div>
    </div>
  );
};
