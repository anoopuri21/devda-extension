import type { Message } from "../hooks/useChat";

export function exportChatAsMarkdown(messages: Message[]): void {
  if (messages.length === 0) return;

  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const time = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let markdown = `# DEVDA Chat Export\n\n`;
  markdown += `**Date:** ${date} at ${time}\n\n`;
  markdown += `**Messages:** ${messages.length}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, index) => {
    const role = msg.role === "user" ? "👤 You" : "🤖 DEVDA";
    const timestamp = new Date(msg.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    markdown += `## ${role}\n`;
    markdown += `*${timestamp}*\n\n`;
    markdown += `${msg.content}\n\n`;

    if (index < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  markdown += `\n---\n\n`;
  markdown += `*Exported from DEVDA - AI Senior Developer*\n`;

  // Download file
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devda-chat-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportChatAsJSON(messages: Message[]): void {
  if (messages.length === 0) return;

  const data = {
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      model: msg.model,
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `devda-chat-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}