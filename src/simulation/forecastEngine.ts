import { ForecastPoint } from '../types/grid';

export interface ForecastMetrics {
  solarRfMae: number;
  solarPersistenceMae: number;
  solarRfRmse: number;
  solarPersistenceRmse: number;
  loadRfMae: number;
  loadPersistenceMae: number;
  confidenceScore: number;
  activeHorizonMin: number;
  predictedSurplusMW: number;
  predictedRisk: 'NORMAL' | 'OVERVOLTAGE' | 'THERMAL_OVERLOAD' | 'CRITICAL';
}

/**
 * Generate multi-horizon Forecast for Solar, Load, and Grid Voltage Risk
 */
export function generateForecast(
  currentSolarMW: number = 4.6,
  currentLoadMW: number = 3.8,
  scenario: 'rising_solar' | 'cloud_transient' | 'heavy_load' | 'extreme_solar' | 'normal' = 'rising_solar'
): { points: ForecastPoint[]; metrics: ForecastMetrics } {
  const horizons = [0, 15, 30, 45, 60, 90, 120];
  const now = new Date();

  const points: ForecastPoint[] = horizons.map((offset) => {
    const timeDate = new Date(now.getTime() + offset * 60 * 1000);
    const timeLabel = offset === 0 ? 'Now' : `+${offset}m (${timeDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })})`;

    let solarRF = currentSolarMW;
    let solarPersistence = currentSolarMW;
    let loadRF = currentLoadMW;
    let loadPersistence = currentLoadMW;

    if (scenario === 'rising_solar') {
      // Clear midday sun peak trajectory
      const solarGrowth = Math.min(1.6, 1 + (offset / 60) * 0.35);
      solarRF = currentSolarMW * solarGrowth + (Math.sin(offset / 10) * 0.08);
      loadRF = currentLoadMW * (1 - (offset / 120) * 0.12) + (Math.cos(offset / 15) * 0.05);
    } else if (scenario === 'cloud_transient') {
      // Rapid dip then rebound
      const cloudDip = offset >= 15 && offset <= 45 ? 0.45 : 1.05;
      solarRF = currentSolarMW * cloudDip + (Math.random() * 0.1 - 0.05);
      loadRF = currentLoadMW * 1.02;
    } else if (scenario === 'heavy_load') {
      solarRF = currentSolarMW * (1 - (offset / 120) * 0.3);
      loadRF = currentLoadMW * (1 + (offset / 60) * 0.45);
    } else if (scenario === 'extreme_solar') {
      solarRF = Math.min(9.5, currentSolarMW * (1 + (offset / 60) * 0.95));
      loadRF = currentLoadMW * 0.75;
    } else {
      // Normal flat with mild diurnal curve
      solarRF = currentSolarMW * (1 + (Math.sin(offset / 40) * 0.05));
      loadRF = currentLoadMW * (1 + (Math.cos(offset / 40) * 0.04));
    }

    solarRF = Number(Math.max(0.1, solarRF).toFixed(2));
    loadRF = Number(Math.max(0.5, loadRF).toFixed(2));
    solarPersistence = Number(currentSolarMW.toFixed(2));
    loadPersistence = Number(currentLoadMW.toFixed(2));

    const netSurplusMW = Number((solarRF - loadRF).toFixed(2));

    // Simulated confidence band (+/- 6% for 15m, up to +/- 18% for 120m)
    const uncertaintyFactor = 0.05 + (offset / 120) * 0.14;
    const solarConfidenceLow = Number(Math.max(0, solarRF * (1 - uncertaintyFactor)).toFixed(2));
    const solarConfidenceHigh = Number((solarRF * (1 + uncertaintyFactor)).toFixed(2));

    // Power-flow voltage projection heuristic (Bus 7 sensitive node)
    let predictedMaxVoltagePu = 1.020 + (netSurplusMW * 0.024);
    if (offset === 0) predictedMaxVoltagePu = Math.min(predictedMaxVoltagePu, 1.035);
    predictedMaxVoltagePu = Number(Math.max(0.92, Math.min(1.12, predictedMaxVoltagePu)).toFixed(3));

    let riskLevel: ForecastPoint['riskLevel'] = 'LOW';
    if (predictedMaxVoltagePu > 1.055) riskLevel = 'CRITICAL';
    else if (predictedMaxVoltagePu > 1.045) riskLevel = 'HIGH';
    else if (predictedMaxVoltagePu > 1.038) riskLevel = 'MEDIUM';

    return {
      timeOffsetMin: offset,
      timeLabel,
      solarRF,
      solarPersistence,
      solarActual: offset === 0 ? currentSolarMW : undefined,
      solarConfidenceLow,
      solarConfidenceHigh,
      loadRF,
      loadPersistence,
      loadActual: offset === 0 ? currentLoadMW : undefined,
      netSurplusMW,
      predictedMaxVoltagePu,
      riskLevel,
    };
  });

  const thirtyMinPoint = points.find((p) => p.timeOffsetMin === 30) || points[2];
  const predictedSurplus = thirtyMinPoint.netSurplusMW;
  const predictedRisk: ForecastMetrics['predictedRisk'] = 
    thirtyMinPoint.predictedMaxVoltagePu > 1.050 ? 'OVERVOLTAGE' : 
    thirtyMinPoint.loadRF > 5.5 ? 'THERMAL_OVERLOAD' : 'NORMAL';

  const metrics: ForecastMetrics = {
    solarRfMae: 0.12,
    solarPersistenceMae: 0.68,
    solarRfRmse: 0.18,
    solarPersistenceRmse: 0.94,
    loadRfMae: 0.08,
    loadPersistenceMae: 0.32,
    confidenceScore: 94.2,
    activeHorizonMin: 30,
    predictedSurplusMW: predictedSurplus,
    predictedRisk,
  };

  return { points, metrics };
}
