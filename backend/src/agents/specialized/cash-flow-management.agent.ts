import { Injectable } from '@nestjs/common';
import { ISpecializedAgent, AgentTaskRequest, AgentTaskResponse } from '../agent.interface.js';
import { AgentPermission, AgentSandbox } from '../../sandbox/agent-sandbox.js';
import { FinanceService } from '../../finance/finance.service.js';

@Injectable()
export class CashFlowManagementAgent implements ISpecializedAgent {
  name = 'Cash Flow Management Agent';
  role = 'Liquidity Monitoring & 30-Day Forward Forecast';
  permissions = [
    AgentPermission.READ_FINANCIALS,
    AgentPermission.ANALYZE_DATA,
    AgentPermission.PROPOSE_ACTION,
  ];

  constructor(private readonly financeService: FinanceService) {}

  async execute(request: AgentTaskRequest): Promise<AgentTaskResponse> {
    const sandboxResult = await AgentSandbox.execute(
      {
        agentName: this.name,
        role: this.role,
        permissions: this.permissions,
        executionId: request.taskId,
      },
      AgentPermission.ANALYZE_DATA,
      request,
      () => this.monitorCashFlow(),
    );

    if (!sandboxResult.success) {
      throw new Error(sandboxResult.error);
    }

    return sandboxResult.data!;
  }

  private monitorCashFlow(): AgentTaskResponse {
    const metrics = this.financeService.getMetrics();
    const forecast = this.financeService.generateCashFlowForecast(30);
    const invoices = this.financeService.getInvoices();

    const insights: string[] = [];
    const recommendations: string[] = [];

    // Liquidity health
    insights.push(
      `Liquid treasury balance stands at $${metrics.totalTreasuryBalance.toLocaleString()} across operating, payroll, and tax accounts.`,
    );

    // Payables vs. Receivables gap
    const netWorkingCapitalImpact = metrics.pendingReceivablesTotal - metrics.pendingPayablesTotal;
    insights.push(
      `Working capital snapshot: Pending AR is $${metrics.pendingReceivablesTotal.toLocaleString()} vs Pending AP of $${metrics.pendingPayablesTotal.toLocaleString()} (Net favorable: +$${netWorkingCapitalImpact.toLocaleString()}).`,
    );

    // Low point in the 30-day curve
    let lowestBalance = Infinity;
    let lowestDay = '';
    forecast.forEach((day) => {
      if (day.projectedBalance < lowestBalance) {
        lowestBalance = day.projectedBalance;
        lowestDay = day.date;
      }
    });

    insights.push(
      `30-day forecast projects minimum liquidity trough of $${lowestBalance.toLocaleString()} on ${lowestDay} (post-payroll cycle).`,
    );

    if (lowestBalance < 100000) {
      recommendations.push(
        'WARNING: Projected cash balance dips below conservative $100k safety threshold. Schedule receivable reminders to clients immediately.',
      );
    } else {
      recommendations.push(
        'Liquidity cushion remains positive across entire 30-day forecast horizon. No immediate short-term financing needed.',
      );
    }

    // Upcoming urgent payables (due in <= 5 days)
    const urgentPayables = invoices.filter(
      (i) =>
        i.type === 'PAYABLE' &&
        i.status === 'UNPAID' &&
        (i.dueDate.getTime() - Date.now()) / (24 * 3600 * 1000) <= 5,
    );

    if (urgentPayables.length > 0) {
      urgentPayables.forEach((p) => {
        recommendations.push(
          `Upcoming bill: $${p.amount.toLocaleString()} due to ${p.counterpart} within 5 days. Confirm operating account liquidity.`,
        );
      });
    }

    return {
      agentName: this.name,
      role: this.role,
      summary: `Cash flow analysis: Treasury has $${metrics.totalTreasuryBalance.toLocaleString()}. Forecast projects lowest balance of $${lowestBalance.toLocaleString()} on ${lowestDay} with positive working capital net (+$${netWorkingCapitalImpact.toLocaleString()}).`,
      insights,
      recommendations,
      metrics: {
        totalTreasuryBalance: metrics.totalTreasuryBalance,
        lowestForecastBalance: lowestBalance,
        lowestForecastDate: lowestDay,
        pendingReceivables: metrics.pendingReceivablesTotal,
        pendingPayables: metrics.pendingPayablesTotal,
      },
    };
  }
}
