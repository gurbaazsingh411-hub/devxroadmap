import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RoadmapResults } from "@/components/RoadmapResults";
import { ParticleBackground } from "@/components/ParticleBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingState } from "@/components/LoadingState";
import type { RoadmapResult } from "@/types/roadmap";
import { toast } from "sonner";

interface LocationState {
  result?: RoadmapResult;
  projectIdea?: string;
  linkSaved?: boolean;
}

const SharedRoadmap = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [result, setResult] = useState<RoadmapResult | null>(locationState?.result ?? null);
  const [loading, setLoading] = useState(!locationState?.result);
  const [projectIdea, setProjectIdea] = useState(locationState?.projectIdea ?? "");
  const [notFound, setNotFound] = useState(false);
  // Show spinner briefly then confirm, or use value from location state
  const [linkSaved, setLinkSaved] = useState(false);
  const hasLocationResult = !!locationState?.result;
  const locationLinkSaved = locationState?.linkSaved;

  useEffect(() => {
    if (locationLinkSaved === false) {
      // Save failed — keep as false
      return;
    }
    if (hasLocationResult) {
      // Came from generation — show spinner briefly for visual feedback
      const timer = setTimeout(() => setLinkSaved(true), 800);
      return () => clearTimeout(timer);
    }
    // Loaded from DB — already saved (handled in the fetch effect)
  }, [hasLocationResult, locationLinkSaved]);

  useEffect(() => {
    if (result) return;
    if (!slug) return;

    (async () => {
      const { data, error } = await supabase
        .from("roadmaps")
        .select("result, project_idea")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) {
        console.error("Failed to load roadmap:", error);
        setNotFound(true);
        setLoading(false);
        return;
      }
      setResult(data.result as unknown as RoadmapResult);
      setProjectIdea(data.project_idea);
      setLinkSaved(true);
      setLoading(false);
    })();
  }, [slug, result]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <ThemeToggle />
        <ParticleBackground />
        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Roadmap Not Found</h1>
          <p className="text-muted-foreground">This roadmap may have been removed or the link is invalid.</p>
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline font-medium"
          >
            ← Generate a new roadmap
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background px-4 pt-8">
        <ThemeToggle />
        <ParticleBackground />
        <div className="max-w-5xl mx-auto pt-24">
          <LoadingState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pt-8">
      <ThemeToggle />
      <ParticleBackground />
      {result && (
        <RoadmapResults
          result={result}
          slug={slug!}
          onBack={() => navigate("/")}
          onRegenerate={() => navigate("/")}
          projectIdea={projectIdea}
          linkSaved={linkSaved}
        />
      )}
    </div>
  );
};

export default SharedRoadmap;
