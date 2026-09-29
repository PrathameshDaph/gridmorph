import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GridState,
  ActionCandidate,
  OptimizationWeights,
  DecisionExplanation,
  FeasibilityReport,
  ForecastPoint,
  SimulationEvent,
  ScenarioPreset,
} from '../types/grid';
import { simulatePowerFlow } from '../simulation/powerFlowEngine';
import { generateForecast, ForecastMetrics } from '../simulation/forecastEngine';
import { evaluateAllActions, DEFAULT_WEIGHTS } from '../simulation/actionOptimizer';
import { generateDecisionExplanation } from '../simulation/explainabilityEngine';
import { evaluateFeasibilityLimits } from '../simulation/feasibilityEngine';
import { SCENARIO_PRESETS } from '../simulation/scenarioPresets';

export interface WhatIfParameters {
  solarMultiplier: number;
  loadMultiplier: number;
  batterySOC: number;
  curtailmentCapPct: number;
  reactivePowerMvar: number;
  tieSwitchClosed: boolean;
}

export interface ScenarioSnapshot {
  id: string;
  name: string;
  timestamp: string;
  solarMultiplier: number;
  loadMultiplier: number;
  batterySOC: number;
  maxVoltage: number;
  maxLoading: number;
  health: number;
  violationsCount: number;
}

interface GridContextType {
  gridState: GridState;
  baselineState: GridState;
  activeScenario: ScenarioPreset;
  activeScenarioId: string;
  forecastPoints: ForecastPoint[];
  forecastMetrics: ForecastMetrics;
  forecastHorizonMin: number;
  optimizationWeights: OptimizationWeights;
  candidates: ActionCandidate[];
  winningActionId: string;
  selectedActionId: string | null;
  selectedAction: ActionCandidate | null;
  explanation: DecisionExplanation | null;
  feasibilityReport: FeasibilityReport | null;
  isSimulating: boolean;
  simulationStage: string;
  appliedActionState: boolean;
  selectedBusId: number | null;
  whatIfParams: WhatIfParameters;
  savedSnapshots: ScenarioSnapshot[];
  liveEvents: SimulationEvent[];
  isLiveSim: boolean;
  liveSimDisturbance: string;
  isDemoActive: boolean;
  demoStep: number;
  activeTab: string;
  
  // Actions
  setActiveTab: (tab: string) => void;
  selectScenario: (scenarioId: string) => void;
  setForecastHorizon: (min: number) => void;
  runPredictiveTwin: () => void;
  updateWeights: (weights: Partial<OptimizationWeights>) => void;
  applyAction: (actionId: string) => void;
  selectCandidate: (actionId: string) => void;
  resetToBaseline: () => void;
  setSelectedBusId: (id: number | null) => void;
  updateWhatIfParams: (params: Partial<WhatIfParameters>) => void;
  runWhatIfSimulation: () => void;
  saveCurrentSnapshot: (name?: string) => void;
  toggleTieSwitch: () => void;
  setIsLiveSim: (active: boolean) => void;
  triggerLiveDisturbance: (type: string) => void;
  startDemo: () => void;
  stopDemo: () => void;
  nextDemoStep: () => void;
  prevDemoStep: () => void;
  jumpToDemoStep: (step: number) => void;
}

const GridContext = createContext<GridContextType | undefined>(undefined);

