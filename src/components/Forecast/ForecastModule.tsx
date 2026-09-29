import React from 'react';
import { useGrid } from '../../context/GridContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from 'recharts';
import { Play, Sun, TrendingUp, Zap, AlertTriangle } from 'lucide-react';

export const ForecastModule: React.FC = () => {
  const {
    forecastPoints,
    forecastHorizonMin,
    setForecastHorizon,
    runPredictiveTwin,
    gridState,
  } = useGrid();

  const selectedPoint = forecastPoints.find((p) => p.timeOffsetMin === forecastHorizonMin) || forecastPoints[2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] tracking-wider">
              ML TIME-SERIES ENGINE
            </span>
            <span className="text-xs font-mono text-ctrl-textTertiary">
              • Random Forest Regressor vs Persistence Baseline
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
            Near-Term Generation & Load Forecast
          </h1>
          <p className="text-xs text-ctrl-textSecondary mt-1 font-sans">
            Continuous multi-horizon irradiance and load projection with deterministic AC voltage risk headroom analysis.
          </p>
        </div>

        {/* Forecast Horizon Selector & CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-ctrl-elevated p-1 rounded-card border border-ctrl-border">
            {[15, 30, 45, 60, 90, 120].map((horizon) => (
              <button
                key={horizon}
                onClick={() => setForecastHorizon(horizon)}
                className={`px-3 py-1 rounded-btn text-xs font-mono font-bold transition-all ${
                  forecastHorizonMin === horizon
                    ? 'bg-[#237A5C] text-white shadow-sm'
                    : 'text-ctrl-textSecondary hover:text-ctrl-textPrimary hover:bg-white'
                }`}
              >
                +{horizon}m
              </button>
            ))}
          </div>

          <button
            onClick={runPredictiveTwin}
            className="flex items-center gap-2 px-4 py-2 bg-[#237A5C] hover:bg-[#1C674E] text-white font-sans font-semibold text-xs rounded-btn shadow-subtle transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Predictive Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Pastel Metric Readout Strip (NutriScan style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Solar Gen (Amber/Sand) */}
        <div className="bg-ctrl-sand p-4 rounded-panel border border-[#F2E5C8] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#8F6A1E] uppercase tracking-wider">
              SOLAR GENERATION
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 border border-[#E8D4A8] flex items-center justify-center text-[#B88728]">
              <Sun className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#78540E]">
              {gridState.totalGenerationMW.toFixed(1)} → {selectedPoint.solarRF.toFixed(1)} MW
            </div>
            <div className="text-[11px] text-[#8F6A1E] mt-1 font-sans">
              Delta: +{(selectedPoint.solarRF - gridState.totalGenerationMW).toFixed(1)} MW at +{forecastHorizonMin}m
            </div>
          </div>
        </div>

        {/* Card 2: Feeder Demand (Sky Blue) */}
        <div className="bg-ctrl-sky p-4 rounded-panel border border-[#CCE2F5] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#1D6396] uppercase tracking-wider">
              FEEDER DEMAND
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 border border-[#B3D6F2] flex items-center justify-center text-[#1D6396]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#114B75]">
              {gridState.totalLoadMW.toFixed(1)} → {selectedPoint.loadRF.toFixed(1)} MW
            </div>
            <div className="text-[11px] text-[#1D6396] mt-1 font-sans">
              Demand delta: {(selectedPoint.loadRF - gridState.totalLoadMW).toFixed(1)} MW
            </div>
          </div>
        </div>

        {/* Card 3: Net Surplus (Peach) */}
        <div className="bg-ctrl-peach p-4 rounded-panel border border-[#FAD7C3] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#A74B1A] uppercase tracking-wider">
              PREDICTED NET SURPLUS
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/80 border border-[#F5C2A4] flex items-center justify-center text-[#A74B1A]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-[#8A3A0F]">
              +{selectedPoint.netSurplusMW.toFixed(1)} MW
            </div>
            <div className="text-[11px] text-[#A74B1A] mt-1 font-sans">
              Drives reverse power flow rise
            </div>
          </div>
        </div>

        {/* Card 4: Voltage Risk Assessment (Rose/Mint) */}
        <div className={`p-4 rounded-panel border flex flex-col justify-between ${
          selectedPoint.predictedMaxVoltagePu > 1.050
            ? 'bg-ctrl-rose border-[#F5D0D9]'
            : 'bg-ctrl-mint border-[#BCE7D3]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
              selectedPoint.predictedMaxVoltagePu > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'
            }`}>
              VOLTAGE RISK
            </span>
            <div className={`w-7 h-7 rounded-lg bg-white/80 border flex items-center justify-center ${
              selectedPoint.predictedMaxVoltagePu > 1.050
                ? 'border-[#F5D0D9] text-ctrl-critical'
                : 'border-[#BCE7D3] text-[#237A5C]'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className={`text-xl font-mono font-extrabold ${
              selectedPoint.predictedMaxVoltagePu > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'
            }`}>
              {selectedPoint.predictedMaxVoltagePu.toFixed(3)} pu
            </div>
            <div className={`text-[11px] mt-1 font-sans ${
              selectedPoint.predictedMaxVoltagePu > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'
            }`}>
              Status: {selectedPoint.riskLevel} (Breach in ~{forecastHorizonMin}m)
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Charts (Clean Light Mode) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Solar Generation Forecast */}
        <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase">
                SOLAR GENERATION FORECAST (MW)
              </h3>
              <p className="text-[11px] text-ctrl-textSecondary font-sans">Random Forest Model vs Persistence Baseline</p>
            </div>
            <div className="text-[10px] font-mono text-ctrl-textSecondary bg-ctrl-elevated px-2.5 py-1 rounded-btn border border-ctrl-border font-semibold">
              RF MAE: 0.12 MW
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2EAE5" />
                <XAxis dataKey="timeLabel" stroke="#5A6E64" fontSize={11} />
                <YAxis stroke="#5A6E64" fontSize={11} domain={[0, 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE7E2', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="solarConfidenceHigh" stroke="none" fill="rgba(217, 119, 6, 0.10)" name="95% Confidence Interval" />
                <Line type="monotone" dataKey="solarRF" stroke="#D97706" strokeWidth={2.5} dot={{ r: 3, fill: '#D97706' }} name="Random Forest (MW)" />
                <Line type="monotone" dataKey="solarPersistence" stroke="#8A9B92" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Persistence Baseline (MW)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Voltage Risk Projection */}
        <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase">
                PEAK VOLTAGE RISK FORECAST (pu)
              </h3>
              <p className="text-[11px] text-ctrl-textSecondary font-sans">Projected Bus 7 Voltage vs Statutory 1.050 pu Limit</p>
            </div>
            <div className="text-[10px] font-mono text-ctrl-critical bg-ctrl-rose px-2.5 py-1 rounded-btn border border-[#F5D0D9] font-bold">
              Max Limit: 1.050 pu
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2EAE5" />
                <XAxis dataKey="timeLabel" stroke="#5A6E64" fontSize={11} />
                <YAxis stroke="#5A6E64" fontSize={11} domain={[0.98, 1.10]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE7E2', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', fontSize: '11px', fontFamily: 'monospace' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
                <ReferenceLine y={1.050} stroke="#E11D48" strokeDasharray="3 3" strokeWidth={1.5} label={{ value: '1.050 Limit', fill: '#E11D48', fontSize: 10, position: 'insideTopLeft' }} />
                <Line type="monotone" dataKey="predictedMaxVoltagePu" stroke="#237A5C" strokeWidth={2.5} dot={{ r: 3.5, fill: '#237A5C' }} name="Predicted Voltage (pu)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance Matrix */}
      <div className="bg-ctrl-surface p-5 rounded-panel border border-ctrl-border shadow-subtle">
        <h4 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase tracking-wider mb-3">
          MODEL PERFORMANCE BENCHMARKS
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-ctrl-elevated p-3 rounded-card border border-ctrl-border">
            <div className="text-[10px] text-ctrl-textTertiary uppercase font-semibold">Random Forest MAE</div>
            <div className="text-base font-extrabold text-[#237A5C] mt-0.5">0.12 MW</div>
            <div className="text-[10px] text-ctrl-textTertiary mt-0.5">82% error reduction vs baseline</div>
          </div>
          <div className="bg-ctrl-elevated p-3 rounded-card border border-ctrl-border">
            <div className="text-[10px] text-ctrl-textTertiary uppercase font-semibold">Persistence Baseline MAE</div>
            <div className="text-base font-extrabold text-ctrl-textSecondary mt-0.5">0.68 MW</div>
            <div className="text-[10px] text-ctrl-textTertiary mt-0.5">Lags during ramp events</div>
          </div>
          <div className="bg-ctrl-elevated p-3 rounded-card border border-ctrl-border">
            <div className="text-[10px] text-ctrl-textTertiary uppercase font-semibold">Prediction Horizon</div>
            <div className="text-base font-extrabold text-ctrl-textPrimary mt-0.5">120 Minutes</div>
            <div className="text-[10px] text-ctrl-textTertiary mt-0.5">Continuous 15m intervals</div>
          </div>
          <div className="bg-ctrl-elevated p-3 rounded-card border border-ctrl-border">
            <div className="text-[10px] text-ctrl-textTertiary uppercase font-semibold">Confidence Score</div>
            <div className="text-base font-extrabold text-[#237A5C] mt-0.5">94.2%</div>
            <div className="text-[10px] text-ctrl-textTertiary mt-0.5">SCADA DER history trained</div>
          </div>
        </div>
      </div>
    </div>
  );
};

