import React from 'react';
import { GridProvider, useGrid } from './context/GridContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { CommandCenter } from './pages/CommandCenter';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ForecastModule } from './components/Forecast/ForecastModule';
import { WhatIfLab } from './components/WhatIfLab/WhatIfLab';
import { ActionMatrix } from './components/ActionComparison/ActionMatrix';
import { BeforeAfterView } from './components/BeforeAfterView';
import { FeasibilityView } from './components/Feasibility/FeasibilityView';
import { LiveSimulationView } from './components/LiveSim/LiveSimulationView';
import { OperatorReportView } from './components/Report/OperatorReportView';
import { DemoModal } from './components/DemoModal';
import { GridMorphCopilot } from './components/Chatbot/GridMorphCopilot';

const MainContent: React.FC = () => {
  const { activeTab } = useGrid();

  return (
    <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
      {activeTab === 'command' && <CommandCenter />}
      {activeTab === 'twin' && <DigitalTwinPage />}
      {activeTab === 'forecast' && <ForecastModule />}
      {activeTab === 'whatif' && <WhatIfLab />}
      {activeTab === 'actions' && (
        <div className="space-y-8">
          <ActionMatrix />
          <BeforeAfterView />
        </div>
      )}
      {activeTab === 'feasibility' && <FeasibilityView />}
      {activeTab === 'live' && <LiveSimulationView />}
      {activeTab === 'report' && <OperatorReportView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <GridProvider>
      <div className="min-h-screen bg-ctrl-bg text-ctrl-textPrimary flex flex-col justify-between selection:bg-ctrl-accent/20 selection:text-ctrl-textPrimary">
        <div>
          {/* Top Header */}
          <Header />

          {/* Navigation Bar */}
          <Navigation />

          {/* Dynamic Main View */}
          <MainContent />
        </div>

        {/* 90-Second Demo Modal Overlay */}
        <DemoModal />

        {/* MorphAI Interactive Grid Copilot Chatbot */}
        <GridMorphCopilot />

        {/* Technical Footer */}
        <footer className="bg-ctrl-surface border-t border-ctrl-border mt-12 py-4 px-6 text-xs font-mono text-ctrl-textSecondary">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ctrl-textPrimary">GRIDMORPH</span>
              <span className="text-ctrl-border">|</span>
              <span className="text-ctrl-textTertiary">Adaptive Digital Twin for Renewable Distribution Networks</span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-ctrl-textTertiary">
              <span>AC Backward-Forward Sweep Solver</span>
              <span>•</span>
              <span>Random Forest ML Regressor</span>
              <span>•</span>
              <span>12-Bus Benchmark</span>
            </div>
          </div>
        </footer>
      </div>
    </GridProvider>
  );
};

export default App;
