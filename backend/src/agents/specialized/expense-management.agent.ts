import { Injectable } from '@nestjs/common';
import { ISpecializedAgent, AgentTaskRequest, AgentTaskResponse } from '../agent.interface.js';
import { AgentPermission, AgentSandbox } from '../../sandbox/agent-sandbox.js';
import { FinanceService } from '../../finance/finance.service.js';
import { FinanceRepository } from '../../finance/finance.repository.js';
import { TransactionStatus } from '../../finance/finance.types.js';

@Injectable()
export class ExpenseManagementAgent implements ISpecializedAgent {
  name = 'Expense Management Agent';
  role = 'Autonomous Expense Categorization & Anomaly Monitoring';
  permissions = [
    AgentPermission.READ_FINANCIALS,
    AgentPermission.ANALYZE_DATA,
    AgentPermission.EXECUTE_CATEGORIZATION,
    AgentPermission.PROPOSE_ACTION,
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
      () => this.auditExpenses(),
    );

    if (!sandboxResult.success) {
      throw new Error(sandboxResult.error);
    }

    return sandboxResult.data!;
  }

  private auditExpenses(): AgentTaskResponse {
    const transactions = this.repo.getTransactions();
    const flagged = transactions.filter((t) => t.status === TransactionStatus.FLAGGED);
    const insights: string[] = [];
    const recommendations: string[] = [];

    insights.push(`Audited ${transactions.length} total ledger records.`);

    if (flagged.length > 0) {
      insights.push(
        `Identified ${flagged.length} anomalous expense transaction(s) requiring immediate financial review.`,
      );
      flagged.forEach((t) => {
        insights.push(
          `[ANOMALY FLAGGED] $${t.amount.toLocaleString()} - ${t.merchant || t.description} (${t.category}): ${t.anomalyReason || 'Abnormal transaction volume'}`,
        );
      });
      recommendations.push(
        'Execute vendor billing audit on flagged SaaS/Cloud overages; verify if team provisions match authorized seats.',
      );
    } else {
      insights.push('Zero anomalous transactions detected in current expense stream.');
      recommendations.push('Maintain automated continuous transaction classification.');
    }

    // Top categories
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCategories.length > 0) {
      const top = sortedCategories[0];
      insights.push(
        `Highest expense category is "${top[0]}" accounting for $${top[1].toLocaleString()}.`,
      );
    }

    let proposedAction;
    if (flagged.length > 0) {
      proposedAction = {
        actionType: 'AUDIT_VENDOR_DISPUTE',
        description: `Initiate dispute and vendor inquiry for flagged transaction ${flagged[0].id} ($${flagged[0].amount.toLocaleString()} - ${flagged[0].merchant})`,
        payload: { transactionId: flagged[0].id, amount: flagged[0].amount, merchant: flagged[0].merchant },
        requiresApproval: true,
      };
    }

    return {
      agentName: this.name,
      role: this.role,
      summary: `Expense audit completed. ${flagged.length} anomaly flagged out of ${transactions.length} ledger entries. Top cost driver: ${sortedCategories[0]?.[0] || 'N/A'}.`,
      insights,
      recommendations,
      proposedAction,
      metrics: {
        totalExpenseTransactions: transactions.filter((t) => t.type === 'EXPENSE').length,
        anomaliesDetected: flagged.length,
        categoryTotals,
      },
    };
  }
}
