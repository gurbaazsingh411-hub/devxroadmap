import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      onClick={() => setDark(!dark)}
      className="fixed top-5 right-5 z-50 p-2.5 rounded-full glass border border-border/60 hover:border-primary/30 transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      {dark ? (
        <Sun className="h-5 w-5 text-yellow-400 group-hover:rotate-90 transition-transform duration-500" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground group-hover:-rotate-12 transition-transform duration-500" />
      )}
    </motion.button>
  );
}
