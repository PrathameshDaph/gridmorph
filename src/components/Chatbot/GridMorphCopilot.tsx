import React, { useState, useRef, useEffect } from 'react';
import { useGrid } from '../../context/GridContext';
import { processChatbotQuery, ChatbotResponse } from '../../simulation/chatbotEngine';
import {
  Bot,
  Send,
  X,
  Sparkles,
  Minimize2,
  Maximize2,
  RefreshCw,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionButton?: ChatbotResponse['actionButton'];
  metrics?: ChatbotResponse['metrics'];
}

export const GridMorphCopilot: React.FC = () => {
  const gridCtx = useGrid();
  const {
    gridState,
    baselineState,
    applyAction,
    resetToBaseline,
    selectScenario,
    setActiveTab,
    candidates,
    winningActionId,
  } = gridCtx;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeViolationsCount = baselineState.activeViolations.length;
  const bus7V = gridState.buses.find((b) => b.id === 7)?.voltage || 1.045;

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    sender: 'assistant',
    text: `👋 **Hello Operator!** I am **MorphAI Copilot**, your real-time grid intelligence assistant.\n\nI am connected to the **11kV 12-Bus AC Power-Flow Solver**, SCADA telemetry, and Random Forest ML forecast engine. Ask me anything about voltages, line loads, dispatch strategies, or physics formulas!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    metrics: [
      { label: 'Grid Health', value: `${gridState.gridHealthPct}%`, isGood: gridState.gridHealthPct >= 90 },
      { label: 'Active Alerts', value: `${activeViolationsCount}`, isGood: activeViolationsCount === 0 },
      { label: 'Bus 7 Voltage', value: `${bus7V.toFixed(3)} pu`, isGood: bus7V <= 1.050 },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const quickPrompts = [
    { label: '🔍 Why is Bus 7 overvoltage?', query: 'Why is Bus 7 experiencing overvoltage?' },
    { label: '⚡ Apply Optimal Action', query: 'What is the optimal corrective action and apply it' },
    { label: '📊 30-min ML Forecast', query: 'What is the 30 minute solar forecast?' },
    { label: '⚡ Line 1-2 & Thermal Load', query: 'What is the thermal loading on line 1-2?' },
    { label: '🔋 Battery Storage SOC', query: 'What is the battery SOC and capacity at Bus 5?' },
    { label: '⚖️ Compare All 5 Actions', query: 'Compare all 5 candidate dispatch actions' },
    { label: '📐 Explain BFS AC Formula', query: 'Explain the AC Backward-Forward Sweep power flow formula' },
    { label: '🛑 Test Infeasible Boundary', query: 'Why is the extreme scenario infeasible?' },
    { label: '🔄 Reset to Baseline', query: 'Reset the network to nominal baseline' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processChatbotQuery(text, gridCtx);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        metrics: response.metrics,
        actionButton: response.actionButton,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const executeAction = (actionButton: ChatMessage['actionButton']) => {
    if (!actionButton) return;

    if (actionButton.actionType === 'APPLY_RECOMMENDED') {
      applyAction(actionButton.payload || 'ACT-Q-CONTROL');
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: `⚡ **Dispatch Setpoint Transmitted!** Digital twin revalidated: Peak terminal voltage restored within statutory limits with **100% renewable energy preserved**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (actionButton.actionType === 'GOTO_TAB') {
      setActiveTab(actionButton.payload || 'twin');
    } else if (actionButton.actionType === 'LOAD_SCENARIO') {
      selectScenario(actionButton.payload || 'extreme');
      setActiveTab('feasibility');
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: `🚨 **Extreme Constrained Scenario Activated!** Feasibility diagnostics report generated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else if (actionButton.actionType === 'RESET') {
      resetToBaseline();
      selectScenario('normal');
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: `🔄 **Network Reset!** Nominal 1.000 pu voltage baseline restored across all 12 buses.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  // Helper to render formatted text with bold, code spans, bullet lists
  const renderFormattedText = (rawText: string) => {
    const paragraphs = rawText.split('\n\n');

    return paragraphs.map((p, pIdx) => {
      const lines = p.split('\n');
      return (
        <div key={pIdx} className="space-y-1">
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
            const content = isBullet ? line.trim().substring(1).trim() : line;

            // Split line by bolding `**` and code spans ```
            const segments = content.split(/(\*\*.*?\*\*|`.*?`|\$.*?\$)/g);

            return (
              <div key={lIdx} className={isBullet ? 'flex items-start gap-1.5 pl-1.5' : ''}>
                {isBullet && <span className="text-[#237A5C] font-bold select-none">•</span>}
                <div className="flex-1">
                  {segments.map((seg, sIdx) => {
                    if (seg.startsWith('**') && seg.endsWith('**')) {
                      return <strong key={sIdx} className="font-bold text-ctrl-textPrimary">{seg.slice(2, -2)}</strong>;
                    }
                    if (seg.startsWith('`') && seg.endsWith('`')) {
                      return (
                        <code key={sIdx} className="px-1.5 py-0.5 rounded bg-ctrl-elevated border border-ctrl-border text-[11px] font-mono text-[#166046] font-bold mx-0.5">
                          {seg.slice(1, -1)}
                        </code>
                      );
                    }
                    if (seg.startsWith('$') && seg.endsWith('$')) {
                      return (
                        <span key={sIdx} className="font-mono text-[#237A5C] font-semibold bg-[#EAF5F0] px-1 py-0.2 rounded border border-[#CDE5DA] mx-0.5">
                          {seg.slice(1, -1)}
                        </span>
                      );
                    }
                    return <span key={sIdx}>{seg}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 bg-[#237A5C] hover:bg-[#1C674E] text-white rounded-full shadow-2xl transition-all transform hover:scale-105 border-2 border-white/40"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 border-2 border-[#237A5C] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-300 border-2 border-[#237A5C] rounded-full" />
          </div>

          <div className="text-left">
            <div className="text-xs font-sans font-bold leading-tight flex items-center gap-1.5">
              <span>MorphAI Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            </div>
            <div className="text-[10px] font-mono text-emerald-100 opacity-90">
              {activeViolationsCount > 0 ? `${activeViolationsCount} Alert Active • Ask AI` : 'Online • Live SCADA Twin'}
            </div>
          </div>
        </button>
      )}

      {/* Expandable Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-[#DFE7E2] shadow-2xl rounded-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[92vw] sm:w-[460px] h-[620px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-5 py-3.5 bg-ctrl-mint border-b border-[#BCE7D3] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#237A5C] flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-sans font-bold text-sm text-[#166046]">
                    MorphAI • Grid Operator Copilot
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-white text-[#237A5C] text-[9px] font-mono font-bold border border-[#BCE7D3]">
                    v2.4 AC
                  </span>
                </div>
                <p className="text-[10px] font-mono text-[#237A5C] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#237A5C] animate-pulse" />
                  <span>SCADA Telemetry & AC Solver Connected</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([initialGreeting])}
                title="Reset conversation"
                className="p-1.5 rounded-lg hover:bg-white/60 text-[#166046] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 rounded-lg hover:bg-white/60 text-[#166046] transition-colors hidden sm:block"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg hover:bg-white/60 text-[#166046] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="px-3 py-2 bg-[#F6FAF8] border-b border-[#E2EAE5] overflow-x-auto scrollbar-none flex items-center gap-2">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.query)}
                className="px-2.5 py-1 rounded-full bg-white hover:bg-ctrl-mint hover:border-[#BCE7D3] border border-[#DFE7E2] text-[11px] font-sans text-ctrl-textPrimary whitespace-nowrap transition-all shadow-xs shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FAFCFB]">
            {messages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-[#237A5C] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl p-3.5 text-xs font-sans leading-relaxed shadow-xs ${
                      isAssistant
                        ? 'bg-white border border-[#DFE7E2] text-ctrl-textPrimary'
                        : 'bg-[#237A5C] text-white rounded-tr-xs'
                    }`}
                  >
                    {/* Render Rich Formatted Content */}
                    <div className="space-y-2">
                      {isAssistant ? renderFormattedText(msg.text) : msg.text}
                    </div>

                    {/* Metric Chips embedded in message */}
                    {msg.metrics && msg.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-1.5 mt-3 pt-2.5 border-t border-[#DFE7E2]">
                        {msg.metrics.map((m, mIdx) => (
                          <div
                            key={mIdx}
                            className="bg-ctrl-elevated p-1.5 rounded-lg border border-ctrl-border text-center font-mono"
                          >
                            <div className="text-[9px] text-ctrl-textTertiary uppercase">{m.label}</div>
                            <div
                              className={`text-[11px] font-extrabold mt-0.5 ${
                                m.isGood === true
                                  ? 'text-[#166046]'
                                  : m.isGood === false
                                  ? 'text-ctrl-critical'
                                  : 'text-ctrl-textPrimary'
                              }`}
                            >
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Button inside Assistant Message */}
                    {msg.actionButton && (
                      <div className="mt-3 pt-2 border-t border-[#E2EAE5]">
                        <button
                          onClick={() => executeAction(msg.actionButton)}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-[#237A5C] hover:bg-[#1C674E] text-white rounded-xl font-sans font-bold text-xs shadow-sm transition-all"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>{msg.actionButton.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      </div>
                    )}

                    <div
                      className={`text-[9px] font-mono mt-1.5 text-right ${
                        isAssistant ? 'text-ctrl-textTertiary' : 'text-emerald-200'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-lg bg-[#237A5C] text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#DFE7E2] rounded-2xl px-4 py-2.5 text-xs text-ctrl-textTertiary flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#237A5C] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#237A5C] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#237A5C] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-mono text-[#237A5C] ml-1">Computing exact power flow...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#DFE7E2]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about Bus 7, Line 1-2, Battery SOC, Q-Control, BFS..."
                className="flex-1 px-4 py-2.5 bg-ctrl-elevated border border-ctrl-border rounded-xl text-xs font-sans text-ctrl-textPrimary placeholder:text-ctrl-textTertiary focus:outline-none focus:border-[#237A5C] focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 rounded-xl bg-[#237A5C] hover:bg-[#1C674E] disabled:opacity-40 text-white transition-colors shadow-sm shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] font-mono text-ctrl-textTertiary text-center mt-1.5">
              Exact AC Backward-Forward Sweep & SCADA Telemetry Engine
            </div>
          </div>
        </div>
      )}
    </>
  );
};

