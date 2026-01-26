import { useEffect, useCallback } from "react";
import type { Message } from "./useChat";

const STORAGE_KEY = "devda_chat_history";
const MAX_HISTORY = 100;

export function useChatHistory(
  messages: Message[],
  setMessages: (messages: Message[]) => void
) {
  // Load from storage on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const result = await chrome.storage.local.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          const saved = JSON.parse(result[STORAGE_KEY]);
          if (Array.isArray(saved) && saved.length > 0) {
            setMessages(saved);
          }
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };

    loadHistory();
  }, []);

  // Save to storage when messages change
  useEffect(() => {
    const saveHistory = async () => {
      try {
        // Only save completed messages (not streaming)
        const toSave = messages
          .filter((m) => !m.isStreaming)
          .slice(-MAX_HISTORY);

        await chrome.storage.local.set({
          [STORAGE_KEY]: JSON.stringify(toSave),
        });
      } catch (error) {
        console.error("Failed to save chat history:", error);
      }
    };

    if (messages.length > 0) {
      saveHistory();
    }
  }, [messages]);

  // Clear history
  const clearHistory = useCallback(async () => {
    try {
      await chrome.storage.local.remove(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  }, []);

  return { clearHistory };
}