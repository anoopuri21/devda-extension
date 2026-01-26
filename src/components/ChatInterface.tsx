import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Trash2,
  Loader2,
  Bot,
  User,
  ImagePlus,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { CodeBlock } from "./CodeBlock";
import { CommandPalette } from "./CommandPalette";
import { cn, formatDate } from "../lib/utils";
import { COMMANDS, parseCommand, getCommandSuggestions, Command } from "../lib/commands";
import type { Message } from "../hooks/useChat";

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string, imageBase64?: string) => void;
  onClearMessages: () => void;
  indexedFilesCount: number;
}

export function ChatInterface({
  messages,
  isLoading,
  error,
  onSendMessage,
  onClearMessages,
  indexedFilesCount,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [commandSuggestions, setCommandSuggestions] = useState<Command[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    const suggestions = getCommandSuggestions(value);
    setCommandSuggestions(suggestions);
    setSelectedCommandIndex(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (commandSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedCommandIndex((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1
        );
        return;
      }
      if (e.key === "Tab" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        handleCommandSelect(commandSuggestions[selectedCommandIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setCommandSuggestions([]);
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey && commandSuggestions.length === 0) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCommandSelect = (command: Command) => {
    setInput(command.name + " ");
    setCommandSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommandSuggestions([]);

    if ((!input.trim() && !imageBase64) || isLoading) return;

    const { command, content } = parseCommand(input);

    if (command) {
      const fullPrompt = `${command.prompt}\n\n${content}`;
      onSendMessage(fullPrompt, imageBase64 || undefined);
    } else {
      onSendMessage(input, imageBase64 || undefined);
    }

    setInput("");
    setImageBase64(null);
    setImagePreview(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setImageBase64(base64);
            setImagePreview(base64);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const removeImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setImageBase64(base64);
          setImagePreview(base64);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full relative",
        isDragging && "ring-2 ring-primary ring-inset"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-primary rounded-xl p-8 text-center animate-pulse-glow">
            <ImagePlus className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-lg font-medium">Drop image here</p>
            <p className="text-sm text-muted-foreground">Figma, Screenshot, or any UI design</p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <EmptyState
            indexedFilesCount={indexedFilesCount}
            onCommandClick={(cmd) => setInput(cmd)}
          />
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {error && (
          <div className="glass-card border-destructive/50 p-4 text-sm animate-fade-in">
            <p className="text-destructive font-medium">Error</p>
            <p className="text-destructive/80 mt-1">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="h-20 rounded-lg border border-border"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white hover:bg-destructive-hover"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            📸 Image attached - I'll convert this to code
          </p>
        </div>
      )}

      <div className="border-t border-border bg-background/50 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            title="Upload image"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex-1 relative">
            <CommandPalette
              commands={commandSuggestions}
              onSelect={handleCommandSelect}
              selectedIndex={selectedCommandIndex}
            />

            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={
                imageBase64
                  ? "Describe what you want..."
                  : "Ask anything or type / for commands..."
              }
              rows={1}
              className="input-base w-full resize-none min-h-[44px] max-h-[120px] py-3 pr-12"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={(!input.trim() && !imageBase64) || isLoading}
              className={cn(
                "absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200",
                (input.trim() || imageBase64) && !isLoading
                  ? "bg-gradient-primary text-white shadow-glow hover:shadow-glow-strong"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {messages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClearMessages}
              className="shrink-0 h-[44px]"
              title="Clear chat"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </form>

        {isLoading && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>DEVDA is thinking<span className="loading-dots"></span></span>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  indexedFilesCount,
  onCommandClick,
}: {
  indexedFilesCount: number;
  onCommandClick: (cmd: string) => void;
}) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        {/* Animated Logo */}
        <div className="relative mb-4 animate-bounce-in">
          <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-xl opacity-40 animate-pulse-glow" />
          <div className="relative bg-gradient-primary p-4 rounded-2xl animate-float">
            <Bot className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold gradient-text mb-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Welcome to DEVDA
        </h2>
        <p className="text-muted-foreground text-sm max-w-[280px] mb-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Your AI Senior Developer. Ask anything!
        </p>

        {/* Status Badge */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className={cn(
            "glass-card px-4 py-2 text-sm mb-4 transition-all duration-300",
            indexedFilesCount > 0 ? "border-success/30" : ""
          )}>
            {indexedFilesCount > 0 ? (
              <span className="text-success flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                {indexedFilesCount} files indexed
              </span>
            ) : (
              <span className="text-muted-foreground">
                No files indexed. Go to Index tab →
              </span>
            )}
          </div>
        </div>

        {/* Quick Commands */}
        <div className="w-full max-w-[280px] space-y-2 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs text-muted-foreground mb-2">⚡ Quick commands:</p>
          {COMMANDS.slice(0, 4).map((cmd, index) => (
            <button
              key={cmd.name}
              onClick={() => onCommandClick(cmd.name + " ")}
              className="w-full flex items-center gap-2 text-left text-sm p-2.5 glass-card-hover text-muted-foreground hover:text-foreground"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              <span className="text-base">{cmd.icon}</span>
              <span className="font-medium">{cmd.name}</span>
              <span className="text-xs opacity-70 truncate">- {cmd.description}</span>
            </button>
          ))}
        </div>

        {/* Image Hint */}
        <div className="mt-4 text-xs text-muted-foreground flex items-center gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
          <ImagePlus className="h-4 w-4" />
          <span>Paste or upload images for UI → Code</span>
        </div>
      </div>
    );
  }

// Message Bubble
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-slide-up", isUser ? "flex-row-reverse" : "")}>
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          isUser ? "bg-gradient-primary" : "bg-card border border-border"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>

      <div
        className={cn(
          "message-bubble max-w-[85%] min-w-0",
          isUser ? "message-bubble-user" : "message-bubble-assistant"
        )}
      >
        {message.imagePreview && (
          <img
            src={message.imagePreview}
            alt="Uploaded"
            className="max-h-40 rounded-lg mb-2 border border-border"
          />
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          <MessageContent content={message.content} />
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">
            {formatDate(message.timestamp)}
          </span>
          {message.model && (
            <span className="text-[10px] text-muted-foreground">
              {message.model.replace("llama-3.3-", "").replace("-versatile", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Content with Code Blocks
function MessageContent({ content }: { content: string }) {
  if (!content) {
    return (
      <span className="text-muted-foreground italic">
        Thinking<span className="loading-dots"></span>
      </span>
    );
  }

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <>
      {parts.map((part, index) => {
        // Check if it's a code block
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).split("\n");
          const language = lines[0]?.trim() || "text";
          const code = lines.slice(1).join("\n");

          // Use the imported CodeBlock component
          return <CodeBlock key={index} code={code} language={language} />;
        }

        // Handle inline code
        const inlineParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={index}>
            {inlineParts.map((inlinePart, i) => {
              if (inlinePart.startsWith("`") && inlinePart.endsWith("`")) {
                return (
                  <code
                    key={i}
                    className="bg-accent px-1.5 py-0.5 rounded text-sm font-mono text-primary"
                  >
                    {inlinePart.slice(1, -1)}
                  </code>
                );
              }
              return <span key={i}>{inlinePart}</span>;
            })}
          </span>
        );
      })}
    </>
  );
}