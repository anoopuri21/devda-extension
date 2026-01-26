import { useState, useEffect, useCallback } from "react";

export interface DetectedProject {
  url: string;
  framework: string;
  name: string;
  port: number;
  isRunning: boolean;
}

const COMMON_PORTS = [3000, 3001, 5173, 5174, 4200, 8080, 8000, 5000];

const FRAMEWORK_SIGNATURES: Record<string, string[]> = {
  "Next.js": ["__NEXT_DATA__", "_next"],
  "React (Vite)": ["__vite__", "vite"],
  "React (CRA)": ["react-root", "root"],
  "Vue": ["__vue__", "vue-app"],
  "Angular": ["ng-version", "angular"],
  "Svelte": ["__svelte__", "svelte"],
  "Nuxt": ["__nuxt__", "nuxt"],
  "Remix": ["__remix", "remix"],
  "Astro": ["astro-island", "astro"],
};

export function useProjectDetection() {
  const [projects, setProjects] = useState<DetectedProject[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentProject, setCurrentProject] = useState<DetectedProject | null>(null);

  const detectFramework = useCallback(async (port: number): Promise<DetectedProject | null> => {
    try {
      const response = await fetch(`http://localhost:${port}`, {
        method: "GET",
        mode: "no-cors",
      });

      // If we get here, something is running on this port
      // Try to detect framework by fetching the page
      try {
        const htmlResponse = await fetch(`http://localhost:${port}`);
        const html = await htmlResponse.text();

        let framework = "Unknown";
        for (const [name, signatures] of Object.entries(FRAMEWORK_SIGNATURES)) {
          if (signatures.some((sig) => html.includes(sig))) {
            framework = name;
            break;
          }
        }

        // Try to get project name from title or package.json
        const titleMatch = html.match(/<title>([^<]+)<\/title>/);
        const name = titleMatch?.[1] || `Project on :${port}`;

        return {
          url: `http://localhost:${port}`,
          framework,
          name,
          port,
          isRunning: true,
        };
      } catch {
        return {
          url: `http://localhost:${port}`,
          framework: "Unknown",
          name: `Project on :${port}`,
          port,
          isRunning: true,
        };
      }
    } catch {
      return null;
    }
  }, []);

  const scanForProjects = useCallback(async () => {
    setIsScanning(true);
    const detected: DetectedProject[] = [];

    for (const port of COMMON_PORTS) {
      const project = await detectFramework(port);
      if (project) {
        detected.push(project);
      }
    }

    setProjects(detected);
    if (detected.length > 0 && !currentProject) {
      setCurrentProject(detected[0]);
    }
    setIsScanning(false);
  }, [detectFramework, currentProject]);

  // Auto-scan on mount
  useEffect(() => {
    scanForProjects();
  }, []);

  return {
    projects,
    currentProject,
    setCurrentProject,
    isScanning,
    scanForProjects,
  };
}