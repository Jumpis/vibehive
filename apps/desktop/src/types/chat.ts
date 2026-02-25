export interface ChatMessage {
  id: string;
  agentId: string;
  role: "user" | "agent";
  content: string;
  timestamp: number;
  missionId?: string;
  status: "sending" | "complete" | "error";
}
