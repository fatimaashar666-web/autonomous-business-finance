import { Controller, Post, Body, Param } from '@nestjs/common';
import { MultiAgentOrchestrator } from './multi-agent-orchestrator.js';
import { ChatQueryDto, ApprovalDecisionDto } from './dto.js';

@Controller('agents')
export class AgentsController {
  constructor(private readonly orchestrator: MultiAgentOrchestrator) {}

  /**
   * Conversational Assistant & Query dispatch endpoint
   */
  @Post('chat')
  async chat(@Body() dto: ChatQueryDto) {
    const query = dto.query || 'Provide complete business financial status';
    return this.orchestrator.processQuery(query);
  }

  /**
   * Trigger full multi-agent coordinated financial audit
   */
  @Post('audit')
  async audit() {
    return this.orchestrator.runComprehensiveAudit();
  }

  /**
   * Human Approval Gate for sensitive proposed actions
   */
  @Post('actions/:id/approval')
  async approveAction(@Param('id') id: string, @Body() dto: ApprovalDecisionDto) {
    return this.orchestrator.approveAction(id, dto.approved);
  }
}
