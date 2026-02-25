import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.post("/api/parse-resume", async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "No text provided" });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract structured information from the following resume text. Return a JSON object.
        
        Resume Text:
        ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    company: { type: Type.STRING },
                    role: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["company", "role"],
                },
              },
              education: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    institution: { type: Type.STRING },
                    degree: { type: Type.STRING },
                    year: { type: Type.STRING },
                  },
                  required: ["institution", "degree"],
                },
              },
              summary: { type: Type.STRING },
            },
            required: ["name", "skills", "experience"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Error parsing resume:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/match-job", async (req, res) => {
    try {
      const { resumeText, jobDescription } = req.body;
      if (!resumeText || !jobDescription) {
        return res.status(400).json({ error: "Resume text and job description are required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Compare the following resume against the job description. 
        Provide a detailed analysis including a match score (0-100), matching skills, missing skills, strengths, weaknesses, and specific suggestions to improve the resume for this role.
        
        Resume:
        ${resumeText}
        
        Job Description:
        ${jobDescription}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Match score from 0 to 100" },
              matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvementSuggestions: { type: Type.STRING, description: "Markdown formatted suggestions" },
              overallFeedback: { type: Type.STRING },
            },
            required: ["score", "matchingSkills", "missingSkills", "improvementSuggestions"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error: any) {
      console.error("Error matching job:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
