export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  resources?: string[];
}

export interface TechStackOption {
  name: string;
  tools: string[];
}

export interface RoadmapResult {
  projectName: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedTime: string;
  skills: string[];
  roadmap: RoadmapStep[];
  techStack: TechStackOption[];
  architecture: string[];
}

export interface RoadmapHistoryItem {
  slug: string;
  projectName: string;
  difficulty: string;
  createdAt: string;
}
