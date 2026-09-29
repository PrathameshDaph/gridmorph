import { ActionCandidate, DecisionExplanation, GridState, OptimizationWeights } from '../types/grid';

/**
 * Generate Human-in-the-Loop Explainable Engineering Decision Rationale
 */
export function generateDecisionExplanation(
  action: ActionCandidate,
  currentState: GridState,
  weights: OptimizationWeights
): DecisionExplanation {
  const bus7 = currentState.buses.find((b) => b.id === 7) || currentState.buses[6];
  const bus7Excess = Number((bus7.voltage - 1.050).toFixed(3));
  const excessStr = bus7Excess > 0 ? `+${bus7Excess} pu` : '0.000 pu';

  let headline = `Optimal Strategy: ${action.name}`;
  let whyBullets: string[] = [];
  let tradeOff = '';

  if (action.id === 'ACT-Q-CONTROL') {
    headline = 'Optimal Response: Reactive Power Control (Volt-VAR)';
    whyBullets = [
      `Bus 7 critical node exceeded the upper statutory limit by ${excessStr} (${bus7.voltage.toFixed(3)} pu vs 1.050 pu limit).`,
      `Inverter reactive power absorption (Q = -0.95 MVar) pulls terminal voltage back to 1.048 pu with +0.002 pu safe margin.`,
      `Preserves 100% of available solar generation — zero clean energy curtailment incurred.`,
      `Avoids battery electrochemical degradation and preserves BESS state-of-charge for evening peak dispatch.`,
      `Zero physical breaker switching operations required, maximizing distribution asset lifespan.`,
    ];
    tradeOff = 'Compared to PV Curtailment (which wastes 18% green energy) and Battery Dispatch (which expends 1.7 MWh cycling capacity), Reactive Power Control achieves statutory compliance at zero variable operating cost.';
  } else if (action.id === 'ACT-COMBINED') {
    headline = 'Optimal Response: Co-Optimized Battery + Volt-VAR';
    whyBullets = [
      `Delivers highest combined voltage stabilization, reducing peak feeder voltage from ${bus7.voltage.toFixed(3)} pu to 1.039 pu.`,
      `Maintains 100% renewable energy capture without shedding solar generation.`,
      `Operates BESS Alpha & Beta within conservative C-rates (0.4C), resulting in minimal battery wear score impact.`,
      `Provides +0.011 pu headroom against future sudden irradiance spikes or cloud clearing events.`,
    ];
    tradeOff = 'Provides superior voltage buffer compared to single-mechanism actions while keeping battery degradation below 12%.';
  } else if (action.id === 'ACT-RECONFIG') {
    headline = 'Optimal Response: Feeder Topology Reconfiguration';
    whyBullets = [
      `Closing Tie Switch SW-8-12 redistributes downstream commercial load (0.95 MW) across alternate feeder trunk.`,
      `Relieves feeder line thermal loading from ${action.thermalBefore}% to ${action.thermalAfter}%.`,
      `Restores bus voltages across all downstream nodes without curtailing renewable generation.`,
      `Feeder recloser breaker count remains within daily allowable limit (1/4 cycles).`,
    ];
    tradeOff = 'Selected over inverter Q-control because it simultaneously resolves upstream line thermal congestion and bus overvoltage.';
  } else if (action.id === 'ACT-BATTERY') {
    headline = 'Optimal Response: Battery Storage Peak Buffering';
    whyBullets = [
      `Dispatches BESS Alpha (+1.0 MW) and BESS Beta (+0.7 MW) into rapid charge mode.`,
      `Directly absorbs local reverse solar power at feeder midpoint, stabilizing terminal voltage.`,
      `Captures 98.5% of surplus solar energy for subsequent peak-hours discharge.`,
      `Maintains battery SOC within safe operational threshold (< 85%).`,
    ];
    tradeOff = 'Preferred when inverter reactive power capacity is constrained and battery capacity is readily available.';
  } else {
    headline = 'Optimal Response: Smart PV Curtailment';
    whyBullets = [
      `Immediately sheds active solar generation at high-penetration buses (Bus 7 & Bus 3).`,
      `Guaranteed rapid voltage reduction to 1.045 pu within inverter control loop time constants.`,
      `Incurred renewable loss is minimized to 18% of peak instantaneous output.`,
    ];
    tradeOff = 'Used as a rapid fail-safe measure when energy storage or reactive headroom are unavailable.';
  }

  const constraintHeadroom = [
    {
      name: 'Bus 7 Voltage Margin',
      status: action.voltageAfter <= 1.048 ? 'OPTIMAL' : action.voltageAfter <= 1.050 ? 'AVAILABLE' : 'CONSTRAINED',
      value: `${(1.050 - action.voltageAfter).toFixed(3)} pu headroom`,
    },
    {
      name: 'Line Thermal Headroom',
      status: action.thermalAfter < 80 ? 'OPTIMAL' : action.thermalAfter <= 100 ? 'AVAILABLE' : 'CONSTRAINED',
      value: `${100 - action.thermalAfter}% capacity available`,
    },
    {
      name: 'PV Inverter Q Headroom',
      status: action.details.reactivePowerMvar ? 'AVAILABLE' : 'OPTIMAL',
      value: '1.25 MVar available',
    },
    {
      name: 'BESS State-of-Charge Headroom',
      status: 'AVAILABLE',
      value: `${100 - currentState.batteries[0].socPct}% charging capacity`,
    },
  ];

  return {
    recommendedActionId: action.id,
    recommendedActionName: action.name,
    headline,
    whyBullets,
    confidence: 'HIGH',
    expectedResult: {
      voltageChange: `${action.voltageBefore.toFixed(3)} → ${action.voltageAfter.toFixed(3)} pu`,
      renewableUtilization: `${action.renewablePreservedPct}%`,
      batteryImpact: action.batteryWear === 'None' ? '0% (Avoided)' : action.batteryWear,
      switchingOps: action.switchingOperations,
      thermalRelief: `${action.thermalBefore}% → ${action.thermalAfter}%`,
    },
    tradeOffSummary: tradeOff,
    constraintHeadroom: constraintHeadroom as DecisionExplanation['constraintHeadroom'],
  };
}
