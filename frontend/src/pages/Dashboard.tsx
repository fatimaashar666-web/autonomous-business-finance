import { useState } from 'react';
import {
  StatusCard,
  AIAssistantChat,
  ActionApprovals,
  FinancialCharts,
  TransactionsAndAudit,
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

  const [auditRunning, setAuditRunning] = useState(false);

  const handleRunFullAudit = async () => {
    setAuditRunning(true);
    await runComprehensiveAudit();
    setAuditRunning(false);
  };

  if (loading && !metrics) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
        <p className="text-sm font-medium text-gray-500">
          Initializing Autonomous Multi-Agent Finance Operations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Top Header Controls & Live Simulation Badge ────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Autonomous Financial Operations Center
            </h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Real-Time Simulated Data
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Coordinated by 6 Specialized AI Agents with Sandboxed Execution &amp; Pre/Post Hooks
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={refresh}
            className="px-3.5 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-2xs transition-colors"
          >
            Refresh Ledger
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
              <span>Run Multi-Agent Audit</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 text-sm">
          <strong>Communication Alert:</strong> {error}
        </div>
      )}

      {/* ── Key Financial KPI Cards ─────────────────────────── */}
      {metrics && (
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

      {/* ── Week 7 Security & Human Approval Gate ────────────── */}
      <section>
        <ActionApprovals actions={actions} onApprove={approveAction} />
      </section>

      {/* ── AI Finance Assistant Conversational Terminal ────── */}
      <section>
        <AIAssistantChat onSendMessage={sendAgentChat} isProcessing={auditRunning} />
      </section>

      {/* ── Forecasting & Departmental Budgets ────────────────── */}
      <section>
        <FinancialCharts
          budgets={budgets}
          forecast={forecast}
        />
      </section>

      {/* ── Live Ledger & Sandboxed Audit Trail ──────────────── */}
      <section>
        <TransactionsAndAudit
          transactions={transactions}
          auditLogs={auditLogs}
        />
      </section>
    </div>
  );
}
