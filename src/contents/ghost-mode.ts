import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.youtube.com/*",
    "https://youtube.com/*",
    "https://www.twitch.tv/*",
    "https://twitch.tv/*",
  ],
  run_at: "document_idle",
};

interface CodeSnippet {
  code: string;
  language: string;
  timestamp: number;
}

let ghostModeEnabled = false;
let suggestionPanel: HTMLDivElement | null = null;
let capturedCode: CodeSnippet[] = [];

// Create suggestion panel
function createSuggestionPanel(): HTMLDivElement {
  const panel = document.createElement("div");
  panel.id = "devda-ghost-panel";
  panel.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 350px;
      max-height: 400px;
      background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(168, 85, 247, 0.3);
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 999999;
      overflow: hidden;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    ">
      <div style="
        background: linear-gradient(135deg, #a855f7, #ec4899);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      ">
        <span style="color: white; font-weight: 600; font-size: 14px;">
          👻 DEVDA Ghost Mode
        </span>
        <button id="devda-ghost-close" style="
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        ">✕</button>
      </div>
      <div id="devda-ghost-content" style="
        padding: 16px;
        color: #e0e0e0;
        font-size: 13px;
        max-height: 300px;
        overflow-y: auto;
      ">
        <p style="color: #888; text-align: center;">
          Watching for code in the stream...<br>
          <span style="font-size: 11px;">Suggestions will appear here</span>
        </p>
      </div>
      <div style="
        padding: 12px 16px;
        border-top: 1px solid rgba(255,255,255,0.1);
      ">
        <input 
          id="devda-ghost-input"
          type="text" 
          placeholder="Ask about the code..."
          style="
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 8px;
            padding: 10px 12px;
            color: white;
            font-size: 13px;
            outline: none;
          "
        />
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  // Close button handler
  const closeBtn = panel.querySelector("#devda-ghost-close");
  closeBtn?.addEventListener("click", () => toggleGhostMode(false));

  // Input handler
  const input = panel.querySelector("#devda-ghost-input") as HTMLInputElement;
  input?.addEventListener("keypress", async (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      await handleGhostQuery(input.value.trim());
      input.value = "";
    }
  });

  return panel;
}

// Handle ghost mode query
async function handleGhostQuery(query: string) {
  const content = document.getElementById("devda-ghost-content");
  if (!content) return;

  // Show loading
  content.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <div style="
        width: 30px;
        height: 30px;
        border: 3px solid rgba(168, 85, 247, 0.3);
        border-top-color: #a855f7;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      "></div>
      <p style="color: #888;">Analyzing...</p>
    </div>
  `;

  try {
    // Get current video context
    const videoTitle = document.querySelector("h1.title")?.textContent || 
                       document.querySelector("[data-a-target='stream-title']")?.textContent ||
                       "Coding Stream";

    // Send to backend
    const response = await fetch("http://localhost:3000/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `[Ghost Mode - Watching: "${videoTitle}"]
            
User question: ${query}

${capturedCode.length > 0 ? `Recent code seen:\n${capturedCode.map(c => c.code).join("\n\n")}` : "No code captured yet."}

Provide a helpful suggestion based on the stream context.`,
          },
        ],
        includeContext: false,
      }),
    });

    const data = await response.json();

    content.innerHTML = `
      <div style="white-space: pre-wrap; line-height: 1.5;">
        ${formatResponse(data.content)}
      </div>
    `;
  } catch (error) {
    content.innerHTML = `
      <p style="color: #ef4444;">Failed to get suggestion. Is the backend running?</p>
    `;
  }
}

// Format response with basic markdown
function formatResponse(text: string): string {
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => `
      <pre style="
        background: #1e1e1e;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-family: monospace;
        font-size: 12px;
        margin: 8px 0;
      "><code>${code.trim()}</code></pre>
    `)
    .replace(/`([^`]+)`/g, '<code style="background: #333; padding: 2px 6px; border-radius: 4px;">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color: #a855f7;">$1</strong>')
    .replace(/\n/g, "<br>");
}

// Toggle ghost mode
function toggleGhostMode(enabled: boolean) {
  ghostModeEnabled = enabled;

  if (enabled) {
    if (!suggestionPanel) {
      suggestionPanel = createSuggestionPanel();
    }
    suggestionPanel.style.display = "block";
    
    // Start watching for code in video (simplified)
    startCodeWatcher();
  } else {
    if (suggestionPanel) {
      suggestionPanel.style.display = "none";
    }
    stopCodeWatcher();
  }
}

let codeWatcherInterval: number | null = null;

function startCodeWatcher() {
  // In a real implementation, this would use OCR or video analysis
  // For now, we'll just watch for text selection
  document.addEventListener("selectionchange", handleSelection);
}

function stopCodeWatcher() {
  document.removeEventListener("selectionchange", handleSelection);
  if (codeWatcherInterval) {
    clearInterval(codeWatcherInterval);
  }
}

function handleSelection() {
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 20 && looksLikeCode(selection)) {
    capturedCode.push({
      code: selection,
      language: detectLanguage(selection),
      timestamp: Date.now(),
    });

    // Keep only last 5 snippets
    if (capturedCode.length > 5) {
      capturedCode.shift();
    }

    updateCodeCapture();
  }
}

function looksLikeCode(text: string): boolean {
  const codePatterns = [
    /function\s+\w+/,
    /const\s+\w+\s*=/,
    /let\s+\w+\s*=/,
    /import\s+.*from/,
    /export\s+(default\s+)?/,
    /=>\s*{/,
    /\(\)\s*{/,
    /<\w+.*>/,
  ];
  return codePatterns.some((p) => p.test(text));
}

function detectLanguage(code: string): string {
  if (code.includes("import React") || code.includes("useState")) return "jsx";
  if (code.includes("interface ") || code.includes(": string")) return "typescript";
  if (code.includes("def ") || code.includes("import ")) return "python";
  return "javascript";
}

function updateCodeCapture() {
  const content = document.getElementById("devda-ghost-content");
  if (!content || capturedCode.length === 0) return;

  content.innerHTML = `
    <p style="color: #a855f7; margin-bottom: 10px; font-size: 12px;">
      📸 Captured ${capturedCode.length} code snippet(s)
    </p>
    <div style="
      background: #1e1e1e;
      padding: 10px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 11px;
      max-height: 150px;
      overflow-y: auto;
    ">
      ${capturedCode[capturedCode.length - 1].code.slice(0, 200)}...
    </div>
    <p style="color: #888; margin-top: 10px; font-size: 11px;">
      Ask a question below to get suggestions!
    </p>
  `;
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_GHOST_MODE") {
    toggleGhostMode(message.enabled);
    sendResponse({ success: true });
  }
});

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

console.log("[DEVDA] Ghost mode script loaded");

export {};