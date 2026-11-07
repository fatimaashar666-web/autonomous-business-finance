export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
  operatingCashBalance: number;
  totalTreasuryBalance: number;
  monthlyBurnRate: number;
  estimatedRunwayMonths: number;
  grossMarginPct: number;
  operatingMarginPct: number;
  pendingPayablesTotal: number;
  pendingReceivablesTotal: number;
  anomalyCount: number;
  isSimulatedData: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  description: string;
  merchant?: string;
  date: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'FLAGGED';
  isSimulated: boolean;
  anomalyScore?: number;
  anomalyReason?: string;
}

export interface DepartmentBudget {
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationPct: number;
  isOverBudget: boolean;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface CashFlowForecastDay {
  date: string;
  projectedBalance: number;
  projectedInflow: number;
  projectedOutflow: number;
  netChange: number;
}

export interface Invoice {
  id: string;
  type: 'PAYABLE' | 'RECEIVABLE';
  counterpart: string;
  amount: number;
  status: 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE';
  dueDate: string;
  issuedDate: string;
  description?: string;
  isSimulated: boolean;
}

export interface AgentAction {
  id: string;
  agentName: string;
  actionType: string;
  description: string;
  payload: Record<string, any>;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
  requiresApproval: boolean;
  reasoning?: string;
  createdAt: string;
  executedAt?: string;
}

export interface AuditLog {
  id: string;
  source: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AgentTaskResponse {
  agentName: string;
  role: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
}

export interface OrchestrationResponse {
  orchestrationId: string;
  query: string;
  routedAgents: string[];
  agentResponses: AgentTaskResponse[];
  synthesis: {
    executiveAnswer: string;
    keyTakeaways: string[];
    actionItems: string[];
    proposedActions: any[];
  };
  durationMs: number;
}
