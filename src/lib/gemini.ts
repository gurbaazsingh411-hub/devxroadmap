import type { RoadmapResult } from "@/types/roadmap";

const SYSTEM_PROMPT = `You are a project analysis expert. Given a project idea, analyze it and return a structured JSON response with EXACTLY this schema (no markdown, no code fences, just valid JSON):

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

export async function generateWithGemini(
  apiKey: string,
  projectIdea: string
): Promise<RoadmapResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${SYSTEM_PROMPT}\n\nAnalyze this project idea and generate a learning roadmap: "${projectIdea}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Gemini API Error:", errorData);

    if (response.status === 400 || response.status === 403) {
      throw new Error("Invalid Gemini API Key. Please check your key and try again.");
    }
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please wait a moment and try again.");
    }
    throw new Error(
      `Gemini API error (${response.status}). Please verify your API key is valid.`
    );
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No content returned from Gemini. Please try again.");
  }

  // Strip markdown code fences if present
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  return JSON.parse(cleaned) as RoadmapResult;
}
