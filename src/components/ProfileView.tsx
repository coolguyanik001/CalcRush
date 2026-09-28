import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  Trophy,
  Flame,
  Target,
  Sparkles,
  Download,
  AlertTriangle,
  Volume2,
  VolumeX,
  Smartphone,
  CheckCircle2,
  LogOut,
  Edit2,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const {
    user,
    overallStats,
    achievements,
    updateUser,
    exportData,
    resetAllProgress,
    signOut,
    setIsAuthModalOpen,
    setAuthModalMode,
    isOnline,
  } = useApp();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim()) {
      updateUser({ name: editedName.trim() });
      setIsEditingName(false);
    }
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'September 2026';

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* User Identity Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0D1219] border border-[#202833] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Avatar & Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-[#111720] border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              {user?.name ? user.name[0].toUpperCase() : '∑'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-2.5 py-1 rounded bg-[#111720] border border-cyan-400 text-sm text-[#F5F7FA] outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 rounded bg-cyan-500 text-[#080B10] text-xs font-bold"
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
                      {user?.name || 'Guest'}
                    </h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-[#8B95A5] hover:text-cyan-400 p-1"
                      title="Edit name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-[#8B95A5]">
                {user?.isGuest ? 'Guest Player' : user?.email || `@${user?.username}`}
              </p>

              {/* Status Badge */}
              <div className="flex items-center space-x-2 pt-1">
                {user?.isGuest ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#111720] border border-amber-500/30 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Local only</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#111720] border border-emerald-500/30 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{isOnline ? 'Cloud Synced' : 'Offline (Local)'}</span>
                  </span>
                )}

                <span className="text-[11px] text-[#8B95A5]">
                  Member since {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Guest Save Progress Button */}
          {user?.isGuest ? (
            <div className="self-start sm:self-auto space-y-2 text-right">
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Save My Progress</span>
              </button>
              <p className="text-[10px] text-[#8B95A5]">
                Back up ratings & stats across devices
              </p>
            </div>
          ) : (
            <button
              onClick={signOut}
              className="py-2 px-3.5 rounded-xl bg-[#111720] hover:bg-[#18202c] text-[#8B95A5] hover:text-rose-400 border border-[#202833] text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        {/* 4-Stat Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#202833]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Level</span>
            <span className="text-xl font-bold font-math text-cyan-400">
              Level {user?.competitiveLevel || 1}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Rating</span>
            <span className="text-xl font-bold font-math text-cyan-400">
              ⚡ {user?.competitiveRating || 1000}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Accuracy</span>
            <span className="text-xl font-bold font-math text-[#F5F7FA]">
              {overallStats.accuracy > 0 ? `${overallStats.accuracy}%` : '100%'}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Questions</span>
            <span className="text-xl font-bold font-math text-amber-400">
              {user?.questionsSolved || 0}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 1: ACHIEVEMENTS SYSTEM */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">Achievements</h2>
            <p className="text-xs text-[#8B95A5]">Milestones in calculation mastery.</p>
          </div>
          <span className="text-xs font-semibold text-cyan-400 font-math">
            {achievements.filter((a) => a.unlockedAt).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => {
            const isUnlocked = !!ach.unlockedAt;
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border flex items-start space-x-3 transition-all ${
                  isUnlocked
                    ? 'bg-[#111720] border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.05)]'
                    : 'bg-[#0D1219]/60 border-[#202833]/60 opacity-60'
                }`}
              >
                <div className="text-2xl shrink-0 p-1">{ach.icon}</div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`text-xs sm:text-sm font-bold ${
                        isUnlocked ? 'text-[#F5F7FA]' : 'text-[#8B95A5]'
                      }`}
                    >
                      {ach.title}
                    </h3>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#8B95A5] leading-snug">
                    {ach.description}
                  </p>

                  {/* Progress bar if not single trigger */}
                  {!isUnlocked && ach.maxProgress > 1 && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-[#8B95A5] font-math">
                        <span>Progress</span>
                        <span>
                          {ach.progress} / {ach.maxProgress}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#0D1219] overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{
                            width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: APPLICATION SETTINGS */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-6">
        <h2 className="text-base font-bold text-[#F5F7FA]">Training & Preferences</h2>

        <div className="space-y-4 divide-y divide-[#202833]/60">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Sound Effects</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Subtle synthesized auditory feedback for correct and incorrect answers.
              </span>
            </div>
            <button
              onClick={() => updateUser({ soundEnabled: !user?.soundEnabled })}
              className={`p-2 rounded-lg border transition-colors ${
                user?.soundEnabled
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-[#0D1219] text-[#8B95A5] border-[#202833]'
              }`}
            >
              {user?.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Haptics Toggle */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Haptic Vibration</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Gentle tactile pulses on mobile keyboards and answers.
              </span>
            </div>
            <button
              onClick={() => updateUser({ hapticsEnabled: !user?.hapticsEnabled })}
              className={`p-2 rounded-lg border transition-colors ${
                user?.hapticsEnabled
                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                  : 'bg-[#0D1219] text-[#8B95A5] border-[#202833]'
              }`}
            >
              <Smartphone
                className={`w-4 h-4 ${user?.hapticsEnabled ? 'text-cyan-400' : 'text-[#8B95A5]'}`}
              />
            </button>
          </div>

          {/* Export Data */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Export Backup</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Download your complete profile, sessions history, and mistake bank as JSON.
              </span>
            </div>
            <button
              onClick={exportData}
              className="py-1.5 px-3 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>

          {/* Reset All Progress */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-rose-400 block">Reset All Progress</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Permanently purge rating, level progress, statistics, and mistake bank.
              </span>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-1.5 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Progress */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#111720] border border-rose-500/40 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">Reset All Progress?</h3>
              <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">
                This will permanently delete:
              </p>
              <ul className="text-xs text-[#8B95A5] mt-2 space-y-1 text-left list-disc list-inside bg-[#0D1219] p-3 rounded-lg border border-[#202833]">
                <li>Competitive rating & Tier status</li>
                <li>All sessions and analytics</li>
                <li>Mistake bank</li>
                <li>Achievements progress</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllProgress();
                  setShowResetConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
