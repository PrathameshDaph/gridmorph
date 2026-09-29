import React from 'react';
import { useGrid } from '../context/GridContext';
import { KPIRow } from '../components/KPIRow';
import { ConventionalVsGridMorph } from '../components/ConventionalVsGridMorph';
import { FeederCanvas } from '../components/DigitalTwin/FeederCanvas';
import { BusDetailDrawer } from '../components/DigitalTwin/BusDetailDrawer';
import { ViolationPanel } from '../components/ViolationPanel';
import { ArrowRight } from 'lucide-react';

export const CommandCenter: React.FC = () => {
  const {
    gridState,
    selectedBusId,
    setActiveTab,
    candidates,
    winningActionId,
    selectedAction,
  } = useGrid();

  const action = selectedAction || candidates.find((c) => c.id === winningActionId) || candidates[0];
  const hasViolations = gridState.activeViolations.length > 0;

  return (
    <div className="space-y-6">
      {/* 1. Operational Metrics Strip */}
      <KPIRow />

      {/* 2. Main Digital Twin Network & Side Inspection Drawer (55-60% Visual Attention) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className={selectedBusId !== null ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <FeederCanvas />
        </div>

        {selectedBusId !== null && (
          <div className="lg:col-span-1">
            <BusDetailDrawer />
          </div>
        )}
      </div>

      {/* 3. Conventional vs GridMorph Comparison */}
      <ConventionalVsGridMorph />

      {/* 4. Active Incident Panel */}
      <ViolationPanel />

      {/* 5. Recommended Action Callout if Incidents Active */}
      {hasViolations && (
        <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-btn bg-ctrl-elevated text-ctrl-accent border border-ctrl-border">
                RECOMMENDED DISPATCH
              </span>
              <span className="text-xs font-mono text-ctrl-textSecondary">
                Score: {action.scores.totalWeighted}/100
              </span>
            </div>
            <h3 className="text-sm font-sans font-bold text-ctrl-textPrimary mt-1">
              {action.name} ({action.title})
            </h3>
            <p className="text-xs text-ctrl-textSecondary mt-0.5 font-sans">
              Expected resolution: Restores terminal voltage from {action.voltageBefore.toFixed(3)} to {action.voltageAfter.toFixed(3)} pu with 100% renewable utilization.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('actions')}
            className="flex items-center gap-2 px-4 py-2.5 bg-ctrl-accent hover:bg-ctrl-accentHover text-ctrl-bg font-mono font-semibold text-xs rounded-btn transition-colors shrink-0"
          >
            <span>Review Actions →</span>
          </button>
        </div>
      )}
    </div>
  );
};
