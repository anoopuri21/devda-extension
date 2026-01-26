import React, { useState } from "react";
import {
  FolderOpen,
  File,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RefreshCw,
  FolderSearch,
  X,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardContent } from "./ui/Card";
import { cn } from "../lib/utils";
import type { IndexingState } from "../hooks/useIndexing";

interface FileExplorerProps {
  indexingState: IndexingState;
  onStartIndexing: () => void;
  onStopIndexing: () => void;
  onClearIndex: () => void;
  onRefreshIndex: () => void;
  onDeleteFile: (filePath: string) => void;
}

export function FileExplorer({
  indexingState,
  onStartIndexing,
  onStopIndexing,
  onClearIndex,
  onRefreshIndex,
  onDeleteFile,
}: FileExplorerProps) {
  const {
    status,
    totalFiles,
    processedFiles,
    currentFile,
    indexedFiles,
    error,
  } = indexingState;

  const isIndexing = status === "scanning" || status === "indexing";
  const progress = totalFiles > 0 ? (processedFiles / totalFiles) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header Card */}
      <Card variant="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderSearch className="h-5 w-5 text-primary" />
              <span className="font-semibold">Codebase Index</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefreshIndex}
                title="Refresh"
                disabled={isIndexing}
              >
                <RefreshCw className={cn("h-4 w-4", isIndexing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Idle State - No files indexed */}
          {status === "idle" && indexedFiles.length === 0 && (
            <div className="text-center py-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Select a folder to index your codebase
              </p>
              <Button onClick={onStartIndexing} variant="primary">
                <FolderOpen className="h-4 w-4 mr-2" />
                Select Folder
              </Button>
            </div>
          )}

          {/* Scanning/Indexing Progress */}
          {isIndexing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {status === "scanning" ? "Scanning files..." : "Indexing..."}
                </span>
                <span className="text-muted-foreground font-mono">
                  {processedFiles}/{totalFiles}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-300"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>

              {/* Current File */}
              {currentFile && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-accent/50 p-2 rounded">
                  <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                  <span className="truncate font-mono">{currentFile}</span>
                </div>
              )}

              <Button
                onClick={onStopIndexing}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}

          {/* Complete State */}
          {(status === "complete" || status === "idle") && indexedFiles.length > 0 && (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-medium">{indexedFiles.length} files indexed</span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Clear all indexed files?")) {
                      onClearIndex();
                    }
                  }}
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Add More Button */}
              <Button
                onClick={onStartIndexing}
                variant="secondary"
                size="sm"
                className="w-full"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Add Another Folder
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Indexing Failed</p>
                  <p className="text-sm opacity-80">{error}</p>
                </div>
              </div>
              <Button onClick={onStartIndexing} variant="secondary" className="w-full">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Indexed Files List */}
      {indexedFiles.length > 0 && (
        <Card variant="glass">
          <CardHeader>
            <span className="font-medium text-sm">Indexed Files</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[300px] overflow-y-auto">
              {indexedFiles.map((filePath) => (
                <FileItem
                  key={filePath}
                  filePath={filePath}
                  onDelete={() => onDeleteFile(filePath)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Individual File Item
function FileItem({
  filePath,
  onDelete,
}: {
  filePath: string;
  onDelete: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const fileName = filePath.split("/").pop() || filePath;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-accent/50 group border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <File className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-muted-foreground truncate">{filePath}</p>
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
        title="Remove from index"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <X className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}