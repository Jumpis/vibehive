import type { ChatMessage } from "@/types/chat";
import { Spinner } from "@/components/ui/Spinner";
import { MarkdownContent } from "@/components/ui/MarkdownContent";
import { cn } from "@/lib/cn";

function formatTime(ts: number): string {
  const date = new Date(ts);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
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
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <MarkdownContent className="break-words">{message.content}</MarkdownContent>
        )}

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
