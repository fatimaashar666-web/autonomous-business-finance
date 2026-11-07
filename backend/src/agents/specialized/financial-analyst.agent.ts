import { Injectable } from '@nestjs/common';
import { ISpecializedAgent, AgentTaskRequest, AgentTaskResponse } from '../agent.interface.js';
import { AgentPermission, AgentSandbox } from '../../sandbox/agent-sandbox.js';
import { FinanceService } from '../../finance/finance.service.js';

@Injectable()
export class FinancialAnalystAgent implements ISpecializedAgent {
  name = 'Financial Analyst Agent';
  role = 'Strategic Performance & Unit Economics';
  permissions = [AgentPermission.READ_FINANCIALS, AgentPermission.ANALYZE_DATA];

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
      () => this.runAnalysis(),
    );

    if (!sandboxResult.success) {
      throw new Error(sandboxResult.error);
    }

    return sandboxResult.data!;
  }

  private runAnalysis(): AgentTaskResponse {
    const metrics = this.financeService.getMetrics();
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Profitability analysis
    if (metrics.netOperatingIncome >= 0) {
      insights.push(
        `Business is operating profitably with Net Operating Income of $${metrics.netOperatingIncome.toLocaleString()} (${metrics.operatingMarginPct}% margin).`,
      );
    } else {
      insights.push(
        `Business is running a net operating deficit of $${Math.abs(metrics.netOperatingIncome).toLocaleString()} this cycle.`,
      );
      recommendations.push(
        'Curtail discretionary cloud and marketing spending until new enterprise revenue closes.',
      );
    }

    // Runway evaluation
    insights.push(
      `Current treasury balance ($${metrics.totalTreasuryBalance.toLocaleString()}) provides an estimated ${metrics.estimatedRunwayMonths} months of runway at current monthly burn of $${Math.round(metrics.monthlyBurnRate).toLocaleString()}.`,
    );

    if (metrics.estimatedRunwayMonths < 6) {
      recommendations.push(
        'CRITICAL: Runway is under 6 months. Expedite collection on outstanding receivables ($' +
          metrics.pendingReceivablesTotal.toLocaleString() +
          ').',
      );
    } else {
      recommendations.push(
        'Treasury posture is robust (> 12 months runway). Surplus yields can be safely deployed into targeted growth or reserved for payroll.',
      );
    }

    insights.push(
      `Gross margin stands at ${metrics.grossMarginPct}%, driven by strong recurring enterprise contracts.`,
    );

    return {
      agentName: this.name,
      role: this.role,
      summary: `Financial performance assessment: Company has $${metrics.totalTreasuryBalance.toLocaleString()} in liquid reserves with ${metrics.estimatedRunwayMonths} months runway and a ${metrics.grossMarginPct}% gross margin.`,
      insights,
      recommendations,
      metrics: {
        totalRevenue: metrics.totalRevenue,
        totalExpenses: metrics.totalExpenses,
        netOperatingIncome: metrics.netOperatingIncome,
        runwayMonths: metrics.estimatedRunwayMonths,
        grossMarginPct: metrics.grossMarginPct,
      },
    };
  }
}
