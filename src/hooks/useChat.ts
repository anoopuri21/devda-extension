import { useState, useCallback, useRef, useEffect } from "react";
import { generateId } from "../lib/utils";

const API_BASE = "http://localhost:3000/api";
const STORAGE_KEY = "devda_chat_history";
const MAX_HISTORY = 50;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  model?: string;
  isStreaming?: boolean;
  imagePreview?: string;
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // =====================
  // LOAD HISTORY ON MOUNT
  // =====================
  useEffect(() => {
    const loadHistory = async () => {
      try {
        console.log("📂 Loading chat history...");

        // Try Chrome storage first
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          const result = await chrome.storage.local.get(STORAGE_KEY);
          if (result[STORAGE_KEY]) {
            const saved = JSON.parse(result[STORAGE_KEY]);
            if (Array.isArray(saved) && saved.length > 0) {
              console.log(`✅ Loaded ${saved.length} messages from Chrome storage`);
              setMessages(saved);
              setIsInitialized(true);
              return;
            }
          }
        }

        // Fallback to localStorage
        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
          const saved = JSON.parse(localData);
          if (Array.isArray(saved) && saved.length > 0) {
            console.log(`✅ Loaded ${saved.length} messages from localStorage`);
            setMessages(saved);
          }
        }
      } catch (error) {
        console.error("❌ Failed to load chat history:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    loadHistory();
  }, []);

  // =====================
  // SAVE HISTORY ON CHANGE
  // =====================
  useEffect(() => {
    // Don't save until we've loaded
    if (!isInitialized) return;

    const saveHistory = async () => {
      try {
        // Only save completed messages (not streaming)
        const toSave = messages
          .filter((m) => !m.isStreaming && m.content.length > 0)
          .slice(-MAX_HISTORY)
          .map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            model: m.model,
            // Don't save imagePreview (too large)
          }));

        const jsonData = JSON.stringify(toSave);

        // Save to Chrome storage
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
          await chrome.storage.local.set({ [STORAGE_KEY]: jsonData });
          console.log(`💾 Saved ${toSave.length} messages to Chrome storage`);
        }

        // Also save to localStorage as backup
        localStorage.setItem(STORAGE_KEY, jsonData);
      } catch (error) {
        console.error("❌ Failed to save chat history:", error);
      }
    };

    // Debounce save
    const timeoutId = setTimeout(saveHistory, 500);
    return () => clearTimeout(timeoutId);
  }, [messages, isInitialized]);

  // =====================
  // SEND MESSAGE
  // =====================
  const sendMessage = useCallback(
    async (content: string, imageBase64?: string) => {
      if ((!content.trim() && !imageBase64) || isLoading) return;

      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setError(null);

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content: content.trim() || "Convert this UI to code",
        timestamp: Date.now(),
        imagePreview: imageBase64,
      };

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        if (imageBase64) {
          // Image to Code (non-streaming)
          const response = await fetch(`${API_BASE}/vision`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "toCode",
              imageBase64,
              prompt: content.trim(),
              options: { framework: "react" },
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) throw new Error("Failed to process image");

          const data = await response.json();

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: data.code, model: "vision", isStreaming: false }
                : m
            )
          );
        } else {
          // Chat with streaming
          const chatHistory = messages
            .filter((m) => !m.imagePreview)
            .map((m) => ({ role: m.role, content: m.content }));

          chatHistory.push({ role: "user", content: content.trim() });

          // Try streaming endpoint first
          let useStreaming = true;
          let response: Response;

          try {
            response = await fetch(`${API_BASE}/agent/stream`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: chatHistory,
                includeContext: true,
              }),
              signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
              useStreaming = false;
            }
          } catch {
            useStreaming = false;
          }

          if (useStreaming && response!) {
            // Process stream
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = "";

            if (reader) {
              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      if (data === "[DONE]") continue;

                      try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                          fullContent += parsed.content;

                          setMessages((prev) =>
                            prev.map((m) =>
                              m.id === assistantMessage.id
                                ? { ...m, content: fullContent }
                                : m
                            )
                          );
                        }
                      } catch {
                        // Ignore parse errors
                      }
                    }
                  }
                }
              } finally {
                reader.releaseLock();
              }
            }

            // Mark as complete
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, isStreaming: false, model: "llama-3.3-70b" }
                  : m
              )
            );
          } else {
            // Fallback to non-streaming
            const fallbackResponse = await fetch(`${API_BASE}/agent`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                messages: chatHistory,
                includeContext: true,
              }),
              signal: abortControllerRef.current.signal,
            });

            if (!fallbackResponse.ok) throw new Error("Request failed");

            const data = await fallbackResponse.json();

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: data.content, model: data.model, isStreaming: false }
                  : m
              )
            );
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id
                ? { ...m, content: "_Cancelled_", isStreaming: false }
                : m
            )
          );
        } else {
          setError(err.message || "Failed to send message");
          setMessages((prev) => prev.filter((m) => m.id !== assistantMessage.id));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  // =====================
  // CLEAR MESSAGES
  // =====================
  const clearMessages = useCallback(async () => {
    abortControllerRef.current?.abort();
    setMessages([]);
    setError(null);

    // Clear storage
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        await chrome.storage.local.remove(STORAGE_KEY);
      }
      localStorage.removeItem(STORAGE_KEY);
      console.log("🗑️ Chat history cleared");
    } catch (error) {
      console.error("Failed to clear storage:", error);
    }
  }, []);

  // =====================
  // CANCEL CURRENT
  // =====================
  const cancelCurrentMessage = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    cancelCurrentMessage,
    isInitialized,
  };
}