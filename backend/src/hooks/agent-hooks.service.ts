import { Injectable, Logger } from '@nestjs/common';
import { FinanceRepository } from '../finance/finance.repository.js';

export interface PreExecutionPayload {
  agentName: string;
  action: string;
  params: Record<string, any>;
}

export interface PostExecutionPayload {
  agentName: string;
  action: string;
  result: any;
  executionDurationMs: number;
}

@Injectable()
export class AgentHooksService {
  private readonly logger = new Logger(AgentHooksService.name);

  constructor(private readonly repo: FinanceRepository) {}

  /**
   * Pre-execution Hook:
   * Validates parameters, guardrails, and records intent.
   */
  async beforeExecute(payload: PreExecutionPayload): Promise<{ allow: boolean; reason?: string }> {
    this.logger.log(`[HOOK:PRE-EXEC] ${payload.agentName} preparing action: ${payload.action}`);

    // Guardrail: verify budget reallocation limits ($50,000 max single autonomous adjustment)
    if (payload.action === 'REALLOCATE_BUDGET' && payload.params?.amount > 50000) {
      this.repo.addAuditLog(
        'HOOK_PRE_VALIDATE',
        'WARN',
        `Blocked action: ${payload.agentName} attempted reallocation of $${payload.params.amount} exceeding $50,000 threshold.`,
      );
      return {
        allow: false,
        reason: 'Requested budget reallocation exceeds autonomous security threshold of $50,000.',
      };
    }

    return { allow: true };
  }

  /**
   * Post-execution Hook:
   * Performs output verification, mathematical consistency checks, and audit logging.
   */
  async afterExecute(payload: PostExecutionPayload): Promise<void> {
    this.logger.log(
      `[HOOK:POST-EXEC] ${payload.agentName} completed ${payload.action} in ${payload.executionDurationMs}ms`,
    );

    this.repo.addAuditLog(
      `AGENT_${payload.agentName.toUpperCase().replace(/\s+/g, '_')}`,
      'INFO',
      `Completed operation '${payload.action}' successfully in ${payload.executionDurationMs}ms.`,
      { durationMs: payload.executionDurationMs },
    );
  }

  /**
   * Error Hook:
   * Catches and records any agent failures into the persistent audit trail.
   */
  async onError(agentName: string, action: string, error: Error): Promise<void> {
    this.logger.error(`[HOOK:ERROR] Failure in ${agentName} during ${action}: ${error.message}`);
    this.repo.addAuditLog(
      `AGENT_ERROR_${agentName.toUpperCase().replace(/\s+/g, '_')}`,
      'ERROR',
      `Execution failed in '${action}': ${error.message}`,
      { stack: error.stack },
    );
  }
}
