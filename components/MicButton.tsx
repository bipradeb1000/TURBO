
import React from 'react';

interface MicButtonProps {
  isActive: boolean;
  onClick: () => void;
  volume?: number;
}

const MicButton: React.FC<MicButtonProps> = ({ isActive, onClick, volume = 0 }) => {
  // Map volume (0 to ~0.5) to a scale factor (1 to 1.6)
  const volScale = 1 + (Math.min(volume, 0.5) * 1.6);

  return (
    <button 
      onClick={onClick}
      className={`relative w-24 h-24 flex items-center justify-center transition-all duration-700 ${
        isActive 
          ? 'scale-110' 
          : 'hover:scale-105 active:scale-95'
      }`}
    >
      {/* Sentient Aura Rings */}
      {isActive && (
        <>
          <div 
            className="absolute inset-0 rounded-full border-2 border-rose-500/30 opacity-30 transition-transform duration-75 ease-out"
            style={{ transform: `scale(${volScale * 1.3})` }}
          ></div>
          <div 
            className="absolute inset-0 rounded-full border border-rose-400/20 opacity-15 transition-transform duration-150 ease-out"
            style={{ transform: `scale(${volScale * 1.7})` }}
          ></div>
          <div className="absolute inset-0 rounded-full bg-rose-500/5 animate-pulse blur-xl"></div>
          <div className="absolute inset-0 rounded-full border border-rose-500/10 animate-ping duration-[2000ms]"></div>
        </>
      )}

      {/* Glassmorphic Core */}
      <div className={`w-full h-full rounded-full border-2 flex items-center justify-center backdrop-blur-2xl transition-all duration-500 ${
        isActive 
          ? 'border-rose-400 bg-rose-500/20 shadow-[0_0_60px_rgba(244,63,94,0.5)]' 
          : 'border-white/10 bg-white/5 hover:border-rose-500/40 hover:bg-white/10'
      }`}>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={`transition-all duration-300 ${isActive ? 'text-white scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'text-white/30'}`}
          style={{ transform: isActive ? `scale(${1 + volume * 0.4})` : 'scale(1)' }}
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </div>

      {/* Status Label */}
      <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.55rem] font-black tracking-[0.3em] uppercase transition-all duration-500 ${isActive ? 'text-rose-400 opacity-100 translate-y-0' : 'text-white/10 opacity-0 translate-y-2'}`}>
        Neural Link Active
      </div>
    </button>
  );
};

export default MicButton;
