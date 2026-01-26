import { useState, useCallback, useRef } from "react";
import { selectFolder, scanDirectory } from "../lib/fileSystem";

const API_BASE = "http://localhost:3000/api";

export interface IndexingState {
  status: "idle" | "selecting" | "scanning" | "indexing" | "complete" | "error";
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
  indexedFiles: string[];
  error: string | null;
}

export function useIndexing() {
  const [state, setState] = useState<IndexingState>({
    status: "idle",
    totalFiles: 0,
    processedFiles: 0,
    currentFile: "",
    indexedFiles: [],
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Start indexing
  const startIndexing = useCallback(async () => {
    try {
      setState((s) => ({ ...s, status: "selecting", error: null }));

      const dirHandle = await selectFolder();
      if (!dirHandle) {
        setState((s) => ({ ...s, status: "idle" }));
        return;
      }

      console.log("📂 Selected:", dirHandle.name);
      abortControllerRef.current = new AbortController();

      setState((s) => ({
        ...s,
        status: "scanning",
        totalFiles: 0,
        processedFiles: 0,
        currentFile: "Scanning...",
      }));

      // Scan files
      const files = await scanDirectory(
        dirHandle,
        "",
        (progress) => {
          setState((s) => ({
            ...s,
            totalFiles: progress.totalFiles,
            currentFile: progress.currentFile,
          }));
        },
        abortControllerRef.current.signal
      );

      console.log(`📄 Found ${files.length} files`);

      if (files.length === 0) {
        setState((s) => ({
          ...s,
          status: "error",
          error: "No indexable files found",
        }));
        return;
      }

      setState((s) => ({
        ...s,
        status: "indexing",
        totalFiles: files.length,
        processedFiles: 0,
      }));

      // Send in batches
      const batchSize = 3;
      let successCount = 0;

      for (let i = 0; i < files.length; i += batchSize) {
        if (abortControllerRef.current?.signal.aborted) {
          throw new DOMException("Cancelled", "AbortError");
        }

        const batch = files.slice(i, i + batchSize);
        setState((s) => ({
          ...s,
          processedFiles: i,
          currentFile: batch[0]?.path || "",
        }));

        try {
          const res = await fetch(`${API_BASE}/index`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ files: batch }),
            signal: abortControllerRef.current.signal,
          });

          if (res.ok) {
            const data = await res.json();
            successCount += data.indexed || 0;
            console.log(`✅ Batch: ${data.indexed} indexed`);
          } else {
            const error = await res.json();
            console.error("❌ Batch failed:", error);
          }
        } catch (err: any) {
          if (err.name === "AbortError") throw err;
          console.error("❌ Batch error:", err);
        }
      }

      // Get final list
      const listRes = await fetch(`${API_BASE}/index`);
      const listData = await listRes.json();

      setState((s) => ({
        ...s,
        status: "complete",
        processedFiles: files.length,
        currentFile: "",
        indexedFiles: listData.files || [],
        error: successCount === 0 ? "No files indexed. Check console." : null,
      }));

      console.log(`🎉 Done! ${listData.files?.length || 0} files indexed`);
    } catch (error: any) {
      if (error.name === "AbortError") {
        setState((s) => ({ ...s, status: "idle", error: "Cancelled" }));
      } else {
        console.error("❌ Indexing error:", error);
        setState((s) => ({
          ...s,
          status: "error",
          error: error.message || "Indexing failed",
        }));
      }
    }
  }, []);

  // Stop indexing
  const stopIndexing = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // Refresh indexed files list
  const refreshIndex = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/index`);
      if (res.ok) {
        const data = await res.json();
        setState((s) => ({ ...s, indexedFiles: data.files || [] }));
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  }, []);

  // Clear all index
  const clearIndex = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/index`, { method: "DELETE" });
      setState((s) => ({ ...s, indexedFiles: [], status: "idle" }));
    } catch (err) {
      console.error("Clear error:", err);
    }
  }, []);

  // Delete single file
  const deleteFile = useCallback(async (filePath: string) => {
    try {
      await fetch(`${API_BASE}/index?file=${encodeURIComponent(filePath)}`, {
        method: "DELETE",
      });
      setState((s) => ({
        ...s,
        indexedFiles: s.indexedFiles.filter((f) => f !== filePath),
      }));
    } catch (err) {
      console.error("Delete error:", err);
    }
  }, []);

  return {
    ...state,
    startIndexing,
    stopIndexing,
    refreshIndex,
    clearIndex,
    deleteFile,
  };
}