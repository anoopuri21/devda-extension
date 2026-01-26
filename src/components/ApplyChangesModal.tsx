import React, { useState } from "react";
import { X, FolderOpen, Github, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";

interface ApplyChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: Array<{
    filePath: string;
    oldContent: string;
    newContent: string;
  }>;
}

export function ApplyChangesModal({ isOpen, onClose, changes }: ApplyChangesModalProps) {
  const [mode, setMode] = useState<"local" | "github">("local");
  const [isApplying, setIsApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleApplyLocal = async () => {
    setIsApplying(true);
    try {
      // Use File System Access API to write files
      for (const change of changes) {
        // This requires user to grant permission
        const dirHandle = await window.showDirectoryPicker({ mode: "readwrite" });
        const pathParts = change.filePath.split("/");
        let currentHandle = dirHandle;

        // Navigate to the file's directory
        for (let i = 0; i < pathParts.length - 1; i++) {
          try {
            currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
          } catch {
            currentHandle = await currentHandle.getDirectoryHandle(pathParts[i], { create: true });
          }
        }

        // Create or overwrite the file
        const fileName = pathParts[pathParts.length - 1];
        const fileHandle = await currentHandle.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(change.newContent);
        await writable.close();
      }

      setApplied(true);
      setTimeout(() => {
        onClose();
        setApplied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to apply changes:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const handleCreatePR = async () => {
    setIsApplying(true);
    try {
      // Open GitHub in new tab with pre-filled PR
      // This is a simplified version - full implementation would use GitHub API
      const prBody = changes
        .map((c) => `### ${c.filePath}\n\`\`\`diff\n${c.newContent}\n\`\`\``)
        .join("\n\n");

      // Copy to clipboard for now
      await navigator.clipboard.writeText(prBody);
      
      setApplied(true);
      setTimeout(() => {
        onClose();
        setApplied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to create PR:", error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Apply Changes</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            {changes.length} file(s) will be modified. Choose how to apply:
          </p>

          {/* Mode Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("local")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                mode === "local"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <FolderOpen className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium">Apply Locally</p>
              <p className="text-xs text-muted-foreground">Direct file changes</p>
            </button>

            <button
              onClick={() => setMode("github")}
              className={cn(
                "p-4 rounded-lg border text-left transition-all",
                mode === "github"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Github className="h-6 w-6 text-primary mb-2" />
              <p className="font-medium">Create PR</p>
              <p className="text-xs text-muted-foreground">GitHub Pull Request</p>
            </button>
          </div>

          {/* Files List */}
          <div className="bg-accent/50 rounded-lg p-3 max-h-40 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Files to modify:</p>
            {changes.map((change, i) => (
              <div key={i} className="text-sm font-mono truncate">
                {change.filePath}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={mode === "local" ? handleApplyLocal : handleCreatePR}
            disabled={isApplying || applied}
          >
            {isApplying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying...
              </>
            ) : applied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Applied!
              </>
            ) : mode === "local" ? (
              "Apply Locally"
            ) : (
              "Create PR"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}