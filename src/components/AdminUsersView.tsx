import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Flame,
  CheckCircle,
  Database,
  PlusCircle,
  ArrowUpDown,
  Eye,
} from 'lucide-react';
import { UserRecord } from '../types.ts';
import { UserPlanModal } from './UserPlanModal.tsx';

interface AdminUsersViewProps {
  users: UserRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onDeleteUser: (userId: string) => Promise<void>;
  onSeedSamples: () => Promise<void>;
  onLoadAsCurrentPlan: (user: UserRecord) => void;
  onNavigateToFeedback: (user: UserRecord) => void;
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  isLoading,
  onRefresh,
  onDeleteUser,
  onSeedSamples,
  onLoadAsCurrentPlan,
  onNavigateToFeedback,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [intensityFilter, setIntensityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserRecord | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.goal.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIntensity =
        intensityFilter === 'All' || u.intensity.toLowerCase() === intensityFilter.toLowerCase();

      return matchesSearch && matchesIntensity;
    });
  }, [users, searchQuery, intensityFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const withUpdates = users.filter((u) => u.updated_plan && u.updated_plan !== 'Not updated').length;
    const avgAge = total > 0 ? Math.round(users.reduce((acc, u) => acc + (u.age || 0), 0) / total) : 0;
    const highIntensity = users.filter((u) => u.intensity?.toLowerCase() === 'high').length;
    return { total, withUpdates, avgAge, highIntensity };
  }, [users]);

  const handleDelete = async (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user ${name} (${userId}) and their workout plan?`)) {
      setDeletingId(userId);
      await onDeleteUser(userId);
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header Banner (PDF page 24: "FitBuddy - All Users & Workout Plans") */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Database className="h-4 w-4" />
            SQLite Storage (/view-all-users)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            FitBuddy - All Users & Workout Plans
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Overview of the user database with original baseline plans and AI-updated feedback iterations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onSeedSamples}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center gap-1.5"
            title="Seed sample data for testing"
          >
            <PlusCircle className="h-4 w-4 text-emerald-400" />
            <span>Seed Samples</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Total Registered Users
          </span>
          <span className="text-2xl font-black text-white block mt-1">
            {stats.total}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Updated via Feedback
          </span>
          <span className="text-2xl font-black text-emerald-400 block mt-1 flex items-center gap-1.5">
            {stats.withUpdates}
            <span className="text-xs text-slate-500 font-normal">
              ({stats.total > 0 ? Math.round((stats.withUpdates / stats.total) * 100) : 0}%)
            </span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            High Intensity Users
          </span>
          <span className="text-2xl font-black text-rose-400 block mt-1 flex items-center gap-1.5">
            {stats.highIntensity}
            <Flame className="h-4 w-4" />
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Average User Age
          </span>
          <span className="text-2xl font-black text-amber-400 block mt-1">
            {stats.avgAge} <span className="text-xs text-slate-500 font-normal">yrs</span>
          </span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, user ID, or fitness goal..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-sm text-white placeholder-slate-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {(['All', 'High', 'Medium', 'Low'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setIntensityFilter(filter)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  intensityFilter === filter
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table (PDF pages 11, 18, 24) */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-sky-600 text-white font-bold uppercase tracking-wider text-[11px] border-b border-sky-700">
                <th className="py-3.5 px-4 whitespace-nowrap">User ID</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Name</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Age</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Weight (kg)</th>
                <th className="py-3.5 px-4 whitespace-nowrap">Goal</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Intensity</th>
                <th className="py-3.5 px-4 min-w-[200px]">Original Plan</th>
                <th className="py-3.5 px-4 min-w-[200px]">Updated Plan</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const hasUpdated = user.updated_plan && user.updated_plan !== 'Not updated';

                  return (
                    <tr
                      key={user.user_id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* User ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {user.user_id}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                        {user.name}
                      </td>

                      {/* Age */}
                      <td className="py-3.5 px-3 text-slate-300">
                        {user.age}
                      </td>

                      {/* Weight */}
                      <td className="py-3.5 px-3 text-slate-300 font-mono">
                        {user.weight}
                      </td>

                      {/* Goal */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate" title={user.goal}>
                        {user.goal}
                      </td>

                      {/* Intensity */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-xs ${
                          user.intensity?.toLowerCase() === 'high'
                            ? 'bg-rose-500/20 text-rose-300'
                            : user.intensity?.toLowerCase() === 'medium'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {user.intensity}
                        </span>
                      </td>

                      {/* Original Plan (PDF: rendered using <pre>{{ user.original_plan }}</pre>) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div 
                          onClick={() => setSelectedUserForModal(user)}
                          className="cursor-pointer group/plan rounded-xl bg-slate-950/80 p-2.5 border border-slate-800/80 hover:border-amber-500/40 transition-all max-h-24 overflow-hidden relative"
                          title="Click to view full plan"
                        >
                          <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap line-clamp-3">
                            {user.original_plan || 'N/A'}
                          </pre>
                          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-center pb-0.5">
                            <span className="text-[9px] font-bold text-amber-400 group-hover/plan:underline flex items-center gap-0.5">
                              <Eye className="h-2.5 w-2.5" /> Full Plan
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Updated Plan (PDF: rendered using <pre>{{ user.updated_plan }}</pre>) */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {hasUpdated ? (
                          <div 
                            onClick={() => setSelectedUserForModal(user)}
                            className="cursor-pointer group/plan rounded-xl bg-emerald-950/20 p-2.5 border border-emerald-500/30 hover:border-emerald-500 transition-all max-h-24 overflow-hidden relative"
                            title="Click to view full updated plan"
                          >
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 mb-1">
                              <Sparkles className="h-2.5 w-2.5" /> Updated via Feedback
                            </div>
                            <pre className="font-mono text-[10px] text-slate-300 whitespace-pre-wrap line-clamp-2">
                              {user.updated_plan}
                            </pre>
                            <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-950 to-transparent flex items-end justify-center pb-0.5">
                              <span className="text-[9px] font-bold text-emerald-400 group-hover/plan:underline flex items-center gap-0.5">
                                <Eye className="h-2.5 w-2.5" /> View Updated
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-block text-xs font-mono text-slate-500 px-2 py-1 rounded bg-slate-950/60 border border-slate-800">
                            Not updated
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onLoadAsCurrentPlan(user)}
                            className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 transition-all"
                            title="Open in Current Plan View"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onNavigateToFeedback(user)}
                            className="p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 transition-all"
                            title="Submit new feedback for this user"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            disabled={deletingId === user.user_id}
                            onClick={() => handleDelete(user.user_id, user.name)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-all disabled:opacity-50"
                            title="Delete User and Plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Plan Details Modal */}
      {selectedUserForModal && (
        <UserPlanModal
          user={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onLoadAsCurrentPlan={onLoadAsCurrentPlan}
        />
      )}
    </div>
  );
};
