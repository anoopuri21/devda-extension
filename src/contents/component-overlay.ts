import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["http://localhost:*/*", "http://127.0.0.1:*/*"],
  run_at: "document_idle",
};

interface ComponentInfo {
  name: string;
  fiber: any;
  element: HTMLElement;
}

let overlayEnabled = false;
let highlightedElements: HTMLElement[] = [];
let tooltip: HTMLDivElement | null = null;

// Find React Fiber from DOM element
function findReactFiber(element: HTMLElement): any {
  const keys = Object.keys(element);
  const fiberKey = keys.find(
    (key) =>
      key.startsWith("__reactFiber$") ||
      key.startsWith("__reactInternalInstance$")
  );

  if (fiberKey) {
    return (element as any)[fiberKey];
  }
  return null;
}

// Get component name from fiber
function getComponentName(fiber: any): string {
  if (!fiber) return "Unknown";

  if (fiber.type) {
    if (typeof fiber.type === "string") {
      return fiber.type; // HTML element
    }
    if (fiber.type.displayName) {
      return fiber.type.displayName;
    }
    if (fiber.type.name) {
      return fiber.type.name;
    }
  }

  // Try to get from parent
  if (fiber.return) {
    return getComponentName(fiber.return);
  }

  return "Anonymous";
}

// Get component hierarchy
function getComponentHierarchy(fiber: any, depth: number = 3): string[] {
  const hierarchy: string[] = [];
  let current = fiber;

  while (current && hierarchy.length < depth) {
    const name = getComponentName(current);
    if (name && !["div", "span", "p", "button", "a"].includes(name)) {
      hierarchy.push(name);
    }
    current = current.return;
  }

  return hierarchy;
}

// Create tooltip
function createTooltip(): HTMLDivElement {
  const div = document.createElement("div");
  div.id = "devda-component-tooltip";
  div.style.cssText = `
    position: fixed;
    z-index: 999999;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 12px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(168, 85, 247, 0.3);
    max-width: 300px;
  `;
  document.body.appendChild(div);
  return div;
}

// Highlight element
function highlightElement(element: HTMLElement, componentInfo: ComponentInfo) {
  // Create highlight overlay
  const rect = element.getBoundingClientRect();
  const highlight = document.createElement("div");
  highlight.className = "devda-highlight";
  highlight.style.cssText = `
    position: fixed;
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    background: rgba(168, 85, 247, 0.1);
    border: 2px solid rgba(168, 85, 247, 0.6);
    border-radius: 4px;
    pointer-events: none;
    z-index: 999998;
    transition: all 0.15s ease;
  `;
  document.body.appendChild(highlight);
  highlightedElements.push(highlight);

  // Update tooltip
  if (!tooltip) {
    tooltip = createTooltip();
  }

  const hierarchy = getComponentHierarchy(componentInfo.fiber);
  tooltip.innerHTML = `
    <div style="color: #a855f7; font-weight: bold; margin-bottom: 4px;">
      📦 ${componentInfo.name}
    </div>
    <div style="color: #888; font-size: 10px;">
      ${hierarchy.join(" → ")}
    </div>
  `;
  tooltip.style.top = `${rect.top - 50}px`;
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.opacity = "1";
}

// Clear highlights
function clearHighlights() {
  highlightedElements.forEach((el) => el.remove());
  highlightedElements = [];
  if (tooltip) {
    tooltip.style.opacity = "0";
  }
}

// Mouse move handler
function handleMouseMove(e: MouseEvent) {
  if (!overlayEnabled) return;

  clearHighlights();

  const element = e.target as HTMLElement;
  if (!element) return;

  const fiber = findReactFiber(element);
  if (!fiber) return;

  const name = getComponentName(fiber);
  if (!name) return;

  highlightElement(element, {
    name,
    fiber,
    element,
  });
}

// Click handler - send component info to extension
function handleClick(e: MouseEvent) {
  if (!overlayEnabled) return;

  e.preventDefault();
  e.stopPropagation();

  const element = e.target as HTMLElement;
  const fiber = findReactFiber(element);

  if (fiber) {
    const name = getComponentName(fiber);
    const hierarchy = getComponentHierarchy(fiber, 10);

    // Send to extension
    chrome.runtime.sendMessage({
      type: "COMPONENT_SELECTED",
      data: {
        name,
        hierarchy,
        props: fiber.memoizedProps,
        state: fiber.memoizedState,
      },
    });
  }
}

// Toggle overlay
function toggleOverlay(enabled: boolean) {
  overlayEnabled = enabled;

  if (enabled) {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("click", handleClick, true);
    document.body.style.cursor = "crosshair";

    // Show activation message
    const msg = document.createElement("div");
    msg.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #a855f7, #ec4899);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui;
      font-size: 14px;
      z-index: 999999;
      animation: fadeInOut 3s ease forwards;
    `;
    msg.textContent = "🔍 DEVDA Component Inspector Active";
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
  } else {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("click", handleClick, true);
    document.body.style.cursor = "";
    clearHighlights();
  }
}

// Listen for messages from extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_COMPONENT_OVERLAY") {
    toggleOverlay(message.enabled);
    sendResponse({ success: true });
  }
});

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    15% { opacity: 1; transform: translateY(0); }
    85% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
`;
document.head.appendChild(style);

console.log("[DEVDA] Component overlay script loaded");

export {};