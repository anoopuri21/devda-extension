import React, { useState, useEffect } from "react";
import { Copy, Check, Download, FileCode } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language: string;
}

// Simple syntax highlighting with inline styles
function highlightCode(code: string, language: string): string {
  const lang = language.toLowerCase().trim();
  
  // Escape HTML first
  let highlighted = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Common patterns with inline styles
  const patterns: Array<{ regex: RegExp; style: string }> = [
    // Comments (green, italic)
    {
      regex: /(\/\/.*$)/gm,
      style: 'color: #6a9955; font-style: italic;',
    },
    {
      regex: /(\/\*[\s\S]*?\*\/)/g,
      style: 'color: #6a9955; font-style: italic;',
    },
    {
      regex: /(#.*$)/gm, // Python/bash comments
      style: 'color: #6a9955; font-style: italic;',
    },
    // Strings (orange)
    {
      regex: /("(?:[^"\\]|\\.)*")/g,
      style: 'color: #ce9178;',
    },
    {
      regex: /('(?:[^'\\]|\\.)*')/g,
      style: 'color: #ce9178;',
    },
    {
      regex: /(`(?:[^`\\]|\\.)*`)/g,
      style: 'color: #ce9178;',
    },
    // Numbers (light green)
    {
      regex: /\b(\d+\.?\d*)\b/g,
      style: 'color: #b5cea8;',
    },
    // Keywords (blue)
    {
      regex: /\b(const|let|var|function|async|await|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|new|class|extends|implements|interface|type|enum|import|export|from|default|as|static|public|private|protected|readonly|abstract|typeof|instanceof|in|of|void|null|undefined|true|false|this|super)\b/g,
      style: 'color: #569cd6;',
    },
    // Python keywords
    {
      regex: /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is|None|True|False|self|async|await)\b/g,
      style: 'color: #569cd6;',
    },
    // Types (teal)
    {
      regex: /\b(string|number|boolean|any|void|never|unknown|object|Array|Promise|Map|Set|Record|Partial|Required|Pick|Omit|React|useState|useEffect|useCallback|useMemo|useRef)\b/g,
      style: 'color: #4ec9b0;',
    },
    // Function calls (yellow) - word followed by (
    {
      regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
      style: 'color: #dcdcaa;',
    },
    // JSX/HTML tags (blue)
    {
      regex: /(&lt;\/?[a-zA-Z][a-zA-Z0-9]*)/g,
      style: 'color: #569cd6;',
    },
    // Decorators/Attributes (purple)
    {
      regex: /(@[a-zA-Z_][a-zA-Z0-9_]*)/g,
      style: 'color: #c586c0;',
    },
  ];

  // Apply patterns (order matters - apply comments/strings first)
  patterns.forEach(({ regex, style }) => {
    highlighted = highlighted.replace(regex, (match) => {
      // Don't re-highlight already highlighted text
      if (match.includes('style=')) return match;
      return `<span style="${style}">${match}</span>`;
    });
  });

  return highlighted;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState("");

  useEffect(() => {
    const highlighted = highlightCode(code, language);
    setHighlightedCode(highlighted);
  }, [code, language]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const downloadAsFile = () => {
    const ext = getExtension(language);
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const displayLanguage = language.toLowerCase().replace(/^```/, "").trim() || "code";

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-border/50 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: '#1e1e1e' }}>
        <div className="flex items-center gap-2 text-xs" style={{ color: '#888' }}>
          <FileCode className="h-3.5 w-3.5" />
          <span className="font-medium">{displayLanguage}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={downloadAsFile}
            className="p-1.5 rounded transition-all hover:bg-white/10"
            style={{ color: '#888' }}
            title="Download file"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded transition-all hover:bg-white/10"
            style={{ color: copied ? '#4ade80' : '#888' }}
            title="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Code with syntax highlighting */}
      <div style={{ backgroundColor: '#0d0d0d' }}>
        <pre className="p-4 overflow-x-auto">
          <code
            className="text-sm leading-relaxed font-mono"
            style={{ color: '#d4d4d4' }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    </div>
  );
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
    typescript: "ts",
    javascript: "js",
    ts: "ts",
    js: "js",
    tsx: "tsx",
    jsx: "jsx",
    python: "py",
    py: "py",
    rust: "rs",
    go: "go",
    java: "java",
    css: "css",
    scss: "scss",
    html: "html",
    json: "json",
    markdown: "md",
    md: "md",
    sql: "sql",
    bash: "sh",
    sh: "sh",
    shell: "sh",
  };
  const lang = language.toLowerCase().replace(/^```/, "").trim();
  return map[lang] || "txt";
}