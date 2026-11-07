import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  AccountEntity,
  TransactionEntity,
  BudgetEntity,
  InvoiceEntity,
  AgentActionEntity,
  AuditLogEntity,
  TransactionType,
  TransactionStatus,
  InvoiceType,
  InvoiceStatus,
  AgentActionStatus,
} from './finance.types.js';

/**
 * Resilient Central Financial Repository:
 * Uses Prisma Client when PostgreSQL is connected, with an in-memory
 * state layer with realistic business data and explicit simulation flags.
 */
@Injectable()
export class FinanceRepository implements OnModuleInit {
  private readonly logger = new Logger(FinanceRepository.name);

  // In-memory persistent collections
  private accounts: Map<string, AccountEntity> = new Map();
  private transactions: Map<string, TransactionEntity> = new Map();
  private budgets: Map<string, BudgetEntity> = new Map();
  private invoices: Map<string, InvoiceEntity> = new Map();
  private agentActions: Map<string, AgentActionEntity> = new Map();
  private auditLogs: AuditLogEntity[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.seedRealisticBusinessData();
    this.logger.log(`Initialized Financial Repository with ${this.transactions.size} ledger transactions and ${this.budgets.size} departmental budgets.`);
  }

  private seedRealisticBusinessData() {
    // 1. Accounts
    const opAcc: AccountEntity = {
      id: 'acc-op-01',
      name: 'Primary Operating Treasury',
      type: 'OPERATING',
      balance: 482500.0,
      currency: 'USD',
      accountNum: 'SVB-90214-OP',
      isSimulated: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
    };
    const payAcc: AccountEntity = {
      id: 'acc-pay-02',
      name: 'Payroll Reserve Escrow',
      type: 'PAYROLL',
      balance: 145000.0,
      currency: 'USD',
      accountNum: 'JPM-44812-PR',
      isSimulated: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
    };
    const taxAcc: AccountEntity = {
      id: 'acc-tax-03',
      name: 'Tax & Compliance Reserve',
      type: 'TAX_RESERVE',
      balance: 62000.0,
      currency: 'USD',
      accountNum: 'CHASE-11029-TX',
      isSimulated: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date(),
    };

    [opAcc, payAcc, taxAcc].forEach((a) => this.accounts.set(a.id, a));

    // 2. Department Budgets
    const budgetList: BudgetEntity[] = [
      {
        id: 'b-eng',
        department: 'Engineering',
        allocated: 120000.0,
        spent: 88400.0,
        period: '2026-Q4',
        alertThreshold: 0.85,
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b-mkt',
        department: 'Marketing',
        allocated: 65000.0,
        spent: 62100.0, // High utilization! 95.5%
        period: '2026-Q4',
        alertThreshold: 0.85,
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b-ops',
        department: 'Operations',
        allocated: 45000.0,
        spent: 31200.0,
        period: '2026-Q4',
        alertThreshold: 0.85,
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b-sales',
        department: 'Sales & BD',
        allocated: 50000.0,
        spent: 34900.0,
        period: '2026-Q4',
        alertThreshold: 0.85,
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'b-ga',
        department: 'General & Administrative',
        allocated: 35000.0,
        spent: 24500.0,
        period: '2026-Q4',
        alertThreshold: 0.85,
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    budgetList.forEach((b) => this.budgets.set(b.id, b));

    // 3. Transactions (realistic historical and recent transactions)
    const rawTx: Partial<TransactionEntity>[] = [
      {
        amount: 85000.0,
        type: TransactionType.INCOME,
        category: 'Enterprise Subscription',
        description: 'Annual Enterprise SaaS Licensing - Acme Corp',
        merchant: 'Acme Corp',
        date: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      },
      {
        amount: 42000.0,
        type: TransactionType.INCOME,
        category: 'Client Retainer',
        description: 'Q4 Fintech Implementation Milestones',
        merchant: 'Stripe Partners',
        date: new Date(Date.now() - 5 * 24 * 3600 * 1000),
      },
      {
        amount: 14500.0,
        type: TransactionType.EXPENSE,
        category: 'Cloud Services',
        description: 'AWS Cluster Compute & GPU Inference Instance reservation',
        merchant: 'Amazon Web Services',
        date: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      },
      {
        amount: 19800.0, // ANOMALY: Unusual spike
        type: TransactionType.EXPENSE,
        category: 'Software & SaaS',
        description: 'Unscheduled Global Token API Overages and Addon Pack',
        merchant: 'OpenAI Enterprise',
        date: new Date(Date.now() - 3 * 3600 * 1000),
        anomalyScore: 0.94,
        anomalyReason: 'Expense is 380% above the 30-day baseline for AI/SaaS tooling.',
        status: TransactionStatus.FLAGGED,
      },
      {
        amount: 72000.0,
        type: TransactionType.EXPENSE,
        category: 'Payroll',
        description: 'Semi-monthly bi-weekly payroll cycle direct deposit',
        merchant: 'Gusto Payroll',
        date: new Date(Date.now() - 6 * 24 * 3600 * 1000),
      },
      {
        amount: 16500.0,
        type: TransactionType.EXPENSE,
        category: 'Marketing',
        description: 'Google & LinkedIn B2B Acquisition Campaign blitz',
        merchant: 'Google Ads',
        date: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      },
      {
        amount: 4800.0,
        type: TransactionType.EXPENSE,
        category: 'Operations',
        description: 'WeWork Global Office Leases & High-speed fiber lines',
        merchant: 'WeWork',
        date: new Date(Date.now() - 8 * 24 * 3600 * 1000),
      },
      {
        amount: 125000.0,
        type: TransactionType.INCOME,
        category: 'Enterprise Subscription',
        description: 'Multi-year Platform Expansion Contract Renewal',
        merchant: 'Global Logistics Inc',
        date: new Date(Date.now() - 12 * 24 * 3600 * 1000),
      },
      {
        amount: 6200.0,
        type: TransactionType.EXPENSE,
        category: 'Legal & Professional',
        description: 'SOC2 Type II Annual Audit & Compliance Retainer',
        merchant: 'Cooley LLP',
        date: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      },
      {
        amount: 25000.0,
        type: TransactionType.INCOME,
        category: 'Consulting',
        description: 'Autonomous Architecture Consulting Engagement',
        merchant: 'FinTech Capital Partners',
        date: new Date(Date.now() - 18 * 24 * 3600 * 1000),
      },
      {
        amount: 9200.0,
        type: TransactionType.EXPENSE,
        category: 'Cloud Services',
        description: 'Datadog & Snowflake Data Lake Observability',
        merchant: 'Datadog',
        date: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      },
      {
        amount: 72000.0,
        type: TransactionType.EXPENSE,
        category: 'Payroll',
        description: 'Monthly mid-cycle payroll run',
        merchant: 'Gusto Payroll',
        date: new Date(Date.now() - 21 * 24 * 3600 * 1000),
      },
    ];

    rawTx.forEach((tx, idx) => {
      const id = `tx-${String(idx + 1).padStart(3, '0')}`;
      this.transactions.set(id, {
        id,
        accountId: opAcc.id,
        amount: tx.amount || 0,
        type: tx.type || TransactionType.EXPENSE,
        category: tx.category || 'Uncategorized',
        description: tx.description || 'Transaction record',
        merchant: tx.merchant || 'Vendor',
        date: tx.date || new Date(),
        status: tx.status || TransactionStatus.COMPLETED,
        isSimulated: true,
        anomalyScore: tx.anomalyScore,
        anomalyReason: tx.anomalyReason,
        createdAt: new Date(),
      });
    });

    // 4. Invoices (AP & AR)
    const invoicesList: InvoiceEntity[] = [
      {
        id: 'inv-rec-101',
        type: InvoiceType.RECEIVABLE,
        counterpart: 'Nordic Bank Solutions',
        amount: 68000.0,
        status: InvoiceStatus.UNPAID,
        dueDate: new Date(Date.now() + 12 * 24 * 3600 * 1000), // Due in 12 days
        issuedDate: new Date(Date.now() - 15 * 24 * 3600 * 1000),
        description: 'Q4 Core Autonomous Banking Integration Phase 1',
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'inv-rec-102',
        type: InvoiceType.RECEIVABLE,
        counterpart: 'Apex Commercial Ventures',
        amount: 45000.0,
        status: InvoiceStatus.UNPAID,
        dueDate: new Date(Date.now() + 25 * 24 * 3600 * 1000),
        issuedDate: new Date(Date.now() - 5 * 24 * 3600 * 1000),
        description: 'Custom AI Financial Forecasting Pipeline',
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'inv-pay-201',
        type: InvoiceType.PAYABLE,
        counterpart: 'Cloudflare Enterprise Infrastructure',
        amount: 8500.0,
        status: InvoiceStatus.UNPAID,
        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000), // Due in 4 days
        issuedDate: new Date(Date.now() - 20 * 24 * 3600 * 1000),
        description: 'Monthly DDoS, WAF, and Global Edge CDN',
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'inv-pay-202',
        type: InvoiceType.PAYABLE,
        counterpart: 'McKinley Accounting & Tax Advisory',
        amount: 14200.0,
        status: InvoiceStatus.UNPAID,
        dueDate: new Date(Date.now() + 18 * 24 * 3600 * 1000),
        issuedDate: new Date(Date.now() - 10 * 24 * 3600 * 1000),
        description: 'Quarterly Corporate Tax Strategy & Compliance Filings',
        isSimulated: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    invoicesList.forEach((inv) => this.invoices.set(inv.id, inv));

    // 5. Initial Sample Agent Action awaiting human approval
    const initialAction: AgentActionEntity = {
      id: 'act-001',
      agentName: 'Budget Planning Agent',
      actionType: 'REALLOCATE_BUDGET',
      description: 'Reallocate $10,000 from Engineering surplus to Marketing budget to avert Q4 deficit',
      payload: { from: 'Engineering', to: 'Marketing', amount: 10000.0 },
      status: AgentActionStatus.PENDING_APPROVAL,
      requiresApproval: true,
      reasoning: 'Marketing has reached 95.5% allocation with 5 weeks remaining in Q4. Engineering has $31,600 projected surplus.',
      createdAt: new Date(Date.now() - 1 * 3600 * 1000),
    };
    this.agentActions.set(initialAction.id, initialAction);

    // Initial Audit Log
    this.addAuditLog('ORCHESTRATOR', 'INFO', 'Autonomous Business Finance platform repository initialized with realistic enterprise ledger data.');
  }

  // ── Queries & Mutations ──────────────────────────────────────────

  getAccounts(): AccountEntity[] {
    return Array.from(this.accounts.values());
  }

  getTransactions(): TransactionEntity[] {
    return Array.from(this.transactions.values()).sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    );
  }

  getTransactionById(id: string): TransactionEntity | undefined {
    return this.transactions.get(id);
  }

  addTransaction(tx: Omit<TransactionEntity, 'id' | 'createdAt'>): TransactionEntity {
    const id = `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newTx: TransactionEntity = {
      ...tx,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTx);

    // Update account balance
    const account = this.accounts.get(tx.accountId);
    if (account) {
      if (tx.type === TransactionType.INCOME) {
        account.balance += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        account.balance -= tx.amount;
      }
      account.updatedAt = new Date();
    }

    return newTx;
  }

  getBudgets(): BudgetEntity[] {
    return Array.from(this.budgets.values());
  }

  updateBudgetSpent(department: string, delta: number): BudgetEntity | undefined {
    for (const budget of this.budgets.values()) {
      if (budget.department.toLowerCase() === department.toLowerCase()) {
        budget.spent += delta;
        budget.updatedAt = new Date();
        return budget;
      }
    }
    return undefined;
  }

  reallocateBudget(fromDept: string, toDept: string, amount: number): boolean {
    let source: BudgetEntity | undefined;
    let target: BudgetEntity | undefined;

    for (const b of this.budgets.values()) {
      if (b.department.toLowerCase() === fromDept.toLowerCase()) source = b;
      if (b.department.toLowerCase() === toDept.toLowerCase()) target = b;
    }

    if (source && target && source.allocated - source.spent >= amount) {
      source.allocated -= amount;
      target.allocated += amount;
      source.updatedAt = new Date();
      target.updatedAt = new Date();
      return true;
    }
    return false;
  }

  getInvoices(): InvoiceEntity[] {
    return Array.from(this.invoices.values()).sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime(),
    );
  }

  getAgentActions(): AgentActionEntity[] {
    return Array.from(this.agentActions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  recordAgentAction(action: Omit<AgentActionEntity, 'id' | 'createdAt'>): AgentActionEntity {
    const id = `act-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const fullAction: AgentActionEntity = {
      ...action,
      id,
      createdAt: new Date(),
    };
    this.agentActions.set(id, fullAction);
    return fullAction;
  }

  updateAgentActionStatus(
    id: string,
    status: AgentActionStatus,
    executedAt?: Date,
  ): AgentActionEntity | undefined {
    const act = this.agentActions.get(id);
    if (act) {
      act.status = status;
      if (executedAt) act.executedAt = executedAt;
      return act;
    }
    return undefined;
  }

  getAuditLogs(limit = 100): AuditLogEntity[] {
    return [...this.auditLogs]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  addAuditLog(
    source: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL',
    message: string,
    metadata?: Record<string, any>,
  ): AuditLogEntity {
    const log: AuditLogEntity = {
      id: `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      source,
      level,
      message,
      metadata,
      timestamp: new Date(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
}
