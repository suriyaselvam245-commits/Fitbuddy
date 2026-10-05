import React, { useState, useMemo } from 'react';
import {
  Dumbbell,
  Lightbulb,
  MessageSquare,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  Calendar,
  User,
  Activity,
  Flame,
  Volume2,
  VolumeX,
  Code,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { GeneratedPlanResponse } from '../types.ts';
import { parseWorkoutPlanText } from '../utils/planParser.ts';

interface PlanResultProps {
  planData: GeneratedPlanResponse;
  updatedPlanText: string | null;
  feedbackText: string | null;
  onSubmitFeedback: (userId: string, feedback: string) => Promise<void>;
  isUpdatingFeedback: boolean;
  onStartNewPlan: () => void;
}

export const PlanResult: React.FC<PlanResultProps> = ({
  planData,
  updatedPlanText,
  feedbackText,
  onSubmitFeedback,
  isUpdatingFeedback,
  onStartNewPlan,
}) => {
  const [feedbackInput, setFeedbackInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activePlanVersion, setActivePlanVersion] = useState<'updated' | 'original'>('updated');
  const [viewMode, setViewMode] = useState<'cards' | 'raw'>('cards');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Active plan text based on whether an updated version exists
  const currentDisplayedPlan = (updatedPlanText && activePlanVersion === 'updated')
    ? updatedPlanText
    : planData.workout_plan;

  // Parsed structured days
  const parsedDays = useMemo(() => {
    return parseWorkoutPlanText(currentDisplayedPlan);
  }, [currentDisplayedPlan]);

  // Handle feedback form submission
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return;
    await onSubmitFeedback(planData.user_id, feedbackInput.trim());
    setActivePlanVersion('updated');
    setFeedbackInput('');
  };

  const handleCopy = () => {
    const textToCopy = `FITBUDDY WORKOUT PLAN - ${planData.username} (${planData.user_id})
Goal: ${planData.goal} | Intensity: ${planData.intensity}

NUTRITION TIP:
${planData.nutrition_tip}

WORKOUT PLAN:
${currentDisplayedPlan}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleExerciseCheck = (key: string) => {
    setCompletedExercises((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAudioRead = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const tip = planData.nutrition_tip;
    const intro = `FitBuddy personalized plan for ${planData.username}. Goal: ${planData.goal}. Nutrition tip: ${tip}. Day 1 workout: ${parsedDays[0]?.title || 'Starting now'}.`;
    const utterance = new SpeechSynthesisUtterance(intro);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" />
            AI-Generated Routine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <span>🏋️ Your Personalized Workout Plan</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={toggleAudioRead}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isSpeaking
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
            }`}
            title="Read summary aloud"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Audio Listen'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all"
            title="Copy plan to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied!' : 'Copy Plan'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-all"
            title="Print or Save as PDF"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          <button
            type="button"
            onClick={onStartNewPlan}
            className="px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 shadow-md shadow-amber-500/20 transition-all"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Create New</span>
          </button>
        </div>
      </div>

      {/* 1. User Information Card (PDF page 20) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl backdrop-blur-md">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-amber-400" />
          User Information
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Name
            </span>
            <span className="font-bold text-white text-base truncate block mt-0.5">
              {planData.username}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              User ID
            </span>
            <span className="font-mono font-bold text-amber-400 text-base truncate block mt-0.5">
              {planData.user_id}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Age
            </span>
            <span className="font-bold text-white text-base block mt-0.5">
              {planData.age} <span className="text-xs text-slate-400 font-normal">yrs</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Weight
            </span>
            <span className="font-bold text-white text-base block mt-0.5">
              {planData.weight} <span className="text-xs text-slate-400 font-normal">kg</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-1 lg:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Intensity
            </span>
            <span className={`inline-flex items-center gap-1 font-bold text-sm mt-1 px-2 py-0.5 rounded-md ${
              planData.intensity === 'High'
                ? 'bg-rose-500/20 text-rose-300'
                : planData.intensity === 'Medium'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              <Flame className="h-3 w-3" />
              {planData.intensity}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 col-span-2 sm:col-span-2 lg:col-span-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Fitness Goal
            </span>
            <span className="font-medium text-amber-300 text-xs truncate block mt-1" title={planData.goal}>
              {planData.goal}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Nutrition Tip Section (PDF page 22) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Lightbulb className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h2 className="text-lg font-black text-amber-300">
                💡 Nutrition & Recovery Tip
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Gemini Flash
              </span>
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              {planData.nutrition_tip}
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Confirmation Notification if updated (PDF page 23) */}
      {updatedPlanText && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between gap-3 shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm sm:text-base">
                Your plan has been updated based on your feedback!
              </span>
              {feedbackText && (
                <p className="text-xs text-emerald-200/80 mt-0.5">
                  Feedback applied: "{feedbackText}"
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActivePlanVersion('updated')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePlanVersion === 'updated'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-emerald-950 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              Updated Plan
            </button>
            <button
              type="button"
              onClick={() => setActivePlanVersion('original')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                activePlanVersion === 'original'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              Original Plan
            </button>
          </div>
        </div>
      )}

      {/* 3. Workout Plan Header & Controls */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-amber-400" />
              <h2 className="text-xl font-black text-white">
                Workout Plan
              </h2>
              {updatedPlanText && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                  activePlanVersion === 'updated'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {activePlanVersion === 'updated' ? 'Active Updated Version' : 'Original Baseline'}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curated 7-day progression tailored to your {planData.intensity.toLowerCase()} intensity routine.
            </p>
          </div>

          {/* View mode toggle (Cards vs PDF <pre> block) */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'cards'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Interactive Day-by-Day Cards"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Interactive</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('raw')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  viewMode === 'raw'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Render formatted <pre> text (as shown in documentation)"
              >
                <Code className="h-3.5 w-3.5" />
                <span>&lt;pre&gt; Text</span>
              </button>
            </div>
          </div>
        </div>

        {/* Day Selector Tabs (for Interactive Mode) */}
        {viewMode === 'cards' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDay === 'all'
                  ? 'bg-slate-200 text-slate-950 shadow-sm'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              All 7 Days ({parsedDays.length})
            </button>
            {parsedDays.map((d) => (
              <button
                key={d.dayNumber}
                type="button"
                onClick={() => setSelectedDay(d.dayNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedDay === d.dayNumber
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Calendar className="h-3 w-3" />
                Day {d.dayNumber}
              </button>
            ))}
          </div>
        )}

        {/* Interactive Cards View */}
        {viewMode === 'cards' ? (
          <div className="space-y-5">
            {parsedDays
              .filter((day) => selectedDay === 'all' || day.dayNumber === selectedDay)
              .map((day) => (
                <div
                  key={day.dayNumber}
                  className="rounded-2xl bg-slate-950/70 border border-slate-800/90 overflow-hidden shadow-md hover:border-slate-700 transition-all"
                >
                  {/* Day Header */}
                  <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-sm">
                        {day.dayNumber}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">
                          Day {day.dayNumber}: {day.title}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          {day.exercises.length} exercises planned
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Warm-up */}
                    {day.warmup.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                          🔥 Warm-up (5–10 mins)
                        </span>
                        <ul className="text-xs sm:text-sm text-slate-300 space-y-1">
                          {day.warmup.map((w, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-amber-400">•</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Main Workout Exercises */}
                    <div>
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                        <Dumbbell className="h-3.5 w-3.5 text-amber-400" />
                        Main Workout Exercises
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {day.exercises.map((ex, exIdx) => {
                          const exKey = `day-${day.dayNumber}-ex-${exIdx}`;
                          const isDone = !!completedExercises[exKey];

                          return (
                            <div
                              key={exIdx}
                              onClick={() => toggleExerciseCheck(exKey)}
                              className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3 ${
                                isDone
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-400 line-through'
                                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                              }`}
                            >
                              <div className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                  : 'border-slate-600 bg-slate-950'
                              }`}>
                                {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`font-semibold text-sm block truncate ${isDone ? 'text-slate-400' : 'text-white'}`}>
                                  {ex.name}
                                </span>
                                <span className="text-xs text-amber-300/90 block font-mono mt-0.5">
                                  {ex.setsReps}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cooldown */}
                    {day.cooldown.length > 0 && (
                      <div className="p-3 rounded-xl bg-sky-500/5 border border-sky-500/20">
                        <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                          🧊 Cooldown / Recovery (5 mins)
                        </span>
                        <ul className="text-xs sm:text-sm text-slate-300 space-y-1">
                          {day.cooldown.map((c, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-sky-400">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Raw <pre> view block (exact requirement from PDF pages 8, 14, 21) */
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-mono text-slate-400">
                // Rendered raw Markdown &lt;pre&gt; output
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {currentDisplayedPlan.length} characters
              </span>
            </div>
            <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
              {currentDisplayedPlan}
            </pre>
          </div>
        )}
      </div>

      {/* 4. Feedback Section (PDF page 23) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-5 w-5 text-amber-400" />
          <h2 className="text-xl font-black text-white">
            Share Your Feedback
          </h2>
        </div>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Need adjustments to your plan? Submit suggestions like <span className="text-amber-400 font-medium">"more focus on cardio"</span>, <span className="text-amber-400 font-medium">"include more rest days"</span>, or <span className="text-amber-400 font-medium">"add yoga and joint stretches"</span>. Gemini will intelligently regenerate an updated workout plan preserving your profile.
        </p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Unique User ID:
            </label>
            <input
              type="text"
              value={planData.user_id}
              disabled
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Feedback:
            </label>
            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="Let us know how we can improve your plan... (e.g. 'Add yoga on day 3 and substitute heavy squats with lunges')"
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all"
              required
            />
          </div>

          {/* Quick feedback suggestions */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              'Add yoga and flexibility work',
              'Include more cardio intervals',
              'Need more rest days between leg workouts',
              'I have shoulder discomfort, avoid overhead presses',
              'Shorten workouts to 30 minutes',
            ].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setFeedbackInput(quick)}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all"
              >
                + {quick}
              </button>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingFeedback || !feedbackInput.trim()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingFeedback ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  <span>Updating Plan with Gemini AI...</span>
                </>
              ) : (
                <>
                  <span>Submit Feedback</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
