import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";

const SAFE_URL_PATTERN = /^https?:\/\//;

const markdownComponents: Components = {
  a: ({ href, children }) => {
    if (href && SAFE_URL_PATTERN.test(href)) {
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
    return <span>{children}</span>;
  },
};

interface MarkdownContentProps {
  children: string;
  className?: string;
}

export function MarkdownContent({ children, className }: MarkdownContentProps) {
  return (
    <div className={cn("chat-markdown", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {children}
      </Markdown>
    </div>
  );
}
