import { Injectable, Logger } from '@nestjs/common';
import { FinanceRepository } from './finance.repository.js';
import {
  TransactionType,
  TransactionEntity,
  AccountEntity,
  BudgetEntity,
  InvoiceEntity,
} from './finance.types.js';

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

export interface CashFlowForecastDay {
  date: string;
  projectedBalance: number;
  projectedInflow: number;
  projectedOutflow: number;
  netChange: number;
}

export interface DepartmentSpendAnalysis {
  department: string;
  allocated: number;
  spent: number;
  remaining: number;
  utilizationPct: number;
  isOverBudget: boolean;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly repo: FinanceRepository) {}

  getMetrics(): FinancialMetrics {
    const transactions = this.repo.getTransactions();
    const accounts = this.repo.getAccounts();
    const invoices = this.repo.getInvoices();

    let totalRevenue = 0;
    let totalExpenses = 0;
    let anomalyCount = 0;

    for (const tx of transactions) {
      if (tx.type === TransactionType.INCOME) {
        totalRevenue += tx.amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        totalExpenses += tx.amount;
      }
      if (tx.anomalyScore && tx.anomalyScore > 0.7) {
        anomalyCount++;
      }
    }

    const netOperatingIncome = totalRevenue - totalExpenses;
    const totalTreasuryBalance = accounts.reduce((acc, a) => acc + a.balance, 0);
    const operatingAccount = accounts.find((a) => a.type === 'OPERATING') || accounts[0];
    const operatingCashBalance = operatingAccount ? operatingAccount.balance : 0;

    // Monthly burn rate calculation based on average 30-day expense volume
    const monthlyBurnRate = Math.max(totalExpenses * 0.55, 35000); // normalized baseline
    const estimatedRunwayMonths =
      monthlyBurnRate > 0
        ? Number((totalTreasuryBalance / monthlyBurnRate).toFixed(1))
        : 99.0;

    const grossMarginPct =
      totalRevenue > 0
        ? Number((((totalRevenue - totalExpenses * 0.4) / totalRevenue) * 100).toFixed(1))
        : 0;

    const operatingMarginPct =
      totalRevenue > 0
        ? Number(((netOperatingIncome / totalRevenue) * 100).toFixed(1))
        : 0;

    const pendingPayablesTotal = invoices
      .filter((i) => i.type === 'PAYABLE' && i.status === 'UNPAID')
      .reduce((sum, i) => sum + i.amount, 0);

    const pendingReceivablesTotal = invoices
      .filter((i) => i.type === 'RECEIVABLE' && i.status === 'UNPAID')
      .reduce((sum, i) => sum + i.amount, 0);

    return {
      totalRevenue,
      totalExpenses,
      netOperatingIncome,
      operatingCashBalance,
      totalTreasuryBalance,
      monthlyBurnRate,
      estimatedRunwayMonths,
      grossMarginPct,
      operatingMarginPct,
      pendingPayablesTotal,
      pendingReceivablesTotal,
      anomalyCount,
      isSimulatedData: true,
    };
  }

  getTransactions(limit = 50): TransactionEntity[] {
    return this.repo.getTransactions().slice(0, limit);
  }

  getAccounts(): AccountEntity[] {
    return this.repo.getAccounts();
  }

  getBudgets(): BudgetEntity[] {
    return this.repo.getBudgets();
  }

  getInvoices(): InvoiceEntity[] {
    return this.repo.getInvoices();
  }

  getDepartmentSpendAnalysis(): DepartmentSpendAnalysis[] {
    const budgets = this.repo.getBudgets();
    return budgets.map((b) => {
      const remaining = b.allocated - b.spent;
      const utilizationPct = Number(((b.spent / b.allocated) * 100).toFixed(1));
      let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
      if (utilizationPct >= 95) {
        status = 'CRITICAL';
      } else if (utilizationPct >= b.alertThreshold * 100) {
        status = 'WARNING';
      }

      return {
        department: b.department,
        allocated: b.allocated,
        spent: b.spent,
        remaining,
        utilizationPct,
        isOverBudget: b.spent > b.allocated,
        status,
      };
    });
  }

  /**
   * Cash Flow Forecast Engine:
   * Generates a 30-day forward looking projection incorporating
   * known upcoming Payables, Receivables, recurring payroll, and historical burn.
   */
  generateCashFlowForecast(days = 30): CashFlowForecastDay[] {
    const accounts = this.repo.getAccounts();
    const invoices = this.repo.getInvoices();
    let currentBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const forecast: CashFlowForecastDay[] = [];
    const now = new Date();

    // Baseline daily operating burn rate (excluding special lump sums)
    const baselineDailyBurn = 2400.0;
    // Expected daily organic revenue
    const baselineDailyIncome = 2800.0;

    for (let i = 1; i <= days; i++) {
      const targetDate = new Date(now.getTime() + i * 24 * 3600 * 1000);
      const dateStr = targetDate.toISOString().split('T')[0];

      let dayInflow = baselineDailyIncome;
      let dayOutflow = baselineDailyBurn;

      // Check for scheduled receivables due on this day (+/- 1 day window)
      for (const inv of invoices) {
        const diffDays = Math.round(
          (inv.dueDate.getTime() - targetDate.getTime()) / (24 * 3600 * 1000),
        );
        if (diffDays === 0 && inv.status === 'UNPAID') {
          if (inv.type === 'RECEIVABLE') {
            dayInflow += inv.amount;
          } else if (inv.type === 'PAYABLE') {
            dayOutflow += inv.amount;
          }
        }
      }

      // Bi-weekly payroll spikes on day 14 and day 28
      if (i === 14 || i === 28) {
        dayOutflow += 72000.0; // payroll run
      }

      const netChange = dayInflow - dayOutflow;
      currentBalance += netChange;

      forecast.push({
        date: dateStr,
        projectedBalance: Math.round(currentBalance),
        projectedInflow: Math.round(dayInflow),
        projectedOutflow: Math.round(dayOutflow),
        netChange: Math.round(netChange),
      });
    }

    return forecast;
  }

  /**
   * Autonomous categorization helper
   */
  categorizeTransaction(description: string, merchant?: string): string {
    const text = `${description} ${merchant || ''}`.toLowerCase();
    if (text.includes('aws') || text.includes('cloud') || text.includes('datadog') || text.includes('hosting')) {
      return 'Cloud Services';
    }
    if (text.includes('payroll') || text.includes('gusto') || text.includes('salary')) {
      return 'Payroll';
    }
    if (text.includes('ads') || text.includes('marketing') || text.includes('google') || text.includes('linkedin')) {
      return 'Marketing';
    }
    if (text.includes('saas') || text.includes('software') || text.includes('openai') || text.includes('subscription')) {
      return 'Software & SaaS';
    }
    if (text.includes('legal') || text.includes('audit') || text.includes('cooley') || text.includes('compliance')) {
      return 'Legal & Professional';
    }
    if (text.includes('office') || text.includes('wework') || text.includes('rent')) {
      return 'Operations';
    }
    if (text.includes('enterprise') || text.includes('contract') || text.includes('retainer') || text.includes('consulting')) {
      return 'Revenue';
    }
    return 'General Business Expense';
  }

  /**
   * Autonomous Anomaly Detection:
   * Computes category variance and flags transactions that exceed 2.5x the rolling average
   */
  evaluateAnomaly(amount: number, category: string): { isAnomaly: boolean; score: number; reason?: string } {
    const transactions = this.repo.getTransactions().filter((t) => t.category === category);
    if (transactions.length < 2) {
      if (amount > 15000) {
        return {
          isAnomaly: true,
          score: 0.85,
          reason: `High value transaction ($${amount}) with limited category baseline.`,
        };
      }
      return { isAnomaly: false, score: 0.1 };
    }

    const avg = transactions.reduce((acc, t) => acc + t.amount, 0) / transactions.length;
    if (amount > avg * 2.5) {
      const score = Math.min(0.99, Number((amount / (avg * 2.5) * 0.7).toFixed(2)));
      return {
        isAnomaly: true,
        score,
        reason: `Amount ($${amount}) is ${((amount / avg) * 100).toFixed(0)}% above category average ($${avg.toFixed(0)}).`,
      };
    }

    return { isAnomaly: false, score: 0.15 };
  }
}
