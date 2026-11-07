import { useState } from 'react';
import {
  StatusCard,
  AIAssistantChat,
  ActionApprovals,
  FinancialCharts,
  TransactionsAndAudit,
  NavigationBar,
  type NavTab,
} from '../components';
import { useFinanceDashboard } from '../hooks';

export default function Dashboard() {
  const {
    metrics,
    transactions,
    budgets,
    forecast,
    actions,
    auditLogs,
    loading,
    error,
    refresh,
    approveAction,
    runComprehensiveAudit,
    sendAgentChat,
  } = useFinanceDashboard();

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [auditRunning, setAuditRunning] = useState(false);

  const handleRunFullAudit = async () => {
    setAuditRunning(true);
    await runComprehensiveAudit();
    setAuditRunning(false);
  };

  const pendingApprovalsCount = actions.filter((a) => a.status === 'PENDING_APPROVAL').length;
  const anomaliesCount = metrics?.anomalyCount || 0;

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
          Initializing Autonomous Multi-Agent Finance Operations...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── Sticky Interactive Navigation Bar ──────────────── */}
      <NavigationBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        anomaliesCount={anomaliesCount}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-8">
        {/* ── Header Controls & Live Simulation Badge ────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Autonomous Financial Operations Center
              </h2>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Real-Time Simulated Ledger
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Coordinated by 6 Specialized AI Agents with Sandboxed Execution &amp; Pre/Post Hooks
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={refresh}
              className="px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-750 shadow-2xs transition-colors"
            >
              Refresh Data
            </button>
            <button
              type="button"
              disabled={auditRunning}
              onClick={handleRunFullAudit}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {auditRunning ? (
                <>
                  <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Auditing Agents...</span>
                </>
              ) : (
                <span>Trigger All Agents Audit</span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-4 text-rose-800 dark:text-rose-300 text-sm">
            <strong>Communication Alert:</strong> {error}
          </div>
        )}

        {/* ── Key Financial KPI Cards (Always visible on Overview, or top banner) ─ */}
        {metrics && (activeTab === 'overview' || activeTab === 'analytics') && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              title="Total Liquid Treasury"
              value={`$${metrics.totalTreasuryBalance.toLocaleString()}`}
              accent="green"
            />
            <StatusCard
              title="Estimated Runway"
              value={`${metrics.estimatedRunwayMonths} Months`}
              accent={metrics.estimatedRunwayMonths < 6 ? 'red' : 'blue'}
            />
            <StatusCard
              title="Net Operating Income"
              value={`$${metrics.netOperatingIncome.toLocaleString()}`}
              accent={metrics.netOperatingIncome >= 0 ? 'green' : 'red'}
            />
            <StatusCard
              title="Active Expense Anomalies"
              value={`${metrics.anomalyCount} Flagged`}
              accent={metrics.anomalyCount > 0 ? 'yellow' : 'green'}
            />
          </section>
        )}

        {/* ── Tab Views ────────────────────────────────────────── */}

        {/* 1. OVERVIEW: Full Dashboard */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <section>
              <ActionApprovals actions={actions} onApprove={approveAction} />
            </section>

            <section>
              <AIAssistantChat onSendMessage={sendAgentChat} isProcessing={auditRunning} />
            </section>

            <section>
              <FinancialCharts budgets={budgets} forecast={forecast} />
            </section>

            <section>
              <TransactionsAndAudit transactions={transactions} auditLogs={auditLogs} />
            </section>
          </div>
        )}

        {/* 2. ASSISTANT: Dedicated Conversational AI Interface */}
        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 text-xs text-indigo-900 dark:text-indigo-300">
              <strong>Tip:</strong> The AI Finance Assistant dynamically routes queries to the Financial Analyst, Expense Manager, Cash Flow Planner, Budget Controller, or Reporting Agent based on your prompt intent.
            </div>
            <AIAssistantChat onSendMessage={sendAgentChat} isProcessing={auditRunning} />
          </div>
        )}

        {/* 3. APPROVALS: Week 7 Human-In-The-Loop Security Gate */}
        {activeTab === 'approvals' && (
          <div className="space-y-6">
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl p-4 text-xs text-amber-900 dark:text-amber-300">
              <strong>Week 7 Authorization Governance:</strong> Autonomous agents can formulate financial modifications (e.g. budget reallocations, vendor disputes, or disbursement proposals), but cannot execute them without human approval.
            </div>
            <ActionApprovals actions={actions} onApprove={approveAction} />
          </div>
        )}

        {/* 4. ANALYTICS: Cash Flow Forecasting & Departmental Budgets */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <FinancialCharts budgets={budgets} forecast={forecast} />
          </div>
        )}

        {/* 5. LEDGER: Live Transaction Stream */}
        {activeTab === 'ledger' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">Company Transaction Ledger</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Complete stream of categorized revenues, operational costs, and vendor debits</p>
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isFlagged = tx.status === 'FLAGGED';
                  return (
                    <div key={tx.id} className="py-3 flex items-center justify-between text-sm">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-800 dark:text-slate-200">{tx.description}</span>
                          {isFlagged && (
                            <span className="bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded text-xs animate-pulse">
                              ANOMALY FLAGGED
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-slate-400 mt-1">
                          <span>Merchant: {tx.merchant || 'N/A'}</span>
                          <span>•</span>
                          <span className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded">{tx.category}</span>
                          <span>•</span>
                          <span>Date: {new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                        {tx.anomalyReason && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 italic">{tx.anomalyReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`font-mono text-base font-bold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-slate-100'}`}>
                          {isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                        </span>
                        <div className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">{tx.status}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 6. AUDIT: Immutable Multi-Agent Audit Trail */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-gray-200 dark:border-slate-800 shadow-sm transition-colors">
              <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100 mb-1">Immutable Multi-Agent Audit Trail</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">Chronological record of pre/post execution hooks, permission checks, and agent telemetry</p>
              <div className="space-y-2.5 font-mono text-xs">
                {auditLogs.map((log) => {
                  const isWarn = log.level === 'WARN';
                  const isError = log.level === 'ERROR';
                  return (
                    <div
                      key={log.id}
                      className={`p-3 rounded-lg border ${
                        isError
                          ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                          : isWarn
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1 text-xs text-gray-500 dark:text-slate-400">
                        <span className="font-bold text-indigo-700 dark:text-indigo-400 uppercase">{log.source}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-sm font-sans">{log.message}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
