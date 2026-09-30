import React from 'react';
import { X, ExternalLink, Heart, Coffee, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SupportModal: React.FC = () => {
  const { isSupportModalOpen, setIsSupportModalOpen, dismissSupportModal } = useApp();

  if (!isSupportModalOpen) return null;

  const handleSupportClick = () => {
    window.open('https://buymeacoffee.com/senshin', '_blank', 'noopener,noreferrer');
    setIsSupportModalOpen(false);
  };

  const handleRemindLater = () => {
    dismissSupportModal('snooze');
  };

  const handleDontShowAgain = () => {
    dismissSupportModal('permanent');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111720] border border-[#202833] p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsSupportModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#0D1219] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0D1219] border border-amber-500/30 text-amber-400 font-bold text-2xl mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
          ☕
        </div>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-center text-[#F5F7FA] tracking-tight">
          ☕ Enjoying CalcRush?
        </h2>

        {/* Creator Badge */}
        <div className="flex items-center justify-center space-x-1.5 mt-2">
          <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider">Created with</span>
          <Heart className="w-3 h-3 text-rose-400 fill-rose-400 inline" />
          <span className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider">by</span>
          <span className="text-xs font-bold text-amber-300">SENSHIN</span>
        </div>

        {/* Body Text */}
        <p className="text-xs sm:text-sm text-[#8B95A5] text-center mt-4 leading-relaxed px-1">
          CalcRush is built to make mathematics practice faster, smarter, and more engaging. If you've found it useful, you can support its development with a small contribution. Every bit helps. 🧮
        </p>

        {/* Free Promise Note */}
        <div className="mt-4 p-3 rounded-xl bg-[#0D1219] border border-[#202833] text-center space-y-0.5">
          <p className="text-[11px] text-[#8B95A5]">
            CalcRush core training, competitive ladder, and AI level generation remain <span className="text-cyan-400 font-semibold">100% free for everyone</span>.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2.5">
          {/* Main Support Button */}
          <button
            onClick={handleSupportClick}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 active:to-amber-600 text-[#080B10] font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Coffee className="w-4 h-4 stroke-[2.5]" />
            <span>☕ Support CalcRush</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-75" />
          </button>

          {/* Secondary Dismissal Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleRemindLater}
              className="py-2.5 px-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-medium transition-colors cursor-pointer"
            >
              Remind Me Later
            </button>
            <button
              onClick={handleDontShowAgain}
              className="py-2.5 px-3 rounded-xl bg-[#0D1219] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-medium transition-colors cursor-pointer"
            >
              Don't Show Again
            </button>
          </div>
        </div>

        {/* External URL footnote */}
        <div className="mt-4 text-center">
          <a
            href="https://buymeacoffee.com/senshin"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#8B95A5] hover:text-amber-400 transition-colors inline-flex items-center space-x-1"
          >
            <span>buymeacoffee.com/senshin</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
