import { ResumeData, MatchResult } from "../types";

export async function parseResume(text: string): Promise<ResumeData> {
  const response = await fetch("/api/parse-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to parse resume");
  }

  return response.json();
}

export async function matchResumeToJob(resumeText: string, jobDescription: string): Promise<MatchResult> {
  const response = await fetch("/api/match-job", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText, jobDescription }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to match job");
  }

  return response.json();
}
