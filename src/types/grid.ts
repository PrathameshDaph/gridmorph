export type BusStatus = 'healthy' | 'warning' | 'critical';
export type LineStatus = 'normal' | 'warning' | 'overload';
export type ViolationSeverity = 'WARNING' | 'HIGH' | 'CRITICAL';
export type ViolationType = 
  | 'OVERVOLTAGE' 
  | 'UNDERVOLTAGE' 
  | 'THERMAL_OVERLOAD' 
  | 'TRANSFORMER_OVERLOAD' 
  | 'HIGH_REVERSE_FLOW' 
  | 'BATTERY_SOC_LIMIT';

export interface Bus {
  id: number;
  name: string;
  voltage: number; // in p.u. (e.g. 1.02)
  nominalVoltageKv: number; // e.g. 11 kV
  loadP: number; // in MW
  loadQ: number; // in MVar
  genP: number; // in MW
  genQ: number; // in MVar
  voltageMinLimit: number; // 0.95 p.u.
  voltageMaxLimit: number; // 1.05 p.u.
  status: BusStatus;
  type: 'slack' | 'load' | 'pv' | 'battery' | 'junction';
  x: number; // svg coordinate
  y: number; // svg coordinate
  hasPV?: boolean;
  hasBattery?: boolean;
  hasSwitch?: boolean;
  isReverseFlow?: boolean;
}

export interface Line {
  id: string;
  from: number;
  to: number;
  loadingPct: number; // % of thermal limit
  currentAmps: number;
  thermalLimitAmps: number;
  rOhms: number;
  xOhms: number;
  status: LineStatus;
  isTieLine?: boolean;
  isOpen?: boolean;
  powerFlowMW: number;
  powerFlowMvar: number;
}

export interface PVUnit {
  id: string;
  busId: number;
  name: string;
  generationMW: number;
  capacityMW: number;
  curtailmentPct: number;
  curtailedMW: number;
  reactivePowerMvar: number;
  powerFactor: number;
  inverterCapacityMVA: number;
  irradianceWm2: number;
}

export interface BatteryUnit {
  id: string;
  busId: number;
  name: string;
  socPct: number; // State of Charge %
  capacityMWh: number;
  maxChargeMW: number;
  maxDischargeMW: number;
  currentDispatchMW: number; // + = charging (absorbing), - = discharging
  degradationCost: 'None' | 'Low' | 'Moderate' | 'High';
  status: 'charging' | 'discharging' | 'idle';
  cycleCount: number;
}

export interface SwitchTie {
  id: string;
  name: string;
  fromBus: number;
  toBus: number;
  isOpen: boolean;
  switchingCost: number; // in normalized unit cost
  maxOperationsPerDay: number;
  operationsToday: number;
}

export interface TransformerUnit {
  id: string;
  name: string;
  ratingMVA: number;
  currentMVA: number;
  loadingPct: number;
  status: 'normal' | 'warning' | 'overload';
  tapPosition: number;
}

export interface Violation {
  id: string;
  type: ViolationType;
  assetId: string | number;
  assetName: string;
  severity: ViolationSeverity;
  currentValue: number;
  limitValue: number;
  excessValue: number;
  headroom: number;
  unit: string;
  predictedTimeMinutes: number;
  timestamp: string;
  explanation: string;
}

export interface ActionCandidate {
  id: string;
  name: string;
  category: 'BATTERY' | 'CURTAILMENT' | 'RECONFIGURATION' | 'REACTIVE_POWER' | 'COMBINED';
  title: string;
  description: string;
  voltageBefore: number;
  voltageAfter: number;
  thermalBefore: number;
  thermalAfter: number;
  renewablePreservedPct: number;
  batteryWear: 'None' | 'Low' | 'Moderate' | 'High';
  batteryWearScore: number; // 0 - 100
  switchingOperations: number;
  isFeasible: boolean;
  infeasibilityReason?: string;
  scores: {
    gridSafety: number;
    renewableUtilization: number;
    batteryDegradation: number;
    switchingCost: number;
    totalWeighted: number;
  };
  details: {
    batteryDispatchMW?: number;
    curtailmentPct?: number;
    switchToggled?: boolean;
    reactivePowerMvar?: number;
  };
}

export interface OptimizationWeights {
  gridSafety: number; // default 40
  renewableUtilization: number; // default 30
  batteryDegradation: number; // default 15
  switchingCost: number; // default 15
}

export interface DecisionExplanation {
  recommendedActionId: string;
  recommendedActionName: string;
  headline: string;
  whyBullets: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  expectedResult: {
    voltageChange: string;
    renewableUtilization: string;
    batteryImpact: string;
    switchingOps: number;
    thermalRelief: string;
  };
  tradeOffSummary: string;
  constraintHeadroom: {
    name: string;
    status: 'OPTIMAL' | 'AVAILABLE' | 'CONSTRAINED' | 'EXHAUSTED';
    value: string;
  }[];
}

export interface FeasibilityReport {
  isFeasible: boolean;
  scenarioName: string;
  headline: string;
  summary: string;
  bottlenecks: {
    component: string;
    status: 'INSUFFICIENT_HEADROOM' | 'CAPACITY_EXCEEDED' | 'TOPOLOGY_CONSTRAINT' | 'HARD_LIMIT_REACHED';
    currentVal: string;
    limitVal: string;
    explanation: string;
  }[];
  remainingViolation: {
    bus: string;
    actualVoltage: number;
    limitVoltage: number;
    unresolvedDelta: number;
    severity: ViolationSeverity;
  };
  recommendedOperatorAction: string;
}

export interface ForecastPoint {
  timeOffsetMin: number; // e.g. 0, 15, 30, 45, 60, 90, 120
  timeLabel: string; // e.g. "15:45", "+30 min"
  solarRF: number; // Random Forest prediction (MW)
  solarPersistence: number; // Persistence baseline (MW)
  solarActual?: number; // Actual historical / ground truth
  solarConfidenceLow: number;
  solarConfidenceHigh: number;
  loadRF: number; // RF Load prediction (MW)
  loadPersistence: number;
  loadActual?: number;
  netSurplusMW: number;
  predictedMaxVoltagePu: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface GridState {
  timestamp: string;
  buses: Bus[];
  lines: Line[];
  pvUnits: PVUnit[];
  batteries: BatteryUnit[];
  switchTie: SwitchTie;
  transformer: TransformerUnit;
  frequencyHz: number;
  totalGenerationMW: number;
  totalLoadMW: number;
  totalLossesMW: number;
  gridHealthPct: number;
  renewableUtilizationPct: number;
  activeViolations: Violation[];
}

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  solarMultiplier: number;
  loadMultiplier: number;
  batterySOC: number;
  curtailmentCapPct: number;
  tieSwitchClosed: boolean;
  expectedOutcome: string;
}

export interface SimulationEvent {
  id: string;
  timeStr: string;
  type: 'INFO' | 'SURGE' | 'RISK' | 'VIOLATION' | 'EVAL' | 'SELECT' | 'VALIDATE' | 'RESOLVE' | 'ALERT';
  message: string;
  details?: string;
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  narration: string;
  durationSec: number;
  scenarioId?: string;
  highlightAssetId?: string | number;
  activeTab?: string;
}
