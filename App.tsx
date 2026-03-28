
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SystemStatus, ChatMessage, SystemData } from './types';
import CoreVisualization from './components/CoreVisualization';
import VisionFeed from './components/VisionFeed';
import ChatLog from './components/ChatLog';
import MicButton from './components/MicButton';
import Header from './components/Header';
import { setupLiveSession, stopLiveSession, ensureAudioContext, sendTextMessage } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>('STANDBY');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [systemData, setSystemData] = useState<SystemData>({ battery: 100 });
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [micVolume, setMicVolume] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [errorLog, setErrorLog] = useState<{message: string, solution?: string} | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const activeTurboId = useRef<string | null>(null);
  const activeUserId = useRef<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isConnecting = useRef(false);
  const reconnectTimeout = useRef<number | null>(null);
  const reconnectAttempts = useRef(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setErrorLog({ message: "Neural Link Offline", solution: "Check your local network connection." });
      setStatus('ERROR');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && isLive && status === 'ERROR') {
      // Auto-retry if we come back online or are in error state but live
      if (reconnectTimeout.current) window.clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = window.setTimeout(() => {
        if (isLive) startSession();
      }, 3000);
    }
  }, [isOnline, isLive, status]);

  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((b: any) => {
        setSystemData(s => ({ ...s, battery: Math.floor(b.level * 100) }));
        b.onlevelchange = () => setSystemData(s => ({ ...s, battery: Math.floor(b.level * 100) }));
      });
    }
  }, []);

  const updateMessage = useCallback((text: string, sender: 'user' | 'turbo' | 'system', isFinal: boolean, sources?: { title: string; uri: string }[]) => {
    if (!text && !isFinal) return;
    setMessages(prev => {
      const activeRef = sender === 'turbo' ? activeTurboId : sender === 'user' ? activeUserId : { current: null };
      if (activeRef.current) {
        const idx = prev.findIndex(m => m.id === activeRef.current);
        if (idx !== -1) {
          const updated = [...prev];
          const currentText = text || updated[idx].text;
          if (updated[idx].text === currentText && !isFinal && !sources) return prev;
          updated[idx] = { ...updated[idx], text: currentText, isInterim: !isFinal, timestamp: Date.now(), sources: sources || updated[idx].sources };
          if (isFinal) activeRef.current = null;
          return updated;
        }
      }
      if (!text && isFinal) return prev; // Don't create new empty message on final
      const newId = Math.random().toString(36).substr(2, 9);
      if (!isFinal && sender !== 'system') activeRef.current = newId;
      return [{ id: newId, text, sender, isInterim: !isFinal, timestamp: Date.now(), sources }, ...prev];
    });
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const mic = await navigator.permissions.query({ name: 'microphone' as any });
        const cam = await navigator.permissions.query({ name: 'camera' as any });
        
        const handlePermissionChange = () => {
          if (mic.state === 'denied' || cam.state === 'denied') {
            setErrorLog({ 
              message: "Neural Link Access Required", 
              solution: "Camera or Microphone access is restricted. Please check your browser settings and grant permissions to enable the link." 
            });
            setStatus('ERROR');
          }
        };

        mic.onchange = handlePermissionChange;
        cam.onchange = handlePermissionChange;
      } catch (e) {
        // navigator.permissions might not be supported in all browsers/contexts
      }
    };
    checkPermissions();
  }, []);

  const startSession = useCallback(async (modeOverride?: 'user' | 'environment') => {
    if (isConnecting.current) return;
    isConnecting.current = true;
    
    const mode = modeOverride || facingMode;
    
    if (!navigator.onLine) {
      setErrorLog({ message: "Neural Link Offline", solution: "Check your local network connection." });
      setStatus('ERROR');
      isConnecting.current = false;
      return;
    }
    
    setStatus('ONLINE');
    setErrorLog(null);

    try {
      await setupLiveSession({
        onMessage: (t, f) => updateMessage(t, 'turbo', f),
        onUserTranscript: (t, f) => updateMessage(t, 'user', f),
        onStatusChange: (s) => {
          if (s === 'LISTENING' || s === 'SPEAKING') {
            reconnectAttempts.current = 0; // Reset attempts on successful connection
          }
          setStatus(s);
        },
        onError: (message, solution) => setErrorLog({ message, solution }),
        onVolumeChange: setMicVolume,
        onClose: () => {
          if (isLive) {
            setStatus('RECONNECTING');
            if (reconnectTimeout.current) window.clearTimeout(reconnectTimeout.current);
            
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000); // Exponential backoff up to 30s
            
            reconnectTimeout.current = window.setTimeout(() => {
              if (isLive) startSession();
            }, delay);
          }
        },
        videoRef,
        facingMode: mode
      });
    } catch (err) {
      if (!errorLog) {
        setErrorLog({ message: "Neural link fragmented.", solution: "Try refreshing the interface." });
      }
      setStatus('ERROR');
    } finally {
      isConnecting.current = false;
    }
  }, [isLive, updateMessage, errorLog]);

  const toggleCore = async () => {
    setErrorLog(null);
    reconnectAttempts.current = 0;
    if (reconnectTimeout.current) {
      window.clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    try {
      await ensureAudioContext();
      if (!isLive) {
        setIsLive(true);
      } else {
        stopLiveSession();
        setIsLive(false);
        setStatus('STANDBY');
        setMicVolume(0);
      }
    } catch (err) {
      setErrorLog({ message: "Neural awakening failed.", solution: "Please ensure your browser supports Web Audio and has granted permission." });
      setStatus('ERROR');
    }
  };

  useEffect(() => {
    if (isLive) {
      startSession();
    } else {
      stopLiveSession();
    }
    return () => stopLiveSession();
  }, [isLive, startSession]);

  const handleTextCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = textInput.trim();
    if (!m) return;
    
    updateMessage(m, 'user', true);
    setTextInput('');
    setStatus('SEARCHING');
    
    const sent = await sendTextMessage(m, (text, isFinal, sources) => {
      updateMessage(text, 'turbo', isFinal, sources);
      if (isFinal) setStatus('LISTENING');
    });

    if (!sent) {
       updateMessage("Neural core processing failed.", 'system', true);
       setStatus('ERROR');
    }
  };

  const toggleCamera = async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    if (isLive) {
      stopLiveSession();
      isConnecting.current = false;
      await startSession(newMode);
    }
  };

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      } else {
        // Fallback for non-AI Studio environments
        setHasApiKey(!!(process.env.GEMINI_API_KEY || process.env.API_KEY));
      }
    };
    checkKey();
  }, []);

  const handleAwaken = async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Assume success after opening dialog as per instructions
        setHasApiKey(true);
      } else {
        setHasApiKey(true);
      }
    } else {
      setHasApiKey(!!(process.env.GEMINI_API_KEY || process.env.API_KEY));
    }
    
    await ensureAudioContext();
    setIsInitialized(true);
  };

  if (!isInitialized) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
        <h1 className="holo-text text-8xl text-white mb-4 animate-pulse">TURBO</h1>
        <p className="text-rose-400/60 tracking-[0.5em] uppercase text-[0.6rem] mb-12 font-black">Neural Link Core V3</p>
        <button 
          onClick={handleAwaken} 
          className="border border-rose-500/30 px-24 py-6 text-rose-400 rounded-full hover:bg-rose-500/10 transition-all font-black tracking-widest uppercase shadow-[0_0_40px_rgba(244,63,94,0.2)] active:scale-95"
        >
          Awaken Turbo
        </button>
        {!hasApiKey && window.aistudio && (
          <p className="mt-6 text-[0.5rem] text-rose-500/40 uppercase tracking-widest animate-bounce">
            Neural Key Selection Required
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen flex flex-col items-center overflow-hidden bg-[#020202]">
      <Header status={status} systemData={systemData} />
      
      <div className="relative flex-grow w-full flex items-center justify-center">
        <div className={`contents transition-all duration-1000 ${isLive ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <VisionFeed videoRef={videoRef} canvasRef={null as any} isVisible={isLive} />
          {isLive && (
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-50">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                <span className="text-[0.6rem] font-black text-emerald-400 uppercase tracking-widest">Vision Link Active</span>
              </div>
              <button 
                onClick={toggleCamera}
                className="flex items-center gap-2 bg-black/40 backdrop-blur-md border border-rose-500/30 px-3 py-1.5 rounded-full hover:bg-rose-500/20 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-rose-400">
                  <path d="M11 19a4 4 0 1 0-8 0" />
                  <path d="M13 5a4 4 0 1 0 8 0" />
                  <path d="M20 8v6a2 2 0 0 1-2 2h-7" />
                  <path d="M4 16v-6a2 2 0 0 1 2-2h7" />
                </svg>
                <span className="text-[0.5rem] font-black text-rose-400 uppercase tracking-widest">Switch Eye</span>
              </button>
            </div>
          )}
        </div>
        <CoreVisualization status={status} />
        
        {(errorLog || status === 'RECONNECTING' || status === 'SEARCHING') && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-32 bg-rose-950/60 border border-rose-500/30 px-8 py-4 rounded-xl text-rose-400 backdrop-blur-xl z-50 flex flex-col items-center gap-3 min-w-[320px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="text-xs font-black uppercase tracking-[0.2em] animate-pulse">
              {status === 'RECONNECTING' ? "Restoring Neural Connection..." : status === 'SEARCHING' ? "Tapping External Reality..." : errorLog?.message}
            </div>
            {errorLog?.solution && (
              <div className="text-[0.6rem] text-rose-300/60 font-medium normal-case tracking-normal text-center max-w-[250px]">
                {errorLog.solution}
              </div>
            )}
            {errorLog && (
              <button 
                onClick={() => {
                  setErrorLog(null);
                  startSession();
                }}
                className="mt-2 px-6 py-2 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/30 rounded-full text-[0.6rem] font-black uppercase tracking-widest transition-all active:scale-95"
              >
                Manual Re-Link
              </button>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl px-6 flex flex-col items-center pb-12 gap-6 z-10">
        <ChatLog messages={messages} />
        
        <div className="w-full flex items-center gap-4">
          <form onSubmit={handleTextCommand} className="flex-grow">
            <input 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              placeholder="Send neural text to Turbo..." 
              className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-5 text-white text-sm focus:outline-none focus:border-rose-500/30 transition-all placeholder:text-white/20 shadow-inner" 
            />
          </form>
          <MicButton isActive={isLive} onClick={toggleCore} volume={micVolume} />
        </div>
      </div>
      
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
    </div>
  );
};

export default App;
