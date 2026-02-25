export interface AgentBudget {
  max_tokens: number;
  last_input: number;
  last_output: number;
  last_total: number;
  window_usage: string;
}

export interface TokenBudgetReport {
  context_strategy: string;
  max_context_tokens: number;
  agents: Record<string, AgentBudget>;
  totals: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
  };
  active_context: Record<string, unknown>;
}
