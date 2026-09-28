import React from 'react';
import { Delete, CornerDownLeft, Space } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface NumericKeypadProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
  disabled?: boolean;
  allowSubmitWhenDisabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  onKeyPress,
  onBackspace,
  onSubmit,
  soundEnabled = true,
  hapticsEnabled = true,
  disabled = false,
  allowSubmitWhenDisabled = false,
}) => {
  const handleKey = (char: string) => {
    if (disabled) return;
    soundEngine.playKeyTap(soundEnabled);
    soundEngine.triggerHaptic('tap', hapticsEnabled);
    onKeyPress(char);
  };

  const handleBackspace = () => {
    if (disabled) return;
    soundEngine.playKeyTap(soundEnabled);
    soundEngine.triggerHaptic('tap', hapticsEnabled);
    onBackspace();
  };

  const handleSubmit = () => {
    if (disabled && !allowSubmitWhenDisabled) return;
    soundEngine.playKeyTap(soundEnabled);
    soundEngine.triggerHaptic('tap', hapticsEnabled);
    onSubmit();
  };

  const btnClass =
    'flex items-center justify-center h-12 sm:h-13 rounded-xl text-xl sm:text-2xl font-math font-semibold bg-[#111720] hover:bg-[#18202c] active:bg-[#202833] text-[#F5F7FA] border border-[#202833] transition-all select-none active:scale-[0.97] touch-manipulation shadow-sm disabled:opacity-40 disabled:pointer-events-none';

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-1.5 sm:gap-2 p-1 sm:p-2">
      {/* 3x3 Digit Grid */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button type="button" disabled={disabled} onClick={() => handleKey('1')} className={btnClass}>
          1
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('2')} className={btnClass}>
          2
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('3')} className={btnClass}>
          3
        </button>

        <button type="button" disabled={disabled} onClick={() => handleKey('4')} className={btnClass}>
          4
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('5')} className={btnClass}>
          5
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('6')} className={btnClass}>
          6
        </button>

        <button type="button" disabled={disabled} onClick={() => handleKey('7')} className={btnClass}>
          7
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('8')} className={btnClass}>
          8
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('9')} className={btnClass}>
          9
        </button>
      </div>

      {/* Row 4: Minus, 0, Period */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('-')}
          className={`${btnClass} text-[#8B95A5] hover:text-[#F5F7FA] text-xl`}
          title="Negative / Minus"
        >
          −
        </button>
        <button type="button" disabled={disabled} onClick={() => handleKey('0')} className={btnClass}>
          0
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('.')}
          className={`${btnClass} text-[#8B95A5] hover:text-[#F5F7FA] font-bold`}
          title="Decimal point"
        >
          .
        </button>
      </div>

      {/* Row 5: Fraction slash, Space (mixed fractions), Backspace, Enter */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey('/')}
          className={`${btnClass} text-cyan-400 bg-[#0D1219] hover:bg-[#111720] border-cyan-500/20 text-lg`}
          title="Fraction slash"
        >
          /
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKey(' ')}
          className={`${btnClass} text-[#8B95A5] hover:text-[#F5F7FA] bg-[#0D1219] hover:bg-[#111720] border-[#202833] text-xs flex flex-col items-center justify-center gap-0.5`}
          title="Space (mixed numbers like 1 1/2)"
        >
          <Space className="w-4 h-4 stroke-[2.5]" />
          <span className="text-[9px] uppercase tracking-wider font-sans font-bold">Space</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={handleBackspace}
          className={`${btnClass} text-[#8B95A5] hover:text-rose-400 active:bg-rose-950/20`}
          title="Backspace"
        >
          <Delete className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center h-12 sm:h-13 rounded-xl text-base sm:text-lg font-bold bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-[#080B10] transition-all select-none active:scale-[0.97] touch-manipulation shadow-md shadow-cyan-500/20 cursor-pointer"
          title="Submit or Continue"
        >
          <CornerDownLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
