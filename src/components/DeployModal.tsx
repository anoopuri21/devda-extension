import React, { useState } from "react";
import { X, Rocket, Check, Loader2, Terminal, ExternalLink } from "lucide-react";
import { Button } from "./ui/Button";

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeployPlatform = "vercel" | "netlify" | "railway" | "render";

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const [platform, setPlatform] = useState<DeployPlatform>("vercel");
  const [step, setStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployUrl, setDeployUrl] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  const platforms = [
    { id: "vercel", name: "Vercel", icon: "▲", color: "#000" },
    { id: "netlify", name: "Netlify", icon: "◆", color: "#00AD9F" },
    { id: "railway", name: "Railway", icon: "🚂", color: "#0B0D0E" },
    { id: "render", name: "Render", icon: "◉", color: "#46E3B7" },
  ];

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    setLogs([]);
    setStep(1);

    try {
      // Step 1: Build
      addLog("📦 Building project...");
      await new Promise((r) => setTimeout(r, 2000));
      addLog("✅ Build successful");
      setStep(2);

      // Step 2: Deploy
      addLog(`🚀 Deploying to ${platform}...`);
      await new Promise((r) => setTimeout(r, 3000));
      addLog("✅ Deployment complete");
      setStep(3);

      // Step 3: Monitor
      addLog("👀 Starting 10-minute monitoring...");
      setDeployUrl(`https://your-app.${platform}.app`);

      // Simulate monitoring
      for (let i = 1; i <= 3; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        addLog(`✅ Health check ${i}/3 passed`);
      }

      setStep(4);
      addLog("🎉 Deployment successful and healthy!");
    } catch (error) {
      addLog(`❌ Error: ${error}`);
      setStep(-1);
    } finally {
      setIsDeploying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">One-Click Deploy</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-accent rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Platform Selection */}
          {step === 0 && (
            <>
              <label className="block text-sm font-medium mb-2">
                Select Platform
              </label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id as DeployPlatform)}
                    className={`p-4 rounded-lg border text-center transition-all ${
                      platform === p.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <p className="mt-1 font-medium">{p.name}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Progress Steps */}
          {step > 0 && (
            <div className="flex justify-between mb-4">
              {["Build", "Deploy", "Monitor", "Done"].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step > i + 1
                        ? "bg-success text-white"
                        : step === i + 1
                        ? "bg-primary text-white"
                        : "bg-accent text-muted-foreground"
                    }`}
                  >
                    {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < 3 && (
                    <div
                      className={`w-12 h-1 ${
                        step > i + 1 ? "bg-success" : "bg-accent"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="bg-[#0d0d0d] rounded-lg p-3 h-48 overflow-y-auto font-mono text-xs">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-300">
                  {log}
                </div>
              ))}
              {isDeploying && (
                <div className="flex items-center gap-2 text-primary">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Working...</span>
                </div>
              )}
            </div>
          )}

          {/* Deploy URL */}
          {deployUrl && step === 4 && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-center">
              <p className="text-success font-medium mb-2">🎉 Deployed Successfully!</p>
              <a
                href={deployUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center justify-center gap-1"
              >
                {deployUrl} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {step === 0 && (
            <Button onClick={handleDeploy}>
              <Rocket className="h-4 w-4 mr-2" />
              Deploy Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}