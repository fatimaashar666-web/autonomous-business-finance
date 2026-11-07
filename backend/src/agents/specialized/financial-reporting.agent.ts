import { Injectable } from '@nestjs/common';
import { ISpecializedAgent, AgentTaskRequest, AgentTaskResponse } from '../agent.interface.js';
import { AgentPermission, AgentSandbox } from '../../sandbox/agent-sandbox.js';
import { FinanceService } from '../../finance/finance.service.js';

@Injectable()
export class FinancialReportingAgent implements ISpecializedAgent {
  name = 'Financial Reporting Agent';
  role = 'Executive P&L Synthesis & Regulatory Audit Summaries';
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
      () => this.generateExecutiveReport(),
    );

    if (!sandboxResult.success) {
      throw new Error(sandboxResult.error);
    }

    return sandboxResult.data!;
  }

  private generateExecutiveReport(): AgentTaskResponse {
    const metrics = this.financeService.getMetrics();
    const depts = this.financeService.getDepartmentSpendAnalysis();
    const insights: string[] = [];
    const recommendations: string[] = [];

    insights.push(`=== EXECUTIVE FINANCIAL PERFORMANCE SUMMARY ===`);
    insights.push(`Total Recognized Revenue: $${metrics.totalRevenue.toLocaleString()}`);
    insights.push(`Total Operating Expenses: $${metrics.totalExpenses.toLocaleString()}`);
    insights.push(`Net Operating Income: $${metrics.netOperatingIncome.toLocaleString()}`);
    insights.push(`Gross Margin: ${metrics.grossMarginPct}% | Operating Margin: ${metrics.operatingMarginPct}%`);
    insights.push(`Total Available Treasury: $${metrics.totalTreasuryBalance.toLocaleString()}`);
    insights.push(`Calculated Runway: ${metrics.estimatedRunwayMonths} months`);
    insights.push(`Outstanding Accounts Receivable: $${metrics.pendingReceivablesTotal.toLocaleString()}`);
    insights.push(`Pending Accounts Payable: $${metrics.pendingPayablesTotal.toLocaleString()}`);

    recommendations.push(
      'Distribute standard monthly financial scorecard to executive leadership and board stakeholders.',
    );
    recommendations.push(
      'Schedule quarterly review for tax reserve allocations against current positive net operating margins.',
    );

    return {
      agentName: this.name,
      role: this.role,
      summary: `Automated Executive Financial Statement prepared. Net Income: $${metrics.netOperatingIncome.toLocaleString()} on Revenue of $${metrics.totalRevenue.toLocaleString()}. Runway is ${metrics.estimatedRunwayMonths} months.`,
      insights,
      recommendations,
      metrics: {
        totalRevenue: metrics.totalRevenue,
        totalExpenses: metrics.totalExpenses,
        netOperatingIncome: metrics.netOperatingIncome,
        operatingMarginPct: metrics.operatingMarginPct,
        totalTreasuryBalance: metrics.totalTreasuryBalance,
        departmentBreakdown: depts.map((d) => ({
          dept: d.department,
          spent: d.spent,
          utilization: d.utilizationPct,
        })),
      },
    };
  }
}
