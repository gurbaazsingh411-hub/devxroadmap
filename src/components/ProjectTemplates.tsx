import { Rocket, Bot, BarChart3, Gamepad2, ShoppingCart, Brain, Music, Camera } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

const TEMPLATES = [
  { icon: BarChart3, label: "SaaS Dashboard", idea: "A SaaS analytics dashboard with user management, subscription billing, and data visualization" },
  { icon: Bot, label: "Discord Bot", idea: "A Discord bot with moderation commands, custom responses, and music playback" },
  { icon: ShoppingCart, label: "E-Commerce Store", idea: "An e-commerce website with product catalog, shopping cart, and payment processing" },
  { icon: Gamepad2, label: "Multiplayer Game", idea: "A real-time multiplayer browser game with matchmaking and leaderboards" },
  { icon: Brain, label: "AI Chatbot", idea: "An AI-powered chatbot with conversation history, context awareness, and multiple personas" },
  { icon: Rocket, label: "Startup Landing", idea: "A modern startup landing page with waitlist signup, animations, and A/B testing" },
  { icon: Music, label: "Music Streaming", idea: "A music streaming platform with playlists, recommendations, and social sharing" },
  { icon: Camera, label: "Photo Sharing", idea: "A photo sharing social network with filters, stories, and real-time notifications" },
];

interface Props {
  onSelect: (idea: string) => void;
}

export function ProjectTemplates({ onSelect }: Props) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-24 relative z-10">
      <ScrollReveal>
        <div className="text-center mb-10">
          <h2 className="text-2xl font-semibold text-foreground">Explore Popular Projects</h2>
          <p className="text-muted-foreground text-sm mt-2">Click any template to instantly generate its learning roadmap</p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {TEMPLATES.map((t, i) => (
          <ScrollReveal key={t.label} delay={i * 0.05}>
            <button
              onClick={() => onSelect(t.idea)}
              className="w-full glass rounded-2xl p-5 text-left group card-hover hover:border-primary/20 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{t.idea}</p>
            </button>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
