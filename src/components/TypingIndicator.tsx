import React from "react";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center">
        <Bot className="h-4 w-4 text-primary" />
      </div>

      {/* Typing Dots */}
      <div className="glass-card px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}