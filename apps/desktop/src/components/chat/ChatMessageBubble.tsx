import type { ChatMessage } from "@/types/chat";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/cn";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "bg-hive-accent/15 border border-hive-accent/20 text-hive-text"
            : "glass-subtle text-hive-text",
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>

        <div className={cn("flex items-center gap-1.5 mt-1", isUser ? "justify-end" : "justify-start")}>
          {message.status === "sending" && <Spinner className="h-3 w-3" />}
          {message.status === "error" && (
            <span className="text-[10px] text-status-error">Failed</span>
          )}
          <span className="text-[10px] text-hive-text-dim">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
