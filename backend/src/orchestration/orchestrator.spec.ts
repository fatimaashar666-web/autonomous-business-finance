import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceRepository } from '../finance/finance.repository.js';
import { FinanceService } from '../finance/finance.service.js';
import { AgentHooksService } from '../hooks/agent-hooks.service.js';
import { FinancialAnalystAgent } from '../agents/specialized/financial-analyst.agent.js';
import { ExpenseManagementAgent } from '../agents/specialized/expense-management.agent.js';
import { CashFlowManagementAgent } from '../agents/specialized/cash-flow-management.agent.js';
import { BudgetPlanningAgent } from '../agents/specialized/budget-planning.agent.js';
import { FinancialReportingAgent } from '../agents/specialized/financial-reporting.agent.js';
import { MultiAgentOrchestrator } from './multi-agent-orchestrator.js';

describe('MultiAgentOrchestrator', () => {
  let orchestrator: MultiAgentOrchestrator;
  let repo: FinanceRepository;

  beforeEach(async () => {
    repo = new FinanceRepository({} as any);
    await repo.onModuleInit();
    const service = new FinanceService(repo);
    const hooks = new AgentHooksService(repo);

    const analyst = new FinancialAnalystAgent(service);
    const expense = new ExpenseManagementAgent(service, repo);
    const cashFlow = new CashFlowManagementAgent(service);
    const budget = new BudgetPlanningAgent(service, repo);
    const reporting = new FinancialReportingAgent(service);

    orchestrator = new MultiAgentOrchestrator(
      analyst,
      expense,
      cashFlow,
      budget,
      reporting,
      hooks,
      repo,
    );
  });

  it('should route cash flow query to Cash Flow Management Agent', async () => {
    const res = await orchestrator.processQuery('What is our projected liquidity and 30-day cash curve?');
    expect(res.routedAgents).toContain('Cash Flow Management Agent');
    expect(res.agentResponses.length).toBeGreaterThan(0);
    expect(res.synthesis.executiveAnswer).toBeDefined();
  });

  it('should route multi-intent queries to multiple specialized agents', async () => {
    const res = await orchestrator.processQuery('Analyze runway and flag unusual expenses');
    expect(res.routedAgents.length).toBeGreaterThanOrEqual(2);
    expect(res.routedAgents).toContain('Expense Management Agent');
    expect(res.synthesis.keyTakeaways.length).toBeGreaterThan(0);
  });

  it('should process human approval gate decisions for proposed actions', () => {
    const actions = repo.getAgentActions();
    expect(actions.length).toBeGreaterThan(0);

    const firstAction = actions[0];
    const approvalResult = orchestrator.approveAction(firstAction.id, true);
    expect(approvalResult.success).toBe(true);

    const updated = repo.getAgentActions().find((a) => a.id === firstAction.id);
    expect(updated?.status).toBe('APPROVED');
  });
});
