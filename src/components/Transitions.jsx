import { useEffect, useState } from 'react';

// --- PASSPORT STAMP ANIMATION ---
export function PassportStamp({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
      <div className="relative">
        {/* Passport Book */}
        <div className="w-64 h-80 bg-[#1a2e35] rounded-xl border-2 border-[#cfb53b] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
           <div className="absolute top-4 text-[#cfb53b] text-xs tracking-[0.3em]">JEWEL PASSPORT</div>
           <div className="w-20 h-20 rounded-full border border-[#cfb53b]/30 mb-4"></div>
           <div className="w-40 h-2 bg-[#cfb53b]/20 rounded-full mb-2"></div>
           <div className="w-32 h-2 bg-[#cfb53b]/20 rounded-full"></div>
        </div>

        {/* The Stamp (Slams down) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[stampBounce_0.5s_ease-out_forwards]">
          <div className="w-40 h-40 rounded-full border-4 border-emerald-500 flex items-center justify-center rotate-[-15deg] bg-emerald-50/10 backdrop-blur-sm shadow-[0_0_15px_rgba(16,185,129,0.5)]">
            <div className="text-center">
              <span className="block text-emerald-500 font-bold text-4xl uppercase tracking-widest">CLEARED</span>
              <span className="block text-emerald-500 text-xs mt-1">FOREST VALLEY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ISOMETRIC TRAIL MAP ANIMATION ---
export function TrailMapTransition({ onComplete, currentStop }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#e6f4f1] flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
      <h2 className="text-[#14312b] font-display font-bold text-2xl mb-8 animate-pulse">Moving to Checkpoint {currentStop}...</h2>
      
      {/* Isometric Map Container */}
      <div className="relative w-64 h-64 rotate-45 transform bg-[#ccece6] rounded-3xl border-8 border-white shadow-xl overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{ backgroundImage: 'radial-gradient(#008272 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* The Path */}
        <svg className="absolute inset-0 w-full h-full -rotate-45 scale-150" viewBox="0 0 100 100">
           <path d="M 10 90 Q 50 10 90 90" stroke="white" strokeWidth="4" fill="none" strokeDasharray="10,5" />
        </svg>

        {/* Walking Character (Simple Dot for 3D effect) */}
        <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10 animate-[walkPath_2s_linear_infinite]">
           {/* Avatar Head */}
           <div className="absolute -top-10 left-0 w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs">🚶</div>
        </div>

        {/* Trees (Decor) */}
        <div className="absolute top-10 right-10 text-4xl -rotate-45">🌲</div>
        <div className="absolute bottom-10 left-10 text-4xl -rotate-45">🌳</div>
      </div>
    </div>
  );
}