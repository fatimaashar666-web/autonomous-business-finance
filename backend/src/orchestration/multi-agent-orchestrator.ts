import { Injectable, Logger } from '@nestjs/common';
import { FinancialAnalystAgent } from '../agents/specialized/financial-analyst.agent.js';
import { ExpenseManagementAgent } from '../agents/specialized/expense-management.agent.js';
import { CashFlowManagementAgent } from '../agents/specialized/cash-flow-management.agent.js';
import { BudgetPlanningAgent } from '../agents/specialized/budget-planning.agent.js';
import { FinancialReportingAgent } from '../agents/specialized/financial-reporting.agent.js';
import { AgentHooksService } from '../hooks/agent-hooks.service.js';
import { FinanceRepository } from '../finance/finance.repository.js';
import { AgentTaskResponse } from '../agents/agent.interface.js';
import { AgentActionStatus } from '../finance/finance.types.js';

export interface OrchestrationResult {
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

@Injectable()
export class MultiAgentOrchestrator {
  private readonly logger = new Logger(MultiAgentOrchestrator.name);

  constructor(
    private readonly analystAgent: FinancialAnalystAgent,
    private readonly expenseAgent: ExpenseManagementAgent,
    private readonly cashFlowAgent: CashFlowManagementAgent,
    private readonly budgetAgent: BudgetPlanningAgent,
    private readonly reportingAgent: FinancialReportingAgent,
    private readonly hooks: AgentHooksService,
    private readonly repo: FinanceRepository,
  ) {}

