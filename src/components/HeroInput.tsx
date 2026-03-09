import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "A social media app",
  "A SaaS dashboard",
  "An AI chatbot",
  "A multiplayer game",
  "A trading bot",
  "A food delivery website",
];

interface HeroInputProps {
  onSubmit: (idea: string) => void;
  isLoading: boolean;
}

export function HeroInput({ onSubmit, isLoading }: HeroInputProps) {
  const [idea, setIdea] = useState("");

  const handleSubmit = () => {
    if (idea.trim() && !isLoading) onSubmit(idea.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative"
      >
        <div className="glass-strong rounded-2xl p-2 glow-border">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/50" />
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="I want to build a habit tracking mobile app..."
                className="w-full bg-transparent border-0 text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-4 text-base md:text-lg focus:outline-none font-light"
                disabled={isLoading}
              />
            </div>
            <Button
              variant="hero"
              size="lg"
              onClick={handleSubmit}
              disabled={!idea.trim() || isLoading}
              className="rounded-xl px-6 shrink-0"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Analyzing
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Generate Path
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="flex flex-wrap items-center justify-center gap-2 mt-6"
      >
        <span className="text-muted-foreground text-sm mr-1">Try:</span>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setIdea(s)}
            className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 bg-card/60"
          >
            {s}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
