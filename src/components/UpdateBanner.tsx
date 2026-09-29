import React from 'react';
import { Sparkles, Download, Bell, X, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CURRENT_VERSION } from '../data/changelog';

export const UpdateBanner: React.FC = () => {
  const {
    isUpdateBannerVisible,
    dismissUpdateBanner,
    setIsChangelogModalOpen,
    setIsDownloadModalOpen,
  } = useApp();

  if (!isUpdateBannerVisible) return null;

  return (
    <div className="relative border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-[#0D1219] to-cyan-950/30 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Banner Announcement Text */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/20 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-bold text-[#F5F7FA]">
              CalcRush <span className="text-cyan-400 font-mono">v{CURRENT_VERSION}</span> is here!
            </span>
            <span className="text-[#8B95A5] hidden md:inline">
              Standalone Desktop (Windows, Linux) and Android applications are now available.
            </span>
          </div>
        </div>

        {/* Banner Interactive Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={() => setIsChangelogModalOpen(true)}
            className="px-2.5 py-1 rounded-md text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
          >
            What&apos;s New
          </button>

          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs transition-colors shadow-sm"
          >
            <Download className="w-3 h-3" />
            <span>Download App</span>
          </button>

          <div className="h-4 w-px bg-[#202833] mx-1 hidden sm:block" />

          {/* Snooze 7 days */}
          <button
            onClick={() => dismissUpdateBanner('snooze')}
            className="px-2 py-1 rounded-md text-[#8B95A5] hover:text-[#F5F7FA] text-[11px] transition-colors"
            title="Remind me again in 7 days"
          >
            Remind Me Later
          </button>

          {/* Don't show again */}
          <button
            onClick={() => dismissUpdateBanner('permanent')}
            className="p-1 rounded-md text-[#8B95A5] hover:text-rose-400 transition-colors"
            title="Don't show again"
            aria-label="Dismiss banner permanently"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
