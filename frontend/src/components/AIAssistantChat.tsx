import React, { useState } from 'react';
import type { OrchestrationResponse } from '../types';

interface AIAssistantChatProps {
  onSendMessage: (message: string) => Promise<OrchestrationResponse | null>;
  isProcessing: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  routedAgents?: string[];
  keyTakeaways?: string[];
  actionItems?: string[];
}

const initialTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  onSendMessage,
  isProcessing,
}) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content:
        'Hello CFO, I am your Autonomous AI Finance Assistant. I coordinate our specialized team: Financial Analyst, Expense Manager, Cash Flow Planner, Budget Controller, and Financial Reporting Agent. How can we optimize operations today?',
      timestamp: initialTimestamp,
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userText = input.trim();
    setInput('');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    const result = await onSendMessage(userText);
    if (result) {
      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        content: result.synthesis.executiveAnswer,
        routedAgents: result.routedAgents,
        keyTakeaways: result.synthesis.keyTakeaways,
        actionItems: result.synthesis.actionItems,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } else {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        content: 'Unable to communicate with the Multi-Agent Orchestrator. Please check connection.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const quickPrompts = [
    'Analyze our runway and liquid reserves',
    'Audit recent expenses and flag anomalies',
    'Review Q4 departmental budget variances',
    'Project 30-day cash flow & upcoming bills',
  ];

  return (
    <div className="flex flex-col h-[560px] bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <h3 className="font-semibold text-sm tracking-wide">Autonomous AI Finance Assistant</h3>
            <p className="text-xs text-indigo-200">Orchestrating 5 Autonomous Financial Specialists</p>
          </div>
        </div>
        <span className="text-xs bg-indigo-800/80 text-indigo-100 px-2.5 py-1 rounded-full border border-indigo-700 font-mono">
          Sandboxed Multi-Agent v2.0
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-200/80 dark:border-slate-700 rounded-bl-none'
              }`}
            >
              {m.routedAgents && m.routedAgents.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    Engaged Agents:
                  </span>
                  {m.routedAgents.map((ag) => (
                    <span
                      key={ag}
                      className="inline-flex items-center text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md font-medium border border-indigo-100 dark:border-indigo-800"
                    >
                      {ag}
                    </span>
                  ))}
                </div>
              )}

              <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>

              {m.keyTakeaways && m.keyTakeaways.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
                  <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1">Key Insights:</div>
                  <ul className="text-xs text-gray-600 dark:text-slate-400 space-y-1 list-disc pl-4">
                    {m.keyTakeaways.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {m.actionItems && m.actionItems.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                  <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Recommended Actions:</div>
                  <ul className="text-xs text-indigo-800 dark:text-indigo-400 space-y-1 list-disc pl-4">
                    {m.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <span className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 text-xs bg-indigo-50 dark:bg-indigo-950/50 px-3 py-2 rounded-lg w-max border border-indigo-100 dark:border-indigo-900">
            <div className="animate-spin h-3.5 w-3.5 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full" />
            <span>Orchestrating agents and evaluating financial data...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex flex-wrap gap-1.5">
        {quickPrompts.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setInput(q)}
            className="text-xs bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-700 px-2.5 py-1 rounded-md border border-gray-200 dark:border-slate-700 transition-colors shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI finance team anything (e.g. 'Project runway', 'Audit anomalies')..."
          className="flex-1 px-4 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !input.trim()}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          Dispatch
        </button>
      </form>
    </div>
  );
};
