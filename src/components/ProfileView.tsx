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
  ScrollText,
  Package,
  ExternalLink,
  Laptop,
  RefreshCw,
  Trash2,
  Coffee,
  Heart,
  Globe,
  KeyRound,
  ShieldAlert,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENT_VERSION } from '../data/changelog';
import { GITHUB_RELEASES_URL } from '../data/releases';
import { authService } from '../services/authService';

export const ProfileView: React.FC = () => {
  const {
    user,
    overallStats,
    achievements,
    updateProfileName,
    changePassword,
    deleteAccount,
    setDailyGoal,
    dailyGoalProgress,
    exportData,
    resetAllProgress,
    signOut,
    setIsAuthModalOpen,
    setAuthModalMode,
    isOnline,
    syncStatus,
    lastSyncedAt,
    syncNow,
    setIsDownloadModalOpen,
    setIsChangelogModalOpen,
    setIsSupportModalOpen,
    updateUser,
  } = useApp();

  // Name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);

  // Modals & Dialogs
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [googleMsg, setGoogleMsg] = useState('');

  // Handle name save
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) return;
    setIsSavingName(true);
    await updateProfileName(editedName.trim());
    setIsSavingName(false);
    setIsEditingName(false);
  };

  // Handle password change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!oldPassword || !newPassword) {
      setPassError('Please enter both current and new passwords.');
      return;
    }
    if (newPassword.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPassError('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(oldPassword, newPassword);
    setIsChangingPass(false);

    if (!res.success) {
      setPassError(res.error || 'Failed to change password.');
      return;
    }

    setPassSuccess('Password updated successfully!');
    setTimeout(() => {
      setShowChangePassModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassSuccess('');
    }, 1200);
  };

  // Handle Google connect
  const handleConnectGoogle = async () => {
    setGoogleMsg('');
    const cfg = await authService.getGoogleConfig();
    if (!cfg.enabled) {
      setGoogleMsg(
        'Google Sign-In is currently unavailable. (Google OAuth credentials have not been configured on this deployment yet.)'
      );
      setTimeout(() => setGoogleMsg(''), 6000);
      return;
    }
    setGoogleMsg('Google integration is enabled. Initiating connection...');
  };

  // Format last synced text
  const getLastSyncedText = () => {
    if (!lastSyncedAt) return 'Never synced';
    const diff = Date.now() - lastSyncedAt;
    if (diff < 30000) return 'Just now';
    if (diff < 60000) return '1 minute ago';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    return new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'September 2026';

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
      {/* ======================================================== */}
      {/* USER IDENTITY HEADER CARD */}
      {/* ======================================================== */}
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
                      disabled={isSavingName}
                      className="px-2.5 py-1 rounded bg-cyan-500 text-[#080B10] text-xs font-bold cursor-pointer"
                    >
                      {isSavingName ? '...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-1 text-xs text-[#8B95A5] hover:text-[#F5F7FA] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-[#F5F7FA]">
                      {user?.name || 'Guest'}
                    </h1>
                    <button
                      onClick={() => {
                        setEditedName(user?.name || '');
                        setIsEditingName(true);
                      }}
                      className="text-[#8B95A5] hover:text-cyan-400 p-1 cursor-pointer"
                      title="Edit Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <p className="text-xs text-[#8B95A5]">
                {user?.isGuest ? 'Guest Player' : user?.email || `@${user?.username}`}
              </p>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {user?.isGuest ? (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#111720] border border-amber-500/30 text-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>Guest Mode (Local)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#111720] border border-emerald-500/30 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Authenticated Account</span>
                  </span>
                )}

                <span className="text-[11px] text-[#8B95A5]">
                  Member since {formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions (Sign Out / Save Progress) */}
          <div className="self-start sm:self-auto space-y-2 text-right">
            {user?.isGuest ? (
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Save My Progress</span>
              </button>
            ) : (
              <button
                onClick={signOut}
                className="py-2 px-3.5 rounded-xl bg-[#111720] hover:bg-[#18202c] text-[#8B95A5] hover:text-rose-400 border border-[#202833] text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>

        {/* 5-Stat Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-[#202833]">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Tier</span>
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
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Daily Streak</span>
            <span className="text-xl font-bold font-math text-amber-400 flex items-center space-x-1">
              <span>{dailyGoalProgress.dailyStreak}</span>
              <span className="text-xs font-normal text-[#8B95A5]">days</span>
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-[#8B95A5] block">Questions</span>
            <span className="text-xl font-bold font-math text-[#F5F7FA]">
              {user?.questionsSolved || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Google Notification Banner if triggered */}
      {googleMsg && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-300 flex items-center space-x-2 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{googleMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 1: ACCOUNT */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SECTION 1
            </span>
            <h2 className="text-base font-bold text-[#F5F7FA]">Account</h2>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-[#202833]/60">
          {/* Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#8B95A5] block">Display Name</span>
              <span className="text-sm font-bold text-[#F5F7FA] block">{user?.name || 'Guest'}</span>
            </div>
            <button
              onClick={() => {
                setEditedName(user?.name || '');
                setIsEditingName(true);
              }}
              className="py-1.5 px-3 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Email & Verification Status Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#8B95A5] block">Email Address</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-[#F5F7FA]">
                  {user?.isGuest ? 'Not registered (Guest Mode)' : user?.email || 'None'}
                </span>
                {!user?.isGuest && (
                  user?.isEmailVerified ? (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Unverified</span>
                    </span>
                  )
                )}
              </div>
            </div>

            {!user?.isGuest && !user?.isEmailVerified && (
              <button
                onClick={() => {
                  setAuthModalMode('verify_email');
                  setIsAuthModalOpen(true);
                }}
                className="py-1.5 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Verify Email</span>
              </button>
            )}
          </div>

          {/* Google Connection Status Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#8B95A5] block">Google Account</span>
              <div className="flex items-center space-x-2">
                {user?.isGoogleConnected ? (
                  <span className="inline-flex items-center space-x-1 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected with Google</span>
                  </span>
                ) : (
                  <span className="text-xs text-[#8B95A5]">Not connected to Google</span>
                )}
              </div>
            </div>

            {!user?.isGoogleConnected && (
              <button
                onClick={handleConnectGoogle}
                className="py-1.5 px-3 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-medium flex items-center space-x-2 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Connect Google</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: SYNC */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SECTION 2
            </span>
            <h2 className="text-base font-bold text-[#F5F7FA]">Sync</h2>
          </div>

          {/* Sync Status Pill */}
          <div className="flex items-center space-x-2">
            {syncStatus === 'synced' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>🟢 Synced</span>
              </span>
            )}
            {syncStatus === 'syncing' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                <span>🟡 Syncing</span>
              </span>
            )}
            {syncStatus === 'error' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>🔴 Sync Error</span>
              </span>
            )}
            {syncStatus === 'offline' && (
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-500/10 border border-zinc-500/30 text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                <span>⚪ Offline</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs text-[#8B95A5] leading-relaxed">
            CalcRush automatically keeps your competitive rating, unlocked levels, training history, mistake bank, bonus records, achievements, and AI Level Maker levels synchronized across all your devices.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0D1219] border border-[#202833]">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Cloud Synchronization Status</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Last synced: <span className="text-cyan-400 font-medium">{getLastSyncedText()}</span>
              </span>
            </div>

            <button
              onClick={syncNow}
              disabled={syncStatus === 'syncing'}
              className="py-2 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-xs flex items-center space-x-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sync Now</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 3: SECURITY */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SECTION 3
            </span>
            <h2 className="text-base font-bold text-[#F5F7FA]">Security</h2>
          </div>
        </div>

        <div className="space-y-4 divide-y divide-[#202833]/60">
          {/* Change Password */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Account Password</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Update your account password to maintain maximum credential safety.
              </span>
            </div>
            <button
              onClick={() => {
                if (user?.isGuest) {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                } else {
                  setShowChangePassModal(true);
                }
              }}
              className="py-1.5 px-3 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Change Password</span>
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-rose-400 block">Delete Account</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Permanently purge your account, cloud data, ratings, and training records.
              </span>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="py-1.5 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-medium flex items-center space-x-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 4: SUPPORT (BUY ME A COFFEE) */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-amber-500/30 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              SECTION 4
            </span>
            <h2 className="text-base font-bold text-[#F5F7FA]">Support</h2>
          </div>
          <span className="text-xs font-bold text-amber-400">☕ Buy Me a Coffee</span>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0D1219] border border-[#202833] space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shrink-0">
                ☕
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#F5F7FA]">Support CalcRush Development</h3>
                  <span className="text-[10px] text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded">
                    by SENSHIN
                  </span>
                </div>
                <p className="text-xs text-[#8B95A5] leading-relaxed">
                  CalcRush is built to make mathematics practice faster, smarter, and more engaging. If you've found it useful, you can support its development with a small contribution. Every bit helps. 🧮
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#202833]">
              <div className="flex items-center space-x-2 text-[11px] text-[#8B95A5]">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <a
                  href="https://calcrush.ai.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors"
                >
                  calcrush.ai.studio
                </a>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <button
                  onClick={() => setIsSupportModalOpen(true)}
                  className="py-2 px-3 rounded-lg bg-[#111720] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-medium transition-colors cursor-pointer"
                >
                  View Support Popup
                </button>
                <a
                  href="https://buymeacoffee.com/senshin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-[#080B10] font-extrabold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  <Coffee className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>☕ Support on Buy Me a Coffee</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 5: APPLICATION */}
      {/* ======================================================== */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#111720] border border-[#202833] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              SECTION 5
            </span>
            <h2 className="text-base font-bold text-[#F5F7FA]">Application & Releases</h2>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            v{CURRENT_VERSION}
          </span>
        </div>

        <div className="space-y-4 divide-y divide-[#202833]/60">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Sound Effects</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Synthesized auditory feedback for correct and incorrect calculations.
              </span>
            </div>
            <button
              onClick={() => updateUser({ soundEnabled: !user?.soundEnabled })}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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
                Tactile pulses on mobile keypad presses and answer submissions.
              </span>
            </div>
            <button
              onClick={() => updateUser({ hapticsEnabled: !user?.hapticsEnabled })}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
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

          {/* Daily Training Target */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#F5F7FA] block">Daily Training Target</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Target calculations per day to maintain your streak.
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#0D1219] p-1 rounded-xl border border-[#202833] self-start sm:self-auto">
              {[20, 50, 100].map((goal) => (
                <button
                  key={goal}
                  onClick={() => setDailyGoal(goal)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-math font-bold transition-all cursor-pointer ${
                    (user?.dailyGoal || 50) === goal
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-[#8B95A5] hover:text-[#F5F7FA]'
                  }`}
                >
                  {goal}Q
                </button>
              ))}
            </div>
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
              className="py-1.5 px-3 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export</span>
            </button>
          </div>

          {/* Multi-Platform Releases Center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-[#0D1219] border border-[#202833] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-cyan-400">
                  <Package className="w-4 h-4" />
                  <span>Release Packages</span>
                </div>
                <p className="text-[11px] text-[#8B95A5] mt-0.5">
                  Download Android APK, Windows EXE, and Linux AppImage/DEB.
                </p>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-cyan-500 text-[#080B10] font-bold text-xs shrink-0 cursor-pointer"
              >
                Download
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D1219] border border-[#202833] flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                  <ScrollText className="w-4 h-4" />
                  <span>Changelog & Audit</span>
                </div>
                <p className="text-[11px] text-[#8B95A5] mt-0.5">
                  Inspect v1.5.0 updates, security audit, and feature history.
                </p>
              </div>
              <button
                onClick={() => setIsChangelogModalOpen(true)}
                className="py-1.5 px-3 rounded-lg bg-[#111720] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] font-semibold text-xs shrink-0 cursor-pointer"
              >
                Notes
              </button>
            </div>
          </div>

          {/* Reset Local Progress */}
          <div className="flex items-center justify-between pt-4">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-rose-400 block">Reset Local Progress</span>
              <span className="text-[11px] text-[#8B95A5] block">
                Purge local offline session caches and statistics.
              </span>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="py-1.5 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              Reset Local
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ACHIEVEMENTS GRID */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">Achievements & Milestones</h2>
            <p className="text-xs text-[#8B95A5]">Career achievements across speed, accuracy, streaks, and mastery.</p>
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

                  {isUnlocked && ach.unlockedAt && (
                    <span className="text-[10px] text-emerald-400/80 font-math pt-1 block">
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  )}

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

      {/* ======================================================== */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ======================================================== */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#111720] border border-[#202833] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base font-bold text-[#F5F7FA]">Change Password</h3>
              </div>
              <button
                onClick={() => setShowChangePassModal(false)}
                className="text-[#8B95A5] hover:text-[#F5F7FA] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                {passError}
              </div>
            )}
            {passSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300">
                {passSuccess}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full py-2 px-3 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  className="w-full py-2 px-3 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full py-2 px-3 rounded-lg bg-[#0D1219] border border-[#202833] text-xs text-[#F5F7FA] focus:border-cyan-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isChangingPass ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#111720] border border-rose-500/40 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">Permanently Delete Account?</h3>
              <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">
                This action is irreversible. All your ratings, cloud synchronizations, sessions, achievements, and account credentials will be permanently erased from both our servers and your local device.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteAccount();
                  setIsDeleting(false);
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* RESET LOCAL PROGRESS CONFIRMATION */}
      {/* ======================================================== */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#111720] border border-rose-500/40 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#F5F7FA]">Reset Local Progress?</h3>
              <p className="text-xs text-[#8B95A5] mt-1 leading-relaxed">
                This will reset local offline session history, mistakes, and cached statistics.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl bg-[#0D1219] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllProgress();
                  setShowResetConfirm(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 cursor-pointer"
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
