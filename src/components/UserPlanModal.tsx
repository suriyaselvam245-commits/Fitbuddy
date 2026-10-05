import React, { useState } from 'react';
import { X, Dumbbell, Sparkles, MessageSquare, Copy, Check, Calendar } from 'lucide-react';
import { UserRecord } from '../types.ts';

interface UserPlanModalProps {
  user: UserRecord | null;
  onClose: () => void;
  onLoadAsCurrentPlan: (user: UserRecord) => void;
}

export const UserPlanModal: React.FC<UserPlanModalProps> = ({
  user,
  onClose,
  onLoadAsCurrentPlan,
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'updated'>('original');
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const hasUpdated = user.updated_plan && user.updated_plan !== 'Not updated';
  const displayedContent = activeTab === 'updated' && hasUpdated ? user.updated_plan : user.original_plan;

  const handleCopy = () => {
    if (!displayedContent) return;
    navigator.clipboard.writeText(displayedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-white">
                  {user.name}
                </h3>
                <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {user.user_id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {user.age} yrs • {user.weight} kg • {user.goal} • {user.intensity} Intensity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Copy current plan text"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'original'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              Original Plan
            </button>
            <button
              type="button"
              onClick={() => hasUpdated && setActiveTab('updated')}
              disabled={!hasUpdated}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'updated'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : hasUpdated
                  ? 'text-emerald-400 hover:bg-emerald-950/50'
                  : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Updated Plan</span>
              {!hasUpdated && <span className="text-[10px] opacity-60">(None)</span>}
            </button>
          </div>

          {user.feedback && (
            <div className="text-xs text-slate-400 truncate max-w-xs flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate italic">"{user.feedback}"</span>
            </div>
          )}
        </div>

        {/* Plan Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {user.nutrition_tip && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm">
              <span className="font-bold block mb-1">💡 Goal-Tailored Nutrition Tip:</span>
              <p className="text-slate-200">{user.nutrition_tip}</p>
            </div>
          )}

          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {displayedContent || 'No plan content recorded.'}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => {
              onLoadAsCurrentPlan(user);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-black hover:from-amber-400 hover:to-orange-400 shadow-md transition-all"
          >
            Load in Current Plan View
          </button>
        </div>
      </div>
    </div>
  );
};
