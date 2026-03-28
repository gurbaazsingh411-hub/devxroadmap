/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { projectIdea, userApiKey } = await req.json();
    if (!projectIdea || typeof projectIdea !== "string" || projectIdea.length > 500) {
      return new Response(JSON.stringify({ error: "Invalid project idea" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are a project analysis expert. Given a project idea, analyze it and return a structured JSON response with EXACTLY this schema (no markdown, no code fences, just valid JSON):

{
  "projectName": "string - a clean title for the project",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedTime": "string - e.g. '3-6 months'",
  "skills": ["array of skill strings needed, 6-12 items"],
  "roadmap": [
    {
      "step": 1,
      "title": "string - skill/topic name",
      "description": "string - one sentence on what to learn"
    }
  ],
  "techStack": [
    {
      "name": "string - stack option name",
      "tools": ["array of technology names"]
    }
  ],
  "architecture": ["array of architecture layers from top to bottom, e.g. 'User Interface', 'Frontend Framework', 'API Layer', 'Backend Server', 'Database'"]
}

For each roadmap step, optionally include a "resources" array with 1-2 URLs to relevant documentation or tutorials (use well-known sites like MDN, official docs, freeCodeCamp, etc.). Provide 6-10 roadmap steps, 1-2 tech stack options, and 4-6 architecture layers. Be specific and practical.`;

    let content: string;
    
    if (userApiKey) {
      // Direct call to Google Gemini API
      console.log("Using user-provided Gemini API key");
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${userApiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${systemPrompt}\n\nAnalyze this project idea and generate a learning roadmap: "${projectIdea}"` }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
              responseMimeType: "application/json",
            }
          })
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API error:", errorText);
        throw new Error("Invalid Gemini API Key or API error");
      }

      const geminiData = await geminiResponse.json();
      content = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    } else {
      // Fallback/Default call via Lovable Gateway
      const AI_API_KEY = Deno.env.get("AI_API_KEY") || Deno.env.get("LOVABLE_API_KEY");
      if (!AI_API_KEY) throw new Error("Please provide a Gemini API Key in the settings.");

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Analyze this project idea and generate a learning roadmap: "${projectIdea}"` },
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits or use your own Gemini API Key." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("AI service error");
      }

      const data = await response.json();
      content = data.choices?.[0]?.message?.content;
    }

    if (!content) throw new Error("No content from AI");

    // Strip markdown code fences if present
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-roadmap error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
