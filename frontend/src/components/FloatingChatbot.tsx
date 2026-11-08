import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '../api';
import type { OrchestrationResponse } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  routedAgents?: string[];
  isError?: boolean;
}

const welcomeMessage: ChatMessage = {
  id: 'floating-welcome',
  sender: 'assistant',
  content:
    'Hello! I’m your AI Finance Assistant. Ask me about runway, expenses, budgets, cash flow, or executive reporting.',
  timestamp: 'Now',
};

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isProcessing]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const clearChat = () => {
    if (!isProcessing) {
      setMessages([{ ...welcomeMessage, id: `welcome-${Date.now()}`, timestamp: 'Now' }]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = input.trim();

    if (!query || isProcessing) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: formatTime(),
    };

    setInput('');
    setMessages((current) => [...current, userMessage]);
    setIsProcessing(true);

    try {
      const response = await apiClient.post<OrchestrationResponse>('/agents/chat', {
        query,
      });

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          content: response.data.synthesis.executiveAnswer,
          timestamp: formatTime(),
          routedAgents: response.data.routedAgents,
        },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'I couldn’t reach the finance service right now. Please try again in a moment.';

      setMessages((current) => [
        ...current,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          content: message,
          timestamp: formatTime(),
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open AI finance assistant"
          className="group flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-900/20 transition duration-200 hover:scale-105 hover:bg-indigo-700 focus:outline-hidden focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900"
        >
          <svg className="h-6 w-6 transition-transform group-hover:-rotate-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M20 11.5c0 4.142-3.582 7.5-8 7.5a8.75 8.75 0 0 1-3.34-.65L4 20l1.13-3.39A7.17 7.17 0 0 1 4 11.5C4 7.358 7.582 4 12 4s8 3.358 8 7.5Z" />
          </svg>
          <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-950" />
        </button>
      )}

      {isOpen && isMinimized && (
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Finance Assistant
          </button>
          <button
            type="button"
            onClick={closeChat}
            aria-label="Close chat"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      )}

      {isOpen && !isMinimized && (
        <section
          aria-label="AI finance assistant"
          className="flex h-[min(640px,calc(100vh-2rem))] w-[calc(100vw-2rem)] max-w-[410px] origin-bottom-right flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 animate-[chat-pop-in_180ms_ease-out] dark:border-slate-700 dark:bg-slate-900 sm:h-[min(640px,calc(100vh-3rem))]"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-900 px-4 py-3.5 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M20 11.5c0 4.142-3.582 7.5-8 7.5a8.75 8.75 0 0 1-3.34-.65L4 20l1.13-3.39A7.17 7.17 0 0 1 4 11.5C4 7.358 7.582 4 12 4s8 3.358 8 7.5Z" />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-indigo-950" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">AI Finance Assistant</h2>
                <p className="truncate text-[11px] text-indigo-200">Multi-agent CFO support</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearChat}
                disabled={isProcessing}
                aria-label="Clear chat"
                title="Clear chat"
                className="rounded-lg p-2 text-indigo-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 7h14M10 11v6M14 11v6M6.5 7l.7 12h9.6l.7-12M9 7V4h6v3" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                aria-label="Minimize chat"
                title="Minimize chat"
                className="rounded-lg p-2 text-indigo-200 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close chat"
                title="Close chat"
                className="rounded-lg p-2 text-indigo-200 transition hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 p-4 dark:bg-slate-950/50" aria-live="polite">
            {messages.map((message) => (
              <div key={message.id} className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.sender === 'user'
                      ? 'rounded-br-md bg-indigo-600 text-white'
                      : message.isError
                        ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.routedAgents && message.routedAgents.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 border-t border-slate-200/70 pt-2 dark:border-slate-700">
                      {message.routedAgents.map((agent) => (
                        <span key={agent} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                          {agent.replace(' Agent', '')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 text-[10px] text-slate-400 dark:text-slate-500">{message.timestamp}</span>
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-300">
                <span className="flex gap-1" aria-label="AI is typing">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                </span>
                <span>Reviewing your financial data…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 transition focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-950">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type your message..."
                aria-label="Chat message"
                disabled={isProcessing}
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={isProcessing || !input.trim()}
                className="rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isProcessing ? '...' : 'Send'}
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400 dark:text-slate-500">Press Enter to send · Responses are generated by the finance agents</p>
          </form>
        </section>
      )}
    </div>
  );
}
