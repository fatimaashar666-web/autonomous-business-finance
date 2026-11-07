import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api';
import type {
  FinancialMetrics,
  Transaction,
  DepartmentBudget,
  CashFlowForecastDay,
  AgentAction,
  AuditLog,
  OrchestrationResponse,
} from '../types';

export function useFinanceDashboard() {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<DepartmentBudget[]>([]);
  const [forecast, setForecast] = useState<CashFlowForecastDay[]>([]);
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [mRes, tRes, bRes, fRes, aRes, lRes] = await Promise.all([
        apiClient.get<FinancialMetrics>('/finance/metrics'),
        apiClient.get<Transaction[]>('/finance/transactions?limit=25'),
        apiClient.get<DepartmentBudget[]>('/finance/budgets'),
        apiClient.get<CashFlowForecastDay[]>('/finance/forecast?days=14'),
        apiClient.get<AgentAction[]>('/finance/actions'),
        apiClient.get<AuditLog[]>('/finance/audit-logs?limit=15'),
      ]);

      setMetrics(mRes.data);
      setTransactions(tRes.data);
      setBudgets(bRes.data);
      setForecast(fRes.data);
      setActions(aRes.data);
      setAuditLogs(lRes.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err?.response?.data?.message || err?.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        const [mRes, tRes, bRes, fRes, aRes, lRes] = await Promise.all([
          apiClient.get<FinancialMetrics>('/finance/metrics'),
          apiClient.get<Transaction[]>('/finance/transactions?limit=25'),
          apiClient.get<DepartmentBudget[]>('/finance/budgets'),
          apiClient.get<CashFlowForecastDay[]>('/finance/forecast?days=14'),
          apiClient.get<AgentAction[]>('/finance/actions'),
          apiClient.get<AuditLog[]>('/finance/audit-logs?limit=15'),
        ]);

        if (!ignore) {
          setMetrics(mRes.data);
          setTransactions(tRes.data);
          setBudgets(bRes.data);
          setForecast(fRes.data);
          setActions(aRes.data);
          setAuditLogs(lRes.data);
          setError(null);
        }
      } catch (err: any) {
        if (!ignore) {
          console.error('Failed to fetch dashboard data:', err);
          setError(err?.response?.data?.message || err?.message || 'Error communicating with backend.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  const approveAction = async (actionId: string, approved: boolean) => {
    try {
      await apiClient.post(`/agents/actions/${actionId}/approval`, { approved });
      await fetchDashboardData();
      return true;
    } catch (err) {
      console.error('Error approving action:', err);
      return false;
    }
  };

  const runComprehensiveAudit = async (): Promise<OrchestrationResponse | null> => {
    try {
      const res = await apiClient.post<OrchestrationResponse>('/agents/audit', {});
      await fetchDashboardData();
      return res.data;
    } catch (err) {
      console.error('Error running audit:', err);
      return null;
    }
  };

  const sendAgentChat = async (query: string): Promise<OrchestrationResponse | null> => {
    try {
      const res = await apiClient.post<OrchestrationResponse>('/agents/chat', { query });
      await fetchDashboardData();
      return res.data;
    } catch (err) {
      console.error('Error in agent chat:', err);
      return null;
    }
  };

  return {
    metrics,
    transactions,
    budgets,
    forecast,
    actions,
    auditLogs,
    loading,
    error,
    refresh: fetchDashboardData,
    approveAction,
    runComprehensiveAudit,
    sendAgentChat,
  };
}
