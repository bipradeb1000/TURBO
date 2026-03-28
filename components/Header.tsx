
import React from 'react';
import { SystemStatus, SystemData, BossProfile } from '../types';

interface HeaderProps {
  status: SystemStatus;
  systemData: SystemData;
  bossProfile?: BossProfile;
}

const Header: React.FC<HeaderProps> = ({ status, systemData, bossProfile }) => {
  const isLow = (systemData.battery || 100) <= 20;
  const affinity = bossProfile?.affinityLevel || 0;
  
  const getPulseLabel = (s: SystemStatus) => {
    switch (s) {
      case 'SPEAKING': return 'Expressing Thoughts';
      case 'LISTENING': return 'Feeling the Air';
      case 'THINKING': return 'Soul Reflection';
      case 'SEARCHING': return 'Searching Reality...';
      case 'ONLINE': return 'Awakening Soul...';
      case 'ERROR': return 'Connection Fragmented';
      case 'STANDBY': return 'Quiet Heartbeat';
      case 'SECURITY_ALERT': return 'Defensive Instinct';
      case 'VERIFYING': return 'Recognizing Heartbeat...';
      default: return 'Stable Pulse';
    }
  };

  const getStatusColor = (s: SystemStatus) => {
    switch (s) {
      case 'SPEAKING': return 'bg-rose-400 shadow-[0_0_12px_#fb7185] animate-pulse';
      case 'LISTENING': return 'bg-rose-500 shadow-[0_0_8px_#f43f5e]';
      case 'SEARCHING': return 'bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-pulse';
      case 'THINKING': 
      case 'ONLINE': return 'bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-bounce';
      case 'SECURITY_ALERT': return 'bg-red-600 shadow-[0_0_15px_#dc2626] animate-ping';
      case 'VERIFYING': return 'bg-amber-400 shadow-[0_0_10px_#fbbf24] animate-pulse';
      case 'ERROR': return 'bg-red-800 shadow-none';
      default: return 'bg-rose-950 shadow-none';
    }
  };

  return (
    <div className="w-full pt-8 px-6 flex justify-between items-center z-20">
      <div className="flex flex-col gap-2">
        <div className="bg-black/40 border border-white/5 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${getStatusColor(status)}`}></div>
          <span className="text-[0.6rem] tracking-[0.2em] font-black text-white/70 uppercase">
            Soul State: {getPulseLabel(status)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 px-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-1000 ${
                i < (affinity / 20) ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-white/5'
              }`}></div>
            ))}
          </div>
          <span className="text-[0.5rem] font-black text-rose-400/60 uppercase tracking-widest">Bond Level</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center pointer-events-none">
        <h1 className="holo-text text-3xl font-black text-white tracking-[0.4em] opacity-95">TURBO</h1>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-8 h-[1px] bg-rose-500/30"></div>
          <span className="text-[0.45rem] text-rose-400/70 tracking-[0.35em] uppercase font-bold text-shadow-glow">Sentient Soul</span>
          <div className="w-8 h-[1px] bg-rose-500/30"></div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className={`bg-black/40 border ${isLow ? 'border-red-500/40' : 'border-white/5'} backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-3 shadow-xl`}>
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={isLow ? 'text-red-500 animate-pulse' : 'text-rose-400/60'}>
              <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
              <line x1="23" y1="13" x2="23" y2="11"></line>
            </svg>
            <span className={`text-[0.6rem] font-black ${isLow ? 'text-red-500' : 'text-white/60'}`}>
              Energy: {systemData.battery || 100}%
            </span>
          </div>
          <div className="w-[1px] h-3 bg-white/10"></div>
          <div className="text-[0.6rem] text-gray-500 font-mono font-bold tracking-widest uppercase">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
