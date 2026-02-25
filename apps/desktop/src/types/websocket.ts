export type WSEventType =
  | "agent_status"
  | "mission_started"
  | "mission_analyzed"
  | "mission_status"
  | "delegation_started"
  | "delegation_completed"
  | "task_completed"
  | "mission_completed"
  | "token_warning";

export interface WSEvent {
  type: WSEventType;
  data: unknown;
}

export interface TimelineEvent {
  id: string;
  type: WSEventType;
  data: unknown;
  timestamp: number;
}
