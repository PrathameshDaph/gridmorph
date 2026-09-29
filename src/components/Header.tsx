import React from 'react';
import { useGrid } from '../context/GridContext';
import { SCENARIO_PRESETS } from '../simulation/scenarioPresets';
import { Play, RotateCcw, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeScenarioId,
    selectScenario,
    startDemo,
    isSimulating,
    simulationStage,
    resetToBaseline,
    appliedActionState,
  } = useGrid();

  return (
    <header className="bg-ctrl-surface border-b border-ctrl-border sticky top-0 z-30 px-6 py-3 shadow-subtle">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Title */}
        <div className="flex items-center justify-between w-full lg:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-btn bg-ctrl-tintGreen border border-ctrl-tintGreenBorder flex items-center justify-center text-ctrl-accent shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M12 2v8"/>
                <path d="m4.93 10.93 1.41 1.41"/>
                <path d="M2 18h2"/>
                <path d="M20 18h2"/>
                <path d="m19.07 10.93-1.41 1.41"/>
                <path d="M22 22H2"/>
                <path d="m8 6 4-4 4 4"/>
                <path d="M16 18a4 4 0 0 0-8 0"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg font-mono tracking-wide text-ctrl-textPrimary">
                  GRIDMORPH
                </span>
                <span className="text-[11px] font-mono text-ctrl-textTertiary bg-ctrl-elevated px-1.5 py-0.5 rounded border border-ctrl-border">
                  v2.4
                </span>
              </div>
              <p className="text-[12px] text-ctrl-textSecondary font-sans">
                Adaptive Digital Twin for Renewable Distribution Networks
              </p>
            </div>
          </div>

          {/* Mobile Start Demo Button */}
          <button
            onClick={startDemo}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-ctrl-accent hover:bg-ctrl-accentHover text-white font-semibold text-xs rounded-btn shadow-sm transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Demo</span>
          </button>
        </div>

        {/* Center/Right: Simple Status Indicators */}
        <div className="hidden xl:flex items-center gap-5 text-xs font-mono text-ctrl-textSecondary">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ctrl-success" />
            <span>Twin online</span>
          </div>
          <span className="text-ctrl-border">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ctrl-accent" />
            <span>AC power flow ready</span>
          </div>
          <span className="text-ctrl-border">|</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ctrl-warning" />
            <span>Forecast ready</span>
          </div>
        </div>

        {/* Right: Scenario Switcher & Primary CTA */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {/* Scenario Selector */}
          <div className="flex items-center gap-2 bg-ctrl-elevated px-3 py-1.5 rounded-card border border-ctrl-border text-xs font-mono">
            <span className="text-ctrl-textTertiary uppercase text-[10px] hidden sm:inline">
              SCENARIO:
            </span>
            <select
              value={activeScenarioId}
              onChange={(e) => selectScenario(e.target.value)}
              className="bg-transparent text-ctrl-textPrimary font-medium focus:outline-none cursor-pointer"
            >
              {SCENARIO_PRESETS.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-white text-ctrl-textPrimary">
                  {sc.name} ({sc.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Reset Baseline */}
          {appliedActionState && (
            <button
              onClick={resetToBaseline}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-ctrl-elevated hover:bg-ctrl-borderLight text-ctrl-textSecondary hover:text-ctrl-textPrimary text-xs font-mono rounded-btn border border-ctrl-border transition-colors"
              title="Reset grid to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          {/* Primary CTA: START 90-SECOND DEMO (Styled after reference camera button) */}
          <button
            id="judge-demo-btn"
            onClick={startDemo}
            className="flex items-center gap-2 px-4 py-2 bg-ctrl-accent hover:bg-ctrl-accentHover text-white font-semibold text-xs tracking-wider uppercase font-mono rounded-btn transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>START 90-SECOND DEMO</span>
          </button>
        </div>
      </div>

      {/* Progress Simulation Banner */}
      {isSimulating && (
        <div className="mt-2 py-1.5 px-3 bg-ctrl-tintGreen border border-ctrl-tintGreenBorder rounded-card flex items-center justify-between text-xs font-mono text-ctrl-tintGreenText">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-spin text-ctrl-accent" />
            <span>ENGINE STATUS: {simulationStage}</span>
          </div>
          <span className="text-[11px] text-ctrl-textTertiary uppercase tracking-wider">Physics Solver Active</span>
        </div>
      )}
    </header>
  );
};
