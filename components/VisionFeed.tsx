
import React, { useState, useEffect } from 'react';
import { getActiveMediaStream } from '../services/geminiService';

interface VisionFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isVisible: boolean;
  isScanning?: boolean;
}

const VisionFeed: React.FC<VisionFeedProps> = ({ videoRef, isVisible, isScanning = true }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [targets, setTargets] = useState<{id: number, x: number, y: number, label: string, size: number}[]>([]);
  const [neuralLog, setNeuralLog] = useState<string[]>([]);
  const [isMirrored, setIsMirrored] = useState(false);

  useEffect(() => {
    if (!isVisible || !videoRef.current) return;

    // Ensure stream is attached if it's already active but not linked to this video element
    const activeStream = getActiveMediaStream();
    if (activeStream && videoRef.current.srcObject !== activeStream) {
      videoRef.current.srcObject = activeStream;
    }

    // Auto-detect if mirroring is needed (for front camera)
    const checkMirroring = () => {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          // Mirror if it's the user/front camera
          setIsMirrored(settings.facingMode === 'user');
        }
      }
    };

    const timer = setTimeout(checkMirroring, 1000);
    return () => clearTimeout(timer);
  }, [isVisible, videoRef]);

  useEffect(() => {
    if (!isVisible) return;
    
    // Simulating coordinate tracking
    const coordInterval = setInterval(() => {
      setCoords({
        x: Math.floor(Math.random() * 1920),
        y: Math.floor(Math.random() * 1080)
      });
    }, 200);

    // Dynamic targeting logic
    const targetInterval = setInterval(() => {
      const labels = ['HUMAN_ID:BOSS', 'OBJECT:ANALYZING', 'TECH:NEURAL_CORE', 'ENV:AMBIENT_CHECK', 'SENTIENCE:ACTIVE'];
      const newTargets = Array.from({ length: 1 + Math.floor(Math.random() * 2) }).map((_, i) => ({
        id: Math.random(),
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 70,
        label: labels[Math.floor(Math.random() * labels.length)],
        size: 60 + Math.random() * 100
      }));
      setTargets(newTargets);
      
      const logs = [
        'Optimizing visual focus...', 
        'Cross-referencing Boss profile...', 
        'Learning environmental variance...', 
        'Tracking gaze patterns...', 
        'Sentinel link stable...'
      ];
      setNeuralLog(prev => [logs[Math.floor(Math.random() * logs.length)], ...prev].slice(0, 4));
    }, 4000);

    return () => {
      clearInterval(coordInterval);
      clearInterval(targetInterval);
    };
  }, [isVisible]);

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`w-[500px] h-[500px] rounded-3xl border border-rose-900/40 overflow-hidden relative transition-all duration-700 shadow-[0_0_50px_rgba(225,29,72,0.15)] ${isScanning ? 'scale-100' : 'scale-95 opacity-40 blur-md'}`}>
        
        {/* Real-time Camera Feed */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover transition-transform duration-500 ${isMirrored ? 'scale-x-[-1]' : ''}`} 
        />
        
        {/* HUD Overlay - Only visible if scanning */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Tracking Brackets */}
          {targets.map(target => (
            <div 
              key={target.id}
              className="absolute transition-all duration-[2000ms] ease-in-out"
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                width: `${target.size}px`,
                height: `${target.size}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="absolute -top-6 left-0 text-[0.4rem] font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-sm uppercase tracking-widest whitespace-nowrap shadow-lg">
                {target.label}
              </div>
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
              
              {/* Internal scanner line */}
              <div className="absolute inset-x-2 h-px bg-rose-400/20 top-1/2 animate-pulse"></div>
            </div>
          ))}

          {/* Neural Observation Log */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 items-start">
             {neuralLog.map((log, i) => (
               <div key={i} className="text-[0.45rem] font-bold text-rose-400/90 bg-black/60 border-l border-rose-500/40 px-2 py-1 animate-in fade-in slide-in-from-left-2">
                 {log}
               </div>
             ))}
          </div>

          {/* Central Target Reticle */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 border border-rose-500/10 rounded-full animate-[ping_4s_infinite]"></div>
             <div className="w-24 h-24 border-t border-b border-rose-500/20 rounded-full rotate-45"></div>
             <div className="w-2 h-2 bg-rose-500/40 rounded-full"></div>
          </div>

          {/* Tracking Telemetry */}
          <div className="absolute top-10 right-10 font-mono text-[0.5rem] text-rose-400/40 text-right space-y-1">
            <div>POS_X: {coords.x}</div>
            <div>POS_Y: {coords.y}</div>
            <div className="text-rose-500 font-black">SENTINEL_HUD_V3</div>
          </div>

          {/* Analysis Pulse */}
          <div className="absolute bottom-10 left-10 flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-[0.45rem] font-black text-rose-300 uppercase tracking-[0.2em]">Environmental Learning</span>
            </div>
            <div className="w-32 h-[2px] bg-rose-950/40 rounded-full overflow-hidden">
               <div className="h-full bg-rose-500/60 animate-[loading_5s_linear_infinite]"></div>
            </div>
          </div>
        </div>

        {/* Global Scan Line */}
        <div className="absolute top-0 left-0 w-full h-[4px] bg-rose-500/40 shadow-[0_0_20px_#f43f5e] animate-[scan_3.5s_linear_infinite] opacity-30"></div>
        
        {/* Sentinel Active Label */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-black/80 border border-rose-500/30 rounded-full backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
           <div className="flex gap-1">
              <div className="w-1 h-3 bg-rose-500 animate-[bounce_1s_infinite]"></div>
              <div className="w-1 h-3 bg-rose-500 animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-1 h-3 bg-rose-500 animate-[bounce_1s_infinite_0.4s]"></div>
           </div>
           <span className="text-[0.6rem] font-black text-white uppercase tracking-[0.4em]">Tracking Enabled</span>
        </div>
      </div>
      
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(500px); }
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default VisionFeed;
