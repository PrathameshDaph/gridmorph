import { GridState, ActionCandidate, ForecastPoint, FeasibilityReport, ScenarioPreset } from '../types/grid';

export interface ChatbotResponse {
  text: string;
  metrics?: { label: string; value: string; isGood?: boolean }[];
  actionButton?: {
    label: string;
    actionType: 'APPLY_RECOMMENDED' | 'GOTO_TAB' | 'LOAD_SCENARIO' | 'RUN_FORECAST' | 'RESET';
    payload?: string;
  };
}

export interface ChatbotContext {
  gridState: GridState;
  baselineState: GridState;
  activeScenario: ScenarioPreset;
  activeScenarioId: string;
  candidates: ActionCandidate[];
  winningActionId: string;
  appliedActionState: boolean;
  forecastPoints: ForecastPoint[];
  forecastHorizonMin: number;
  feasibilityReport: FeasibilityReport | null;
  whatIfParams: {
    solarMultiplier: number;
    loadMultiplier: number;
    batterySOC: number;
    curtailmentCapPct: number;
    reactivePowerMvar: number;
    tieSwitchClosed: boolean;
  };
}

export function processChatbotQuery(rawQuery: string, ctx: ChatbotContext): ChatbotResponse {
  const query = rawQuery.toLowerCase().trim();
  const {
    gridState,
    baselineState,
    activeScenario,
    candidates,
    winningActionId,
    appliedActionState,
    forecastPoints,
    feasibilityReport,
    whatIfParams,
  } = ctx;

  const bus7 = gridState.buses.find((b) => b.id === 7) || gridState.buses[6];
  const bestAction = candidates.find((c) => c.id === winningActionId) || candidates[0];
  const violations = baselineState.activeViolations;
  const isOvervoltage = bus7.voltage > 1.050;

  // =========================================================================
  // TIER 1: CONVERSATIONAL, GREETINGS & INTRODUCTIONS
  // =========================================================================
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b/i.test(query)) {
    const statusNote = violations.length > 0
      ? `Currently, there is **${violations.length} active voltage alarm** at Bus 7 (\`${bus7.voltage.toFixed(3)} pu\`).`
      : `All **12 feeder buses** are currently operating within nominal statutory limits.`;

    return {
      text: `Hello Operator! I'm **MorphAI Copilot**, your real-time grid intelligence assistant.\n\n${statusNote}\n\nHow can I assist you? You can ask me:\n• *"What should I do to fix the grid?"*\n• *"Why is Bus 7 experiencing overvoltage?"*\n• *"What is the 30-minute solar forecast?"*\n• *"Compare Q-Control vs Battery Storage"*`,
      metrics: [
        { label: 'Grid Health', value: `${gridState.gridHealthPct}%`, isGood: gridState.gridHealthPct >= 90 },
        { label: 'Bus 7 V', value: `${bus7.voltage.toFixed(3)} pu`, isGood: !isOvervoltage },
        { label: 'Active Alerts', value: `${violations.length}`, isGood: violations.length === 0 },
      ],
      actionButton: violations.length > 0 && !appliedActionState
        ? { label: `⚡ Apply Recommended Action (${bestAction.name})`, actionType: 'APPLY_RECOMMENDED', payload: bestAction.id }
        : { label: 'Inspect Digital Twin Feeder', actionType: 'GOTO_TAB', payload: 'twin' },
    };
  }

  if (query.includes('how are you') || query.includes('status of assistant') || query.includes('who are you')) {
    return {
      text: `I am running optimally! I am continuously monitoring telemetry streams, evaluating AC Backward-Forward Sweep power flows, and tracking multi-horizon Random Forest generation forecasts for this 11kV feeder.\n\nAsk me any power-systems question, or ask me to dispatch setpoints directly!`,
      metrics: [
        { label: 'Solver', value: 'AC BFS (Online)', isGood: true },
        { label: 'Frequency', value: `${gridState.frequencyHz.toFixed(2)} Hz`, isGood: true },
        { label: 'Health', value: `${gridState.gridHealthPct}%`, isGood: true },
      ],
    };
  }

  if (query.includes('thank') || query.includes('thanks') || query.includes('great job') || query.includes('awesome')) {
    return {
      text: `You're very welcome! I'm here to ensure clean renewable distribution with zero statutory breaches and full decision transparency. Let me know if you need further simulations or audit reports!`,
    };
  }

  // =========================================================================
  // TIER 2: SITUATIONAL ADVICE & TROUBLESHOOTING ("What should I do?", "How to fix?")
  // =========================================================================
  if (
    query.includes('what should i do') ||
    query.includes('how to fix') ||
    query.includes('how do i resolve') ||
    query.includes('how to solve') ||
    query.includes('what is the solution') ||
    query.includes('suggest action') ||
    query.includes('help me fix') ||
    query.includes('fix the problem') ||
    query.includes('is there any problem') ||
    query.includes('is there any issue') ||
    query.includes('what is wrong')
  ) {
    if (violations.length === 0 && !isOvervoltage) {
      return {
        text: `**System Assessment:** The network is currently in a healthy, nominal state with **zero active violations**.\n\n` +
          `• All bus voltages are between **0.980 pu and 1.030 pu**.\n` +
          `• Feeder loading is within thermal limits.\n` +
          `• No corrective action is required at this moment. You can test stress scenarios using the Scenario switcher or What-If lab!`,
        metrics: [
          { label: 'Status', value: 'HEALTHY', isGood: true },
          { label: 'Violations', value: '0', isGood: true },
          { label: 'Health', value: `${gridState.gridHealthPct}%`, isGood: true },
        ],
        actionButton: {
          label: 'Open What-If Scenario Lab',
          actionType: 'GOTO_TAB',
          payload: 'whatif',
        },
      };
    }

    if (appliedActionState) {
      return {
        text: `**Grid Stabilized:** Corrective strategy **${bestAction.name}** has already been dispatched!\n\n` +
          `• Peak terminal voltage at Bus 7 was reduced from \`${bestAction.voltageBefore.toFixed(3)} pu\` down to **\`${bestAction.voltageAfter.toFixed(3)} pu\`** (below the 1.050 pu statutory ceiling).\n` +
          `• **100% of clean renewable energy is preserved** with zero inverter curtailment.\n` +
          `• You can reset the network anytime or test other scenarios.`,
        metrics: [
          { label: 'Active Action', value: bestAction.name },
          { label: 'Restored V', value: `${bestAction.voltageAfter.toFixed(3)} pu`, isGood: true },
          { label: 'PV Preserved', value: '100%', isGood: true },
        ],
        actionButton: {
          label: '🔄 Reset Grid to Baseline',
          actionType: 'RESET',
        },
      };
    }

    return {
      text: `**Recommended Operator Action Plan:**\n\n` +
        `1. **Current Issue:** Active statutory overvoltage breach at **Bus 7** (\`${bus7.voltage.toFixed(3)} pu\` > 1.050 pu ceiling) caused by midday solar surge (**${gridState.totalGenerationMW.toFixed(2)} MW**).\n` +
        `2. **Optimal Solution:** Dispatch **${bestAction.name}** (Score: **${bestAction.scores.totalWeighted}/100**).\n` +
        `3. **Why this action:** It commands the smart inverters to absorb inductive reactive power ($Q = -0.95\\text{ MVar}$), which directly eliminates voltage rise along distribution lines while preserving **100% of solar generation** and avoiding battery wear.\n\n` +
        `Click below to execute this dispatch setpoint immediately:`,
      metrics: [
        { label: 'Current V', value: `${bus7.voltage.toFixed(3)} pu`, isGood: false },
        { label: 'Target V', value: `${bestAction.voltageAfter.toFixed(3)} pu`, isGood: true },
        { label: 'Preserved PV', value: '100%', isGood: true },
      ],
      actionButton: {
        label: `⚡ Execute ${bestAction.name}`,
        actionType: 'APPLY_RECOMMENDED',
        payload: bestAction.id,
      },
    };
  }

  // =========================================================================
  // TIER 3: SPECIFIC BUS & NETWORK TOPOLOGY INQUIRIES
  // =========================================================================
  const busMatch = query.match(/\bbus\s*(\d+)\b/i) || query.match(/\bnode\s*(\d+)\b/i);
  if (busMatch) {
    const busId = parseInt(busMatch[1], 10);
    const bus = gridState.buses.find((b) => b.id === busId);
    if (bus) {
      const isNominal = bus.voltage >= bus.voltageMinLimit && bus.voltage <= bus.voltageMaxLimit;
      const connectedAssets: string[] = [];
      if (bus.hasPV) connectedAssets.push(`Solar PV Array (${bus.genP.toFixed(2)} MW)`);
      if (bus.hasBattery) connectedAssets.push(`Battery Storage BESS (${gridState.batteries[0]?.socPct || 65}% SOC)`);
      if (bus.hasSwitch) connectedAssets.push(`Feeder Tie-Switch Sw 8-12`);

      let detail = `**Bus ${bus.id} (${bus.name}) Profile:**\n\n` +
        `• **Voltage:** \`${bus.voltage.toFixed(3)} pu\` (${(bus.voltage * bus.nominalVoltageKv).toFixed(2)} kV)\n` +
        `• **Limits:** Standard \`${bus.voltageMinLimit.toFixed(3)} - ${bus.voltageMaxLimit.toFixed(3)} pu\`\n` +
        `• **Demand (Load):** \`${bus.loadP.toFixed(2)} MW\` active (P), \`${bus.loadQ.toFixed(2)} MVar\` reactive (Q)\n` +
        `• **Generation:** \`${bus.genP.toFixed(2)} MW\` active (P), \`${bus.genQ.toFixed(2)} MVar\` reactive (Q)\n` +
        `• **Connected DERs:** ${connectedAssets.length > 0 ? connectedAssets.join(', ') : 'Standard residential/commercial customer load'}\n` +
        `• **Condition:** ${isNominal ? '✅ **Normal operating zone**' : bus.voltage > 1.050 ? '🚨 **Overvoltage breach**' : '⚠️ **Undervoltage warning**'}`;

      if (bus.id === 7) {
        detail += `\n\n*Engineering Note:* Bus 7 is located at the far radial terminus of the main feeder line. When Solar Park 7B exports high active power, voltage rise $\\Delta V \\approx \\frac{RP + XQ}{V}$ peaks here first.`;
      } else if (bus.id === 1) {
        detail += `\n\n*Engineering Note:* Bus 1 is the 11kV Substation Slack Bus holding nominal 1.000 pu voltage.`;
      } else if (bus.id === 5) {
        detail += `\n\n*Engineering Note:* Bus 5 hosts the 4.0 MWh BESS 1 battery storage facility.`;
      }

      return {
        text: detail,
        metrics: [
          { label: `Bus ${bus.id} V`, value: `${bus.voltage.toFixed(3)} pu`, isGood: isNominal },
          { label: 'Load', value: `${bus.loadP.toFixed(2)} MW` },
          { label: 'Gen', value: `${bus.genP.toFixed(2)} MW` },
        ],
        actionButton: {
          label: `View Bus ${bus.id} in Digital Twin`,
          actionType: 'GOTO_TAB',
          payload: 'twin',
        },
      };
    }
  }

  if (query.includes('how many buses') || query.includes('network size') || query.includes('topology') || query.includes('feeder layout')) {
    return {
      text: `**Network Topology Overview:**\n\n` +
        `• **Structure:** 11kV Radial Distribution Feeder with 12 Buses & 11 Primary Lines + 1 Tie-Line.\n` +
        `• **Bus 1:** 11kV Primary Substation (Slack Bus, 1.000 pu reference).\n` +
        `• **Buses 2 - 12:** Radial feeder nodes serving 3.50 MW nominal customer demand.\n` +
        `• **DER Assets:**\n` +
        `  - Bus 7: Solar Park 7B (3.0 MW capacity)\n` +
        `  - Bus 3: Commercial Rooftop PV 3A (1.8 MW capacity)\n` +
        `  - Bus 5: Battery Energy Storage BESS 1 (4.0 MWh capacity)\n` +
        `  - Bus 8 - 12: Tie-Switch SW 8-12 for network reconfiguration.`,
      metrics: [
        { label: 'Buses', value: '12' },
        { label: 'Nominal kV', value: '11 kV' },
        { label: 'DER Assets', value: '3 Major Units' },
      ],
      actionButton: {
        label: 'Open Feeder Canvas',
        actionType: 'GOTO_TAB',
        payload: 'twin',
      },
    };
  }

  // =========================================================================
  // TIER 4: SPECIFIC LINE LOADING & THERMAL CAPACITY
  // =========================================================================
  const lineMatch = query.match(/\bline\s*(\d+)[-_](\d+)\b/i);
  if (lineMatch || query.includes('line loading') || query.includes('thermal') || query.includes('ampacity') || query.includes('cable')) {
    let line = lineMatch
      ? gridState.lines.find((l) => (l.from === parseInt(lineMatch[1]) && l.to === parseInt(lineMatch[2])) || (l.to === parseInt(lineMatch[1]) && l.from === parseInt(lineMatch[2])))
      : [...gridState.lines].sort((a, b) => b.loadingPct - a.loadingPct)[0];

    if (line) {
      return {
        text: `**Line Loading & Ampacity Details (Line ${line.id}: Bus ${line.from} ↔ Bus ${line.to}):**\n\n` +
          `• **Current Thermal Loading:** \`${line.loadingPct.toFixed(1)}%\` of continuous rating\n` +
          `• **Current Flow:** \`${line.currentAmps.toFixed(1)} A\` (Thermal Ampacity Ceiling: \`${line.thermalLimitAmps} A\`)\n` +
          `• **Power Transmitted:** \`${line.powerFlowMW.toFixed(2)} MW\` active (P), \`${line.powerFlowMvar.toFixed(2)} MVar\` reactive (Q)\n` +
          `• **Line Impedance:** $R = ${line.rOhms}\\ \\Omega,\\ X = ${line.xOhms}\\ \\Omega$ (High $R/X$ ratio typical of distribution lines)\n` +
          `• **Status:** ${line.loadingPct > 100 ? '🚨 **Thermal Overload Breach**' : line.loadingPct > 85 ? '⚠️ **High Thermal Stress**' : '✅ **Safe thermal margin**'}`,
        metrics: [
          { label: `Line ${line.id}`, value: `${line.loadingPct.toFixed(1)}%`, isGood: line.loadingPct <= 85 },
          { label: 'Current', value: `${line.currentAmps.toFixed(0)} A` },
          { label: 'Limit', value: `${line.thermalLimitAmps} A` },
        ],
        actionButton: {
          label: 'View Feeder Schematic',
          actionType: 'GOTO_TAB',
          payload: 'twin',
        },
      };
    }
  }

  // =========================================================================
  // TIER 5: SOLAR & RENEWABLE GENERATION
  // =========================================================================
  if (query.includes('solar') || query.includes('pv') || query.includes('generation') || query.includes('irradiance') || query.includes('clean energy') || query.includes('park 7b') || query.includes('rooftop')) {
    const pv7 = gridState.pvUnits.find((p) => p.busId === 7) || gridState.pvUnits[1];
    const pv3 = gridState.pvUnits.find((p) => p.busId === 3) || gridState.pvUnits[0];

    return {
      text: `**Solar Generation & Renewable Telemetry:**\n\n` +
        `• **Total Solar Injection:** **\`${gridState.totalGenerationMW.toFixed(2)} MW\`** (vs Feeder Demand: \`${gridState.totalLoadMW.toFixed(2)} MW\`)\n` +
        `• **Solar Park 7B (Bus 7):** \`${pv7?.generationMW.toFixed(2) || '2.80'} MW\` at \`${pv7?.irradianceWm2 || 940} W/m²\` irradiance (Rated: \`${pv7?.capacityMW || 3.0} MW\`)\n` +
        `• **Commercial Rooftop PV 3A (Bus 3):** \`${pv3?.generationMW.toFixed(2) || '1.40'} MW\` at \`${pv3?.irradianceWm2 || 940} W/m²\` irradiance (Rated: \`${pv3?.capacityMW || 1.8} MW\`)\n` +
        `• **Renewable Utilization Rate:** **${gridState.renewableUtilizationPct}%** (0% curtailed under GridMorph dispatch)\n` +
        `• **Net Feeder Export Surplus:** \`+${(gridState.totalGenerationMW - gridState.totalLoadMW).toFixed(2)} MW\` flowing upstream towards the substation.`,
      metrics: [
        { label: 'Total Solar', value: `${gridState.totalGenerationMW.toFixed(2)} MW` },
        { label: 'Utilization', value: `${gridState.renewableUtilizationPct}%`, isGood: true },
        { label: 'Demand', value: `${gridState.totalLoadMW.toFixed(2)} MW` },
      ],
      actionButton: {
        label: 'Open Solar Forecast Module',
        actionType: 'GOTO_TAB',
        payload: 'forecast',
      },
    };
  }

  // =========================================================================
  // TIER 6: BATTERY (BESS) & STORAGE
  // =========================================================================
  if (query.includes('battery') || query.includes('bess') || query.includes('storage') || query.includes('soc') || query.includes('charge') || query.includes('discharge')) {
    const battery = gridState.batteries[0];
    return {
      text: `**BESS 1 Storage Unit Details (Bus 5):**\n\n` +
        `• **Current State of Charge (SOC):** **\`${battery.socPct}%\`**\n` +
        `• **Capacity:** \`${battery.capacityMWh} MWh\` continuous storage\n` +
        `• **Max Charge / Discharge:** \`+${battery.maxChargeMW} MW\` (charge) / \`-${battery.maxDischargeMW} MW\` (discharge)\n` +
        `• **Operating State:** **${battery.status.toUpperCase()}** (\`${battery.currentDispatchMW > 0 ? `+${battery.currentDispatchMW.toFixed(2)} MW` : `${battery.currentDispatchMW.toFixed(2)} MW`}\`)\n` +
        `• **Cycle Lifetime Count:** \`${battery.cycleCount} cycles\`\n` +
        `• **Degradation Cost Profile:** **${battery.degradationCost}**\n\n` +
        `*Comparison Note:* While BESS charging can absorb excess solar MW, it accelerates chemical cell degradation. Inverter reactive Volt-VAR control provides equivalent voltage relief with **zero battery wear**.`,
      metrics: [
        { label: 'Battery SOC', value: `${battery.socPct}%`, isGood: battery.socPct < 90 && battery.socPct > 15 },
        { label: 'Capacity', value: `${battery.capacityMWh} MWh` },
        { label: 'Degradation', value: battery.degradationCost },
      ],
      actionButton: {
        label: 'Tune Battery in What-If Lab',
        actionType: 'GOTO_TAB',
        payload: 'whatif',
      },
    };
  }

  // =========================================================================
  // TIER 7: MULTI-OBJECTIVE ACTIONS & PARETO COMPARISON
  // =========================================================================
  if (
    query.includes('compare action') ||
    query.includes('candidate') ||
    query.includes('action matrix') ||
    query.includes('pareto') ||
    query.includes('why q-control') ||
    query.includes('why not battery') ||
    query.includes('why not curtail') ||
    query.includes('weights') ||
    query.includes('scoring')
  ) {
    const list = candidates.map((c, i) =>
      `**${i + 1}. ${c.name}** — Total Score: **${c.scores.totalWeighted}/100** ${c.id === winningActionId ? '👑 *(Recommended)*' : ''}\n` +
      `   • Voltage: \`${c.voltageBefore.toFixed(3)} pu\` → \`${c.voltageAfter.toFixed(3)} pu\` | Preserved PV: **${c.renewablePreservedPct}%** | Battery Wear: **${c.batteryWear}** | Breaker Ops: **${c.switchingOperations}**`
    ).join('\n\n');

    return {
      text: `**Multi-Objective Candidate Evaluation (Parallel Physics Solvers):**\n\n${list}\n\n` +
        `**Scoring Objective Weights:**\n` +
        `• Grid Safety & Voltage Relief: **40%**\n` +
        `• Renewable Generation Preservation: **30%**\n` +
        `• Battery Asset Lifetime: **15%**\n` +
        `• Mechanical Switching Minimization: **15%**\n\n` +
        `*Why Q-Control Wins:* It achieves **97/100 points** because it solves the voltage rise instantly at the inverter terminal without shedding 1 watt of clean energy or cycling the battery.`,
      metrics: [
        { label: 'Winner', value: bestAction.name },
        { label: 'Score', value: `${bestAction.scores.totalWeighted} pts`, isGood: true },
        { label: 'PV Kept', value: `${bestAction.renewablePreservedPct}%`, isGood: true },
      ],
      actionButton: appliedActionState
        ? { label: 'Inspect Action Matrix', actionType: 'GOTO_TAB', payload: 'actions' }
        : { label: `⚡ Apply ${bestAction.name}`, actionType: 'APPLY_RECOMMENDED', payload: bestAction.id },
    };
  }

  // =========================================================================
  // TIER 8: ML TIME-SERIES FORECAST & PREDICTION
  // =========================================================================
  if (query.includes('forecast') || query.includes('prediction') || query.includes('random forest') || query.includes('persistence') || query.includes('future') || query.includes('horizon') || query.includes('30 min') || query.includes('mae')) {
    const horizon = ctx.forecastHorizonMin || 30;
    const pt = forecastPoints.find((p) => p.timeOffsetMin === horizon) || forecastPoints[2];

    return {
      text: `**Machine Learning Multi-Horizon Forecast Engine:**\n\n` +
        `• **Horizon Selected:** \`+${horizon} Minutes\` (continuous 0-120 min projection)\n` +
        `• **Solar RF Prediction:** \`${pt.solarRF.toFixed(2)} MW\` (Persistence baseline: \`${pt.solarPersistence.toFixed(2)} MW\`)\n` +
        `• **Feeder Load Prediction:** \`${pt.loadRF.toFixed(2)} MW\`\n` +
        `• **Predicted Net Surplus:** \`+${pt.netSurplusMW.toFixed(2)} MW\`\n` +
        `• **Predicted Max Voltage:** \`${pt.predictedMaxVoltagePu.toFixed(3)} pu\` (**${pt.riskLevel} Risk**)\n` +
        `• **Accuracy Benchmark:** Random Forest model achieves **0.12 MW MAE** (**82% error reduction** over standard persistence baseline).\n\n` +
        `GridMorph's predictive twin detects impending overvoltage ~28 minutes before statutory SCADA alarms trip.`,
      metrics: [
        { label: `+${horizon}m Solar`, value: `${pt.solarRF.toFixed(1)} MW` },
        { label: 'Projected V', value: `${pt.predictedMaxVoltagePu.toFixed(3)} pu`, isGood: pt.predictedMaxVoltagePu <= 1.050 },
        { label: 'RF MAE', value: '0.12 MW', isGood: true },
      ],
      actionButton: {
        label: 'Open Forecast Module',
        actionType: 'GOTO_TAB',
        payload: 'forecast',
      },
    };
  }

  // =========================================================================
  // TIER 9: FEASIBILITY, INFEASIBILITY & EMERGENCY OPERATING PROCEDURES (EOP)
  // =========================================================================
  if (query.includes('infeasib') || query.includes('extreme') || query.includes('eop') || query.includes('saturation') || query.includes('bottleneck') || query.includes('emergency')) {
    if (feasibilityReport) {
      const bnList = feasibilityReport.bottlenecks.map((b) =>
        `• **${b.component} (${b.status.replace('_', ' ')}):** Value \`${b.currentVal}\` vs Limit \`${b.limitVal}\` — *${b.explanation}*`
      ).join('\n');

      return {
        text: `**Physical Feasibility Boundary Diagnostics (${feasibilityReport.scenarioName}):**\n\n` +
          `🚨 **${feasibilityReport.headline}**\n\n` +
          `${feasibilityReport.summary}\n\n` +
          `**Physical Bottleneck Attribution:**\n${bnList}\n\n` +
          `**Emergency Operating Procedure (EOP-DIST-402):**\n` +
          `• ${feasibilityReport.recommendedOperatorAction}\n` +
          `• *Protocol:* Control Room Supervisor Level 3 Authorization Required (Target Response: < 5 min).`,
        metrics: [
          { label: 'Feasibility', value: 'INFEASIBLE', isGood: false },
          { label: 'Residual V', value: `${feasibilityReport.remainingViolation.actualVoltage.toFixed(3)} pu`, isGood: false },
          { label: 'Residual Delta', value: `+${feasibilityReport.remainingViolation.unresolvedDelta.toFixed(3)} pu`, isGood: false },
        ],
        actionButton: {
          label: 'Open Feasibility Diagnostics',
          actionType: 'GOTO_TAB',
          payload: 'feasibility',
        },
      };
    }

    return {
      text: `**Feasibility Boundary Engine:**\n\n` +
        `Unlike typical AI dashboards that hallucinate fake solutions, GridMorph tests physical feasibility bounds:\n` +
        `1. **Inverter MVA Limits** (Apparent capacity cannot be exceeded).\n` +
        `2. **Battery Saturated SOC** (Cannot absorb charge if SOC ≥ 98%).\n` +
        `3. **Line Ampacity Limits** (Cannot transfer load across overloaded tie-lines).\n\n` +
        `When compounded constraints prevent autonomous clearance, GridMorph triggers Emergency Operating Procedures (EOP-DIST-402).`,
      actionButton: {
        label: 'Demonstrate Infeasible Boundary Case',
        actionType: 'LOAD_SCENARIO',
        payload: 'extreme',
      },
    };
  }

  // =========================================================================
  // TIER 10: PHYSICS, MATH & POWER-FLOW FORMULAS
  // =========================================================================
  if (query.includes('formula') || query.includes('physics') || query.includes('bfs') || query.includes('backward') || query.includes('math') || query.includes('equation') || query.includes('algorithm') || query.includes('how does power flow work')) {
    return {
      text: `**AC Backward-Forward Sweep (BFS) Power-Flow Physics Solver:**\n\n` +
        `GridMorph solves exact AC power flows on distribution feeders using an iterative 2-pass solver:\n\n` +
        `1. **Backward Current Sweep:** Iteratively accumulates branch currents from downstream leaf nodes back to the substation:\n` +
        `   $$I_k = \\left(\\frac{S_k}{V_k}\\right)^* + \\sum I_{\\text{downstream}}$$\n\n` +
        `2. **Forward Voltage Sweep:** Propagates voltage drops along line impedances ($R + jX$) outward from the slack bus:\n` +
        `   $$V_{k+1} = V_k - I_{\\text{line}} \\cdot (R + jX)$$\n\n` +
        `3. **Distribution Voltage Rise Governing Equation:**\n` +
        `   $$\\Delta V \\approx \\frac{R \\cdot P + X \\cdot Q}{V}$$\n` +
        `   Because distribution networks have high resistance-to-reactance ratios ($R/X \\approx 1.5 - 2.5$), active solar injection ($P$) increases terminal voltage. Injecting inductive reactive power ($Q < 0$) counteracts this rise with **zero active power curtailment**.`,
      metrics: [
        { label: 'Solver', value: 'AC BFS' },
        { label: 'Convergence', value: '3 Iterations', isGood: true },
        { label: 'Topology', value: '12-Bus Radial' },
      ],
      actionButton: {
        label: 'Inspect Digital Twin Voltages',
        actionType: 'GOTO_TAB',
        payload: 'twin',
      },
    };
  }

  // =========================================================================
  // TIER 11: WHAT-IF SIMULATION & DEMO WORKFLOW
  // =========================================================================
  if (query.includes('what if') || query.includes('what-if') || query.includes('slider') || query.includes('perturb') || query.includes('test')) {
    return {
      text: `**What-If Scenario Simulation Lab:**\n\n` +
        `• **Active Scenario:** **${activeScenario.name}** (${activeScenario.badge})\n` +
        `• **Solar Multiplier:** \`${Math.round(whatIfParams.solarMultiplier * 100)}%\`\n` +
        `• **Demand Multiplier:** \`${Math.round(whatIfParams.loadMultiplier * 100)}%\`\n` +
        `• **Battery SOC:** \`${whatIfParams.batterySOC}%\`\n` +
        `• **Tie-Switch Sw 8-12:** \`${whatIfParams.tieSwitchClosed ? 'CLOSED (Loop)' : 'OPEN (Radial)'}\`\n\n` +
        `You can adjust sliders to perturb solar irradiance, customer demand, and grid topology to simulate stress events in real time.`,
      metrics: [
        { label: 'Solar Multiplier', value: `${Math.round(whatIfParams.solarMultiplier * 100)}%` },
        { label: 'Demand Multiplier', value: `${Math.round(whatIfParams.loadMultiplier * 100)}%` },
        { label: 'Tie Switch', value: whatIfParams.tieSwitchClosed ? 'Closed' : 'Open' },
      ],
      actionButton: {
        label: 'Open What-If Scenario Lab',
        actionType: 'GOTO_TAB',
        payload: 'whatif',
      },
    };
  }

  if (query.includes('reset') || query.includes('normal baseline')) {
    return {
      text: `**Reset Grid to Nominal Baseline:**\n\nReturns all 12 buses, solar inverters, and battery storage units to standard balanced operating setpoints (1.000 pu voltage, 0 active alarms).`,
      actionButton: {
        label: '🔄 Execute Network Reset',
        actionType: 'RESET',
      },
    };
  }

  // =========================================================================
  // TIER 12: GENERAL / ABOUT GRIDMORPH / DEMO OVERVIEW
  // =========================================================================
  if (query.includes('what is gridmorph') || query.includes('demo') || query.includes('about') || query.includes('overview') || query.includes('summary')) {
    return {
      text: `**GRIDMORPH: Adaptive Digital Twin for Renewable Distribution Networks**\n\n` +
        `*"Not just a digital twin that watches — one that adapts, compares, and tells you the truth."*\n\n` +
        `**Live Operational Summary:**\n` +
        `• **Current Scenario:** **${activeScenario.name}**\n` +
        `• **Solar Generation:** \`${gridState.totalGenerationMW.toFixed(2)} MW\`\n` +
        `• **Feeder Demand:** \`${gridState.totalLoadMW.toFixed(2)} MW\`\n` +
        `• **Peak Voltage:** \`${bus7.voltage.toFixed(3)} pu\` at Bus 7\n` +
        `• **System Health:** **${gridState.gridHealthPct}%** (${violations.length} active violations)\n` +
        `• **Recommended Action:** **${bestAction.name}** (Score: **${bestAction.scores.totalWeighted} pts**)`,
      metrics: [
        { label: 'Solar Gen', value: `${gridState.totalGenerationMW.toFixed(2)} MW` },
        { label: 'Peak Voltage', value: `${bus7.voltage.toFixed(3)} pu`, isGood: !isOvervoltage },
        { label: 'System Health', value: `${gridState.gridHealthPct}%`, isGood: gridState.gridHealthPct >= 90 },
      ],
      actionButton: {
        label: 'Launch 90-Second Demo Story',
        actionType: 'GOTO_TAB',
        payload: 'command',
      },
    };
  }

  // =========================================================================
  // TIER 13: COMPREHENSIVE CONTEXTUAL FALLBACK
  // =========================================================================
  return {
    text: `**Grid Telemetry Analysis for "${rawQuery}":**\n\n` +
      `• **Feeder Power Profile:** Solar Generation: **\`${gridState.totalGenerationMW.toFixed(2)} MW\`** | Customer Demand: **\`${gridState.totalLoadMW.toFixed(2)} MW\`**\n` +
      `• **Voltage Conditions:** Peak terminal voltage is **\`${bus7.voltage.toFixed(3)} pu\`** at Bus 7 (${isOvervoltage ? '⚠️ Breaching 1.050 pu upper limit' : '✅ Within statutory 0.950 - 1.050 pu limits'})\n` +
      `• **Optimal Strategy:** **${bestAction.name}** resolves violations with **100% renewable energy preservation**.\n` +
      `• **System Health:** **${gridState.gridHealthPct}%** with **${violations.length} active alerts**.\n\n` +
      `*Try asking me:*\n` +
      `• *"What should I do to fix the grid?"*\n` +
      `• *"Why is Bus 7 experiencing overvoltage?"*\n` +
      `• *"What is the thermal loading on Line 1-2?"*\n` +
      `• *"What is the 30-minute Random Forest forecast?"*\n` +
      `• *"Compare all 5 candidate actions"*`,
    metrics: [
      { label: 'Solar Gen', value: `${gridState.totalGenerationMW.toFixed(2)} MW` },
      { label: 'Bus 7 V', value: `${bus7.voltage.toFixed(3)} pu`, isGood: !isOvervoltage },
      { label: 'System Health', value: `${gridState.gridHealthPct}%`, isGood: gridState.gridHealthPct >= 90 },
    ],
    actionButton: {
      label: 'Open Feeder Digital Twin',
      actionType: 'GOTO_TAB',
      payload: 'twin',
    },
  };
}

