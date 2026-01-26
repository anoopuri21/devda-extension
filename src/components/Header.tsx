import React from "react";
import { RefreshCw, StopCircle, Sparkles, Settings, Download, HelpCircle } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "../lib/utils";

interface HeaderProps {
  onRefresh: () => void;
  onStop: () => void;
  onOpenSettings: () => void;
  onExportChat: () => void;
  onOpenHelp: () => void;
  isLoading: boolean;
  hasActiveOperations: boolean;
  hasMessages: boolean;
}

export function Header({
  onRefresh,
  onStop,
  onOpenSettings,
  onExportChat,
  onOpenHelp,
  isLoading,
  hasActiveOperations,
  hasMessages,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-primary rounded-lg blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
            <div className="relative bg-gradient-primary p-2 rounded-lg transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">DEVDA</h1>
            <p className="text-[10px] text-muted-foreground -mt-1">
              AI Senior Developer
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Help Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenHelp}
            title="Help & Shortcuts"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Export Chat Button */}
          {hasMessages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportChat}
              title="Export chat as Markdown"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}

          {/* Settings Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>

          {/* Stop Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onStop}
            disabled={!hasActiveOperations}
            className={cn(
              "transition-all duration-300",
              hasActiveOperations
                ? "opacity-100 scale-100"
                : "opacity-50 scale-95"
            )}
          >
            <StopCircle className="h-4 w-4" />
          </Button>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            title="Reload Extension"
          >
            <RefreshCw
              className={cn("h-4 w-4", isLoading && "animate-spin")}
            />
          </Button>
        </div>
      </div>
    </header>
  );
}