import React from "react";
import "./styles/globals.css";
import { Sparkles, PanelRight, ExternalLink } from "lucide-react";
import { Button } from "./components/ui/Button";

function Popup() {
  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.sidePanel.open({ tabId: tab.id });
    }
    window.close();
  };

  return (
    <div className="w-[300px] p-4 bg-background text-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-primary rounded-xl blur-md opacity-50" />
          <div className="relative bg-gradient-primary p-3 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-text">DEVDA</h1>
          <p className="text-xs text-muted-foreground">AI Senior Developer</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4">
        Your AI-powered coding assistant. Index your codebase and get intelligent
        help with code reviews, debugging, and more.
      </p>

      {/* Open Side Panel Button */}
      <Button onClick={openSidePanel} className="w-full mb-3">
        <PanelRight className="h-4 w-4 mr-2" />
        Open Side Panel
      </Button>

      {/* Features */}
      <div className="space-y-2 pt-3 border-t border-border">
        <p className="text-xs font-medium text-muted-foreground mb-2">Features:</p>
        <Feature text="Codebase indexing with semantic search" />
        <Feature text="AI-powered code assistance" />
        <Feature text="Context-aware responses" />
        <Feature text="Image generation & analysis" />
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">v1.0.0</span>
        <a
          href="https://github.com/devda"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          GitHub <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="h-1 w-1 rounded-full bg-primary" />
      <span>{text}</span>
    </div>
  );
}

export default Popup;