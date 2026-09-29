import React from 'react';
import { useGrid } from '../context/GridContext';
import {
  LayoutDashboard,
  Cpu,
  TrendingUp,
  Sliders,
  Scale,
  AlertOctagon,
  Radio,
  FileText,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, gridState } = useGrid();
  const violationCount = gridState.activeViolations.length;

  const navItems: NavItem[] = [
    { id: 'command', label: 'Command Center', icon: LayoutDashboard },
    { id: 'twin', label: 'Digital Twin', icon: Cpu },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'whatif', label: 'What-If Lab', icon: Sliders },
    {
      id: 'actions',
      label: 'Actions',
      icon: Scale,
      badge: violationCount > 0 ? `${violationCount}` : undefined,
      badgeColor: 'bg-ctrl-tintRose text-ctrl-tintRoseText border border-ctrl-tintRoseBorder font-bold',
    },
    {
      id: 'feasibility',
      label: 'Feasibility',
      icon: AlertOctagon,
    },
    { id: 'live', label: 'Live Simulation', icon: Radio },
    { id: 'report', label: 'Reports', icon: FileText },
  ];

  return (
    <nav className="bg-ctrl-surface border-b border-ctrl-border px-6 py-0 overflow-x-auto">
      <div className="flex items-center gap-6 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 py-3 text-xs font-sans font-medium transition-colors relative ${
                isActive
                  ? 'text-ctrl-accent font-semibold'
                  : 'text-ctrl-textSecondary hover:text-ctrl-textPrimary'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-ctrl-accent' : 'text-ctrl-textTertiary'}`} />
              <span>{item.label}</span>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.2 rounded-btn text-[10px] font-mono leading-tight ${
                    item.badgeColor || 'bg-ctrl-elevated text-ctrl-textSecondary border border-ctrl-border'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-ctrl-accent rounded-t" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
