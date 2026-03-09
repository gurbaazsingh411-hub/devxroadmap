import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Layers, BookOpen, Code2, BarChart3, Share2, Copy, RefreshCw, Download, FileText, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { getProgress, setProgress } from "@/lib/history";
import { downloadMarkdown, downloadPDF } from "@/lib/export";
import type { RoadmapResult } from "@/types/roadmap";

const difficultyVariant = (d: string) => {
  if (d === "Beginner") return "beginner" as const;
  if (d === "Intermediate") return "intermediate" as const;
  return "advanced" as const;
};

interface Props {
  result: RoadmapResult;
  slug: string;
  onBack: () => void;
  onRegenerate?: () => void;
  projectIdea?: string;
  linkSaved?: boolean;
}

export function RoadmapResults({ result, slug, onBack, onRegenerate, projectIdea, linkSaved = true }: Props) {
  const [completed, setCompleted] = useState<number[]>(() => getProgress(slug));

  useEffect(() => {
    setProgress(slug, completed);
  }, [completed, slug]);

  const toggleStep = (step: number) => {
    setCompleted((prev) =>
      prev.includes(step) ? prev.filter((s) => s !== step) : [...prev, step]
    );
  };

  const progressPercent = result.roadmap.length > 0
    ? Math.round((completed.length / result.roadmap.length) * 100)
    : 0;

  const getShareUrl = () => {
    return `${window.location.origin}/r/${slug}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getShareUrl());
    toast.success("Link copied to clipboard!");
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: result.projectName, text: `Check out this learning roadmap for: ${result.projectName}`, url });
      } catch { /* user cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 pb-16 relative z-10">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" /> New idea
              </Button>
              {onRegenerate && (
                <Button variant="ghost" size="sm" onClick={onRegenerate} className="text-muted-foreground hover:text-foreground">
                  <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                </Button>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{result.projectName}</h1>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant={difficultyVariant(result.difficulty)}>{result.difficulty}</Badge>
              <span className="text-muted-foreground text-sm font-mono">{result.estimatedTime}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {linkSaved ? (
              <Badge variant="default" className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/15 gap-1">
                <CheckCircle2 className="h-3 w-3" /> Link saved
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving link…
              </Badge>
            )}
            <Button variant="glass" size="sm" onClick={handleCopyLink} disabled={!linkSaved}>
              <Copy className="h-4 w-4 mr-1" /> Copy Link
            </Button>
            <Button variant="glass" size="sm" onClick={handleShare} disabled={!linkSaved}>
              <Share2 className="h-4 w-4 mr-1" /> Share
            </Button>
            <Button variant="glass" size="sm" onClick={() => downloadMarkdown(result)}>
              <FileText className="h-4 w-4 mr-1" /> Markdown
            </Button>
            <Button variant="glass" size="sm" onClick={() => downloadPDF(result)}>
              <Download className="h-4 w-4 mr-1" /> PDF
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Progress Bar */}
      <ScrollReveal delay={0.05}>
        <div className="glass-strong rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-mono text-muted-foreground">{completed.length}/{result.roadmap.length} steps</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          <p className="text-xs text-muted-foreground">{progressPercent}% complete — check off steps as you learn them</p>
        </div>
      </ScrollReveal>

      {/* Skills */}
      <ScrollReveal delay={0.1}>
        <div className="glass-strong rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Code2 className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">Required Skills</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.skills.map((skill) => (
              <Badge key={skill} variant="skill">{skill}</Badge>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Roadmap */}
        <ScrollReveal delay={0.15} className="md:col-span-3">
          <div className="glass-strong rounded-2xl p-6 space-y-4 h-full">
            <div className="flex items-center gap-2 text-foreground">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">Learning Roadmap</h2>
            </div>
            <div className="relative space-y-0">
              {result.roadmap.map((step, i) => {
                const isCompleted = completed.includes(step.step);
                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <button
                        onClick={() => toggleStep(step.step)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-all duration-300 ${isCompleted
                            ? "bg-primary text-primary-foreground border border-primary"
                            : "bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
                          }`}
                      >
                        {isCompleted ? "✓" : step.step}
                      </button>
                      {i < result.roadmap.length - 1 && (
                        <div className={`w-px flex-1 my-1 transition-colors ${isCompleted ? "bg-primary/40" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-6">
                      <p className={`font-medium transition-colors ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {step.title}
                      </p>
                      <p className="text-muted-foreground text-sm mt-0.5">{step.description}</p>
                      {step.resources && step.resources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {step.resources.map((url, ri) => (
                            <a
                              key={ri}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Resource {ri + 1}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Tech Stack */}
          <ScrollReveal delay={0.2} direction="right">
            <div className="glass-strong rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-foreground">
                <Layers className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Tech Stack</h2>
              </div>
              <div className="space-y-4">
                {result.techStack.map((stack, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-mono text-muted-foreground">Option {i + 1}: {stack.name}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {stack.tools.map((tool) => (
                        <span key={tool} className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-secondary-foreground font-mono">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Architecture */}
          <ScrollReveal delay={0.25} direction="right">
            <div className="glass-strong rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Architecture</h2>
              </div>
              <div className="space-y-2">
                {result.architecture.map((layer, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                    <span className="text-sm font-mono text-foreground">{layer}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
