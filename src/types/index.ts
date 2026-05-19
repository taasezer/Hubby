export interface Repository {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  visibility: string;
  topics: string[];
  homepage: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  gradientFrom: string;
  gradientTo: string;
  responsibilities: string[];
  description: string;
}

export interface WorkflowItem {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "high" | "medium" | "low";
  assignee: string;
  assigneeInitials: string;
}

export interface RoadmapPhase {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  timeline: string;
  items: string[];
}

export interface AIFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  metrics: { label: string; value: string }[];
}

export interface TechStackItem {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export type Language = "en" | "tr";

export interface Translations {
  nav: {
    repositories: string;
    team: string;
    workflow: string;
    roadmap: string;
    aiSystems: string;
    techStack: string;
  };
  hero: {
    badge: string;
    title: string;
    titleAccent: string;
    subtitle: string;
    cta1: string;
    cta2: string;
    stats: {
      repositories: string;
      workflows: string;
      sprintProgress: string;
      contributors: string;
    };
  };
  repositories: {
    badge: string;
    title: string;
    subtitle: string;
    filterAll: string;
    openRepo: string;
    stars: string;
    forks: string;
    updated: string;
    loading: string;
    error: string;
    retry: string;
  };
  team: {
    badge: string;
    title: string;
    subtitle: string;
  };
  workflow: {
    badge: string;
    title: string;
    subtitle: string;
    columns: {
      todo: string;
      inProgress: string;
      review: string;
      completed: string;
    };
    priority: {
      high: string;
      medium: string;
      low: string;
    };
  };
  roadmap: {
    badge: string;
    title: string;
    subtitle: string;
    status: {
      completed: string;
      active: string;
      upcoming: string;
    };
  };
  ai: {
    badge: string;
    title: string;
    subtitle: string;
  };
  techStack: {
    badge: string;
    title: string;
    subtitle: string;
  };
  footer: {
    tagline: string;
    navigation: string;
    resources: string;
    connect: string;
    githubProfile: string;
    documentation: string;
    rights: string;
  };
}
