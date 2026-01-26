import React from "react";
import type { Command } from "../lib/commands";
import { cn } from "../lib/utils";

interface CommandPaletteProps {
  commands: Command[];
  onSelect: (command: Command) => void;
  selectedIndex: number;
}

export function CommandPalette({
  commands,
  onSelect,
  selectedIndex,
}: CommandPaletteProps) {
  if (commands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
      <div className="px-3 py-2 border-b border-border bg-accent/30">
        <p className="text-xs text-muted-foreground font-medium">⌨️ Commands</p>
      </div>
      <div className="max-h-52 overflow-y-auto">
        {commands.map((cmd, index) => (
          <button
            key={cmd.name}
            onClick={() => onSelect(cmd)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
              index === selectedIndex
                ? "bg-primary/20 text-foreground"
                : "hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="text-xl">{cmd.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{cmd.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {cmd.description}
              </p>
            </div>
            {index === selectedIndex && (
              <span className="text-xs text-muted-foreground">↵</span>
            )}
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border bg-accent/30">
        <p className="text-[10px] text-muted-foreground">
          ↑↓ Navigate • Enter/Tab Select • Esc Close
        </p>
      </div>
    </div>
  );
}