import { TeamMember, WorkflowItem, RoadmapPhase, AIFeature, TechStackItem } from "@/types";

export const GITHUB_USERNAME = "taasezer";
export const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=30`;

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "taha-sezer",
    name: "Taha Sezer",
    role: "System Engineer",
    initials: "TS",
    gradientFrom: "#8b1a1a",
    gradientTo: "#c43c3c",
    responsibilities: [
      "System Architecture",
      "Workflow Design",
      "GitHub Integration",
      "Agile Planning",
      "System Analysis",
    ],
    description:
      "Designs the core system architecture and orchestrates development workflows. Leads agile planning, manages GitHub integration pipelines, and ensures system coherence across all engineering domains.",
  },
  {
    id: "yunus-emre-sayin",
    name: "Yunus Emre Sayın",
    role: "AI & Backend Engineer",
    initials: "YES",
    gradientFrom: "#1a3a5c",
    gradientTo: "#2a6a9c",
    responsibilities: [
      "AI Workflow Logic",
      "API Architecture Planning",
      "AI Integration Concepts",
      "Repository Intelligence Systems",
    ],
    description:
      "Architects the intelligence layer powering Hubby's AI capabilities. Designs API schemas, builds repository analysis engines, and develops machine learning pipelines for automated developer insights.",
  },
  {
    id: "bartu-selcuk",
    name: "Bartu Selçuk",
    role: "UI & Frontend Engineer",
    initials: "BS",
    gradientFrom: "#2d1a4e",
    gradientTo: "#5a3a8e",
    responsibilities: [
      "UI/UX Design",
      "Frontend Architecture",
      "Responsive Design",
      "Theme Systems",
      "Motion Design",
    ],
    description:
      "Crafts the premium visual experience and frontend architecture. Implements the liquid glass design system, responsive layouts, motion choreography, and the dual-theme engine that defines Hubby's identity.",
  },
];

export const WORKFLOW_ITEMS: WorkflowItem[] = [
  {
    id: "wf-1",
    title: "Repository Analytics Engine",
    description: "Build real-time analytics pipeline for repository activity tracking and visualization",
    status: "todo",
    priority: "high",
    assignee: "Yunus Emre Sayın",
    assigneeInitials: "YES",
  },
  {
    id: "wf-2",
    title: "CI/CD Pipeline Configuration",
    description: "Set up automated build, test, and deployment workflows across all repositories",
    status: "todo",
    priority: "medium",
    assignee: "Taha Sezer",
    assigneeInitials: "TS",
  },
  {
    id: "wf-3",
    title: "AI Documentation Generator",
    description: "Implement LLM-based automatic documentation generation from codebase analysis",
    status: "todo",
    priority: "low",
    assignee: "Yunus Emre Sayın",
    assigneeInitials: "YES",
  },
  {
    id: "wf-4",
    title: "GitHub API Integration Layer",
    description: "Connect platform to GitHub REST API with caching, rate limiting, and error recovery",
    status: "in-progress",
    priority: "high",
    assignee: "Taha Sezer",
    assigneeInitials: "TS",
  },
  {
    id: "wf-5",
    title: "Responsive Layout System",
    description: "Implement mobile-first responsive grid with breakpoint-aware component rendering",
    status: "in-progress",
    priority: "medium",
    assignee: "Bartu Selçuk",
    assigneeInitials: "BS",
  },
  {
    id: "wf-6",
    title: "Dark Mode Theme Engine",
    description: "Build theme switching system with CSS custom properties and smooth transitions",
    status: "review",
    priority: "high",
    assignee: "Bartu Selçuk",
    assigneeInitials: "BS",
  },
  {
    id: "wf-7",
    title: "Sprint Planning Dashboard",
    description: "Design and implement visual Kanban board with drag semantics and status tracking",
    status: "review",
    priority: "medium",
    assignee: "Taha Sezer",
    assigneeInitials: "TS",
  },
  {
    id: "wf-8",
    title: "Liquid Glass Design System",
    description: "Implement glassmorphism components with backdrop blur, transparency layers, and depth",
    status: "completed",
    priority: "high",
    assignee: "Bartu Selçuk",
    assigneeInitials: "BS",
  },
  {
    id: "wf-9",
    title: "i18n Architecture",
    description: "Build scalable internationalization system supporting English and Turkish localization",
    status: "completed",
    priority: "medium",
    assignee: "Taha Sezer",
    assigneeInitials: "TS",
  },
  {
    id: "wf-10",
    title: "Component Library Foundation",
    description: "Establish reusable component library with shadcn/ui base and custom design tokens",
    status: "completed",
    priority: "high",
    assignee: "Bartu Selçuk",
    assigneeInitials: "BS",
  },
];

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: "phase-1",
    phase: 1,
    title: "System Analysis",
    description:
      "Comprehensive requirements gathering, stakeholder interviews, and technical feasibility assessment. Defined platform scope, user personas, and core feature specifications.",
    status: "completed",
    timeline: "Week 1–2",
    items: [
      "Requirements documentation",
      "Technical feasibility analysis",
      "Architecture decision records",
      "Risk assessment matrix",
    ],
  },
  {
    id: "phase-2",
    phase: 2,
    title: "UI/UX Architecture",
    description:
      "Design system creation with liquid glass aesthetics, component library establishment, responsive layout specifications, and interactive prototype development.",
    status: "completed",
    timeline: "Week 3–5",
    items: [
      "Design token system",
      "Component library (shadcn/ui)",
      "Responsive breakpoint strategy",
      "Motion design specifications",
    ],
  },
  {
    id: "phase-3",
    phase: 3,
    title: "GitHub Integration",
    description:
      "REST API integration for real-time repository data, commit analytics, language distribution analysis, and contributor activity visualization.",
    status: "active",
    timeline: "Week 6–8",
    items: [
      "GitHub REST API client",
      "Repository data pipeline",
      "Language analytics engine",
      "Real-time activity feeds",
    ],
  },
  {
    id: "phase-4",
    phase: 4,
    title: "AI Workflow Systems",
    description:
      "Integration of AI-assisted development tools including automated code review insights, smart documentation generation, and workflow optimization algorithms.",
    status: "upcoming",
    timeline: "Week 9–12",
    items: [
      "AI code analysis pipeline",
      "Smart documentation engine",
      "Workflow optimization ML models",
      "Developer productivity metrics",
    ],
  },
  {
    id: "phase-5",
    phase: 5,
    title: "Deployment Strategy",
    description:
      "Production deployment configuration, CI/CD pipeline automation, performance optimization, monitoring infrastructure, and scalability planning.",
    status: "upcoming",
    timeline: "Week 13–14",
    items: [
      "Vercel deployment pipeline",
      "Performance optimization audit",
      "Monitoring & alerting setup",
      "Documentation & handoff",
    ],
  },
];

export const AI_FEATURES: AIFeature[] = [
  {
    id: "ai-1",
    title: "Workflow Optimization",
    description:
      "Intelligent task routing analyzes team velocity, individual expertise, and sprint capacity to automatically suggest optimal task assignments and predict delivery timelines with adaptive learning.",
    icon: "workflow",
    metrics: [
      { label: "Task Routing Accuracy", value: "94%" },
      { label: "Sprint Prediction", value: "±0.5 days" },
    ],
  },
  {
    id: "ai-2",
    title: "Repository Intelligence",
    description:
      "Deep codebase analysis engine that maps dependency graphs, detects architectural patterns, identifies code duplication, and surfaces security vulnerabilities across all connected repositories.",
    icon: "repository",
    metrics: [
      { label: "Code Coverage Analysis", value: "Real-time" },
      { label: "Vulnerability Detection", value: "< 2min" },
    ],
  },
  {
    id: "ai-3",
    title: "Smart Documentation",
    description:
      "Automated documentation pipeline that generates API references, changelog summaries, and architectural decision records directly from commit history and code structure analysis.",
    icon: "documentation",
    metrics: [
      { label: "Docs Generated", value: "1,200+" },
      { label: "Accuracy Rate", value: "97%" },
    ],
  },
  {
    id: "ai-4",
    title: "Productivity Insights",
    description:
      "Developer performance analytics dashboard tracking commit patterns, review throughput, focus time distribution, and bottleneck identification with personalized improvement recommendations.",
    icon: "productivity",
    metrics: [
      { label: "Efficiency Gain", value: "+32%" },
      { label: "Bottleneck Detection", value: "Automated" },
    ],
  },
];

export const TECH_STACK: TechStackItem[] = [
  {
    id: "tech-1",
    name: "Next.js",
    category: "Framework",
    description:
      "React framework powering server-side rendering, static generation, and API routes with optimized performance out of the box.",
    icon: "nextjs",
  },
  {
    id: "tech-2",
    name: "React",
    category: "Library",
    description:
      "Component-based UI library enabling declarative interfaces with efficient virtual DOM reconciliation and hooks-based state management.",
    icon: "react",
  },
  {
    id: "tech-3",
    name: "TailwindCSS",
    category: "Styling",
    description:
      "Utility-first CSS framework providing rapid UI development with a comprehensive design token system and zero unused CSS in production.",
    icon: "tailwind",
  },
  {
    id: "tech-4",
    name: "GitHub API",
    category: "Integration",
    description:
      "REST API integration fetching real-time repository data, commit history, and contributor analytics from GitHub's platform.",
    icon: "github",
  },
  {
    id: "tech-5",
    name: "Framer Motion",
    category: "Animation",
    description:
      "Production-ready animation library delivering fluid transitions, gesture interactions, and layout animations with declarative syntax.",
    icon: "framer",
  },
  {
    id: "tech-6",
    name: "TypeScript",
    category: "Language",
    description:
      "Typed superset of JavaScript ensuring compile-time safety, enhanced IDE support, and self-documenting codebases at scale.",
    icon: "typescript",
  },
];

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Shell: "#89e051",
  Go: "#00ADD8",
  "C#": "#178600",
  C: "#555555",
  Assembly: "#6E4C13",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Rust: "#dea584",
  Java: "#b07219",
};
