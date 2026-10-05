import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar.tsx';
import { PlanForm } from './components/PlanForm.tsx';
import { PlanResult } from './components/PlanResult.tsx';
import { AdminUsersView } from './components/AdminUsersView.tsx';
import { ArchitectureModal } from './components/ArchitectureModal.tsx';
import {
  UserFormData,
  GeneratedPlanResponse,
  UpdatedPlanResponse,
  UserRecord,
} from './types.ts';
import { AlertCircle, CheckCircle, Database } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'result' | 'feedback' | 'admin'>('create');
  const [currentPlan, setCurrentPlan] = useState<GeneratedPlanResponse | null>(null);
  const [updatedPlanText, setUpdatedPlanText] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingFeedback, setIsUpdatingFeedback] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setBannerNotice({ type, message });
    setTimeout(() => {
      setBannerNotice(null);
    }, 4000);
  };

  // Fetch all users from SQLite
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        setUsersList(users);

        // Preload first user into currentPlan if currentPlan is null so the view is immediately visible
        if (users.length > 0) {
          setCurrentPlan((prev) => {
            if (prev) return prev;
            const first = users[0];
            return {
              message: 'Sample Plan Loaded from SQLite',
              user_id: first.user_id,
              username: first.name,
              age: first.age,
              weight: first.weight,
              goal: first.goal,
              intensity: first.intensity,
              workout_plan: first.original_plan || '',
              nutrition_tip: first.nutrition_tip || 'Prioritize adequate daily protein, whole foods, and hydration.',
            };
          });

          // Preload updated plan if exists
          const first = users[0];
          if (first.updated_plan && first.updated_plan !== 'Not updated') {
            setUpdatedPlanText((prev) => prev || first.updated_plan || null);
            setLastFeedback((prev) => prev || first.feedback || null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Check initial URL pathname or hash/query
    const path = window.location.pathname;
    const search = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (path.includes('view-all-users') || search.get('tab') === 'admin' || hash === '#admin') {
      setActiveTab('admin');
    } else if (search.get('tab') === 'result' || hash === '#result') {
      setActiveTab('result');
    }

    fetchUsers();
  }, []);

  // Handle plan generation form submission
  const handleGeneratePlan = async (formData: UserFormData) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          user_id: formData.user_id,
          age: formData.age,
          weight: formData.weight,
          goal: formData.goal,
          intensity: formData.intensity,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate workout plan');
      }

      const result: GeneratedPlanResponse = await response.json();
      setCurrentPlan(result);
      setUpdatedPlanText(null);
      setLastFeedback(null);
      setActiveTab('result');

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      showNotice('success', 'Personalized 7-day workout plan generated and saved to SQLite!');
      // Refresh user database in background
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showNotice('error', err.message || 'Error communicating with Gemini AI server');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle user feedback submission
  const handleSubmitFeedback = async (userId: string, feedback: string) => {
    setIsUpdatingFeedback(true);
    try {
      const response = await fetch('/api/update-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          feedback,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update plan based on feedback');
      }

      const result: UpdatedPlanResponse = await response.json();
      setUpdatedPlanText(result.updated_plan);
      setLastFeedback(feedback);
      setActiveTab('result');

      showNotice('success', 'Plan revised based on your feedback!');
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      showNotice('error', err.message || 'Error updating workout plan');
    } finally {
      setIsUpdatingFeedback(false);
    }
  };

  // Handle user deletion in Admin view
  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotice('success', `User ${userId} deleted successfully.`);
        if (currentPlan && currentPlan.user_id === userId) {
          setCurrentPlan(null);
          setUpdatedPlanText(null);
        }
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Failed to delete user.');
    }
  };

  // Seed sample database records
  const handleSeedSamples = async () => {
    try {
      const res = await fetch('/api/seed-samples', { method: 'POST' });
      if (res.ok) {
        showNotice('success', 'Sample users seeded into SQLite.');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
      showNotice('error', 'Failed to seed sample records.');
    }
  };

  // Load user from admin table into active plan view
  const handleLoadAsCurrentPlan = (user: UserRecord) => {
    if (!user.original_plan || user.original_plan === 'N/A') {
      showNotice('error', 'This user has no saved workout plan.');
      return;
    }

    setCurrentPlan({
      message: 'Loaded from SQLite database',
      user_id: user.user_id,
      username: user.name,
      age: user.age,
      weight: user.weight,
      goal: user.goal,
      intensity: user.intensity,
      workout_plan: user.original_plan,
      nutrition_tip: user.nutrition_tip || 'Focus on balanced macros, adequate hydration, and consistent rest.',
    });

    if (user.updated_plan && user.updated_plan !== 'Not updated') {
      setUpdatedPlanText(user.updated_plan);
      setLastFeedback(user.feedback || null);
    } else {
      setUpdatedPlanText(null);
      setLastFeedback(null);
    }

    setActiveTab('result');
    showNotice('success', `Loaded ${user.name}'s plan into view.`);
  };

  const handleNavigateToFeedback = (user: UserRecord) => {
    handleLoadAsCurrentPlan(user);
    setActiveTab('feedback');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative selection:bg-amber-500 selection:text-black">
      {/* Background Decorative Mesh & Gym Aesthetic */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasActivePlan={!!currentPlan}
        onOpenArchitectureModal={() => setIsArchModalOpen(true)}
      />

      {/* Floating Notice Toast */}
      {bannerNotice && (
        <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium backdrop-blur-xl ${
              bannerNotice.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {bannerNotice.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{bannerNotice.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {activeTab === 'create' && (
          <PlanForm
            onSubmit={handleGeneratePlan}
            isLoading={isGenerating}
            onViewCurrentPlan={() => setActiveTab('result')}
            hasCurrentPlan={!!currentPlan}
          />
        )}

        {(activeTab === 'result' || activeTab === 'feedback') && (
          currentPlan ? (
            <PlanResult
              planData={currentPlan}
              updatedPlanText={updatedPlanText}
              feedbackText={lastFeedback}
              onSubmitFeedback={handleSubmitFeedback}
              isUpdatingFeedback={isUpdatingFeedback}
              onStartNewPlan={() => setActiveTab('create')}
            />
          ) : (
            <div className="max-w-xl mx-auto text-center py-16 px-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Database className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-black text-white mb-2">No Active Workout Plan Loaded</h2>
              <p className="text-slate-400 text-sm mb-6">
                You can generate a brand new customized routine, or instantly load one of the saved profiles from SQLite.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (usersList.length > 0) {
                      handleLoadAsCurrentPlan(usersList[0]);
                    } else {
                      handleSeedSamples();
                    }
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all"
                >
                  Load Demo Plan (Shreya - Muscle Gain)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
                >
                  Create Custom Plan
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'admin' && (
          <AdminUsersView
            users={usersList}
            isLoading={isLoadingUsers}
            onRefresh={fetchUsers}
            onDeleteUser={handleDeleteUser}
            onSeedSamples={handleSeedSamples}
            onLoadAsCurrentPlan={handleLoadAsCurrentPlan}
            onNavigateToFeedback={handleNavigateToFeedback}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">FitBuddy</span>
            <span>•</span>
            <span>AI Fitness Plan Generator</span>
            <span>•</span>
            <span className="text-amber-500 font-semibold">Gemini AI Models</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsArchModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Architecture & Scenarios
            </button>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400 flex items-center gap-1 font-mono">
              <Database className="h-3 w-3 text-emerald-400" />
              SQLite Persistent
            </span>
          </div>
        </div>
      </footer>

      {/* Architecture & Scenario Documentation Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
