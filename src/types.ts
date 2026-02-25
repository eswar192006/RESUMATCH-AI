export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  summary: string;
}

export interface MatchResult {
  score: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string;
  overallFeedback: string;
}
