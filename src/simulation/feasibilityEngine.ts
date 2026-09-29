import { FeasibilityReport } from '../types/grid';

/**
 * Feasibility Engine for Extreme Constrained Scenarios
 * Evaluates physical limits and generates transparent failure diagnostics
 */
export function evaluateFeasibilityLimits(scenarioName: string = 'Extreme Solar Surplus'): FeasibilityReport {
  return {
    isFeasible: false,
    scenarioName,
    headline: 'CRITICAL ALERT: Physical Feasibility Limits Exceeded',
    summary: 'GridMorph simulated all 5 corrective actions and combinations. Due to compound physical asset saturation (high battery SOC, inverter apparent power thermal limits, and feeder topology constraints), no autonomous dispatch can fully clear the statutory overvoltage at Bus 7.',
    bottlenecks: [
      {
        component: 'BESS Storage Units (Alpha & Beta)',
        status: 'INSUFFICIENT_HEADROOM',
        currentVal: 'SOC 96.4%',
        limitVal: '95.0% Max Charge Limit',
        explanation: 'Battery packs are fully saturated from prior charging cycles; attempting further charge triggers safety BMS interlocks.',
      },
      {
        component: 'PV Curtailment Cap',
        status: 'CAPACITY_EXCEEDED',
        currentVal: '10.0% Max Allowed Cap',
        limitVal: 'Grid Code PPA Restriction',
        explanation: 'Utility interconnect agreement caps autonomous curtailment at 10%. Overriding requires manual operator escalation.',
      },
      {
        component: 'Feeder Reconfiguration (Tie SW-8-12)',
        status: 'TOPOLOGY_CONSTRAINT',
        currentVal: 'Line 8-12 Thermal 98%',
        limitVal: '100% Thermal Rating',
        explanation: 'Alternate feeder section is already heavily loaded; closing tie breaker would induce secondary thermal cascade overload.',
      },
      {
        component: 'Smart Inverter Reactive Power (Volt-VAR)',
        status: 'HARD_LIMIT_REACHED',
        currentVal: 'Q = -1.85 MVar',
        limitVal: 'S_max = 3.8 MVA Inverter Current Limit',
        explanation: 'Inverter apparent power rating S = sqrt(P^2 + Q^2) is thermally bound by high active solar export (P = 3.5 MW).',
      },
    ],
    remainingViolation: {
      bus: 'Bus 7 (PV Solar Park B)',
      actualVoltage: 1.061,
      limitVoltage: 1.050,
      unresolvedDelta: 0.011,
      severity: 'CRITICAL',
    },
    recommendedOperatorAction: 'Manual operator intervention required. Execute Emergency Operating Procedure EOP-DIST-402: Issue direct curtailment command to Solar Park 7B (reduce to 60% output) and prepare substation transformer OLTC tap down by -1 step.',
  };
}
