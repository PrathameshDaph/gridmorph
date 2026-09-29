import React, { useState, useEffect } from 'react';
import { useGrid } from '../../context/GridContext';
import { Clock, Sun, Battery, Activity, Zap, Cpu } from 'lucide-react';

export const LiveSimulationView: React.FC = () => {
  const {
    gridState,
    liveEvents,
    triggerLiveDisturbance,
    liveSimDisturbance,
  } = useGrid();

  const [currentTime, setCurrentTime] = useState<string>('15:42:18');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const disturbances = [
    { id: 'NORMAL', label: '1. Normal Baseline' },
    { id: 'HIGH SOLAR', label: '2. Solar Surge (+1.8 MW)' },
    { id: 'HIGH DEMAND', label: '3. Demand Spike (+1.5 MW)' },
    { id: 'CLOUD TRANSIENT', label: '4. Cloud Transient' },
    { id: 'FEEDER OVERLOAD', label: '5. Line Overload' },
    { id: 'EXTREME EVENT', label: '6. Extreme Saturated Case' },
  ];

  const bus7V = gridState.buses.find((b) => b.id === 7)?.voltage || 1.045;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#237A5C] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] tracking-wider">
              LIVE SCADA STREAM
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
            Live Grid Telemetry & SCADA Event Stream
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-ctrl-elevated px-4 py-2 rounded-card border border-ctrl-border text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-ctrl-textTertiary" />
          <span className="text-ctrl-textTertiary">TIME:</span>
          <span className="text-ctrl-textPrimary font-bold tracking-wider">{currentTime}</span>
          <span className="text-ctrl-border">|</span>
          <span className="text-ctrl-textTertiary">FREQ:</span>
          <span className="text-ctrl-textPrimary font-semibold">49.98 Hz</span>
        </div>
      </div>

      {/* Pastel Telemetry Blocks (NutriScan style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Solar */}
        <div className="bg-ctrl-sand p-3.5 rounded-panel border border-[#F2E5C8] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#8F6A1E] uppercase">
              SOLAR GEN
            </span>
            <Sun className="w-3.5 h-3.5 text-[#B88728]" />
          </div>
          <div className="text-xl font-mono font-extrabold text-[#78540E] mt-1">
            {gridState.totalGenerationMW.toFixed(2)} MW
          </div>
        </div>

        {/* Load */}
        <div className="bg-ctrl-sky p-3.5 rounded-panel border border-[#CCE2F5] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#1D6396] uppercase">
              FEEDER LOAD
            </span>
            <Zap className="w-3.5 h-3.5 text-[#1D6396]" />
          </div>
          <div className="text-xl font-mono font-extrabold text-[#114B75] mt-1">
            {gridState.totalLoadMW.toFixed(2)} MW
          </div>
        </div>

        {/* Battery */}
        <div className="bg-ctrl-peach p-3.5 rounded-panel border border-[#FAD7C3] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#A74B1A] uppercase">
              BATTERY SOC
            </span>
            <Battery className="w-3.5 h-3.5 text-[#A74B1A]" />
          </div>
          <div className="text-xl font-mono font-extrabold text-[#8A3A0F] mt-1">
            {gridState.batteries[0].socPct}%
          </div>
        </div>

        {/* Voltage */}
        <div className={`p-3.5 rounded-panel border flex flex-col justify-between ${
          bus7V > 1.050 ? 'bg-ctrl-rose border-[#F5D0D9]' : 'bg-ctrl-mint border-[#BCE7D3]'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-mono font-bold uppercase ${
              bus7V > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'
            }`}>
              BUS 07 V
            </span>
            <Cpu className="w-3.5 h-3.5 opacity-70" />
          </div>
          <div className={`text-xl font-mono font-extrabold mt-1 ${
            bus7V > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'
          }`}>
            {bus7V.toFixed(3)} pu
          </div>
        </div>

        {/* Health */}
        <div className="bg-ctrl-mint p-3.5 rounded-panel border border-[#BCE7D3] col-span-2 sm:col-span-1 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-[#166046] uppercase">
              GRID HEALTH
            </span>
            <Activity className="w-3.5 h-3.5 text-[#237A5C]" />
          </div>
          <div className="text-xl font-mono font-extrabold text-[#166046] mt-1">
            {gridState.gridHealthPct}%
          </div>
        </div>
      </div>

      {/* Disturbance Triggers */}
      <div className="bg-ctrl-surface p-5 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase tracking-wider">
            TRIGGER SIMULATED DISTURBANCES
          </h3>
          <span className="text-[11px] font-mono text-ctrl-textTertiary">
            Active: <strong className="text-[#237A5C]">{liveSimDisturbance}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {disturbances.map((d) => (
            <button
              key={d.id}
              onClick={() => triggerLiveDisturbance(d.id)}
              className={`p-2.5 rounded-btn border text-xs font-mono font-semibold transition-all text-center shadow-subtle ${
                liveSimDisturbance === d.id
                  ? 'bg-[#237A5C] text-white border-[#237A5C]'
                  : 'bg-ctrl-elevated border-ctrl-border text-ctrl-textSecondary hover:text-ctrl-textPrimary hover:bg-white'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Timeline */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-ctrl-border">
          <h3 className="font-mono font-bold text-xs uppercase text-ctrl-textPrimary tracking-wider">
            SUB-SECOND SCADA EVENT LOG
          </h3>
          <span className="text-[10px] font-mono text-ctrl-textTertiary">
            Deterministic Real-Time Capture
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {liveEvents.map((evt) => {
            const isResolved = evt.type === 'RESOLVE';
            const isAlert = evt.type === 'ALERT' || evt.type === 'SURGE' || evt.type === 'VIOLATION';
            return (
              <div
                key={evt.id}
                className="flex items-center justify-between p-2.5 rounded-card bg-ctrl-elevated border border-ctrl-border text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-ctrl-textTertiary">{evt.timeStr}</span>
                  <span className={`px-2 py-0.5 rounded-btn text-[9px] font-extrabold uppercase ${
                    isResolved
                      ? 'bg-ctrl-mint text-[#166046] border border-[#BCE7D3]'
                      : isAlert
                      ? 'bg-ctrl-rose text-ctrl-critical border border-[#F5D0D9]'
                      : 'bg-white text-ctrl-textSecondary border border-ctrl-border'
                  }`}>
                    {evt.type}
                  </span>
                  <span className="text-ctrl-textPrimary font-medium">{evt.message}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

