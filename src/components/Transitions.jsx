import { useEffect } from 'react';

// --- CSS FOR WALKING ANIMATION ---
const walkStyles = `
  @keyframes limbSwing {
    0% { transform: rotate(-25deg); }
    100% { transform: rotate(25deg); }
  }
  @keyframes bodyBounce {
    0% { transform: translateY(0); }
    100% { transform: translateY(-4px); }
  }
  .animate-limb {
    animation: limbSwing 0.5s ease-in-out infinite alternate;
    transform-origin: top center;
  }
  .animate-limb-delayed {
    animation: limbSwing 0.5s ease-in-out infinite alternate-reverse;
    transform-origin: top center;
  }
  .animate-body {
    animation: bodyBounce 0.25s ease-in-out infinite alternate;
  }
`;

// --- PASSPORT STAMP ANIMATION ---
export function PassportStamp({ onComplete, currentId }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1650);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const stamps = [1, 2, 3, 4];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="relative scale-90 md:scale-100">
        <div className="w-72 h-96 bg-[#14312b] rounded-r-2xl rounded-l-md border-l-8 border-[#0f2621] shadow-2xl flex flex-col items-center relative overflow-hidden p-6 font-sans">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#008272]/10 rounded-bl-full pointer-events-none"></div>
           <div className="w-full border-b-2 border-[#008272]/30 pb-3 mb-6 flex justify-between items-end">
              <div>
                <span className="block text-white/40 text-[9px] font-bold tracking-[0.2em] uppercase mb-1">Travel Document</span>
                <span className="block text-white font-display font-bold text-lg tracking-wide uppercase leading-none">Jewel Passport</span>
              </div>
              <div className="w-8 h-8 rounded-full border border-[#008272]/50 flex items-center justify-center">
                 <span className="text-lg">✈️</span>
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4 w-full h-full content-start">
              {stamps.map((num) => {
                if (num > currentId) {
                    return (
                        <div key={num} className="border-2 border-dashed border-[#008272]/20 rounded-xl aspect-square flex items-center justify-center">
                            <span className="text-[#008272]/20 font-bold text-xl">{num}</span>
                        </div>
                    );
                }
                const isNew = num === currentId;
                return (
                  <div key={num} className="relative border-2 border-[#008272]/30 bg-white/5 rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                    <div className={`
                      w-24 h-24 rounded-full border-[3px] border-emerald-400 flex flex-col items-center justify-center 
                      text-emerald-400 font-bold uppercase tracking-wider rotate-[-12deg]
                      bg-[#14312b] shadow-[0_0_15px_rgba(52,211,153,0.3)]
                      ${isNew ? 'animate-[zoomIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]' : 'opacity-70 grayscale-[0.3]'}
                    `}>
                      <span className="text-[7px] text-emerald-200/80">Checkpoint</span>
                      <span className="text-3xl leading-none text-white drop-shadow-md">0{num}</span>
                      <span className="text-[7px] text-emerald-200/80 mt-1">CLEARED</span>
                    </div>
                  </div>
                );
              })}
           </div>
           <div className="absolute bottom-3 text-white/20 text-[8px] tracking-widest uppercase">Forest Valley Trail • Singapore</div>
        </div>
      </div>
    </div>
  );
}

// --- WALKING MAN ANIMATION ---
export function TrailMapTransition({ onComplete, currentStop }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000); // 4 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <style>{walkStyles}</style>
      <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
        
        {/* TEXT */}
        <div className="text-center mb-16 animate-pulse">
          <h2 className="text-[#14312b] font-display font-bold text-2xl">Walking to Checkpoint {currentStop}...</h2>
        </div>
        
        {/* WALKING CHARACTER CONTAINER */}
        <div className="relative w-24 h-48 flex items-center justify-center">
            
            {/* The Character Structure */}
            <div className="relative w-16 h-32 animate-body">
                
                {/* HEAD (Yellow Skin) */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#facc15] rounded-full z-20 shadow-sm"></div>

                {/* LEFT ARM (Red Top - Behind) */}
                <div className="absolute top-1 left-1/2 w-3 h-14 bg-[#ef4444] rounded-full origin-top animate-limb-delayed z-0"></div>

                {/* LEFT LEG (Blue Jeans - Behind) */}
                <div className="absolute top-20 left-1/2 w-4 h-16 bg-[#1d4ed8] rounded-full origin-top animate-limb-delayed z-0">
                    {/* Shoe */}
                    <div className="absolute bottom-0 left-0 w-6 h-3 bg-black rounded-r-md"></div>
                </div>

                {/* BODY (Red Torso) - TEXT REMOVED */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-24 bg-[#ef4444] rounded-xl z-10 shadow-inner"></div>

                {/* RIGHT LEG (Blue Jeans - Front) */}
                <div className="absolute top-20 left-1/2 w-4 h-16 bg-[#1d4ed8] rounded-full origin-top animate-limb z-10">
                    {/* Shoe */}
                    <div className="absolute bottom-0 left-0 w-6 h-3 bg-black rounded-r-md"></div>
                </div>

                {/* RIGHT ARM (Red Top - Front) */}
                <div className="absolute top-1 left-1/2 w-3 h-14 bg-[#ef4444] rounded-full origin-top animate-limb z-20"></div>

            </div>
            
            {/* Ground Shadow */}
            <div className="absolute -bottom-4 w-24 h-2 bg-black/10 rounded-full animate-pulse blur-sm"></div>

        </div>

      </div>
    </>
  );
}