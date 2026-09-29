import React, { useState } from 'react';
import { useGrid } from '../../context/GridContext';
import { Play, BookmarkPlus, Layers } from 'lucide-react';

export const WhatIfLab: React.FC = () => {
  const {
    whatIfParams,
    updateWhatIfParams,
    runWhatIfSimulation,
    savedSnapshots,
    saveCurrentSnapshot,
  } = useGrid();

  const [snapshotName, setSnapshotName] = useState('');

  const handleSave = () => {
    saveCurrentSnapshot(snapshotName.trim() || undefined);
    setSnapshotName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase text-[#237A5C] bg-ctrl-mint px-2 py-0.5 rounded-full border border-[#BCE7D3] tracking-wider">
              SIMULATION WORKSTATION
            </span>
            <span className="text-xs font-mono text-ctrl-textTertiary">
              • Deterministic Parameter Perturbation
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
            What-If Scenario Lab
          </h1>
          <p className="text-xs text-ctrl-textSecondary mt-1 font-sans">
            Adjust distributed solar generation, feeder demand, battery state-of-charge, and grid topology to simulate stress conditions.
          </p>
        </div>

        <button
          onClick={runWhatIfSimulation}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#237A5C] hover:bg-[#1C674E] text-white font-sans font-bold text-xs tracking-wider uppercase rounded-btn transition-colors shadow-subtle"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>RUN SIMULATION</span>
        </button>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Solar Multiplier */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ctrl-textSecondary font-semibold uppercase">SOLAR GENERATION</span>
            <span className="text-ctrl-textPrimary font-extrabold text-sm">
              {Math.round(whatIfParams.solarMultiplier * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.5"
            step="0.05"
            value={whatIfParams.solarMultiplier}
            onChange={(e) => updateWhatIfParams({ solarMultiplier: Number(e.target.value) })}
            className="w-full h-2 bg-[#E2EAE5] rounded-full cursor-pointer accent-[#237A5C]"
          />
          <div className="flex justify-between text-[10px] font-mono text-ctrl-textTertiary">
            <span>50% (Overcast)</span>
            <span>100% (Nominal)</span>
            <span>250% (Peak Peak)</span>
          </div>
        </div>

        {/* Load Multiplier */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ctrl-textSecondary font-semibold uppercase">FEEDER DEMAND (LOAD)</span>
            <span className="text-ctrl-textPrimary font-extrabold text-sm">
              {Math.round(whatIfParams.loadMultiplier * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.4"
            max="2.2"
            step="0.05"
            value={whatIfParams.loadMultiplier}
            onChange={(e) => updateWhatIfParams({ loadMultiplier: Number(e.target.value) })}
            className="w-full h-2 bg-[#E2EAE5] rounded-full cursor-pointer accent-[#237A5C]"
          />
          <div className="flex justify-between text-[10px] font-mono text-ctrl-textTertiary">
            <span>40% (Light Load)</span>
            <span>100% (Nominal)</span>
            <span>220% (Peak Peak)</span>
          </div>
        </div>

        {/* Battery SOC */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ctrl-textSecondary font-semibold uppercase">BATTERY STORAGE SOC</span>
            <span className="text-ctrl-textPrimary font-extrabold text-sm">
              {whatIfParams.batterySOC}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="98"
            step="2"
            value={whatIfParams.batterySOC}
            onChange={(e) => updateWhatIfParams({ batterySOC: Number(e.target.value) })}
            className="w-full h-2 bg-[#E2EAE5] rounded-full cursor-pointer accent-[#237A5C]"
          />
          <div className="flex justify-between text-[10px] font-mono text-ctrl-textTertiary">
            <span>10% (Depleted)</span>
            <span>65% (Nominal)</span>
            <span>98% (Saturated)</span>
          </div>
        </div>

        {/* Curtailment Cap */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ctrl-textSecondary font-semibold uppercase">PV CURTAILMENT CAP</span>
            <span className="text-ctrl-textPrimary font-extrabold text-sm">
              {whatIfParams.curtailmentCapPct}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={whatIfParams.curtailmentCapPct}
            onChange={(e) => updateWhatIfParams({ curtailmentCapPct: Number(e.target.value) })}
            className="w-full h-2 bg-[#E2EAE5] rounded-full cursor-pointer accent-[#237A5C]"
          />
          <div className="flex justify-between text-[10px] font-mono text-ctrl-textTertiary">
            <span>0% (No Curtailment)</span>
            <span>15% (PPA Cap)</span>
            <span>50% (Max Shed)</span>
          </div>
        </div>

        {/* Inverter Reactive Power */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle space-y-3">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-ctrl-textSecondary font-semibold uppercase">INVERTER Q ABSORPTION</span>
            <span className="text-ctrl-textPrimary font-extrabold text-sm">
              {whatIfParams.reactivePowerMvar.toFixed(2)} MVar
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={whatIfParams.reactivePowerMvar}
            onChange={(e) => updateWhatIfParams({ reactivePowerMvar: Number(e.target.value) })}
            className="w-full h-2 bg-[#E2EAE5] rounded-full cursor-pointer accent-[#237A5C]"
          />
          <div className="flex justify-between text-[10px] font-mono text-ctrl-textTertiary">
            <span>0.00 (Unity)</span>
            <span>0.75 (Standard)</span>
            <span>1.50 (Max Q)</span>
          </div>
        </div>

        {/* Feeder Topology Switch */}
        <div className="bg-ctrl-surface p-4 rounded-panel border border-ctrl-border shadow-subtle flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-ctrl-textSecondary font-semibold uppercase">FEEDER TIE SW 8-12</span>
            <span className="font-bold text-ctrl-textPrimary">
              {whatIfParams.tieSwitchClosed ? 'CLOSED (LOOP)' : 'OPEN (RADIAL)'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => updateWhatIfParams({ tieSwitchClosed: false })}
              className={`flex-1 py-1.5 text-xs font-mono rounded-btn border font-semibold transition-all ${
                !whatIfParams.tieSwitchClosed
                  ? 'bg-ctrl-elevated text-ctrl-textPrimary border-ctrl-borderLight shadow-sm'
                  : 'bg-white text-ctrl-textTertiary border-ctrl-border'
              }`}
            >
              Radial (Normal)
            </button>
            <button
              onClick={() => updateWhatIfParams({ tieSwitchClosed: true })}
              className={`flex-1 py-1.5 text-xs font-mono rounded-btn border font-semibold transition-all ${
                whatIfParams.tieSwitchClosed
                  ? 'bg-[#237A5C] text-white border-[#237A5C] shadow-sm'
                  : 'bg-white text-ctrl-textTertiary border-ctrl-border'
              }`}
            >
              Loop (Closed)
            </button>
          </div>
          <div className="text-[10px] text-ctrl-textTertiary mt-2 font-mono">
            Transfers Bus 11-12 load across secondary feeder
          </div>
        </div>
      </div>

      {/* Snapshot Manager */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-ctrl-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#237A5C]" />
            <h3 className="font-mono font-bold text-xs uppercase text-ctrl-textPrimary tracking-wider">
              SCENARIO SNAPSHOT COMPARISON MANAGER
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Snapshot name (e.g. Midday Peak)"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
              className="px-3 py-1.5 bg-ctrl-elevated border border-ctrl-border rounded-input text-xs font-mono text-ctrl-textPrimary placeholder:text-ctrl-textTertiary focus:outline-none focus:border-[#237A5C]"
            />
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-[#237A5C] hover:bg-[#1C674E] text-white rounded-btn text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-subtle shrink-0"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Snapshot</span>
            </button>
          </div>
        </div>

        {/* Snapshot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {savedSnapshots.map((snap) => (
            <div
              key={snap.id}
              className="bg-ctrl-elevated p-4 rounded-panel border border-ctrl-border hover:border-ctrl-borderLight transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2.5">
                  <h4 className="font-sans font-bold text-xs text-ctrl-textPrimary truncate">
                    {snap.name}
                  </h4>
                  <span className="text-[10px] font-mono text-ctrl-textTertiary shrink-0">
                    {snap.timestamp}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-2.5 rounded-card border border-ctrl-border mb-3">
                  <div>
                    <span className="text-ctrl-textTertiary text-[10px]">Peak Voltage:</span>
                    <div className={`font-bold ${snap.maxVoltage > 1.050 ? 'text-ctrl-critical' : 'text-[#166046]'}`}>
                      {snap.maxVoltage.toFixed(3)} pu
                    </div>
                  </div>
                  <div>
                    <span className="text-ctrl-textTertiary text-[10px]">Max Loading:</span>
                    <div className={`font-bold ${snap.maxLoading > 100 ? 'text-ctrl-critical' : 'text-ctrl-textPrimary'}`}>
                      {snap.maxLoading}%
                    </div>
                  </div>
                  <div>
                    <span className="text-ctrl-textTertiary text-[10px]">Solar / Load:</span>
                    <div className="text-ctrl-textSecondary">
                      {Math.round(snap.solarMultiplier * 100)}% / {Math.round(snap.loadMultiplier * 100)}%
                    </div>
                  </div>
                  <div>
                    <span className="text-ctrl-textTertiary text-[10px]">Health:</span>
                    <div className="text-[#166046] font-bold">{snap.health}%</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono pt-2.5 border-t border-ctrl-border">
                <span className={snap.violationsCount > 0 ? 'text-ctrl-critical font-bold' : 'text-[#166046] font-bold'}>
                  {snap.violationsCount > 0 ? `${snap.violationsCount} Violation(s)` : 'Zero Violations'}
                </span>
                <button
                  onClick={() => {
                    updateWhatIfParams({
                      solarMultiplier: snap.solarMultiplier,
                      loadMultiplier: snap.loadMultiplier,
                      batterySOC: snap.batterySOC,
                    });
                    runWhatIfSimulation();
                  }}
                  className="text-[#237A5C] hover:text-[#1C674E] font-bold transition-colors"
                >
                  Load & Run →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

