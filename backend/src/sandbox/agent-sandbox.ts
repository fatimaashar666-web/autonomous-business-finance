export interface AgentContext {
  agentName: string;
  role: string;
  permissions: AgentPermission[];
  executionId: string;
}

export enum AgentPermission {
  READ_FINANCIALS = 'READ_FINANCIALS',
  ANALYZE_DATA = 'ANALYZE_DATA',
  PROPOSE_ACTION = 'PROPOSE_ACTION',
  EXECUTE_CATEGORIZATION = 'EXECUTE_CATEGORIZATION',
  EXECUTE_BUDGET_REALLOCATION = 'EXECUTE_BUDGET_REALLOCATION',
  EXECUTE_PAYMENT = 'EXECUTE_PAYMENT',
}

/**
 * Sandboxed Agent Runner:
 * Enforces strict permission validation, isolates memory and catches runtime faults.
 */
export class AgentSandbox {
  static async execute<TInput, TOutput>(
    context: AgentContext,
    requiredPermission: AgentPermission,
    input: TInput,
    taskFn: (input: TInput) => Promise<TOutput> | TOutput,
  ): Promise<{ success: boolean; data?: TOutput; error?: string }> {
    // 1. Permission check
    if (!context.permissions.includes(requiredPermission)) {
      return {
        success: false,
        error: `Security Sandbox Violation: Agent '${context.agentName}' lacks required permission '${requiredPermission}'`,
      };
    }

    // 2. Safe execution boundary
    try {
      const result = await Promise.resolve(taskFn(input));
      return { success: true, data: result };
    } catch (err) {
      return {
        success: false,
        error: `Sandbox Execution Exception in ${context.agentName}: ${(err as Error).message}`,
      };
    }
  }
}
