import React, { useEffect, useCallback, useState } from "react";
import "./styles/globals.css";
import { Header } from "./components/Header";
import { ChatInterface } from "./components/ChatInterface";
import { FileExplorer } from "./components/FileExplorer";
import { SettingsModal } from "./components/SettingsModal";
import { HelpModal } from "./components/HelpModal";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/ui/Tabs";
import { ToastProvider, useToastContext } from "./contexts/ToastContext";
import { useChat } from "./hooks/useChat";
import { useIndexing } from "./hooks/useIndexing";
import { useAbortController } from "./hooks/useAbortController";
import { exportChatAsMarkdown } from "./lib/export";
import { MessageSquare, FolderCode, Loader2 } from "lucide-react";
import { AutonomousModeModal } from "./components/AutonomousModal";
import { DeployModal } from "./components/DeployModal";
// Main content component (needs toast context)
function SidePanelContent() {
  const chat = useChat();
  const indexing = useIndexing();
  const { stopAllOperations, hasActiveOperations } = useAbortController();
  const toast = useToastContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [isAutonomousOpen, setIsAutonomousOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);

  // Load indexed files on mount
  useEffect(() => {
    indexing.refreshIndex();
  }, []);

  // Show toast when indexing completes
  useEffect(() => {
    if (indexing.status === "complete" && indexing.indexedFiles.length > 0) {
      toast.success(
        "Indexing Complete",
        `${indexing.indexedFiles.length} files indexed successfully`
      );
    }
    if (indexing.status === "error" && indexing.error) {
      toast.error("Indexing Failed", indexing.error);
    }
  }, [indexing.status]);

  // Show toast on chat error
  useEffect(() => {
    if (chat.error) {
      toast.error("Message Failed", chat.error);
    }
  }, [chat.error]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "k") {
        e.preventDefault();
        chat.clearMessages();
        toast.info("Chat Cleared");
      }

      if (modifier && e.key === "/") {
        e.preventDefault();
        const input = document.querySelector("textarea");
        input?.focus();
      }

      if (modifier && e.key === "i") {
        e.preventDefault();
        setActiveTab("index");
      }

      if (e.key === "Escape") {
        chat.cancelCurrentMessage();
        stopAllOperations();
      }

      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== "INPUT" && target.tagName !== "TEXTAREA") {
          e.preventDefault();
          setIsHelpOpen(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [chat, stopAllOperations, toast]);

  const handleRefresh = useCallback(() => {
    chrome.runtime.reload();
  }, []);

  const handleStop = useCallback(() => {
    stopAllOperations();
    indexing.stopIndexing();
    chat.cancelCurrentMessage();
    toast.info("Stopped", "All operations cancelled");
  }, [stopAllOperations, indexing, chat, toast]);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setIsHelpOpen(true);
  }, []);

  const handleCloseHelp = useCallback(() => {
    setIsHelpOpen(false);
  }, []);

  const handleExportChat = useCallback(() => {
    exportChatAsMarkdown(chat.messages);
    toast.success("Chat Exported", "Saved as Markdown file");
  }, [chat.messages, toast]);

  const handleSpecialCommand = useCallback((command: string) => {
    switch (command) {
      case "__TOGGLE_INSPECTOR__":
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "TOGGLE_COMPONENT_OVERLAY",
              enabled: true,
            });
          }
        });
        toast.info("Component Inspector", "Hover over elements to inspect");
        break;

      case "__TOGGLE_GHOST__":
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "TOGGLE_GHOST_MODE",
              enabled: true,
            });
          }
        });
        toast.info("Ghost Mode", "Watching for code in stream");
        break;

      case "__OPEN_AUTONOMOUS__":
        setIsAutonomousOpen(true);
        break;

      case "__OPEN_DEPLOY__":
        setIsDeployOpen(true);
        break;

      case "__SHOW_ERRORS__":
        // Get captured errors and show them
        chrome.storage.local.get("devda_errors", (result) => {
          const errors = result.devda_errors ? JSON.parse(result.devda_errors) : [];
          if (errors.length > 0) {
            const errorSummary = errors.slice(-5).map((e: any) => e.message).join("\n");
            chat.sendMessage(`Analyze these console errors and suggest fixes:\n\n${errorSummary}`);
          } else {
            toast.info("No Errors", "No console errors captured");
          }
        });
        break;
    }
  }, [toast, chat]);

  const isLoading =
    chat.isLoading ||
    indexing.status === "scanning" ||
    indexing.status === "indexing";

  // Loading state
  if (!chat.isInitialized) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">Loading DEVDA...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <Header
        onRefresh={handleRefresh}
        onStop={handleStop}
        onOpenSettings={handleOpenSettings}
        onExportChat={handleExportChat}
        onOpenHelp={handleOpenHelp}
        isLoading={isLoading}
        hasActiveOperations={hasActiveOperations() || isLoading}
        hasMessages={chat.messages.length > 0}
      />

      {/* Main Content */}
      <Tabs
        defaultValue="chat"
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 pt-3">
          <TabsList>
            <TabsTrigger value="chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="index">
              <FolderCode className="h-4 w-4 mr-2" />
              Index ({indexing.indexedFiles.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <ChatInterface
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
            onSendMessage={chat.sendMessage}
            onClearMessages={chat.clearMessages}
            indexedFilesCount={indexing.indexedFiles.length}
          />
        </TabsContent>

        <TabsContent value="index" className="flex-1 overflow-y-auto">
          <FileExplorer
            indexingState={{
              status: indexing.status,
              totalFiles: indexing.totalFiles,
              processedFiles: indexing.processedFiles,
              currentFile: indexing.currentFile,
              indexedFiles: indexing.indexedFiles,
              error: indexing.error,
            }}
            onStartIndexing={indexing.startIndexing}
            onStopIndexing={indexing.stopIndexing}
            onClearIndex={indexing.clearIndex}
            onRefreshIndex={indexing.refreshIndex}
            onDeleteFile={indexing.deleteFile}
          />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            DEVDA v1.0 • {indexing.indexedFiles.length} files indexed
            {chat.messages.length > 0 && ` • ${chat.messages.length} messages`}
          </p>
          <button
            onClick={handleOpenHelp}
            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Press <kbd className="px-1 py-0.5 bg-accent rounded text-[9px]">?</kbd> for help
          </button>
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={handleCloseSettings} />
      <HelpModal isOpen={isHelpOpen} onClose={handleCloseHelp} />
      <AutonomousModeModal isOpen={isAutonomousOpen} onClose={() => setIsAutonomousOpen(false)} />
      <DeployModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
    </div>
  );
}

// Wrap with Toast Provider
function SidePanel() {
  return (
    <ToastProvider>
      <SidePanelContent />
    </ToastProvider>
  );
}

export default SidePanel;