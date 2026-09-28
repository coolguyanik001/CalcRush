import React from 'react';
import { Play, RotateCcw, LogOut } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  onResume,
  onRestart,
  onExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080B10]/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-[#111720] border border-[#202833] p-6 shadow-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-[#0D1219] border border-[#202833] mx-auto flex items-center justify-center text-cyan-400 mb-4">
          <span className="font-math font-bold text-lg">II</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#F5F7FA]">Training Paused</h2>
        <p className="text-xs text-[#8B95A5] mt-1 mb-6">
          Paused time does not count toward your calculation average.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-[#0D1219] hover:bg-[#18202c] active:bg-[#202833] text-[#F5F7FA] border border-[#202833] font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#8B95A5]" />
            <span>Restart Session</span>
          </button>

          <button
            onClick={onExit}
            className="w-full py-3 px-4 rounded-xl bg-transparent hover:bg-rose-950/20 text-[#8B95A5] hover:text-rose-400 border border-transparent font-medium text-sm flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
