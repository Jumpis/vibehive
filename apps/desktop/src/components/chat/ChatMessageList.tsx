import type { ChatMessage } from "@/types/chat";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { useAutoScroll } from "@/hooks/useAutoScroll";

interface ChatMessageListProps {
  messages: ChatMessage[];
  agentName: string;
}

export function ChatMessageList({ messages, agentName }: ChatMessageListProps) {
  const scrollRef = useAutoScroll<HTMLDivElement>([messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-hive-text-dim text-center">
          Send a message to start chatting with {agentName}
        </p>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {messages.map((msg) => (
        <ChatMessageBubble key={msg.id} message={msg} />
      ))}
    </div>
  );
}
