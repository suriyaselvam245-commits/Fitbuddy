import React from 'react';
import { X, Cpu, Database, Layout, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                FitBuddy Technical Architecture
              </h2>
              <p className="text-xs text-slate-400">
                SmartBridge Specification & Gemini Model Pipeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Architecture flow cards */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Data & Logic Pipeline
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                  <Layout className="h-3.5 w-3.5 text-amber-400" /> 1. Client Layer
                </span>
                <p className="text-xs text-slate-400">
                  Form input (index.html), 7-day schedule & feedback UI (result.html), Admin table (all_users.html).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-sky-400" /> 2. Gemini AI Engine
                </span>
                <p className="text-xs text-slate-400">
                  Workout plan & feedback updates generation + fast targeted nutrition advice via Google Gemini models.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="flex items-center gap-1.5 font-bold text-white text-xs mb-1">
                  <Database className="h-3.5 w-3.5 text-emerald-400" /> 3. Persistent Storage
                </span>
                <p className="text-xs text-slate-400">
                  SQLite database (<code className="text-emerald-300">fitbuddy.db</code>) with users & plans tables preserving original and updated revisions.
                </p>
              </div>
            </div>
          </div>

          {/* Scenarios Implemented */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Documented Scenarios
            </h3>
            
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block">Scenario 1: Personalized 7-Day Plan</span>
                  <span className="text-xs text-slate-400">
                    Captures name, age, weight, goal, and intensity (low, medium, high) to generate structured warm-ups, exercises, and cooldowns.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block">Scenario 2: Feedback-Based Plan Revision</span>
                  <span className="text-xs text-slate-400">
                    User inputs suggestions ("more focus on cardio", "include rest days"); AI updates the plan and saves the revision alongside original baseline.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block">Scenario 3: Tailored Nutrition & Recovery Advice</span>
                  <span className="text-xs text-slate-400">
                    Generates concise, goal-aligned dietary guidance (protein timing, hydration, calorie management) complementing the workout.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white text-xs block">Scenario 4: Coach & Admin Overview (/view-all-users)</span>
                  <span className="text-xs text-slate-400">
                    Lists all registered profiles, original plans, and updated versions in a structured data table with deletion and inspection.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
