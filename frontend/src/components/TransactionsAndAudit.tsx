import React from 'react';
import type { Transaction, AuditLog } from '../types';

interface TransactionsAndAuditProps {
  transactions: Transaction[];
  auditLogs: AuditLog[];
}

export const TransactionsAndAudit: React.FC<TransactionsAndAuditProps> = ({
  transactions,
  auditLogs,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Real-time Ledger Stream */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Live Financial Ledger</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Autonomous categorization & anomaly detection</p>
          </div>
          <span className="text-[11px] font-mono bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded-sm">
            Expense Agent
          </span>
        </div>

        <div className="overflow-y-auto max-h-[360px] divide-y divide-gray-100 dark:divide-slate-800">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const isFlagged = tx.status === 'FLAGGED';
            return (
              <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800 dark:text-slate-200">{tx.description}</span>
                    {isFlagged && (
                      <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold px-1.5 py-0.5 rounded-sm text-[10px] animate-pulse">
                        ANOMALY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">
                    <span>{tx.merchant || 'Vendor'}</span>
                    <span>•</span>
                    <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 px-1.5 py-0.2 rounded-xs">{tx.category}</span>
                    <span>•</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-semibold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                  </span>
                  <div className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider">{tx.status}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Week 7 Audit & Hooks Log */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">Multi-Agent Audit Trail</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">Sandboxing, pre/post execution hooks and security records</p>
          </div>
          <span className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-sm">
            Week 7 Hooks
          </span>
        </div>

        <div className="overflow-y-auto max-h-[360px] space-y-2.5 font-mono text-xs">
          {auditLogs.map((log) => {
            const isWarn = log.level === 'WARN';
            const isError = log.level === 'ERROR';
            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-lg border text-[11px] ${
                  isError
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                    : isWarn
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center mb-1 text-[10px] text-gray-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400 uppercase">{log.source}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="leading-tight">{log.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
