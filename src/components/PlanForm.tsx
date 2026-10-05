import React, { useState } from 'react';
import { Sparkles, Activity, Target, Flame, ArrowRight, UserCheck, RefreshCw, Zap } from 'lucide-react';
import { UserFormData, IntensityLevel } from '../types.ts';

interface PlanFormProps {
  onSubmit: (data: UserFormData) => Promise<void>;
  isLoading: boolean;
  onViewCurrentPlan?: () => void;
  hasCurrentPlan?: boolean;
}

const GOAL_SUGGESTIONS = [
  'Weight Loss & Belly Fat Reduction',
  'Muscle Gain & Hypertrophy',
  'General Fitness & Wellness',
  'Flexibility, Mobility & Posture',
  'Athletic Conditioning & Endurance',
  'Strength & Power Lifting',
];

const PRESET_PROFILES: { label: string; data: UserFormData }[] = [
  {
    label: '🏋️ Muscle Gain (High)',
    data: {
      username: 'Shreya Sharma',
      user_id: 'USR-101',
      age: 22,
      weight: 55,
      goal: 'Muscle gain, lean mass & progressive overload',
      intensity: 'High',
    },
  },
  {
    label: '🔥 Fat Loss (High)',
    data: {
      username: 'Marcus Chen',
      user_id: 'USR-102',
      age: 28,
      weight: 82.5,
      goal: 'Lose belly fat and tone muscles',
      intensity: 'High',
    },
  },
  {
    label: '⚡ General Wellness (Med)',
    data: {
      username: 'Priya Patel',
      user_id: 'USR-103',
      age: 34,
      weight: 64,
      goal: 'General fitness, stamina and posture',
      intensity: 'Medium',
    },
  },
  {
    label: '🧘 Mobility & Yoga (Low)',
    data: {
      username: 'David Miller',
      user_id: 'USR-104',
      age: 45,
      weight: 78,
      goal: 'Joint mobility, core strength and flexibility',
      intensity: 'Low',
    },
  },
];

export const PlanForm: React.FC<PlanFormProps> = ({
  onSubmit,
  isLoading,
  onViewCurrentPlan,
  hasCurrentPlan,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    user_id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    age: '',
    weight: '',
    goal: '',
    intensity: 'Medium',
  });

  const [formError, setFormError] = useState<string | null>(null);

  const generateNewUserId = () => {
    setFormData((prev) => ({
      ...prev,
      user_id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    }));
  };

  const handleApplyPreset = (preset: UserFormData) => {
    setFormData({ ...preset });
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setFormError('Please enter your Name');
      return;
    }
    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 120) {
      setFormError('Please enter a valid age between 10 and 120');
      return;
    }
    if (!formData.weight || Number(formData.weight) <= 0 || Number(formData.weight) > 350) {
      setFormError('Please enter a valid weight in kg');
      return;
    }
    if (!formData.goal.trim()) {
      setFormError('Please select or specify a fitness goal');
      return;
    }

    setFormError(null);
    await onSubmit(formData);
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Background Graphic Accent */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3 tracking-wide">
          <Zap className="h-3.5 w-3.5" />
          SmartBridge AI Workout Engine • Gemini Models
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          FitBuddy – <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">AI Workout Generator</span>
        </h1>
        <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Input your details and fitness objective. Our Gemini AI creates a personalized 
          7-day workout routine with warm-ups, progressive exercises, cooldowns, and actionable nutrition tips.
        </p>
      </div>

      {/* Preset Profiles Bar */}
      <div className="mb-6 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-amber-400" />
            Quick Demo Presets:
          </span>
          <span className="text-[11px] text-slate-500">1-click fill test cases</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_PROFILES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.data)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/60 hover:border-amber-500/50 transition-all text-left truncate flex items-center justify-between"
            >
              <span className="truncate">{preset.label}</span>
            </button>
          ))}
        </div>

        {onViewCurrentPlan && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Already have plans stored in SQLite?
            </span>
            <button
              type="button"
              onClick={onViewCurrentPlan}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all"
            >
              <span>👀 View Current Workout Plan</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Input Form Card */}
      <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium">
              ⚠️ {formError}
            </div>
          )}

          {/* Row 1: Name & User ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. Shreya Sharma"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-200">
                  User ID <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateNewUserId}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                >
                  <RefreshCw className="h-3 w-3" /> Auto-ID
                </button>
              </div>
              <input
                type="text"
                value={formData.user_id}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                placeholder="e.g. 10 or USR-101"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm font-mono transition-all"
                required
              />
            </div>
          </div>

          {/* Row 2: Age & Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Age <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. 24"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-2">
                Weight (kg) <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value === '' ? '' : Number(e.target.value) })}
                placeholder="e.g. 70.0"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all"
                required
              />
            </div>
          </div>

          {/* Row 3: Fitness Goal */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Fitness Goal <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
              placeholder="e.g., weight loss, muscle gain, flexibility, core strength"
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-white placeholder-slate-500 text-sm transition-all mb-2.5"
              required
            />
            {/* Quick goal pill selectors */}
            <div className="flex flex-wrap gap-1.5">
              {GOAL_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: suggestion })}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                    formData.goal === suggestion
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Workout Intensity */}
          <div>
            <label className="block text-sm font-semibold text-slate-200 mb-2">
              Workout Intensity <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['Low', 'Medium', 'High'] as IntensityLevel[]).map((level) => {
                const isSelected = formData.intensity === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, intensity: level })}
                    className={`relative p-3.5 rounded-xl border text-center font-medium transition-all ${
                      isSelected
                        ? level === 'High'
                          ? 'bg-rose-500/15 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                          : level === 'Medium'
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                          : 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5 mb-1">
                      {level === 'High' && <Flame className="h-4 w-4 text-rose-400" />}
                      {level === 'Medium' && <Activity className="h-4 w-4 text-amber-400" />}
                      {level === 'Low' && <Target className="h-4 w-4 text-emerald-400" />}
                      <span className="font-bold text-sm">{level}</span>
                    </div>
                    <span className="text-[11px] opacity-75 block">
                      {level === 'Low' && 'Beginner / Gentle'}
                      {level === 'Medium' && 'Moderate / Standard'}
                      {level === 'High' && 'Intense / Advanced'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-base shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Generating 7-Day Plan with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Generate Plan</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-2">
              Gemini models create structured day-wise plans & actionable nutrition tips instantly.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
