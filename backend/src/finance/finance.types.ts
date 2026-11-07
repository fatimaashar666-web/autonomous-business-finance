export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  FLAGGED = 'FLAGGED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum InvoiceType {
  PAYABLE = 'PAYABLE',
  RECEIVABLE = 'RECEIVABLE',
}

export enum AgentActionStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

export interface AccountEntity {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  accountNum: string;
  isSimulated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionEntity {
  id: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  merchant?: string;
  date: Date;
  status: TransactionStatus;
  isSimulated: boolean;
  anomalyScore?: number;
  anomalyReason?: string;
  createdAt: Date;
}

export interface BudgetEntity {
  id: string;
  department: string;
  allocated: number;
  spent: number;
  period: string;
  alertThreshold: number;
  isSimulated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceEntity {
  id: string;
  type: InvoiceType;
  counterpart: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: Date;
  issuedDate: Date;
  description?: string;
  isSimulated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentActionEntity {
  id: string;
  agentName: string;
  actionType: string;
  description: string;
  payload: Record<string, any>;
  status: AgentActionStatus;
  requiresApproval: boolean;
  reasoning?: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface AuditLogEntity {
  id: string;
  source: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}
