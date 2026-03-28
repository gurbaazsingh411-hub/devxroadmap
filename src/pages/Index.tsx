import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HeroInput } from "@/components/HeroInput";
import { LoadingState } from "@/components/LoadingState";
import { ProjectTemplates } from "@/components/ProjectTemplates";
import { RecentRoadmaps } from "@/components/RecentRoadmaps";
import { ParticleBackground } from "@/components/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { RoadmapResult } from "@/types/roadmap";
import { Route as RouteIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { generateSlug } from "@/lib/slug";
import { addToHistory, getApiKey, setApiKey } from "@/lib/history";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState(() => getApiKey());
  const [showApiInput, setShowApiInput] = useState(false);
  const navigate = useNavigate();

  const handleApiKeyChange = (key: string) => {
    setUserApiKey(key);
    setApiKey(key);
  };

  const handleSubmit = async (idea: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-roadmap", {
        body: { projectIdea: idea, userApiKey },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const result = data as RoadmapResult;
      let finalSlug = generateSlug();

      // Save to DB before navigating
      let saved = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const { error: dbError } = await supabase
          .from("roadmaps")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .insert({ slug: finalSlug, project_idea: idea, result: result as any });

        if (!dbError) { saved = true; break; }
        if ((dbError as { code?: string }).code === "23505") {
          finalSlug = generateSlug();
          continue;
        }
        break;
      }

      if (saved) {
        addToHistory({
          slug: finalSlug,
          projectName: result.projectName,
          difficulty: result.difficulty,
          createdAt: new Date().toISOString(),
        });
      }

      navigate(`/r/${finalSlug}`, { state: { result, projectIdea: idea, linkSaved: saved } });
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      
      if (errorMessage.toLowerCase().includes("api key")) {
        setShowApiInput(true);
        toast.error("Please configure your Gemini API Key to continue.", {
          description: "Click the configuration button below to set your key.",
        });
      } else {
        toast.error("Could not generate roadmap. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-4 pt-32 pb-24 relative overflow-hidden">
      <ThemeToggle />
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-4xl mx-auto text-center space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card/80 text-muted-foreground text-sm font-mono mb-2">
            <RouteIcon className="h-3.5 w-3.5 text-primary" />
            buildpath
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
            Turn Your Idea Into a{" "}
            <span className="text-gradient">Learning Roadmap</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
            Describe what you want to build. We'll show you exactly what skills you need and in what order to learn them.
          </p>
        </motion.div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <HeroInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            apiKey={userApiKey}
            onApiKeyChange={handleApiKeyChange}
            showApiInput={showApiInput}
            onToggleApiInput={() => setShowApiInput(!showApiInput)}
          />
        )}
      </div>

      {!isLoading && (
        <>
          <RecentRoadmaps />
          <ProjectTemplates onSelect={handleSubmit} />
        </>
      )}

      <footer className="mt-auto py-8 text-center text-muted-foreground/60 text-sm font-light relative z-10 w-full">
        <p>Made by <span className="text-foreground font-medium">DevX</span></p>
      </footer>
    </div>
  );
};

export default Index;
