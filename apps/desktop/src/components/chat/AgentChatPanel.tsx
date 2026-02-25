import { useCallback } from "react";
import { useChatStore } from "@/stores/chatStore";
import { AGENT_META } from "@/lib/constants";
import { ChatHeader } from "./ChatHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInput } from "./ChatInput";
import type { ChatMessage } from "@/types/chat";

const EMPTY_MESSAGES: ChatMessage[] = [];

export function AgentChatPanel() {
  const selectedAgentId = useChatStore((s) => s.selectedAgentId);
  const messages = useChatStore((s) =>
    s.selectedAgentId ? (s.messages[s.selectedAgentId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES,
  );
  const sending = useChatStore((s) =>
    s.selectedAgentId ? (s.sendingTo[s.selectedAgentId] ?? false) : false,
  );
  const closeChat = useChatStore((s) => s.closeChat);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const handleSend = useCallback(
    (content: string) => {
      if (selectedAgentId) {
        sendMessage(selectedAgentId, content);
      }
    },
    [selectedAgentId, sendMessage],
  );

  if (!selectedAgentId) return null;

  const meta = AGENT_META[selectedAgentId];
  const agentName = meta?.name ?? selectedAgentId;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={closeChat}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 z-50 w-[380px] flex flex-col bg-hive-bg/95 backdrop-blur-xl border-l border-hive-border animate-slide-in-panel">
        <ChatHeader agentId={selectedAgentId} onClose={closeChat} />
        <ChatMessageList messages={messages} agentName={agentName} />
        <ChatInput agentName={agentName} sending={sending} onSend={handleSend} />
      </div>
    </>
  );
}
