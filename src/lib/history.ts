import type { RoadmapHistoryItem } from "@/types/roadmap";

const KEY = "buildpath_history";
const MAX = 12;

export function getHistory(): RoadmapHistoryItem[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToHistory(item: RoadmapHistoryItem) {
  const history = getHistory().filter((h) => h.slug !== item.slug);
  history.unshift(item);
  localStorage.setItem(KEY, JSON.stringify(history.slice(0, MAX)));
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}

export function getProgress(slug: string): number[] {
  try {
    return JSON.parse(localStorage.getItem(`progress_${slug}`) || "[]");
  } catch {
    return [];
  }
}

export function setProgress(slug: string, completed: number[]) {
  localStorage.setItem(`progress_${slug}`, JSON.stringify(completed));
}
