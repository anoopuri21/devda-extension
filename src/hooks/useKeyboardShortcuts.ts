import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  onNewChat: () => void;
  onFocusInput: () => void;
  onToggleIndex: () => void;
  onStopGeneration: () => void;
}

export function useKeyboardShortcuts(config: ShortcutConfig) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + K: New chat
      if (modifier && event.key === "k") {
        event.preventDefault();
        config.onNewChat();
      }

      // Cmd/Ctrl + /: Focus input
      if (modifier && event.key === "/") {
        event.preventDefault();
        config.onFocusInput();
      }

      // Cmd/Ctrl + I: Toggle index tab
      if (modifier && event.key === "i") {
        event.preventDefault();
        config.onToggleIndex();
      }

      // Escape: Stop generation
      if (event.key === "Escape") {
        config.onStopGeneration();
      }
    },
    [config]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}