import { AgentPermission } from '../sandbox/agent-sandbox.js';

export interface AgentTaskRequest {
  taskId: string;
  query?: string;
  params?: Record<string, any>;
}

export interface AgentTaskResponse {
  agentName: string;
  role: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
  proposedAction?: {
    actionType: string;
    description: string;
    payload: Record<string, any>;
    requiresApproval: boolean;
  };
}

export interface ISpecializedAgent {
  name: string;
  role: string;
  permissions: AgentPermission[];
  execute(request: AgentTaskRequest): Promise<AgentTaskResponse>;
}
