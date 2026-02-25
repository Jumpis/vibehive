export type AgentStatusValue = "idle" | "working" | "error";

export interface TokenUsageSummary {
  input: number;
  output: number;
  total: number;
  ratio: string;
}

export interface AgentInfo {
  name: string;
  emoji: string;
  status: AgentStatusValue;
  current_task: string | null;
  max_tokens: number;
  last_usage: TokenUsageSummary | null;
}

export interface AgentMeta {
  id: string;
  name: string;
  emoji: string;
  color: string;
  role: string;
}
