import React, { useState, useEffect } from "react";
import { X, Save, Check } from "lucide-react";
import { Button } from "./ui/Button";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "devda_settings";

export interface Settings {
  customInstructions: string;
  preferredFramework: string;
  codeStyle: string;
}

export const DEFAULT_SETTINGS: Settings = {
  customInstructions: "",
  preferredFramework: "react",
  codeStyle: "concise",
};

// Export function to get settings (used by chat)
export async function getSettings(): Promise<Settings> {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(result[STORAGE_KEY]) };
      }
    }
  } catch (e) {
    console.error("Failed to load settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings on open
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getSettings().then((s) => {
        setSettings(s);
        setLoading(false);
      });
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        await chrome.storage.local.set({
          [STORAGE_KEY]: JSON.stringify(settings),
        });
      }
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1000);
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-accent/30">
          <h2 className="text-lg font-semibold">⚙️ Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading settings...
          </div>
        ) : (
          <div className="p-4 space-y-5 overflow-y-auto max-h-[60vh]">
            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium mb-2">
                📝 Custom Instructions
              </label>
              <textarea
                value={settings.customInstructions}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, customInstructions: e.target.value }))
                }
                placeholder="E.g., Always use functional components, prefer TypeScript, use Tailwind CSS, follow clean code principles..."
                className="input-base w-full h-28 resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                These instructions will be included in every AI response.
              </p>
            </div>

            {/* Preferred Framework */}
            <div>
              <label className="block text-sm font-medium mb-2">
                🛠️ Preferred Framework
              </label>
              <select
                value={settings.preferredFramework}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, preferredFramework: e.target.value }))
                }
                className="input-base w-full"
              >
                <option value="react">React</option>
                <option value="nextjs">Next.js</option>
                <option value="vue">Vue.js</option>
                <option value="svelte">Svelte</option>
                <option value="angular">Angular</option>
                <option value="node">Node.js</option>
                <option value="python">Python</option>
                <option value="go">Go</option>
              </select>
            </div>

            {/* Code Style */}
            <div>
              <label className="block text-sm font-medium mb-2">
                💻 Code Style
              </label>
              <select
                value={settings.codeStyle}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, codeStyle: e.target.value }))
                }
                className="input-base w-full"
              >
                <option value="concise">Concise - Minimal comments, clean code</option>
                <option value="verbose">Verbose - Detailed comments, explanations</option>
                <option value="educational">Educational - Teach concepts, explain why</option>
              </select>
            </div>

            {/* Tips */}
            <div className="bg-accent/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Tip:</strong> Good custom instructions:
              </p>
              <ul className="text-xs text-muted-foreground mt-1 list-disc list-inside space-y-0.5">
                <li>Use TypeScript with strict mode</li>
                <li>Prefer async/await over promises</li>
                <li>Use meaningful variable names</li>
                <li>Add error handling</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-accent/30">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {saved ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}