export const GridProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('command');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('overvoltage');
  const [forecastHorizonMin, setForecastHorizonMin] = useState<number>(30);
  const [optimizationWeights, setOptimizationWeights] = useState<OptimizationWeights>(DEFAULT_WEIGHTS);
  const [selectedBusId, setSelectedBusId] = useState<number | null>(7);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStage, setSimulationStage] = useState<string>('IDLE');
  const [appliedActionState, setAppliedActionState] = useState<boolean>(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  // Live simulation & events
  const [isLiveSim, setIsLiveSim] = useState<boolean>(false);
  const [liveSimDisturbance, setLiveSimDisturbance] = useState<string>('NORMAL');
  const [liveEvents, setLiveEvents] = useState<SimulationEvent[]>([
    { id: '1', timeStr: '15:42:18', type: 'SURGE', message: 'Solar surge detected at PV Park 7B (+1.8 MW)' },
    { id: '2', timeStr: '15:42:20', type: 'RISK', message: 'Voltage risk predicted by Random Forest (1.067 pu)' },
    { id: '3', timeStr: '15:42:21', type: 'VIOLATION', message: 'Power-flow violation confirmed on Bus 7' },
    { id: '4', timeStr: '15:42:22', type: 'EVAL', message: '5 corrective strategies evaluated in parallel' },
    { id: '5', timeStr: '15:42:23', type: 'SELECT', message: 'Reactive Power Control selected (Score: 97)' },
    { id: '6', timeStr: '15:42:24', type: 'VALIDATE', message: 'Power flow revalidated — Voltage restored to 1.048 pu' },
  ]);

  // What-If Parameters & Snapshots
  const [whatIfParams, setWhatIfParams] = useState<WhatIfParameters>({
    solarMultiplier: 1.55,
    loadMultiplier: 0.85,
    batterySOC: 68,
    curtailmentCapPct: 15,
    reactivePowerMvar: 0.0,
    tieSwitchClosed: false,
  });

  const [savedSnapshots, setSavedSnapshots] = useState<ScenarioSnapshot[]>([
    {
      id: 'snap-1',
      name: 'Scenario A: High Solar Baseline',
      timestamp: '15:30:00',
      solarMultiplier: 1.55,
      loadMultiplier: 0.85,
      batterySOC: 68,
      maxVoltage: 1.067,
      maxLoading: 94,
      health: 74,
      violationsCount: 1,
    },
    {
      id: 'snap-2',
      name: 'Scenario B: BESS Charging Peak',
      timestamp: '15:35:12',
      solarMultiplier: 1.55,
      loadMultiplier: 1.10,
      batterySOC: 85,
      maxVoltage: 1.051,
      maxLoading: 78,
      health: 92,
      violationsCount: 0,
    },
  ]);

  // Demo Mode state
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(1);

  const activeScenario = SCENARIO_PRESETS.find((s) => s.id === activeScenarioId) || SCENARIO_PRESETS[1];

  // Base Grid State for the active scenario
  const baselineState = simulatePowerFlow({
    solarMultiplier: activeScenario.solarMultiplier,
    loadMultiplier: activeScenario.loadMultiplier,
    batteryASoc: activeScenario.batterySOC,
    batteryBSoc: Math.max(30, activeScenario.batterySOC - 12),
    tieSwitchClosed: activeScenario.tieSwitchClosed,
  });

  // Current Grid State (either baseline or modified by applied action / what-if)
  const [gridState, setGridState] = useState<GridState>(baselineState);

  // Evaluate Forecast
  const scenarioForecastType = 
    activeScenarioId === 'extreme' ? 'extreme_solar' :
    activeScenarioId === 'thermal_overload' ? 'heavy_load' :
    activeScenarioId === 'transient' ? 'cloud_transient' :
    activeScenarioId === 'normal' ? 'normal' : 'rising_solar';

  const { points: forecastPoints, metrics: forecastMetrics } = generateForecast(
    gridState.totalGenerationMW || 4.6,
    gridState.totalLoadMW || 3.8,
    scenarioForecastType
  );

  // Evaluate Candidates
  const { candidates, winningActionId } = evaluateAllActions(
    gridState,
    optimizationWeights,
    activeScenarioId
  );

  const activeCandidateId = selectedCandidateId || winningActionId;
  const selectedAction = candidates.find((c) => c.id === activeCandidateId) || candidates[0];

  // Explainability & Feasibility
  const explanation = selectedAction ? generateDecisionExplanation(selectedAction, gridState, optimizationWeights) : null;
  const feasibilityReport = activeScenarioId === 'extreme' ? evaluateFeasibilityLimits('Extreme Solar Surplus (9.2 MW)') : null;

  // Sync state when active scenario changes
  useEffect(() => {
    const nextState = simulatePowerFlow({
      solarMultiplier: activeScenario.solarMultiplier,
      loadMultiplier: activeScenario.loadMultiplier,
      batteryASoc: activeScenario.batterySOC,
      batteryBSoc: Math.max(30, activeScenario.batterySOC - 12),
      tieSwitchClosed: activeScenario.tieSwitchClosed,
    });
    setGridState(nextState);
    setAppliedActionState(false);
    setSelectedCandidateId(null);
    setWhatIfParams({
      solarMultiplier: activeScenario.solarMultiplier,
      loadMultiplier: activeScenario.loadMultiplier,
      batterySOC: activeScenario.batterySOC,
      curtailmentCapPct: activeScenario.curtailmentCapPct,
      reactivePowerMvar: 0.0,
      tieSwitchClosed: activeScenario.tieSwitchClosed,
    });
  }, [activeScenarioId]);

  // Handler: Select Scenario
  const selectScenario = useCallback((id: string) => {
    setActiveScenarioId(id);
  }, []);

  // Handler: Forecast Horizon Selection
  const setForecastHorizon = useCallback((min: number) => {
    setForecastHorizonMin(min);
  }, []);

  // Handler: Run Predictive Digital Twin
  const runPredictiveTwin = useCallback(() => {
    setIsSimulating(true);
    setSimulationStage('INGESTING FORECAST HORIZON...');
    setTimeout(() => {
      setSimulationStage('PROJECTING POWER-FLOW EQUATIONS...');
      setTimeout(() => {
        setSimulationStage('DETECTING IMPENDING VIOLATIONS...');
        setTimeout(() => {
          setIsSimulating(false);
          setSimulationStage('COMPLETE');
          setActiveTab('actions');
        }, 400);
      }, 400);
    }, 400);
  }, []);

  // Handler: Update Objective Weights
  const updateWeights = useCallback((weights: Partial<OptimizationWeights>) => {
    setOptimizationWeights((prev) => ({ ...prev, ...weights }));
  }, []);

  // Handler: Apply Action to Digital Twin
  const applyAction = useCallback((actionId: string) => {
    const candidate = candidates.find((c) => c.id === actionId);
    if (!candidate || !candidate.isFeasible) return;

    setIsSimulating(true);
    setSimulationStage('TRANSMITTING INVERTER & BESS SETPOINTS...');
    
    setTimeout(() => {
      setSimulationStage('RE-SOLVING AC POWER-FLOW...');
      setTimeout(() => {
        let nextState: GridState;
        if (candidate.id === 'ACT-Q-CONTROL') {
          nextState = simulatePowerFlow({
            solarMultiplier: activeScenario.solarMultiplier,
            loadMultiplier: activeScenario.loadMultiplier,
            reactivePowerQ_Mvar: 0.95,
          });
        } else if (candidate.id === 'ACT-COMBINED') {
          nextState = simulatePowerFlow({
            solarMultiplier: activeScenario.solarMultiplier,
            loadMultiplier: activeScenario.loadMultiplier,
            batteryADispatchMW: 0.6,
            batteryBDispatchMW: 0.4,
            reactivePowerQ_Mvar: 0.75,
          });
        } else if (candidate.id === 'ACT-BATTERY') {
          nextState = simulatePowerFlow({
            solarMultiplier: activeScenario.solarMultiplier,
            loadMultiplier: activeScenario.loadMultiplier,
            batteryADispatchMW: 1.0,
            batteryBDispatchMW: 0.7,
            batteryASoc: 74.0,
          });
        } else if (candidate.id === 'ACT-RECONFIG') {
          nextState = simulatePowerFlow({
            solarMultiplier: activeScenario.solarMultiplier,
            loadMultiplier: activeScenario.loadMultiplier,
            tieSwitchClosed: true,
          });
        } else {
          nextState = simulatePowerFlow({
            solarMultiplier: activeScenario.solarMultiplier,
            loadMultiplier: activeScenario.loadMultiplier,
            pvBCurtailmentPct: 25.0,
            pvACurtailmentPct: 10.0,
          });
        }

        setGridState(nextState);
        setAppliedActionState(true);
        setIsSimulating(false);
        setSimulationStage('COMPLETE');

        // Add event to live log
        const timeNow = new Date().toLocaleTimeString('en-US', { hour12: false });
        setLiveEvents((prev) => [
          {
            id: String(Date.now()),
            timeStr: timeNow,
            type: 'RESOLVE',
            message: `Applied ${candidate.name}: Bus 7 voltage restored to ${candidate.voltageAfter.toFixed(3)} pu`,
          },
          ...prev.slice(0, 15),
        ]);
      }, 500);
    }, 400);
  }, [candidates, activeScenario]);

  // Handler: Reset to Baseline
  const resetToBaseline = useCallback(() => {
    const base = simulatePowerFlow({
      solarMultiplier: activeScenario.solarMultiplier,
      loadMultiplier: activeScenario.loadMultiplier,
      batteryASoc: activeScenario.batterySOC,
      tieSwitchClosed: activeScenario.tieSwitchClosed,
    });
    setGridState(base);
    setAppliedActionState(false);
  }, [activeScenario]);

  // Handler: Toggle Tie Switch
  const toggleTieSwitch = useCallback(() => {
    const isClosed = !gridState.switchTie.isOpen;
    const nextState = simulatePowerFlow({
      solarMultiplier: activeScenario.solarMultiplier,
      loadMultiplier: activeScenario.loadMultiplier,
      tieSwitchClosed: !isClosed,
      batteryASoc: activeScenario.batterySOC,
    });
    setGridState(nextState);
  }, [gridState, activeScenario]);

  // Handler: Run What-If Simulation
  const runWhatIfSimulation = useCallback(() => {
    setIsSimulating(true);
    setSimulationStage('COMPUTING WHAT-IF AC LOAD FLOW...');
    setTimeout(() => {
      const nextState = simulatePowerFlow({
        solarMultiplier: whatIfParams.solarMultiplier,
        loadMultiplier: whatIfParams.loadMultiplier,
        batteryASoc: whatIfParams.batterySOC,
        batteryBSoc: Math.max(20, whatIfParams.batterySOC - 14),
        pvBCurtailmentPct: whatIfParams.curtailmentCapPct,
        reactivePowerQ_Mvar: whatIfParams.reactivePowerMvar,
        tieSwitchClosed: whatIfParams.tieSwitchClosed,
      });
      setGridState(nextState);
      setIsSimulating(false);
      setSimulationStage('COMPLETE');
    }, 400);
  }, [whatIfParams]);

  const updateWhatIfParams = useCallback((params: Partial<WhatIfParameters>) => {
    setWhatIfParams((prev) => ({ ...prev, ...params }));
  }, []);

  const saveCurrentSnapshot = useCallback((name?: string) => {
    const maxV = Math.max(...gridState.buses.map((b) => b.voltage));
    const maxL = Math.max(...gridState.lines.map((l) => l.loadingPct));
    const newSnap: ScenarioSnapshot = {
      id: `snap-${Date.now()}`,
      name: name || `Snapshot ${savedSnapshots.length + 1} (${whatIfParams.solarMultiplier * 100}% Solar)`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      solarMultiplier: whatIfParams.solarMultiplier,
      loadMultiplier: whatIfParams.loadMultiplier,
      batterySOC: whatIfParams.batterySOC,
      maxVoltage: maxV,
      maxLoading: maxL,
      health: gridState.gridHealthPct,
      violationsCount: gridState.activeViolations.length,
    };
    setSavedSnapshots((prev) => [newSnap, ...prev]);
  }, [gridState, whatIfParams, savedSnapshots]);

  // Handler: Live Simulation Disturbances
  const triggerLiveDisturbance = useCallback((type: string) => {
    setLiveSimDisturbance(type);
    let sMult = 1.0;
    let lMult = 1.0;
    let desc = '';

    if (type === 'HIGH SOLAR') {
      sMult = 1.65;
      lMult = 0.85;
      desc = 'High Solar Surge triggered (+1.9 MW export spike)';
    } else if (type === 'HIGH DEMAND') {
      sMult = 0.6;
      lMult = 1.7;
      desc = 'Feeder Heavy Demand triggered (EV fast-charging surge)';
    } else if (type === 'CLOUD TRANSIENT') {
      sMult = 0.5;
      lMult = 1.0;
      desc = 'Sudden Cloud Shadow passing over Solar Park 7B';
    } else if (type === 'FEEDER OVERLOAD') {
      sMult = 1.2;
      lMult = 1.8;
      desc = 'Line L10-11 Thermal Overload condition active';
    } else if (type === 'EXTREME EVENT') {
      sMult = 2.1;
      lMult = 0.5;
      desc = 'Extreme Solar Surplus beyond autonomous feasibility threshold';
    } else {
      desc = 'Normal operating baseline restored';
    }

    const nextState = simulatePowerFlow({ solarMultiplier: sMult, loadMultiplier: lMult });
    setGridState(nextState);
    setAppliedActionState(false);

    const nowStr = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLiveEvents((prev) => [
      { id: String(Date.now()), timeStr: nowStr, type: 'ALERT', message: desc },
      ...prev.slice(0, 15),
    ]);
  }, []);

  // Demo Control Handlers
  const startDemo = useCallback(() => {
    setIsDemoActive(true);
    setDemoStep(1);
    setActiveScenarioId('overvoltage');
    setActiveTab('command');
  }, []);

  const stopDemo = useCallback(() => {
    setIsDemoActive(false);
  }, []);

  const nextDemoStep = useCallback(() => {
    setDemoStep((prev) => Math.min(12, prev + 1));
  }, []);

  const prevDemoStep = useCallback(() => {
    setDemoStep((prev) => Math.max(1, prev - 1));
  }, []);

  const jumpToDemoStep = useCallback((step: number) => {
    setDemoStep(step);
  }, []);

  return (
    <GridContext.Provider
      value={{
        gridState,
        baselineState,
        activeScenario,
        activeScenarioId,
        forecastPoints,
        forecastMetrics,
        forecastHorizonMin,
        optimizationWeights,
        candidates,
        winningActionId,
        selectedActionId: activeCandidateId,
        selectedAction,
        explanation,
        feasibilityReport,
        isSimulating,
        simulationStage,
        appliedActionState,
        selectedBusId,
        whatIfParams,
        savedSnapshots,
        liveEvents,
        isLiveSim,
        liveSimDisturbance,
        isDemoActive,
        demoStep,
        activeTab,
        setActiveTab,
        selectScenario,
        setForecastHorizon,
        runPredictiveTwin,
        updateWeights,
        applyAction,
        selectCandidate: setSelectedCandidateId,
        resetToBaseline,
        setSelectedBusId,
        updateWhatIfParams,
        runWhatIfSimulation,
        saveCurrentSnapshot,
        toggleTieSwitch,
        setIsLiveSim,
        triggerLiveDisturbance,
        startDemo,
        stopDemo,
        nextDemoStep,
        prevDemoStep,
        jumpToDemoStep,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error('useGrid must be used within a GridProvider');
  }
  return context;
};
