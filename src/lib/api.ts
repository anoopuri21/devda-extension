const API_BASE = "http://localhost:3000/api";

// Global abort controllers for cancellation
const activeControllers = new Map<string, AbortController>();

export function createAbortController(id: string): AbortController {
  // Cancel any existing controller with this ID
  cancelRequest(id);
  
  const controller = new AbortController();
  activeControllers.set(id, controller);
  return controller;
}

export function cancelRequest(id: string): void {
  const controller = activeControllers.get(id);
  if (controller) {
    controller.abort();
    activeControllers.delete(id);
  }
}

export function cancelAllRequests(): void {
  activeControllers.forEach((controller) => {
    controller.abort();
  });
  activeControllers.clear();
}

export function getActiveRequestCount(): number {
  return activeControllers.size;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export async function sendMessage(
  messages: ChatMessage[],
  includeContext: boolean = true
): Promise<AgentResponse> {
  const controller = createAbortController("chat");

  try {
    const response = await fetch(`${API_BASE}/agent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages, includeContext }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send message");
    }

    return response.json();
  } finally {
    activeControllers.delete("chat");
  }
}

export interface FileData {
  path: string;
  name: string;
  content: string;
}

export interface IndexResult {
  success: boolean;
  indexed: number;
  skipped: number;
  errors: string[];
}

export async function indexFiles(files: FileData[]): Promise<IndexResult> {
  const controller = createAbortController("indexing");

  try {
    const response = await fetch(`${API_BASE}/index`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ files }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Indexing failed");
    }

    return response.json();
  } finally {
    activeControllers.delete("indexing");
  }
}

export async function getIndexedFiles(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/index`);
  
  if (!response.ok) {
    throw new Error("Failed to get indexed files");
  }

  const data = await response.json();
  return data.files;
}

export async function clearIndex(): Promise<void> {
  const response = await fetch(`${API_BASE}/index`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to clear index");
  }
}

export interface SearchResult {
  filePath: string;
  fileName: string;
  content: string;
  similarity: number;
  chunkIndex: number;
}

export async function searchCode(
  query: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const controller = createAbortController("search");

  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data.results;
  } finally {
    activeControllers.delete("search");
  }
}

export async function generateImage(
  prompt: string,
  options?: { width?: number; height?: number }
): Promise<{ images: Array<{ url: string }> }> {
  const controller = createAbortController("vision");

  try {
    const response = await fetch(`${API_BASE}/vision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "generate",
        prompt,
        options,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Image generation failed");
    }

    return response.json();
  } finally {
    activeControllers.delete("vision");
  }
}

export async function analyzeImage(imageUrl: string): Promise<string> {
  const controller = createAbortController("vision");

  try {
    const response = await fetch(`${API_BASE}/vision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "analyze",
        imageUrl,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Image analysis failed");
    }

    const data = await response.json();
    return data.caption;
  } finally {
    activeControllers.delete("vision");
  }
}