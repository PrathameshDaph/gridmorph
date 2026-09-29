import React, { useState, useEffect } from 'react';
import { useGrid } from '../context/GridContext';
import {
  X,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

interface DemoStoryStep {
  stepNumber: number;
  phase: string;
  title: string;
  narration: string;
  metricBadge: string;
  targetTab?: string;
}

export const DemoModal: React.FC = () => {
  const {
    isDemoActive,
    stopDemo,
    demoStep,
    nextDemoStep,
    prevDemoStep,
    jumpToDemoStep,
    selectScenario,
    setActiveTab,
    applyAction,
    resetToBaseline,
  } = useGrid();

  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const demoSteps: DemoStoryStep[] = [
    {
      stepNumber: 1,
      phase: 'PHASE 01 • BASELINE',
      title: 'Step 1: Normal Grid Baseline',
      narration: 'The 12-bus radial feeder operates in a balanced midday state. All 12 bus voltages remain within standard statutory margins (0.98 - 1.03 pu), with zero active alarms.',
      metricBadge: 'Health: 100% • 0 Violations',
      targetTab: 'command',
    },
    {
      stepNumber: 2,
      phase: 'PHASE 02 • DER SURGE',
      title: 'Step 2: Solar Generation Begins Rising',
      narration: 'Clear midday irradiance causes a steep ramp at Solar Park 7B and Rooftop Array 3A. Total solar injection surges towards 4.8 MW, outpacing local downstream feeder demand (3.5 MW).',
      metricBadge: 'PV Surge: +1.8 MW Net Export',
      targetTab: 'twin',
    },
    {
      stepNumber: 3,
      phase: 'PHASE 03 • PREDICTION',
      title: 'Step 3: ML Forecast Predicts Impending Overvoltage',
      narration: 'GridMorph\'s Random Forest forecast model predicts that within 28 minutes, reverse power flow will push terminal voltage at Bus 7 beyond statutory limits, well before SCADA alarms trip.',
      metricBadge: 'Horizon: +30 min (Risk: HIGH)',
      targetTab: 'forecast',
    },
    {
      stepNumber: 4,
      phase: 'PHASE 04 • PHYSICS VALIDATION',
      title: 'Step 4: Digital Twin Confirms Power-Flow Violation',
      narration: 'The AC Backward-Forward Sweep solver re-evaluates the network: Bus 7 terminal voltage reaches 1.067 pu (+0.017 pu above the 1.050 pu upper statutory limit). Violation confirmed.',
      metricBadge: 'Bus 07: 1.067 pu (> 1.050 Limit)',
      targetTab: 'twin',
    },
    {
      stepNumber: 5,
      phase: 'PHASE 05 • ACTION EVALUATION',
      title: 'Step 5: Parallel Corrective Action Evaluation',
      narration: 'Instead of blind alerting or uncoordinated tripping, GridMorph immediately spins up 5 parallel physics-based simulation models for candidate dispatch strategies.',
      metricBadge: '5 Parallel Physics Solvers Active',
      targetTab: 'actions',
    },
    {
      stepNumber: 6,
      phase: 'PHASE 06 • MULTI-OBJECTIVE',
      title: 'Step 6: Multi-Objective Score Comparison',
      narration: 'Every candidate action is graded across 4 weighted objectives: Grid Safety (40%), Renewable Utilization (30%), Battery Degradation (15%), and Switching Minimization (15%).',
      metricBadge: 'Pareto Scoring Completed',
      targetTab: 'actions',
    },
    {
      stepNumber: 7,
      phase: 'PHASE 07 • OPTIMIZATION',
      title: 'Step 7: GridMorph Selects Optimal Action',
      narration: 'Reactive Power Control (Inverter Volt-VAR Q Absorption) achieves the highest score (97/100) because it provides sufficient voltage drop while preserving 100% of green energy.',
      metricBadge: 'Selected: Reactive Power Control (97 pts)',
      targetTab: 'actions',
    },
    {
      stepNumber: 8,
      phase: 'PHASE 08 • DISPATCH',
      title: 'Step 8: Action Setpoint is Dispatched',
      narration: 'Automated digital twin setpoints are transmitted to the smart inverters at Bus 7 and Bus 3, commanding inductive reactive absorption (Q = -0.95 MVar) without shedding active generation.',
      metricBadge: 'Dispatching Q = -0.95 MVar Setpoint',
      targetTab: 'twin',
    },
    {
      stepNumber: 9,
      phase: 'PHASE 09 • RE-SOLVER',
      title: 'Step 9: Power Flow is Re-run & Revalidated',
      narration: 'GridMorph re-solves the full AC power-flow equations on the modified network state to strictly verify that no secondary thermal or downstream low-voltage issues were triggered.',
      metricBadge: 'AC Convergence: 3 Iterations',
      targetTab: 'twin',
    },
    {
      stepNumber: 10,
      phase: 'PHASE 10 • STABILIZATION',
      title: 'Step 10: Voltage Returns Within Statutory Limits',
      narration: 'Bus 7 terminal voltage drops from 1.067 pu down to 1.048 pu (+0.002 pu safety margin). The critical statutory violation is officially resolved.',
      metricBadge: 'Voltage Restored: 1.048 pu (PASS)',
      targetTab: 'twin',
    },
    {
      stepNumber: 11,
      phase: 'PHASE 11 • SUSTAINABILITY',
      title: 'Step 11: 100% Renewable Energy Preserved',
      narration: 'Unlike brute-force legacy curtailment which would have wasted 25% of solar export, GridMorph preserves 100% of clean energy generation and avoids battery cycle degradation.',
      metricBadge: 'Renewable Utilization: 100%',
      targetTab: 'command',
    },
    {
      stepNumber: 12,
      phase: 'PHASE 12 • FINAL IMPACT',
      title: 'Step 12: Final Impact & Decision Audit',
      narration: 'The grid is stabilized with zero mechanical breaker wear and full audit compliance. GridMorph did not simply react — it predicted, compared, validated and explained.',
      metricBadge: 'GRID STABILIZED • ZERO VIOLATIONS',
      targetTab: 'report',
    },
  ];

  const currentStep = demoSteps[demoStep - 1] || demoSteps[0];

  useEffect(() => {
    if (!isDemoActive || !isPlaying) return;

    const timer = setTimeout(() => {
      if (demoStep < 12) {
        handleStepTransition(demoStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, 7500);

    return () => clearTimeout(timer);
  }, [isDemoActive, isPlaying, demoStep]);

  const handleStepTransition = (nextStepNumber: number) => {
    jumpToDemoStep(nextStepNumber);
    const targetStep = demoSteps[nextStepNumber - 1];
    if (targetStep.targetTab) {
      setActiveTab(targetStep.targetTab);
    }
    if (nextStepNumber === 1) {
      selectScenario('normal');
      resetToBaseline();
    } else if (nextStepNumber === 2 || nextStepNumber === 4) {
      selectScenario('overvoltage');
    } else if (nextStepNumber >= 8) {
      applyAction('ACT-Q-CONTROL');
    }
  };

  if (!isDemoActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="bg-white w-full max-w-3xl rounded-panel border border-ctrl-border shadow-2xl overflow-hidden flex flex-col justify-between max-h-[85vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-ctrl-elevated border-b border-ctrl-border">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase tracking-wider">
                90-SECOND HACKATHON JUDGE DEMO
              </h3>
              <span className="text-[11px] font-mono text-[#237A5C] font-bold">
                (Step {demoStep} of 12)
              </span>
            </div>
            <p className="text-[11px] text-ctrl-textSecondary font-sans mt-0.5">
              Automated Walkthrough: Prediction → AC Simulation → Multi-Action Optimization → Revalidation
            </p>
          </div>

          <button
            onClick={stopDemo}
            className="text-ctrl-textTertiary hover:text-ctrl-textPrimary p-1.5 rounded-btn hover:bg-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thin Progress Bar */}
        <div className="px-6 pt-3 bg-white">
          <div className="grid grid-cols-12 gap-1.5">
            {demoSteps.map((step) => (
              <button
                key={step.stepNumber}
                onClick={() => handleStepTransition(step.stepNumber)}
                className={`h-1.5 rounded-full transition-all ${
                  step.stepNumber === demoStep
                    ? 'bg-[#237A5C]'
                    : step.stepNumber < demoStep
                    ? 'bg-[#A3CEBE]'
                    : 'bg-[#E2EAE5]'
                }`}
                title={`Step ${step.stepNumber}: ${step.title}`}
              />
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 overflow-y-auto bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-wider text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] uppercase">
                {currentStep.phase}
              </span>
              <h2 className="text-xl font-sans font-bold text-ctrl-textPrimary mt-1.5">
                {currentStep.title}
              </h2>
            </div>
            <div className="px-3 py-1 rounded-btn bg-ctrl-elevated border border-ctrl-border text-xs font-mono font-semibold text-ctrl-textPrimary shrink-0">
              {currentStep.metricBadge}
            </div>
          </div>

          <div className="p-4 rounded-card bg-[#F4F8F6] border border-[#D8E8E0] text-xs text-[#1E3B2F] leading-relaxed font-sans">
            {currentStep.narration}
          </div>

          {demoStep === 12 && (
            <div className="p-4 rounded-card bg-ctrl-mint border border-[#BCE7D3] space-y-3">
              <div className="flex items-center gap-2 text-[#166046] font-mono font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4 text-[#237A5C]" />
                <span>GRID STABILIZED & AUDIT VERIFIED</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-white p-2.5 rounded-btn border border-[#BCE7D3]">
                  <span className="text-ctrl-textTertiary text-[10px]">Voltage Delta</span>
                  <div className="text-[#166046] font-extrabold">1.067 → 1.048 pu</div>
                </div>
                <div className="bg-white p-2.5 rounded-btn border border-[#BCE7D3]">
                  <span className="text-ctrl-textTertiary text-[10px]">Renewables Preserved</span>
                  <div className="text-[#166046] font-extrabold">100% (0% Curtailed)</div>
                </div>
                <div className="bg-white p-2.5 rounded-btn border border-[#BCE7D3]">
                  <span className="text-ctrl-textTertiary text-[10px]">Battery Wear</span>
                  <div className="text-ctrl-textPrimary font-extrabold">0% Impact</div>
                </div>
                <div className="bg-white p-2.5 rounded-btn border border-[#BCE7D3]">
                  <span className="text-ctrl-textTertiary text-[10px]">Breaker Cycles</span>
                  <div className="text-ctrl-textPrimary font-extrabold">0 Operations</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-ctrl-elevated border-t border-ctrl-border">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-white hover:bg-ctrl-borderLight text-ctrl-textPrimary text-xs font-mono font-semibold border border-ctrl-border transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={demoStep === 1}
              onClick={() => handleStepTransition(demoStep - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-white hover:bg-ctrl-borderLight disabled:opacity-30 disabled:cursor-not-allowed text-ctrl-textPrimary text-xs font-mono font-semibold border border-ctrl-border transition-colors shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {demoStep < 12 ? (
              <button
                onClick={() => handleStepTransition(demoStep + 1)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-btn bg-[#237A5C] hover:bg-[#1C674E] text-white font-sans font-bold text-xs shadow-subtle transition-colors"
              >
                <span>Next Step</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={stopDemo}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-btn bg-[#237A5C] hover:bg-[#1C674E] text-white font-sans font-bold text-xs shadow-subtle transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

