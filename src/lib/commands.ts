export interface Command {
  name: string;
  description: string;
  prompt: string;
  icon: string;
}

export const COMMANDS: Command[] = [
  {
    name: "/explain",
    description: "Explain the code in detail",
    prompt: "Explain this code in detail. Break down what each part does and why:",
    icon: "💡",
  },
  {
    name: "/fix",
    description: "Find and fix bugs",
    prompt: "Analyze this code for bugs and issues. Provide the fixed code with explanations:",
    icon: "🔧",
  },
  {
    name: "/test",
    description: "Generate unit tests",
    prompt: "Generate comprehensive unit tests for this code. Include edge cases:",
    icon: "🧪",
  },
  {
    name: "/refactor",
    description: "Improve and optimize code",
    prompt: "Refactor this code to be cleaner and follow best practices. Explain changes:",
    icon: "✨",
  },
  {
    name: "/doc",
    description: "Generate documentation",
    prompt: "Generate documentation with JSDoc comments and usage examples:",
    icon: "📚",
  },
  {
    name: "/security",
    description: "Security audit",
    prompt: "Perform a security audit. Identify vulnerabilities and provide fixes:",
    icon: "🔒",
  },
  {
    name: "/perf",
    description: "Performance optimization",
    prompt: "Analyze for performance issues and suggest optimizations:",
    icon: "⚡",
  },
  {
    name: "/convert",
    description: "Convert to TypeScript",
    prompt: "Convert this code to TypeScript with proper types and interfaces:",
    icon: "🔄",
  }, {
    name: "/refactor-all",
    description: "Bhai poora project refactor kar do",
    prompt: `You are in FULL PROJECT REFACTOR MODE.
    Analyze the entire indexed codebase and provide a complete modernization plan:
    1. **Code Quality Issues** - List all problems
    2. **Outdated Patterns** - What needs updating
    3. **Performance Issues** - What's slow
    4. **Security Issues** - What's vulnerable
    5. **Refactored Code** - Complete updated code for EACH file
    For each file, provide:
    \`\`\`typescript
    // filepath: <path>
    <complete refactored code>
    \`\`\`
    Be thorough. This is a one-click modernization.`,
    icon: "🔄",
  },
  {
    name: "/value",
    description: "Bhai ye project kitne ka hai?",
    prompt: `Analyze this codebase and provide project valuation:
    1. **Complexity Score** (1-10)
    2. **Estimated Dev Hours**
    3. **Freelance Pricing** (USD):
      - Budget: $X - $X
      - Standard: $X - $X
      - Premium: $X - $X
    4. **Agency Pricing** (USD)
    5. **Key Value Factors**
    6. **Market Comparison**
    Base on: code complexity, features, integrations, UI sophistication, market rates 2024-2025.`,
    icon: "💰",
  },
  {
    name: "/usage",
    description: "Bhai ye feature kitne log use kar rahe?",
    prompt: `Analyze the codebase for usage patterns. Without any analytics, estimate:
      1. **Feature Complexity Map** - Which features are most used (based on code paths)
      2. **Code Coverage Estimation** - Which parts are critical
      3. **User Flow Analysis** - Common user journeys
      4. **Optimization Priorities** - What to focus on
      Base this on: code structure, component hierarchy, route definitions, API endpoints.`,
      icon: "📊",
    },
    {
      name: "/deploy",
      description: "One command deploy with monitoring",
      prompt: `Provide a complete deployment guide for this project:
      1. **Build Command**
      2. **Deploy Steps** (Vercel/Netlify/Railway)
      3. **Environment Variables** needed
      4. **Post-deploy Checks**
      5. **Monitoring Setup**
      6. **Auto-fix Script** for common errors
      Include actual commands and scripts.`,
      icon: "🚀",
    },
    {
      name: "/parallel",
      description: "Same feature in 2 different styles",
      prompt: `For the requested feature, provide TWO different implementations side by side:
      ## Style A: Minimal / Simple
      <code>
      ## Style B: Feature-rich / Complex
      <code>
      ## Comparison Table
      | Aspect | Style A | Style B |
      |--------|---------|---------|
      | Lines of Code | | |
      | Performance | | |
      | Maintainability | | |
      | User Experience | | |
      ## Recommendation
      Which to choose and why.`,
      icon: "🔀",
    },
    {
      name: "/inspect",
      description: "Toggle component inspector overlay",
      prompt: "__TOGGLE_INSPECTOR__",
      icon: "🔍",
    },

    {
      name: "/ghost",
      description: "Toggle Ghost Mode for coding streams",
      prompt: "__TOGGLE_GHOST__",
      icon: "👻",
    },

    {
      name: "/autonomous",
      description: "Schedule autonomous tasks",
      prompt: "__OPEN_AUTONOMOUS__",
      icon: "🤖",
    },

    {
      name: "/deploy",
      description: "One-click deploy with monitoring",
      prompt: "__OPEN_DEPLOY__",
      icon: "🚀",
    },

    {
      name: "/errors",
      description: "Show captured console errors",
      prompt: "__SHOW_ERRORS__",
      icon: "🐛",
    },

    {
      name: "/memory",
      description: "Use patterns from previous projects",
      prompt: "Use patterns and components similar to my previous projects. Apply the same coding style and architecture.",
      icon: "🧠",
    },
  ];

export function parseCommand(input: string): { command: Command | null; content: string } {
  const trimmed = input.trim();

  for (const cmd of COMMANDS) {
    if (trimmed.toLowerCase().startsWith(cmd.name)) {
      const content = trimmed.slice(cmd.name.length).trim();
      return { command: cmd, content };
    }
  }

  return { command: null, content: input };
}

export function getCommandSuggestions(input: string): Command[] {
  if (!input.startsWith("/")) return [];

  const search = input.toLowerCase();
  return COMMANDS.filter((cmd) => cmd.name.startsWith(search));
}