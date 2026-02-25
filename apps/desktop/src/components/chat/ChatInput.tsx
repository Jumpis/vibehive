import { useState, useCallback, type KeyboardEvent } from "react";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

const IS_MAC = typeof navigator !== "undefined" && navigator.userAgent.includes("Mac");

interface ChatInputProps {
  agentName: string;
  sending: boolean;
  onSend: (content: string) => void;
}

export function ChatInput({ agentName, sending, onSend }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText("");
  }, [text, sending, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="p-3 border-t border-hive-border">
      <div className="flex gap-2">
        <TextArea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Send a task to ${agentName}...`}
          rows={2}
          disabled={sending}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          size="sm"
          className="self-end"
        >
          {sending ? <Spinner className="h-3.5 w-3.5" /> : "Send"}
        </Button>
      </div>
      <p className="text-[10px] text-hive-text-dim mt-1">
        {IS_MAC ? "Cmd" : "Ctrl"}+Enter to send
      </p>
    </div>
  );
}
