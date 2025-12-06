import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [ticketID, setTicketID] = useState('');
  
  // LIVE CLOCK STATE
  const [currentTime, setCurrentTime] = useState(new Date());

  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    // 1. Read Score
    let savedScore = parseInt(localStorage.getItem('userScore') || '0');
    const savedNation = localStorage.getItem('userNation') || 'TR';

    if (savedScore > 4) savedScore = 4;
    setScore(savedScore);

    // 2. IF WINNER: Set the "Daily Lock"
    if (savedScore === 4) {
      const existingTicket = localStorage.getItem('dailyTicketID');
      const lastWinDate = localStorage.getItem('lastWinDate');
      const today = new Date().toDateString();

      if (existingTicket && lastWinDate === today) {
        // If they already won today, reuse the SAME ticket ID (No new vouchers!)
        setTicketID(existingTicket);
      } else {
        // New Win: Generate New ID and Lock Device
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const newID = `JWL-${savedNation.substring(0, 2).toUpperCase()}-${randomCode}`;
        setTicketID(newID);
        
        // SAVE LOCK
        localStorage.setItem('dailyTicketID', newID);
        localStorage.setItem('lastWinDate', today);
      }
    }

    // 3. Start Live Clock (Anti-Screenshot)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
    };
  }, []);

  const isWinner = score === 4;

  const handleRestart = () => {
    // If they are a winner, don't clear the score, just go home
    // This way Landing Page knows they are a winner
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {isWinner && (
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.15} />
      )}

      <div className="max-w-md w-full z-10 space-y-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-1 text-white">
            {isWinner ? 'Quest Complete!' : 'Checkpoint Reached'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isWinner ? 'You have conquered the Forest Valley.' : 'Keep exploring to earn rewards.'}
          </p>
        </div>

        {isWinner ? (
          /* --- SECURE GOLDEN TICKET --- */
          <div className="relative group perspective-1000 animate-[fadeIn_0.5s_ease-out]">
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* LIVE SECURITY HEADER */}
              <div className="bg-slate-900 text-amber-400 p-4 flex justify-between items-center">
                <span className="font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Ticket
                </span>
                {/* Ticking Clock prevents static screenshots */}
                <span className="text-xs font-mono font-bold opacity-90">
                  {currentTime.toLocaleTimeString('en-SG', { hour12: false })}
                </span>
              </div>

              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner border border-amber-200">
                  🎁
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-800 mb-1 leading-tight">
                  Jewel Retail Voucher
                </h2>
                <p className="text-sm text-slate-500 mb-6">Redeemable at L1 Concierge</p>

                <div className="border-t-2 border-dashed border-slate-300 my-4 relative">
                  <div className="absolute -left-8 -top-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                </div>

                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Validation Code</p>
                  <p className="font-mono text-2xl font-bold text-slate-900 tracking-wider">{ticketID}</p>
                </div>
              </div>

              <div className="bg-amber-400 p-3 text-center">
                <p className="text-xs font-bold text-amber-900 uppercase">
                  Valid for {new Date().toLocaleDateString()} Only
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* TRY AGAIN CARD */
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-xl">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-white mb-2">You Scored {score}/4</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You need a perfect score to unlock the exclusive voucher.
            </p>
            <button 
              onClick={() => { localStorage.setItem('userScore', '0'); navigate('/'); }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Try Again ↻
            </button>
          </div>
        )}

        <div className="text-center pt-4">
          <button 
            onClick={handleRestart}
            className="text-slate-500 hover:text-white text-sm transition-colors border-b border-transparent hover:border-slate-500 pb-0.5"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}