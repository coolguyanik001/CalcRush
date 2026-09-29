import React, { useState } from 'react';
import {
  X,
  Download,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Terminal,
  HelpCircle,
  FileCode,
  Sparkles,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  GITHUB_RELEASES_URL,
  GITHUB_REPO_URL,
  LATEST_RELEASE_TAG_URL,
  RELEASE_ARTIFACTS,
  ReleaseArtifact,
} from '../data/releases';
import { CURRENT_VERSION } from '../data/changelog';

export const DownloadModal: React.FC = () => {
  const { isDownloadModalOpen, setIsDownloadModalOpen } = useApp();
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'windows' | 'linux' | 'macos'>('android');
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  if (!isDownloadModalOpen) return null;

  const filteredArtifacts = RELEASE_ARTIFACTS.filter((a) => a.platform === selectedPlatform);

  const handleCopyHash = (art: ReleaseArtifact) => {
    navigator.clipboard.writeText(art.sha256);
    setCopiedHashId(art.id);
    setTimeout(() => {
      setCopiedHashId(null);
    }, 2500);
  };

  const handleDownload = (filename: string) => {
    // Direct download trigger from /releases/
    const link = document.createElement('a');
    link.href = `/releases/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="download-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-[#0D1219] border border-[#202833] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202833] bg-[#111720]/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 id="download-modal-title" className="text-lg font-bold text-[#F5F7FA]">
                  Download CalcRush
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  v{CURRENT_VERSION}
                </span>
              </div>
              <p className="text-xs text-[#8B95A5]">
                Standalone desktop & mobile applications with offline persistence
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDownloadModalOpen(false)}
            className="p-2 rounded-lg text-[#8B95A5] hover:text-[#F5F7FA] hover:bg-[#111720] transition-colors"
            aria-label="Close download modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex border-b border-[#202833] bg-[#080B10]/50 px-6 pt-3 gap-2 overflow-x-auto">
          {[
            { id: 'android', label: 'Android', icon: '🤖', sub: 'APK Package' },
            { id: 'windows', label: 'Windows', icon: '🪟', sub: 'Setup & Portable' },
            { id: 'linux', label: 'Linux', icon: '🐧', sub: 'AppImage & DEB' },
            { id: 'macos', label: 'macOS', icon: '🍎', sub: 'Safari / PWA' },
          ].map((tab) => {
            const isActive = selectedPlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPlatform(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold transition-all border-t border-x -mb-px ${
                  isActive
                    ? 'bg-[#0D1219] text-cyan-400 border-[#202833] border-b-transparent shadow-sm'
                    : 'text-[#8B95A5] border-transparent hover:text-[#F5F7FA] hover:bg-[#111720]/40'
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <div className="text-left">
                  <div className="leading-tight">{tab.label}</div>
                  <div className="text-[10px] text-[#8B95A5] font-normal leading-tight">
                    {tab.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Artifact Cards */}
          <div className="space-y-4">
            {filteredArtifacts.map((art) => (
              <div
                key={art.id}
                className="p-5 rounded-xl bg-[#111720] border border-[#202833] space-y-4 transition-all hover:border-cyan-500/30"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5">
                    <div className="text-2xl mt-0.5">{art.icon}</div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-bold text-sm text-[#F5F7FA]">{art.platformName}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0D1219] text-cyan-400 border border-[#202833]">
                          {art.badge}
                        </span>
                        {art.recommended && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Recommended
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[#8B95A5]">
                        <span className="font-mono text-[11px] text-[#F5F7FA]">{art.filename}</span>
                        {art.sizeBytes > 0 && (
                          <span>{(art.sizeBytes / 1024).toFixed(1)} KB</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {art.platform !== 'macos' ? (
                      <button
                        onClick={() => handleDownload(art.filename)}
                        className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#080B10] font-bold text-xs transition-all shadow-md shadow-cyan-500/15"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    ) : (
                      <a
                        href={GITHUB_RELEASES_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#0D1219] text-cyan-400 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/10 transition-colors"
                      >
                        <span>GitHub Build</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Installation Steps */}
                <div className="bg-[#080B10] rounded-lg p-3.5 border border-[#202833]/80 space-y-2">
                  <div className="text-[11px] font-semibold text-[#8B95A5] uppercase tracking-wider flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Installation Instructions</span>
                  </div>
                  <ol className="text-xs text-[#8B95A5] space-y-1.5 list-decimal list-inside">
                    {art.instructions.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-[#F5F7FA]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Cryptographic Checksum SHA-256 */}
                {art.sha256 && art.sha256 !== 'PENDING_BUILD' && (
                  <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[#8B95A5] shrink-0 text-[11px]">SHA-256:</span>
                      <code className="font-mono text-[10px] text-cyan-400/90 truncate bg-[#080B10] px-2 py-0.5 rounded border border-[#202833]">
                        {art.sha256}
                      </code>
                    </div>

                    <button
                      onClick={() => handleCopyHash(art)}
                      className="flex items-center space-x-1 text-[11px] text-[#8B95A5] hover:text-cyan-400 py-0.5 px-2 rounded hover:bg-[#080B10] transition-colors self-start sm:self-auto shrink-0"
                      title="Copy SHA-256 hash"
                    >
                      {copiedHashId === art.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400 font-medium">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Hash</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Verification & GitHub Footer Note */}
          <div className="rounded-xl bg-[#080B10] border border-[#202833] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#F5F7FA] block">
                Cryptographic Integrity Verification
              </span>
              <p className="text-[11px] text-[#8B95A5] leading-relaxed">
                Verify any downloaded file via terminal using{' '}
                <code className="text-cyan-400 font-mono">sha256sum &lt;file&gt;</code> on Linux/Mac
                or <code className="text-cyan-400 font-mono">CertUtil -hashfile &lt;file&gt; SHA256</code> on Windows.
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <a
                href={LATEST_RELEASE_TAG_URL}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111720] hover:bg-[#18202c] text-[#8B95A5] hover:text-[#F5F7FA] border border-[#202833] text-xs font-medium transition-colors"
              >
                <span>GitHub Release</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-[#202833] bg-[#111720]/50 text-xs text-[#8B95A5]">
          <span>CalcRush releases are open-source and free of telemetry.</span>
          <button
            onClick={() => setIsDownloadModalOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#0D1219] hover:bg-[#18202c] text-[#F5F7FA] border border-[#202833] text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
