import React from 'react';
import { useGrid } from '../context/GridContext';
import { FeederCanvas } from '../components/DigitalTwin/FeederCanvas';
import { BusDetailDrawer } from '../components/DigitalTwin/BusDetailDrawer';
import { ArrowRight } from 'lucide-react';

export const DigitalTwinPage: React.FC = () => {
  const { gridState, selectedBusId, setSelectedBusId, setActiveTab } = useGrid();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-semibold uppercase text-ctrl-accent tracking-widest">
              PHYSICS SOLVER
            </span>
            <span className="text-xs font-mono text-ctrl-textTertiary">
              • AC Backward-Forward Sweep Topology
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-sans font-bold text-ctrl-textPrimary tracking-tight">
            12-Bus Distribution Feeder Digital Twin
          </h1>
          <p className="text-xs text-ctrl-textSecondary mt-1 font-sans">
            Real-time telemetry and state estimation for primary 11 kV radial distribution feeder with high DER penetration.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('actions')}
          className="flex items-center gap-2 px-4 py-2 bg-ctrl-elevated hover:bg-ctrl-border text-ctrl-textPrimary font-mono font-semibold text-xs rounded-btn border border-ctrl-border transition-colors"
        >
          <span>Evaluate Actions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Canvas & Inspection Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        <div className={selectedBusId !== null ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <FeederCanvas />
        </div>

        {selectedBusId !== null && (
          <div className="lg:col-span-1">
            <BusDetailDrawer />
          </div>
        )}
      </div>

      {/* Bus-by-Bus Telemetry Data Table */}
      <div className="bg-ctrl-surface rounded-panel p-5 border border-ctrl-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-bold text-xs uppercase text-ctrl-textPrimary tracking-wider">
            12-BUS TELEMETRY MATRIX
          </h3>
          <span className="text-[10px] font-mono text-ctrl-textTertiary">
            Statutory Limits: 0.950 ≤ V ≤ 1.050 pu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono text-left border-collapse">
            <thead>
              <tr className="border-b border-ctrl-border text-ctrl-textTertiary text-[11px]">
                <th className="py-2.5 px-3">Node</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Voltage (pu)</th>
                <th className="py-2.5 px-3">Voltage (kV)</th>
                <th className="py-2.5 px-3">Load (MW)</th>
                <th className="py-2.5 px-3">Generation (MW)</th>
                <th className="py-2.5 px-3">DER Assets</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ctrl-border">
              {gridState.buses.map((b) => {
                const isOver = b.voltage > b.voltageMaxLimit;
                const isUnder = b.voltage < b.voltageMinLimit;
                const isSelected = selectedBusId === b.id;

                return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBusId(b.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-ctrl-elevated text-ctrl-textPrimary font-semibold'
                        : 'hover:bg-ctrl-elevated text-ctrl-textSecondary'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-semibold text-ctrl-textPrimary">
                      {b.name}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-ctrl-textTertiary text-[10px]">{b.type}</td>
                    <td className={`py-2.5 px-3 font-bold ${isOver ? 'text-ctrl-critical' : isUnder ? 'text-ctrl-warning' : 'text-ctrl-textPrimary'}`}>
                      {b.voltage.toFixed(3)} pu
                    </td>
                    <td className="py-2.5 px-3 text-ctrl-textSecondary">
                      {(b.voltage * b.nominalVoltageKv).toFixed(2)} kV
                    </td>
                    <td className="py-2.5 px-3 text-ctrl-textPrimary">{b.loadP.toFixed(2)} MW</td>
                    <td className="py-2.5 px-3 text-ctrl-textPrimary">{b.genP.toFixed(2)} MW</td>
                    <td className="py-2.5 px-3">
                      {b.hasPV && <span className="px-1.5 py-0.5 rounded-btn bg-ctrl-bgDark text-ctrl-warning text-[10px] border border-ctrl-border mr-1">PV</span>}
                      {b.hasBattery && <span className="px-1.5 py-0.5 rounded-btn bg-ctrl-bgDark text-ctrl-accent text-[10px] border border-ctrl-border mr-1">BESS</span>}
                      {b.hasSwitch && <span className="px-1.5 py-0.5 rounded-btn bg-ctrl-bgDark text-ctrl-textSecondary text-[10px] border border-ctrl-border">SW</span>}
                      {!b.hasPV && !b.hasBattery && !b.hasSwitch && <span className="text-ctrl-textTertiary text-[10px]">Load</span>}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-btn text-[10px] font-bold uppercase ${
                        b.status === 'critical' ? 'bg-ctrl-critical/20 text-ctrl-critical border border-ctrl-critical/40' :
                        b.status === 'warning' ? 'bg-ctrl-warning/20 text-ctrl-warning border border-ctrl-warning/40' : 'bg-ctrl-bgDark text-ctrl-accent border border-ctrl-border'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
