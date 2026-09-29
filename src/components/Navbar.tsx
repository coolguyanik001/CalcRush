import React from 'react';
import {
  Flame,
  Home,
  Swords,
  FlaskConical,
  BarChart3,
  User,
  Volume2,
  VolumeX,
  Smartphone,
  CloudCheck,
  CloudOff,
  Sparkles,
  Bot,
  Download,
  ScrollText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENT_VERSION } from '../data/changelog';

export const Navbar: React.FC = () => {
  const {
    user,
    activeView,
    setActiveView,
    activeSession,
    isOnline,
    updateUser,
    setIsAuthModalOpen,
    setAuthModalMode,
    setIsDownloadModalOpen,
    setIsChangelogModalOpen,
  } = useApp();

  if (activeSession) {
    // Hide standard navigation during active calculation workspace to maximize focus
    return null;
  }

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'competitive', label: 'Compete', icon: Swords },
    { id: 'practice', label: 'Practice', icon: FlaskConical },
    { id: 'statistics', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[#202833] bg-[#080B10]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
            <div
            onClick={() => setActiveView('home')}
            className="flex cursor-pointer items-center space-x-3 group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#111720] border border-cyan-500/30 text-cyan-400 font-bold text-xl transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              ∑
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-base text-[#F5F7FA]">
                  CALC<span className="text-cyan-400">RUSH</span>
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsChangelogModalOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#111720] text-cyan-400 border border-[#202833] hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
                  title={`View Changelog (v${CURRENT_VERSION})`}
                >
                  v{CURRENT_VERSION}
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-[#8B95A5] -mt-0.5">
                Train Calculation
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#111720] text-cyan-400 border border-[#202833]'
                      : 'text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#0D1219]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-[#8B95A5]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* AI Maker Nav item */}
            <button
              onClick={() => setActiveView('ai-maker')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                activeView === 'ai-maker'
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                  : 'border-[#202833]/60 text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#0D1219]'
              }`}
              title="AI Custom Level Maker"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI Maker</span>
            </button>
          </nav>

          {/* Quick Metrics & User Status */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                {/* Rating Pill */}
                <div
                  onClick={() => setActiveView('competitive')}
                  className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#111720] border border-[#202833] cursor-pointer hover:border-cyan-500/40 transition-colors"
                  title="Competitive Rating"
                >
                  <span className="text-xs text-[#8B95A5]">⚡</span>
                  <span className="text-xs font-semibold text-cyan-400 font-math">
                    {user.competitiveRating}
                  </span>
                </div>

                {/* Streak Pill */}
                {user.currentStreak > 0 && (
                  <div
                    className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#111720] border border-amber-500/20"
                    title="Current Streak"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-400 font-math">
                      {user.currentStreak}
                    </span>
                  </div>
                )}

                {/* Sound Quick Toggle */}
                <button
                  onClick={() => updateUser({ soundEnabled: !user.soundEnabled })}
                  className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
                  title={user.soundEnabled ? 'Mute sound' : 'Enable sound'}
                  aria-label="Toggle sound"
                >
                  {user.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-zinc-600" />
                  )}
                </button>

                {/* Guest / Synced Badge */}
                {user.isGuest ? (
                  <button
                    onClick={() => {
                      setAuthModalMode('signup');
                      setIsAuthModalOpen(true);
                    }}
                    className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#111720] border border-[#202833] text-[#8B95A5] hover:text-cyan-300 hover:border-cyan-500/40 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Guest</span>
                    <span className="text-[10px] text-cyan-400 font-semibold ml-1">Save</span>
                  </button>
                ) : (
                  <div
                    className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#111720] border border-[#202833] text-[#8B95A5]"
                    title="Account Synced"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                    <span>{isOnline ? 'Synced' : 'Offline'}</span>
                  </div>
                )}
              </>
            )}

            {/* Download App Trigger */}
            <button
              onClick={() => setIsDownloadModalOpen(true)}
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#111720] border border-[#202833] text-[#8B95A5] hover:text-cyan-400 hover:border-cyan-500/40 transition-colors"
              title="Download CalcRush Desktop & Mobile App"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>App</span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setActiveView('profile')}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#111720] border border-[#202833] text-[#F5F7FA] hover:border-cyan-400/50 transition-colors"
              aria-label="View Profile"
            >
              <span className="text-xs font-bold text-cyan-400">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#202833] bg-[#080B10]/95 backdrop-blur-md pb-safe">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-[#8B95A5] active:text-[#F5F7FA]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-[#8B95A5]'}`} />
                <span className="text-[10px] font-medium tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
