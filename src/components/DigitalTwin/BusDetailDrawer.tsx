import React from 'react';
import { useGrid } from '../../context/GridContext';
import { X, Sun, Battery, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const BusDetailDrawer: React.FC = () => {
  const { gridState, selectedBusId, setSelectedBusId, setActiveTab } = useGrid();

  if (selectedBusId === null) return null;

  const bus = gridState.buses.find((b) => b.id === selectedBusId) || gridState.buses[0];
  const pv = gridState.pvUnits.find((p) => p.busId === selectedBusId);
  const battery = gridState.batteries.find((b) => b.busId === selectedBusId);
  const connectedLines = gridState.lines.filter((l) => l.from === selectedBusId || l.to === selectedBusId);
  const activeViolation = gridState.activeViolations.find((v) => v.assetId === selectedBusId);

  const isOvervoltage = bus.voltage > bus.voltageMaxLimit;
  const isUndervoltage = bus.voltage < bus.voltageMinLimit;

  return (
    <div className="bg-ctrl-surface rounded-panel p-4 border border-ctrl-border shadow-card flex flex-col justify-between h-full">
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-ctrl-border">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              bus.status === 'critical' ? 'bg-ctrl-critical' :
              bus.status === 'warning' ? 'bg-ctrl-warning' : 'bg-ctrl-accent'
            }`} />
            <h3 className="font-mono font-bold text-xs text-ctrl-textPrimary uppercase tracking-wider">
              {bus.name}
            </h3>
          </div>
          <button
            onClick={() => setSelectedBusId(null)}
            className="text-ctrl-textTertiary hover:text-ctrl-textPrimary p-1 rounded-btn hover:bg-ctrl-elevated transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Active Incident Alert */}
        {activeViolation && (
          <div className="my-3 p-3 rounded-card bg-ctrl-tintRose border border-ctrl-tintRoseBorder text-xs">
            <div className="font-bold font-mono text-[11px] text-ctrl-tintRoseText uppercase">
              {activeViolation.type.replace('_', ' ')}
            </div>
            <p className="text-[11px] mt-1 text-ctrl-textPrimary leading-relaxed">
              {activeViolation.explanation}
            </p>
          </div>
        )}

        {/* Primary Electrical Metrics */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-ctrl-elevated p-2.5 rounded-card border border-ctrl-border">
            <div className="text-[10px] font-mono text-ctrl-textTertiary uppercase">VOLTAGE</div>
            <div className={`text-base font-mono font-bold mt-0.5 ${
              isOvervoltage ? 'text-ctrl-critical' : isUndervoltage ? 'text-ctrl-warning' : 'text-ctrl-textPrimary'
            }`}>
              {bus.voltage.toFixed(3)} pu
            </div>
            <div className="text-[10px] text-ctrl-textTertiary font-mono">
              {(bus.voltage * bus.nominalVoltageKv).toFixed(2)} kV
            </div>
          </div>

          <div className="bg-ctrl-elevated p-2.5 rounded-card border border-ctrl-border">
            <div className="text-[10px] font-mono text-ctrl-textTertiary uppercase">NET INJECTION</div>
            <div className="text-base font-mono font-bold text-ctrl-textPrimary mt-0.5 flex items-center gap-1">
              {(bus.genP - bus.loadP) >= 0 ? (
                <span className="text-ctrl-tintPeachText flex items-center"><ArrowUpRight className="w-3.5 h-3.5" />+{(bus.genP - bus.loadP).toFixed(2)} MW</span>
              ) : (
                <span className="text-ctrl-textPrimary flex items-center"><ArrowDownRight className="w-3.5 h-3.5" />{(bus.genP - bus.loadP).toFixed(2)} MW</span>
              )}
            </div>
            <div className="text-[10px] text-ctrl-textTertiary font-mono">
              Load {bus.loadP.toFixed(2)} / Gen {bus.genP.toFixed(2)} MW
            </div>
          </div>
        </div>

        {/* Connected DER Details */}
        {pv && (
          <div className="mb-3 p-3 rounded-card bg-ctrl-tintPeach border border-ctrl-tintPeachBorder">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-ctrl-tintPeachText mb-2">
              <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-ctrl-tintPeachText" /> {pv.name}</span>
              <span className="text-[10px] font-mono">CAP {pv.capacityMW} MW</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-ctrl-textPrimary">
              <div>Output: <strong>{pv.generationMW} MW</strong></div>
              <div>Irradiance: <strong>{pv.irradianceWm2} W/m²</strong></div>
              <div>Curtailment: <strong className={pv.curtailmentPct > 0 ? 'text-ctrl-critical' : 'text-ctrl-accent'}>{pv.curtailmentPct}%</strong></div>
              <div>Inverter PF: <strong>{pv.powerFactor}</strong></div>
            </div>
          </div>
        )}

        {battery && (
          <div className="mb-3 p-3 rounded-card bg-ctrl-tintGreen border border-ctrl-tintGreenBorder">
            <div className="flex items-center justify-between text-xs font-mono font-semibold text-ctrl-tintGreenText mb-2">
              <span className="flex items-center gap-1.5"><Battery className="w-3.5 h-3.5 text-ctrl-tintGreenText" /> {battery.name}</span>
              <span className="text-[10px] font-mono">SOC {battery.socPct}%</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono text-ctrl-textPrimary">
              <div>Capacity: <strong>{battery.capacityMWh} MWh</strong></div>
              <div>Dispatch: <strong>{battery.currentDispatchMW > 0 ? `+${battery.currentDispatchMW} MW` : `${battery.currentDispatchMW} MW`}</strong></div>
              <div>Degradation: <strong>{battery.degradationCost}</strong></div>
              <div>Cycles: <strong>{battery.cycleCount}</strong></div>
            </div>
          </div>
        )}

        {/* Connected Branches */}
        <div>
          <div className="text-[10px] font-mono text-ctrl-textTertiary uppercase mb-1.5">
            CONNECTED FEEDER BRANCHES
          </div>
          <div className="space-y-1">
            {connectedLines.map((l) => (
              <div key={l.id} className="flex items-center justify-between p-2 rounded-card bg-ctrl-elevated border border-ctrl-border text-xs font-mono">
                <span className="text-ctrl-textSecondary">Line {l.id} ({l.from}→{l.to})</span>
                <span className={`font-semibold ${l.loadingPct > 100 ? 'text-ctrl-critical' : l.loadingPct > 80 ? 'text-ctrl-warning' : 'text-ctrl-textPrimary'}`}>
                  {l.loadingPct}% ({l.currentAmps} A)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="pt-3 border-t border-ctrl-border mt-3">
        <button
          onClick={() => setActiveTab('actions')}
          className="w-full py-1.5 px-3 bg-ctrl-accent hover:bg-ctrl-accentHover text-white text-xs font-mono font-medium rounded-btn transition-colors text-center shadow-sm"
        >
          Evaluate Corrective Actions →
        </button>
      </div>
    </div>
  );
};
