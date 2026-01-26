const INDEXABLE_EXTENSIONS = new Set([
  ".js", ".ts", ".jsx", ".tsx", ".mdx", ".json",
  ".css", ".scss", ".md", ".html", ".vue", ".svelte",
]);

const SKIP_DIRECTORIES = new Set([
  "node_modules", ".git", ".next", "build", "dist", "public",
  ".turbo", ".plasmo", ".cache", "coverage", "__pycache__", ".venv", "venv",
]);

export interface FileInfo {
  path: string;
  name: string;
  content: string;
  size: number;
}

export interface ScanProgress {
  totalFiles: number;
  processedFiles: number;
  currentFile: string;
}

function shouldSkipDirectory(name: string): boolean {
  return SKIP_DIRECTORIES.has(name) || name.startsWith(".");
}

function shouldIndexFile(name: string): boolean {
  const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
  return INDEXABLE_EXTENSIONS.has(ext);
}

export async function selectFolder(): Promise<FileSystemDirectoryHandle | null> {
  try {
    if (!("showDirectoryPicker" in window)) {
      throw new Error("File System Access API not supported. Use Chrome/Edge.");
    }
    
    // Cast to any to bypass TypeScript checks for this Chrome-only API
    const handle = await (window as any).showDirectoryPicker({ mode: "read" });
    return handle;
  } catch (error: unknown) {
    if ((error as Error).name === "AbortError") {
      return null;
    }
    throw error;
  }
}

// Helper function to iterate directory entries (bypasses TS issues)
async function* getDirectoryEntries(
  dirHandle: FileSystemDirectoryHandle
): AsyncGenerator<[string, FileSystemHandle]> {
  // Use entries() with type assertion
  const entries = (dirHandle as any).entries();
  for await (const entry of entries) {
    yield entry;
  }
}

export async function scanDirectory(
  dirHandle: FileSystemDirectoryHandle,
  basePath: string = "",
  onProgress?: (progress: ScanProgress) => void,
  signal?: AbortSignal
): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  let totalFound = 0;

  async function processDirectory(
    handle: FileSystemDirectoryHandle,
    path: string
  ): Promise<void> {
    if (signal?.aborted) {
      throw new DOMException("Scanning aborted", "AbortError");
    }

    // Iterate using our helper function
    for await (const [name, entry] of getDirectoryEntries(handle)) {
      if (signal?.aborted) {
        throw new DOMException("Scanning aborted", "AbortError");
      }

      const entryPath = path ? `${path}/${name}` : name;

      if (entry.kind === "directory") {
        if (!shouldSkipDirectory(name)) {
          try {
            const subHandle = await handle.getDirectoryHandle(name);
            await processDirectory(subHandle, entryPath);
          } catch (err) {
            console.warn(`Could not access directory: ${entryPath}`);
          }
        }
      } else if (entry.kind === "file" && shouldIndexFile(name)) {
        try {
          const fileHandle = await handle.getFileHandle(name);
          const file = await fileHandle.getFile();

          // Skip files > 500KB
          if (file.size > 500 * 1024) {
            continue;
          }

          const content = await file.text();

          files.push({
            path: entryPath,
            name: name,
            content,
            size: file.size,
          });

          totalFound++;

          onProgress?.({
            totalFiles: totalFound,
            processedFiles: totalFound,
            currentFile: entryPath,
          });
        } catch (err) {
          console.warn(`Could not read file: ${entryPath}`);
        }
      }
    }
  }

  await processDirectory(dirHandle, basePath);
  return files;
}

export function isFileSystemSupported(): boolean {
  return "showDirectoryPicker" in window;
}