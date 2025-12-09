import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [ticketID, setTicketID] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    let savedScore = parseInt(localStorage.getItem('userScore') || '0');
    const savedNation = localStorage.getItem('userNation') || 'TR';
    if (savedScore > 4) savedScore = 4;
    setScore(savedScore);

    if (savedScore === 4) {
      const existingTicket = localStorage.getItem('dailyTicketID');
      const lastWinDate = localStorage.getItem('lastWinDate');
      const today = new Date().toDateString();

      if (existingTicket && lastWinDate === today) {
        setTicketID(existingTicket);
      } else {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const newID = `JWL-${savedNation.substring(0, 2).toUpperCase()}-${randomCode}`;
        setTicketID(newID);
        localStorage.setItem('dailyTicketID', newID);
        localStorage.setItem('lastWinDate', today);
      }
    }

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); clearInterval(timer); };
  }, []);

  const isWinner = score === 4;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {isWinner && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.15} />
      )}

      <div className="max-w-md w-full z-10 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-2 text-[#14312b]">
            {isWinner ? 'Quest Complete!' : 'Checkpoint Reached'}
          </h1>
          {/* UPDATED: Subtitle with East Trail Prompt */}
          <p className="text-gray-500 leading-relaxed px-4">
            {isWinner 
              ? 'You have conquered the Forest Valley. Why not challenge yourself with the Forest Valley Trail (East) next?' 
              : 'Keep exploring to earn rewards.'}
          </p>
        </div>

        {isWinner ? (
          /* --- GOLDEN TICKET --- */
          <div className="relative group perspective-1000 animate-[fadeIn_0.5s_ease-out]">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
              
              <div className="bg-[#14312b] text-amber-400 p-4 flex justify-between items-center">
                <span className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Ticket
                </span>
                <span className="text-xs font-mono font-bold opacity-90">
                  {currentTime.toLocaleTimeString('en-SG', { hour12: false })}
                </span>
              </div>

              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner border border-amber-100">
                  🎁
                </div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-1 leading-tight">
                  Jewel Retail Voucher
                </h2>
                <p className="text-sm text-gray-400 mb-6">Redeemable at L1 Concierge</p>

                <div className="border-t-2 border-dashed border-gray-200 my-4 relative">
                  <div className="absolute -left-8 -top-3 w-6 h-6 bg-gray-50 rounded-full shadow-[inset_-2px_0_2px_rgba(0,0,0,0.05)]"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 bg-gray-50 rounded-full shadow-[inset_2px_0_2px_rgba(0,0,0,0.05)]"></div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Validation Code</p>
                  <p className="font-mono text-2xl font-bold text-[#14312b] tracking-wider">{ticketID}</p>
                </div>
              </div>

              <div className="bg-amber-500 p-3 text-center">
                <p className="text-xs font-bold text-white uppercase">
                  Valid for {new Date().toLocaleDateString()} Only
                </p>
              </div>
            </div>
            
            {/* NEW: Screenshot Prompt */}
            <p className="text-center text-xs text-gray-400 mt-4 italic">
              📸 Tip: Take a screenshot to save this voucher!
            </p>
          </div>
        ) : (
          /* --- TRY AGAIN CARD --- */
          <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-lg">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You Scored {score}/4</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You need a perfect score to unlock the exclusive voucher.
            </p>
            <button 
              onClick={() => { localStorage.setItem('userScore', '0'); navigate('/'); }}
              className="w-full py-3 bg-[#14312b] hover:bg-[#0f2621] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Try Again ↻
            </button>
          </div>
        )}

        {/* --- NEW: EXPLORE LINKS --- */}
        <div className="flex flex-col gap-3 text-center pt-4 pb-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">More to Explore</p>
           
           <a 
             href="https://www.jewelchangiairport.com/en/dine.html" 
             target="_blank" 
             rel="noreferrer" 
             className="block w-full py-3 bg-white border border-gray-200 rounded-xl text-[#008272] font-bold hover:border-[#008272] hover:bg-emerald-50 transition-all shadow-sm"
           >
             Dining in Jewel 🍽️
           </a>
           
           <a 
             href="https://www.jewelchangiairport.com/en/shop.html" 
             target="_blank" 
             rel="noreferrer" 
             className="block w-full py-3 bg-white border border-gray-200 rounded-xl text-[#008272] font-bold hover:border-[#008272] hover:bg-emerald-50 transition-all shadow-sm"
           >
             Shopping at Jewel 🛍️
           </a>
        </div>

        <div className="text-center">
          <button 
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-[#14312b] text-sm transition-colors border-b border-transparent hover:border-[#14312b] pb-0.5"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}