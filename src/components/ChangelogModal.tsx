import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Zap,
  Bug,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
  Download,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CHANGELOG_DATA, CURRENT_VERSION } from '../data/changelog';
import { GITHUB_RELEASES_URL } from '../data/releases';

export const ChangelogModal: React.FC = () => {
  const { isChangelogModalOpen, setIsChangelogModalOpen, setIsDownloadModalOpen } = useApp();
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({
    [CURRENT_VERSION]: true,
  });

  if (!isChangelogModalOpen) return null;

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => ({
      ...prev,
      [version]: !prev[version],
    }));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="changelog-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0D1219] border border-[#202833] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202833] bg-[#111720]/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="changelog-modal-title" className="text-lg font-bold text-[#F5F7FA]">
                  What&apos;s New in CalcRush
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  v{CURRENT_VERSION}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5]">
                Release history, continuous improvements, and mathematical fixes
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChangelogModalOpen(false)}
            className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
            aria-label="Close changelog modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Action Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-[#080B10]/60 border-b border-[#202833] text-xs">
          <span className="text-[#8B95A5]">
            Showing all {CHANGELOG_DATA.length} versions from launch to current
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsChangelogModalOpen(false);
                setIsDownloadModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Get Desktop / Mobile</span>
            </button>
            <a
              href={GITHUB_RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-2.5 py-1 text-[#8B95A5] hover:text-[#F5F7FA] transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {CHANGELOG_DATA.map((item) => {
            const isExpanded = Boolean(expandedVersions[item.version]);
            const isCurrent = item.version === CURRENT_VERSION;

            return (
              <div
                key={item.version}
                className={`rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#111720] border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.06)]'
                    : 'bg-[#111720]/60 border-[#202833]'
                }`}
              >
                {/* Release Header (Click to toggle) */}
                <div
                  onClick={() => toggleVersion(item.version)}
                  className="p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className="font-mono text-base font-bold text-cyan-400">
                        v{item.version}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          {item.badge}
                        </span>
                      )}
                      <span className="text-xs text-[#8B95A5] flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.date}</span>
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-[#F5F7FA] group-hover:text-cyan-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2 text-[#8B95A5] group-hover:text-[#F5F7FA]">
                    <span className="text-xs hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 space-y-4 border-t border-[#202833]/60 pt-4">
                    {/* Summary */}
                    <p className="text-xs text-[#8B95A5] leading-relaxed bg-[#080B10] p-3.5 rounded-lg border border-[#202833]/80">
                      {item.summary}
                    </p>

                    {/* New Features */}
                    {item.newFeatures.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>New Features</span>
                        </div>
                        <ul className="space-y-1.5">
                          {item.newFeatures.map((feat, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-[#F5F7FA] flex items-start space-x-2"
                            >
                              <span className="text-cyan-400 font-bold shrink-0 mt-0.5">•</span>
                              <span className="leading-relaxed">{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {item.improvements.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Improvements & Tuning</span>
                        </div>
                        <ul className="space-y-1.5">
                          {item.improvements.map((imp, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-[#F5F7FA] flex items-start space-x-2"
                            >
                              <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                              <span className="leading-relaxed">{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Bug Fixes */}
                    {item.bugFixes.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                          <Bug className="w-3.5 h-3.5" />
                          <span>Bug Fixes & Audit Resolutions</span>
                        </div>
                        <ul className="space-y-1.5">
                          {item.bugFixes.map((fix, idx) => (
                            <li
                              key={idx}
                              className="text-xs text-[#F5F7FA] flex items-start space-x-2"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="leading-relaxed text-[#8B95A5]">
                                <span className="text-[#F5F7FA]">{fix}</span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#202833] bg-[#111720]/50 text-xs text-[#8B95A5]">
          <span>CalcRush adheres to semantic versioning.</span>
          <button
            onClick={() => setIsChangelogModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
