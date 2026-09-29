import React, { useState } from 'react';
import { useGrid } from '../../context/GridContext';
import { Bus, Line } from '../../types/grid';
import { Info } from 'lucide-react';

export const FeederCanvas: React.FC = () => {
  const {
    gridState,
    selectedBusId,
    setSelectedBusId,
    toggleTieSwitch,
  } = useGrid();

  const [, setHoveredBus] = useState<Bus | null>(null);

  const buses = gridState.buses;
  const lines = gridState.lines;
  const tieSwitch = gridState.switchTie;

  // 12-Bus schematic coordinate layout
  const busCoords: Record<number, { x: number; y: number }> = {
    1: { x: 70, y: 190 },
    2: { x: 170, y: 190 },
    3: { x: 260, y: 100 }, // PV A branch
    4: { x: 330, y: 190 },
    5: { x: 420, y: 100 }, // Battery A branch
    6: { x: 490, y: 190 },
    7: { x: 580, y: 100 }, // PV B branch (critical reverse flow)
    8: { x: 650, y: 190 }, // Tie junction
    9: { x: 740, y: 280 }, // Battery B branch
    10: { x: 840, y: 280 },
    11: { x: 940, y: 280 },
    12: { x: 1040, y: 280 }, // End load / Tie end
  };

  const getBusColors = (bus: Bus) => {
    if (bus.voltage > bus.voltageMaxLimit || bus.voltage < bus.voltageMinLimit) {
      return { fill: '#FDF0F3', stroke: '#D93B5E', text: '#D93B5E', dot: '#D93B5E' };
    }
    if (bus.voltage > 1.040 || bus.voltage < 0.965) {
      return { fill: '#FAF5E8', stroke: '#D97706', text: '#D97706', dot: '#D97706' };
    }
    return { fill: '#FFFFFF', stroke: '#BEE4D4', text: '#1A2821', dot: '#237A5C' };
  };

  const getLineStroke = (line: Line) => {
    if (line.isOpen) return { color: '#DFE7E2', width: 1.5, dash: '4 4' };
    if (line.loadingPct > 100) return { color: '#D93B5E', width: 3, dash: 'none' };
    if (line.loadingPct > 80) return { color: '#D97706', width: 2.5, dash: 'none' };
    return { color: '#237A5C', width: 2, dash: 'none' };
  };

  return (
    <div className="relative w-full bg-ctrl-surface rounded-panel border border-ctrl-border overflow-hidden shadow-card">
      {/* Subtle light blueprint grid */}
      <div className="absolute inset-0 blueprint-grid pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ctrl-elevated border-b border-ctrl-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-ctrl-accent" />
          <span className="text-ctrl-textPrimary font-semibold tracking-wide">
            12-BUS DISTRIBUTION FEEDER SCHEMATIC
          </span>
          <span className="text-ctrl-border">|</span>
          <span className="text-ctrl-textTertiary">11 kV RADIAL NETWORK</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-ctrl-textSecondary">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ctrl-accent" />
            <span>Clean Flow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ctrl-warning" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ctrl-critical" />
            <span>Violation</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto py-6 px-4 select-none bg-white">
        <svg
          viewBox="0 0 1140 380"
          className="w-full h-auto min-w-[920px] max-h-[460px]"
        >
          {/* Substation */}
          <g transform="translate(10, 140)">
            <rect
              x="0"
              y="0"
              width="50"
              height="100"
              rx="6"
              fill="#F7FAF8"
              stroke="#DFE7E2"
              strokeWidth="1.5"
            />
            <text x="25" y="22" textAnchor="middle" fill="#5A6E64" fontSize="8" fontFamily="monospace" fontWeight="bold">
              33/11kV
            </text>
            <circle cx="25" cy="48" r="11" fill="none" stroke="#237A5C" strokeWidth="1.5" />
            <circle cx="25" cy="62" r="11" fill="none" stroke="#237A5C" strokeWidth="1.5" />
            <text x="25" y="90" textAnchor="middle" fill="#8A9B92" fontSize="7" fontFamily="monospace">
              SUBSTATION
            </text>
          </g>

          {/* Feeder Lines */}
          {lines.map((line) => {
            const p1 = busCoords[line.from];
            const p2 = busCoords[line.to];
            if (!p1 || !p2) return null;

            const strokeProps = getLineStroke(line);
            const isTie = line.isTieLine;

            const dPath = isTie
              ? `M ${p1.x} ${p1.y} C ${p1.x + 80} ${p1.y + 120}, ${p2.x - 80} ${p2.y + 70}, ${p2.x} ${p2.y}`
              : `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;

            const midX = isTie ? (p1.x + p2.x) / 2 + 10 : (p1.x + p2.x) / 2;
            const midY = isTie ? (p1.y + p2.y) / 2 + 50 : (p1.y + p2.y) / 2 - 10;

            return (
              <g key={line.id}>
                {/* Base Line */}
                <path
                  d={dPath}
                  stroke={strokeProps.color}
                  strokeWidth={strokeProps.width}
                  strokeDasharray={strokeProps.dash}
                  fill="none"
                  opacity={line.isOpen ? 0.4 : 0.9}
                />

                {/* Animated Flow Particles */}
                {!line.isOpen && (
                  <path
                    d={dPath}
                    stroke="#237A5C"
                    strokeWidth="1.5"
                    fill="none"
                    className={line.powerFlowMW < 0 ? 'animate-reverse-flow' : 'animate-power-flow'}
                    opacity="0.8"
                  />
                )}

                {/* Line Loading Badge */}
                {!line.isOpen && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-18"
                      y="-7"
                      width="36"
                      height="14"
                      rx="3"
                      fill="#FFFFFF"
                      stroke={line.loadingPct > 100 ? '#D93B5E' : line.loadingPct > 80 ? '#D97706' : '#DFE7E2'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill={line.loadingPct > 100 ? '#D93B5E' : line.loadingPct > 80 ? '#D97706' : '#5A6E64'}
                      fontSize="8.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {line.loadingPct}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Tie Breaker Switch */}
          <g
            transform="translate(850, 310)"
            className="cursor-pointer group"
            onClick={toggleTieSwitch}
          >
            <rect
              x="-45"
              y="-13"
              width="90"
              height="26"
              rx="6"
              fill={tieSwitch.isOpen ? '#F7FAF8' : '#E8F6F0'}
              stroke={tieSwitch.isOpen ? '#DFE7E2' : '#237A5C'}
              strokeWidth="1.5"
              className="transition-colors group-hover:stroke-ctrl-accent"
            />
            <text
              x="0"
              y="3"
              textAnchor="middle"
              fill={tieSwitch.isOpen ? '#8A9B92' : '#1E7557'}
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {tieSwitch.isOpen ? 'SW 8-12: OPEN' : 'SW 8-12: CLOSED'}
            </text>
          </g>

          {/* Bus Nodes */}
          {buses.map((bus) => {
            const coord = busCoords[bus.id];
            if (!coord) return null;

            const isSelected = selectedBusId === bus.id;
            const colors = getBusColors(bus);
            const isCritical = bus.status === 'critical';

            return (
              <g
                key={bus.id}
                transform={`translate(${coord.x}, ${coord.y})`}
                className="cursor-pointer group"
                onClick={() => setSelectedBusId(bus.id)}
                onMouseEnter={() => setHoveredBus(bus)}
                onMouseLeave={() => setHoveredBus(null)}
              >
                {/* Selection Outline */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="none"
                    stroke="#237A5C"
                    strokeWidth="2"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Main Node */}
                <circle
                  cx="0"
                  cy="0"
                  r={bus.type === 'slack' ? 14 : 12}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-105 shadow-sm"
                />

                {/* Inner status dot */}
                <circle cx="0" cy="0" r="4" fill={colors.dot} />

                {/* Bus Label */}
                <text
                  x="0"
                  y="-16"
                  textAnchor="middle"
                  fill="#1A2821"
                  fontSize="10.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  BUS {bus.id < 10 ? `0${bus.id}` : bus.id}
                </text>

                {/* Voltage Tag */}
                <text
                  x="0"
                  y="24"
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="9.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {bus.voltage.toFixed(3)} pu
                </text>

                {/* DER Assets Badges */}
                {bus.hasPV && (
                  <g transform="translate(0, -36)">
                    <rect x="-24" y="-8" width="48" height="15" rx="4" fill="#FFF3EB" stroke="#FCD7C2" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#D9651E" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      PV {bus.genP.toFixed(1)}MW
                    </text>
                  </g>
                )}

                {bus.hasBattery && (
                  <g transform="translate(0, -36)">
                    <rect x="-24" y="-8" width="48" height="15" rx="4" fill="#E8F6F0" stroke="#BEE4D4" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#1E7557" fontSize="8" fontFamily="monospace" fontWeight="bold">
                      BESS
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-ctrl-elevated border-t border-ctrl-border text-xs font-mono text-ctrl-textSecondary">
        <div className="flex items-center gap-5">
          <span>
            Active Solar: <strong className="text-ctrl-textPrimary font-mono">{gridState.totalGenerationMW.toFixed(2)} MW</strong>
          </span>
          <span>
            Feeder Load: <strong className="text-ctrl-textPrimary font-mono">{gridState.totalLoadMW.toFixed(2)} MW</strong>
          </span>
          <span>
            Transformer: <strong className="text-ctrl-accent font-mono">{gridState.transformer.loadingPct}% ({gridState.transformer.currentMVA} MVA)</strong>
          </span>
        </div>
        <div className="text-[11px] text-ctrl-textTertiary flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-ctrl-accent" />
          <span>Click any bus node or switch to inspect telemetry</span>
        </div>
      </div>
    </div>
  );
};
