# AI Resume Parser & Job Matching System

An AI-powered full-stack web application that parses resumes and performs semantic job matching using the Google Gemini API.  
The system extracts structured information from unstructured resumes and generates intelligent match scores with skill gap analysis.

---

## 🚀 Features

- 📄 Extracts structured data (skills, education, experience) from PDF and text resumes  
- 🎯 Generates percentage-based job match scores  
- 🧠 Performs semantic job-resume comparison  
- 📊 Identifies missing skills and skill gaps  
- ✨ Provides AI-driven resume optimization suggestions  
- 🔐 Secure backend API integration using environment variables  

---

## 🏗 Architecture

Frontend (React + TypeScript)  
⬇  
Backend (Node.js + Express)  
⬇  
Google Gemini API  
⬇  
Structured JSON Response  
⬇  
Match Score + Skill Analysis Display  

---

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Tailwind CSS, Vite  
**Backend:** Node.js, Express  
**AI Integration:** Google Gemini API  
**Document Processing:** PDF.js  

---

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- Google Gemini API Key

---

### 🚀 Setup & Run Locally

```bash
# Clone the repository
git clone https://github.com/eswar192006/RESUMATCH-AI.git
cd RESUMATCH-AI

# Install dependencies
npm install

# Create a .env file and add your API key
echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env

# Start the development server
npm run dev
