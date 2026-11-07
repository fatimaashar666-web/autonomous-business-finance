import { Module } from '@nestjs/common';
import { FinanceModule } from '../finance/finance.module.js';
import { AgentHooksService } from '../hooks/agent-hooks.service.js';
import { FinancialAnalystAgent } from '../agents/specialized/financial-analyst.agent.js';
import { ExpenseManagementAgent } from '../agents/specialized/expense-management.agent.js';
import { CashFlowManagementAgent } from '../agents/specialized/cash-flow-management.agent.js';
import { BudgetPlanningAgent } from '../agents/specialized/budget-planning.agent.js';
import { FinancialReportingAgent } from '../agents/specialized/financial-reporting.agent.js';
import { MultiAgentOrchestrator } from './multi-agent-orchestrator.js';
import { AgentsController } from './agents.controller.js';

@Module({
  imports: [FinanceModule],
  controllers: [AgentsController],
  providers: [
    AgentHooksService,
    FinancialAnalystAgent,
    ExpenseManagementAgent,
    CashFlowManagementAgent,
    BudgetPlanningAgent,
    FinancialReportingAgent,
    MultiAgentOrchestrator,
  ],
  exports: [MultiAgentOrchestrator, AgentHooksService],
})
export class OrchestrationModule {}
