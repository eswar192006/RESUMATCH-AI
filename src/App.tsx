/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  User, 
  GraduationCap, 
  Code2, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { extractTextFromPdf } from './utils/pdfParser';
import { parseResume, matchResumeToJob } from './services/geminiService';
import { ResumeData, MatchResult } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [isMatching, setIsMatching] = useState(false);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setIsParsing(true);

    try {
      let text = '';
      if (selectedFile.type === 'application/pdf') {
        text = await extractTextFromPdf(selectedFile);
      } else {
        text = await selectedFile.text();
      }
      setResumeText(text);
      
      const parsed = await parseResume(text);
      setResumeData(parsed);
      setStep(2);
    } catch (err) {
      console.error(err);
      setError('Failed to parse resume. Please try again or use a different file.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  const handleMatch = async () => {
    if (!resumeText || !jobDescription) return;

    setIsMatching(true);
    setError(null);

    try {
      const result = await matchResumeToJob(resumeText, jobDescription);
      setMatchResult(result);
      setStep(3);
    } catch (err) {
      console.error(err);
      setError('Failed to analyze match. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResumeText('');
    setJobDescription('');
    setResumeData(null);
    setMatchResult(null);
    setStep(1);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">ResuMatch AI</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step >= 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
              )}>1</div>
              <span className={cn("text-sm font-medium", step >= 1 ? "text-indigo-600" : "text-gray-500")}>Upload</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step >= 2 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
              )}>2</div>
              <span className={cn("text-sm font-medium", step >= 2 ? "text-indigo-600" : "text-gray-500")}>Job Info</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                step >= 3 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
              )}>3</div>
              <span className={cn("text-sm font-medium", step >= 3 ? "text-indigo-600" : "text-gray-500")}>Analysis</span>
            </div>
          </nav>

          <button 
            onClick={reset}
            className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Optimize your resume for <span className="text-indigo-600">success.</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload your resume and let our AI analyze your skills, experience, and potential to match you with your dream job.
                </p>
              </div>

              <div 
                {...getRootProps()} 
                className={cn(
                  "relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-300 p-12 text-center",
                  isDragActive ? "border-indigo-600 bg-indigo-50/50" : "border-gray-300 hover:border-indigo-400 bg-white shadow-sm"
                )}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    {isParsing ? (
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-indigo-600" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xl font-semibold text-gray-900">
                      {isParsing ? "Parsing your resume..." : "Drop your resume here"}
                    </p>
                    <p className="text-gray-500">Support PDF, TXT, or DOCX (Max 10MB)</p>
                  </div>
                  {!isParsing && (
                    <button className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-colors">
                      Select File
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{resumeData?.name || 'Candidate'}</h3>
                      <p className="text-xs text-gray-500">Resume Parsed Successfully</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Skills</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resumeData?.skills.slice(0, 8).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                            {skill}
                          </span>
                        ))}
                        {(resumeData?.skills.length || 0) > 8 && (
                          <span className="text-xs text-gray-400 font-medium">+{resumeData!.skills.length - 8} more</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Latest Role</label>
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {resumeData?.experience[0]?.role} at {resumeData?.experience[0]?.company}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg shadow-indigo-200">
                  <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">Ready for matching?</h3>
                  <p className="text-indigo-100 text-sm mb-6">
                    Paste the job description you're interested in, and we'll tell you how well you fit.
                  </p>
                  <button 
                    onClick={handleMatch}
                    disabled={!jobDescription || isMatching}
                    className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isMatching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Analyze Match
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-700">Job Description</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paste Below</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here (responsibilities, requirements, etc.)..."
                    className="w-full h-[400px] p-6 focus:outline-none resize-none text-gray-700 leading-relaxed placeholder:text-gray-300"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && matchResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* Candidate Profile Section */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{resumeData?.name}</h2>
                      <div className="flex flex-wrap gap-4 mt-1">
                        {resumeData?.email && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Mail className="w-4 h-4" />
                            {resumeData.email}
                          </div>
                        )}
                        {resumeData?.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <Phone className="w-4 h-4" />
                            {resumeData.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {resumeData?.education && resumeData.education.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-start gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <GraduationCap className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Latest Education</p>
                        <p className="text-sm font-bold text-gray-900">{resumeData.education[0].degree}</p>
                        <p className="text-xs text-gray-500">{resumeData.education[0].institution} • {resumeData.education[0].year}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Score Card */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-3xl font-extrabold text-gray-900">Analysis Complete</h2>
                  <p className="text-gray-500">Here's how your profile stacks up against the role.</p>
                </div>
                
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-100"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="58"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={364.4}
                        initial={{ strokeDashoffset: 364.4 }}
                        animate={{ strokeDashoffset: 364.4 - (364.4 * matchResult.score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={cn(
                          matchResult.score >= 80 ? "text-emerald-500" : 
                          matchResult.score >= 60 ? "text-amber-500" : "text-rose-500"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-gray-900">{matchResult.score}%</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Match</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{matchResult.matchingSkills.length} Matching Skills</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{matchResult.missingSkills.length} Missing Skills</span>
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <Code2 className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">Skill Gap Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Matching Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.matchingSkills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-md font-medium border border-emerald-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {matchResult.missingSkills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 text-xs rounded-md font-medium border border-rose-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">Strengths & Weaknesses</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Strengths</p>
                        <ul className="space-y-2">
                          {matchResult.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Weaknesses</p>
                        <ul className="space-y-2">
                          {matchResult.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <Search className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-gray-900">Improvement Suggestions</h3>
                    </div>
                    <div className="prose prose-sm prose-indigo max-w-none text-gray-700 leading-relaxed">
                      <Markdown>{matchResult.improvementSuggestions}</Markdown>
                    </div>
                  </section>
                </div>
              </div>

              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => setStep(2)}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Another Job
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-gray-200 mt-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center">
              <FileText className="text-white w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm tracking-tight text-gray-600">ResuMatch AI</span>
          </div>
          <p className="text-sm text-gray-400">© 2026 ResuMatch AI. Powered by Eswar.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
