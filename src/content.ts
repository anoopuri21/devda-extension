import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:*/*", "http://127.0.0.1:*/*"],
  run_at: "document_start",
  all_frames: true,
};

interface CapturedError {
  type: "error" | "unhandledrejection" | "console.error";
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
}

const capturedErrors: CapturedError[] = [];
const MAX_ERRORS = 50;

// Capture console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  const error: CapturedError = {
    type: "console.error",
    message: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "),
    timestamp: Date.now(),
    url: window.location.href,
  };

  capturedErrors.push(error);
  if (capturedErrors.length > MAX_ERRORS) {
    capturedErrors.shift();
  }

  // Send to extension
  sendErrorToExtension(error);

  // Call original
  originalConsoleError.apply(console, args);
};

// Capture uncaught errors
window.addEventListener("error", (event) => {
  const error: CapturedError = {
    type: "error",
    message: event.message,
    stack: event.error?.stack,
    timestamp: Date.now(),
    url: window.location.href,
  };

  capturedErrors.push(error);
  if (capturedErrors.length > MAX_ERRORS) {
    capturedErrors.shift();
  }

  sendErrorToExtension(error);
});

// Capture unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  const error: CapturedError = {
    type: "unhandledrejection",
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack,
    timestamp: Date.now(),
    url: window.location.href,
  };

  capturedErrors.push(error);
  if (capturedErrors.length > MAX_ERRORS) {
    capturedErrors.shift();
  }

  sendErrorToExtension(error);
});

// Send error to extension
function sendErrorToExtension(error: CapturedError) {
  try {
    chrome.runtime.sendMessage({
      type: "CONSOLE_ERROR",
      error,
    });
  } catch {
    // Extension context might be invalid
  }
}

// Listen for requests from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_ERRORS") {
    sendResponse({ errors: capturedErrors });
  }
  if (message.type === "CLEAR_ERRORS") {
    capturedErrors.length = 0;
    sendResponse({ success: true });
  }
});

console.log("[DEVDA] Error capture active on", window.location.href);

export {};