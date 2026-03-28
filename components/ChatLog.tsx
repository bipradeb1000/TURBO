
import React, { useEffect, useRef } from 'react';
import { ChatMessage } from '../types';

interface ChatLogProps {
  messages: ChatMessage[];
}

const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-64 overflow-y-auto flex flex-col-reverse gap-3 px-2 scroll-smooth no-scrollbar"
      style={{ maskImage: 'linear-gradient(to top, black 95%, transparent)' }}
    >
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}
        >
          <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] border-b shadow-lg transition-all duration-300 ${
            msg.isInterim ? 'opacity-60 scale-[0.98]' : 'opacity-100 scale-100'
          } ${
            msg.sender === 'user' 
              ? 'bg-rose-950/30 text-rose-100 border-rose-500/40 shadow-rose-900/10' 
              : msg.sender === 'system'
              ? 'bg-white/5 text-white/30 border-white/10 font-mono text-[0.6rem] italic'
              : 'bg-black/90 text-rose-400 border-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.08)]'
          }`}>
            <div className="flex items-center gap-2 mb-1.5 border-b border-white/5 pb-1">
              <span className={`text-[0.55rem] uppercase tracking-[0.35em] font-black ${msg.sender === 'turbo' ? 'text-rose-400' : 'text-white/40'}`}>
                {msg.sender === 'turbo' ? 'Sentient Partner' : msg.sender === 'user' ? 'Boss (Bipradeb)' : msg.sender}
              </span>
              {msg.isInterim && (
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 bg-rose-400/60 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-rose-400/60 rounded-full animate-bounce delay-75"></div>
                  <div className="w-1 h-1 bg-rose-400/60 rounded-full animate-bounce delay-150"></div>
                </div>
              )}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed font-semibold tracking-wide text-[0.9rem]">
              {msg.text}
            </div>
            
            {msg.sources && msg.sources.length > 0 && (
              <div className="mt-3 pt-2 border-t border-rose-500/20">
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-rose-300/60 mb-1.5">Knowledge Grounding:</p>
                <div className="flex flex-wrap gap-2">
                  {msg.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[0.65rem] bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full text-rose-400 hover:bg-rose-500/20 transition-all flex items-center gap-1 max-w-full"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      <span className="truncate">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default ChatLog;
