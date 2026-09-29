import React from 'react';
import { useGrid } from '../context/GridContext';
import { ShieldCheck, Sun, BatteryCharging, Zap, AlertTriangle, Sparkles } from 'lucide-react';

export const KPIRow: React.FC = () => {
  const { gridState } = useGrid();
  const criticalViolations = gridState.activeViolations.length;

  const metrics = [
    {
      id: 'health',
      label: 'GRID STABILITY',
      value: `${gridState.gridHealthPct}%`,
      subtext: criticalViolations === 0 ? 'Nominal Operation' : `${criticalViolations} Active Alert(s)`,
      icon: ShieldCheck,
      bg: 'bg-ctrl-tintGreen',
      border: 'border-ctrl-tintGreenBorder',
      color: 'text-ctrl-tintGreenText',
    },
    {
      id: 'renewables',
      label: 'RENEWABLES',
      value: `${gridState.renewableUtilizationPct}%`,
      subtext: `${gridState.totalGenerationMW.toFixed(1)} MW Clean Solar`,
      icon: Sparkles,
      bg: 'bg-ctrl-tintBlue',
      border: 'border-ctrl-tintBlueBorder',
      color: 'text-ctrl-tintBlueText',
    },
    {
      id: 'pv',
      label: 'ACTIVE SOLAR',
      value: `${gridState.totalGenerationMW.toFixed(1)} MW`,
      subtext: 'Buses 03 & 07 Online',
      icon: Sun,
      bg: 'bg-ctrl-tintPeach',
      border: 'border-ctrl-tintPeachBorder',
      color: 'text-ctrl-tintPeachText',
    },
    {
      id: 'load',
      label: 'FEEDER DEMAND',
      value: `${gridState.totalLoadMW.toFixed(1)} MW`,
      subtext: '12 Radial Nodes',
      icon: Zap,
      bg: 'bg-ctrl-tintSand',
      border: 'border-ctrl-tintSandBorder',
      color: 'text-ctrl-tintSandText',
    },
    {
      id: 'bess',
      label: 'BATTERY SOC',
      value: `${gridState.batteries[0].socPct}%`,
      subtext: '4.3 MWh Storage BESS',
      icon: BatteryCharging,
      bg: 'bg-ctrl-tintGreen',
      border: 'border-ctrl-tintGreenBorder',
      color: 'text-ctrl-tintGreenText',
    },
    {
      id: 'violations',
      label: 'VIOLATIONS',
      value: `${criticalViolations}`,
      subtext: criticalViolations === 0 ? 'Within Standards' : 'Requires AI Action',
      icon: AlertTriangle,
      bg: criticalViolations === 0 ? 'bg-ctrl-tintGreen' : 'bg-ctrl-tintRose',
      border: criticalViolations === 0 ? 'border-ctrl-tintGreenBorder' : 'border-ctrl-tintRoseBorder',
      color: criticalViolations === 0 ? 'text-ctrl-tintGreenText' : 'text-ctrl-tintRoseText',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className={`${m.bg} ${m.border} border rounded-card p-3.5 flex flex-col justify-between transition-transform duration-150 hover:scale-[1.01]`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className={`w-3.5 h-3.5 ${m.color}`} />
              <span className={`text-[10px] font-mono tracking-wider uppercase font-semibold ${m.color}`}>
                {m.label}
              </span>
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-mono font-bold text-ctrl-textPrimary tracking-tight">
                {m.value}
              </div>
              <div className="text-[11px] text-ctrl-textSecondary font-sans mt-0.5 truncate">
                {m.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
