import { Injectable } from '@nestjs/common';
import { ISpecializedAgent, AgentTaskRequest, AgentTaskResponse } from '../agent.interface.js';
import { AgentPermission, AgentSandbox } from '../../sandbox/agent-sandbox.js';
import { FinanceService } from '../../finance/finance.service.js';
import { FinanceRepository } from '../../finance/finance.repository.js';

@Injectable()
export class BudgetPlanningAgent implements ISpecializedAgent {
  name = 'Budget Planning Agent';
  role = 'Departmental Allocation & Variance Optimization';
  permissions = [
    AgentPermission.READ_FINANCIALS,
    AgentPermission.ANALYZE_DATA,
    AgentPermission.PROPOSE_ACTION,
    AgentPermission.EXECUTE_BUDGET_REALLOCATION,
  ];

  constructor(
    private readonly financeService: FinanceService,
    private readonly repo: FinanceRepository,
  ) {}

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
      () => this.evaluateBudgets(),
    );

    if (!sandboxResult.success) {
      throw new Error(sandboxResult.error);
    }

    return sandboxResult.data!;
  }

  private evaluateBudgets(): AgentTaskResponse {
    const analysis = this.financeService.getDepartmentSpendAnalysis();
    const insights: string[] = [];
    const recommendations: string[] = [];

    const criticalDepts = analysis.filter((d) => d.status === 'CRITICAL');
    const warningDepts = analysis.filter((d) => d.status === 'WARNING');
    const surplusDepts = analysis.filter((d) => d.utilizationPct < 75);

    analysis.forEach((d) => {
      insights.push(
        `${d.department}: Spent $${d.spent.toLocaleString()} / $${d.allocated.toLocaleString()} (${d.utilizationPct}% utilized). Remaining: $${d.remaining.toLocaleString()}. Status: ${d.status}.`,
      );
    });

    let proposedAction;

    if (criticalDepts.length > 0) {
      const targetDept = criticalDepts[0];
      const sourceDept = surplusDepts[0] || analysis.find((d) => d.remaining > 15000);

      recommendations.push(
        `CRITICAL: Department "${targetDept.department}" is at ${targetDept.utilizationPct}% utilization. Risk of budget overrun before quarter end.`,
      );

      if (sourceDept) {
        const reallocAmount = 10000;
        recommendations.push(
          `Optimization proposal: Reallocate $${reallocAmount.toLocaleString()} from ${sourceDept.department} (which has $${sourceDept.remaining.toLocaleString()} remaining) to ${targetDept.department}.`,
        );

        proposedAction = {
          actionType: 'REALLOCATE_BUDGET',
          description: `Reallocate $${reallocAmount.toLocaleString()} from ${sourceDept.department} to ${targetDept.department}`,
          payload: { from: sourceDept.department, to: targetDept.department, amount: reallocAmount },
          requiresApproval: true,
        };
      }
    } else if (warningDepts.length > 0) {
      recommendations.push(
        `Monitor ${warningDepts.map((d) => d.department).join(', ')} - spend has reached warning thresholds.`,
      );
    } else {
      recommendations.push(
        'All department expenditures are tracking within expected quarterly boundaries.',
      );
    }

    return {
      agentName: this.name,
      role: this.role,
      summary: `Budget monitoring review: ${analysis.length} departments evaluated. Critical overruns: ${criticalDepts.length}, Warnings: ${warningDepts.length}.`,
      insights,
      recommendations,
      proposedAction,
      metrics: {
        totalAllocated: analysis.reduce((s, a) => s + a.allocated, 0),
        totalSpent: analysis.reduce((s, a) => s + a.spent, 0),
        departmentsAtRisk: criticalDepts.length + warningDepts.length,
      },
    };
  }
}
