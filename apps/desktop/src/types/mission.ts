export type MissionStatus =
  | "pending"
  | "analyzing"
  | "delegating"
  | "executing"
  | "completed"
  | "failed";

export type MissionType = "team" | "direct";

export interface Delegation {
  agent_id: string;
  task: string;
  depends_on: string[];
  execution_order: number;
}

export interface MissionPlan {
  analysis: string;
  delegations: Delegation[];
  execution_strategy: "parallel" | "sequential" | "mixed";
}

export interface AgentResult {
  agent_id: string;
  task: string;
  result: string;
  artifacts: string[];
  duration_ms: number;
  success: boolean;
  error: string | null;
  token_usage: TokenUsage | null;
}

export interface TokenUsage {
  system_tokens: number;
  context_tokens: number;
  task_tokens: number;
  constraint_tokens: number;
  input_total: number;
  output_tokens: number;
  max_allowed: number;
}

export interface Mission {
  id: string;
  description: string;
  type: MissionType;
  status: MissionStatus;
  assigned_to: string;
  plan: MissionPlan | null;
  results: AgentResult[];
  created_at: string;
  completed_at: string | null;
}
