import { useNavigate } from "react-router-dom";
import { getHistory, clearHistory } from "@/lib/history";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const difficultyVariant = (d: string) => {
  if (d === "Beginner") return "beginner" as const;
  if (d === "Intermediate") return "intermediate" as const;
  return "advanced" as const;
};

export function RecentRoadmaps() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(() => getHistory());

  if (history.length === 0) return null;

  const handleClear = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 relative z-10">
      <ScrollReveal>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Recent Roadmaps</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4 mr-1" /> Clear
          </Button>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.map((item, i) => (
          <ScrollReveal key={item.slug} delay={i * 0.05}>
            <button
              onClick={() => navigate(`/r/${item.slug}`)}
              className="w-full glass rounded-xl p-4 text-left card-hover hover:border-primary/20 cursor-pointer"
            >
              <p className="font-semibold text-foreground text-sm truncate">{item.projectName}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={difficultyVariant(item.difficulty)} className="text-[10px]">{item.difficulty}</Badge>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