  /**
   * Intelligently routes queries to one or more specialized agents,
   * executes them with hooks and sandboxing, and synthesizes the final response.
   */
  async processQuery(query: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const orchestrationId = `orch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const lower = query.toLowerCase();

    // 1. Intent routing
    const targetAgents: { agent: any; name: string }[] = [];

    if (lower.includes('expense') || lower.includes('anomaly') || lower.includes('spend') || lower.includes('fraud') || lower.includes('cost')) {
      targetAgents.push({ agent: this.expenseAgent, name: this.expenseAgent.name });
    }
    if (lower.includes('cash') || lower.includes('liquidity') || lower.includes('forecast') || lower.includes('runway') || lower.includes('balance') || lower.includes('payable') || lower.includes('receivable')) {
      targetAgents.push({ agent: this.cashFlowAgent, name: this.cashFlowAgent.name });
    }
    if (lower.includes('budget') || lower.includes('department') || lower.includes('overrun') || lower.includes('allocation') || lower.includes('reallocate')) {
      targetAgents.push({ agent: this.budgetAgent, name: this.budgetAgent.name });
    }
    if (lower.includes('report') || lower.includes('p&l') || lower.includes('statement') || lower.includes('executive') || lower.includes('summary')) {
      targetAgents.push({ agent: this.reportingAgent, name: this.reportingAgent.name });
    }
    if (lower.includes('margin') || lower.includes('revenue') || lower.includes('profit') || lower.includes('analyst') || lower.includes('growth') || targetAgents.length === 0) {
      targetAgents.push({ agent: this.analystAgent, name: this.analystAgent.name });
    }

    // Deduplicate target agents
    const uniqueTargets = Array.from(new Set(targetAgents.map((t) => t.name))).map((name) =>
      targetAgents.find((t) => t.name === name)!,
    );

    this.logger.log(`[ORCHESTRATOR] Routing query "${query}" to: ${uniqueTargets.map((t) => t.name).join(', ')}`);
    this.repo.addAuditLog(
      'ORCHESTRATOR',
      'INFO',
      `Orchestrating user inquiry: "${query.substring(0, 80)}" to ${uniqueTargets.length} agent(s).`,
      { orchestrationId, query, routedTo: uniqueTargets.map((t) => t.name) },
    );

    // 2. Coordinated execution with pre/post hooks
    const agentResponses: AgentTaskResponse[] = [];
    const proposedActions: any[] = [];

    for (const target of uniqueTargets) {
      const taskStart = Date.now();
      const preValidation = await this.hooks.beforeExecute({
        agentName: target.name,
        action: 'EXECUTE_QUERY_TASK',
        params: { query },
      });

      if (!preValidation.allow) {
        this.logger.warn(`Execution rejected for ${target.name}: ${preValidation.reason}`);
        continue;
      }

      try {
        const response = await target.agent.execute({
          taskId: orchestrationId,
          query,
        });
        agentResponses.push(response);

        if (response.proposedAction) {
          // Record action in repository
          const recorded = this.repo.recordAgentAction({
            agentName: target.name,
            actionType: response.proposedAction.actionType,
            description: response.proposedAction.description,
            payload: response.proposedAction.payload,
            status: response.proposedAction.requiresApproval
              ? AgentActionStatus.PENDING_APPROVAL
              : AgentActionStatus.EXECUTED,
            requiresApproval: response.proposedAction.requiresApproval,
            reasoning: response.summary,
          });
          proposedActions.push(recorded);
        }

        await this.hooks.afterExecute({
          agentName: target.name,
          action: 'EXECUTE_QUERY_TASK',
          result: response.summary,
          executionDurationMs: Date.now() - taskStart,
        });
      } catch (err) {
        await this.hooks.onError(target.name, 'EXECUTE_QUERY_TASK', err as Error);
      }
    }

    // 3. Central synthesis
    const synthesis = this.synthesizeAgentOutputs(query, agentResponses, proposedActions);

    return {
      orchestrationId,
      query,
      routedAgents: uniqueTargets.map((t) => t.name),
      agentResponses,
      synthesis,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Run full multi-agent comprehensive financial audit (all agents simultaneously)
   */
  async runComprehensiveAudit(): Promise<OrchestrationResult> {
    return this.processQuery('comprehensive financial analysis, expenses, cash flow forecast, budget allocations, and executive reporting');
  }

  /**
   * Human Approval Gate for sensitive proposed actions
   */
  approveAction(actionId: string, approved: boolean): { success: boolean; message: string; action?: any } {
    const actions = this.repo.getAgentActions();
    const action = actions.find((a) => a.id === actionId);

    if (!action) {
      return { success: false, message: `Action ${actionId} not found.` };
    }

    if (action.status !== AgentActionStatus.PENDING_APPROVAL) {
      return { success: false, message: `Action ${actionId} is already in status ${action.status}.` };
    }

    if (approved) {
      // Execute the action safely
      if (action.actionType === 'REALLOCATE_BUDGET' && action.payload?.from && action.payload?.to && action.payload?.amount) {
        const reallocSuccess = this.repo.reallocateBudget(
          action.payload.from,
          action.payload.to,
          action.payload.amount,
        );

        if (!reallocSuccess) {
          this.repo.updateAgentActionStatus(actionId, AgentActionStatus.FAILED);
          return { success: false, message: 'Budget reallocation failed: source department lacks sufficient surplus.' };
        }
      }

      this.repo.updateAgentActionStatus(actionId, AgentActionStatus.APPROVED, new Date());
      this.repo.addAuditLog(
        'HUMAN_APPROVAL_GATE',
        'INFO',
        `Authorized and executed autonomous action ${actionId}: ${action.description}`,
      );
      return { success: true, message: `Action '${action.description}' approved and executed.`, action };
    } else {
      this.repo.updateAgentActionStatus(actionId, AgentActionStatus.REJECTED);
      this.repo.addAuditLog(
        'HUMAN_APPROVAL_GATE',
        'WARN',
        `User rejected proposed action ${actionId}: ${action.description}`,
      );
      return { success: true, message: `Action '${action.description}' was rejected.`, action };
    }
  }

  private synthesizeAgentOutputs(
    query: string,
    responses: AgentTaskResponse[],
    proposedActions: any[],
  ) {
    const keyTakeaways: string[] = [];
    const actionItems: string[] = [];

    responses.forEach((r) => {
      if (r.insights.length > 0) {
        keyTakeaways.push(...r.insights.slice(0, 2));
      }
      if (r.recommendations.length > 0) {
        actionItems.push(...r.recommendations.slice(0, 2));
      }
    });

    const summaries = responses.map((r) => `• [${r.agentName}]: ${r.summary}`).join('\n');
    const executiveAnswer =
      responses.length > 1
        ? `Coordinated analysis from ${responses.length} specialized agents across finance operations:\n\n${summaries}`
        : responses[0]?.summary || 'Analysis complete with no critical flags.';

    return {
      executiveAnswer,
      keyTakeaways: Array.from(new Set(keyTakeaways)).slice(0, 6),
      actionItems: Array.from(new Set(actionItems)).slice(0, 5),
      proposedActions,
    };
  }
}
