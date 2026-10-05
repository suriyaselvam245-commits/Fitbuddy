import React from 'react';
import { Dumbbell, Users, Sparkles, MessageSquare, Database, BookOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'create' | 'result' | 'feedback' | 'admin';
  setActiveTab: (tab: 'create' | 'result' | 'feedback' | 'admin') => void;
  hasActivePlan: boolean;
  onOpenArchitectureModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  hasActivePlan,
  onOpenArchitectureModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('create')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Dumbbell className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-amber-400 transition-colors">
                FitBuddy
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Gemini AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              AI Workout & Nutrition Generator
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'create'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden md:inline">Generate Plan</span>
            <span className="md:hidden">New</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('result')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'result'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="View Generated Workout Plan"
          >
            <Dumbbell className="h-4 w-4" />
            <span className="hidden md:inline">Current Plan</span>
            <span className="md:hidden">Plan</span>
            {hasActivePlan && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'feedback'
                ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Refine Plan with Feedback"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Feedback & Refine</span>
            <span className="md:hidden">Feedback</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-sky-500 text-slate-950 font-semibold shadow-md shadow-sky-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Admin View</span>
            <span className="md:hidden">Admin</span>
          </button>
        </nav>

        {/* Right Status & Help */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenArchitectureModal}
            className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/80 rounded-lg transition-colors"
            title="View Technical Architecture & Workflow"
          >
            <BookOpen className="h-4 w-4" />
          </button>

          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-400">DB:</span>
            <span className="font-mono text-emerald-400 font-semibold">SQLite</span>
          </div>
        </div>
      </div>
    </header>
  );
};
