import React from "react";
import { X, Keyboard, Command, Zap, Image, FolderCode, MessageSquare } from "lucide-react";
import { Button } from "./ui/Button";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-accent/30">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Help & Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto max-h-[65vh]">
          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-primary" />
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              <ShortcutRow keys={["Ctrl", "K"]} description="Clear chat / New conversation" />
              <ShortcutRow keys={["Ctrl", "/"]} description="Focus input field" />
              <ShortcutRow keys={["Ctrl", "I"]} description="Switch to Index tab" />
              <ShortcutRow keys={["Escape"]} description="Stop AI generation" />
              <ShortcutRow keys={["Enter"]} description="Send message" />
              <ShortcutRow keys={["Shift", "Enter"]} description="New line in message" />
              <ShortcutRow keys={["↑", "↓"]} description="Navigate command suggestions" />
              <ShortcutRow keys={["Tab"]} description="Select command" />
            </div>
          </section>

          {/* Quick Commands */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Commands
            </h3>
            <div className="space-y-2 text-sm">
              <CommandRow command="/explain" description="Explain code in detail" />
              <CommandRow command="/fix" description="Find and fix bugs" />
              <CommandRow command="/test" description="Generate unit tests" />
              <CommandRow command="/refactor" description="Improve code quality" />
              <CommandRow command="/doc" description="Generate documentation" />
              <CommandRow command="/security" description="Security audit" />
              <CommandRow command="/perf" description="Performance optimization" />
              <CommandRow command="/convert" description="Convert to TypeScript" />
            </div>
          </section>

          {/* Features */}
          <section>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Command className="h-4 w-4 text-primary" />
              Features
            </h3>
            <div className="space-y-3 text-sm">
              <FeatureRow
                icon={<FolderCode className="h-4 w-4" />}
                title="Codebase Indexing"
                description="Index your project folder for context-aware responses"
              />
              <FeatureRow
                icon={<Image className="h-4 w-4" />}
                title="Image to Code"
                description="Upload or paste UI screenshots to generate code"
              />
              <FeatureRow
                icon={<MessageSquare className="h-4 w-4" />}
                title="Context-Aware Chat"
                description="AI references your indexed codebase in responses"
              />
            </div>
          </section>

          {/* Tips */}
          <section className="bg-accent/50 rounded-lg p-3">
            <h3 className="text-sm font-semibold mb-2">💡 Pro Tips</h3>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li>• Index your project first for better AI responses</li>
              <li>• Use commands like <code className="bg-background px-1 rounded">/fix</code> for specific tasks</li>
              <li>• Paste screenshots directly to convert UI to code</li>
              <li>• Export chats as Markdown for documentation</li>
              <li>• Set custom instructions in Settings for personalized responses</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-accent/30">
          <p className="text-xs text-muted-foreground">
            DEVDA v1.0 • Made with ❤️
          </p>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
}

// Shortcut Row Component
function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={key}>
            <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded shadow-sm">
              {key}
            </kbd>
            {index < keys.length - 1 && (
              <span className="text-muted-foreground text-xs">+</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// Command Row Component
function CommandRow({ command, description }: { command: string; description: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <code className="text-primary font-mono bg-accent px-2 py-0.5 rounded">
        {command}
      </code>
      <span className="text-muted-foreground">{description}</span>
    </div>
  );
}

// Feature Row Component
function FeatureRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}