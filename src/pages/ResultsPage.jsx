import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

export default function ResultsPage() {
  const navigate = useNavigate();
  
  // State for game data
  const [score, setScore] = useState(0);
  const [nation, setNation] = useState('');
  
  // State for the Digital Ticket details
  const [ticketID, setTicketID] = useState('');
  const [timestamp, setTimestamp] = useState('');
  
  // State for Confetti sizing
  const [windowSize, setWindowSize] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });

  useEffect(() => {
    // --- 1. Load & Validate Score ---
    let savedScore = parseInt(localStorage.getItem('userScore') || '0');
    const savedNation = localStorage.getItem('userNation') || 'Traveler';

    // Failsafe: Prevent scores like "9/4" if the user refreshed many times
    if (savedScore > 4) savedScore = 4;
    
    setScore(savedScore);
    setNation(savedNation);

    // --- 2. Generate Ticket Data (Only needed if they win, but safe to generate anyway) ---
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    // Create a code like "JWL-SG-8921"
    const nationCode = savedNation.substring(0, 2).toUpperCase(); 
    setTicketID(`JWL-${nationCode}-${randomCode}`);
    
    // Get current time for the "Live" timestamp
    const now = new Date();
    setTimestamp(now.toLocaleDateString('en-SG', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }));

    // --- 3. Handle Screen Resizing (for Confetti) ---
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup listener when leaving page
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isWinner = score === 4;

  const handleRestart = () => {
    // Reset score to 0 so they can play again cleanly
    localStorage.setItem('userScore', '0'); 
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Confetti Overlay (Only renders if isWinner is true) */}
      {isWinner && (
        <Confetti 
          width={windowSize.width} 
          height={windowSize.height} 
          recycle={false} 
          numberOfPieces={400} 
          gravity={0.15} 
        />
      )}

      <div className="max-w-md w-full z-10 space-y-6">
        
        {/* Page Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-1 text-white">
            {isWinner ? 'Quest Complete!' : 'Checkpoint Reached'}
          </h1>
          <p className="text-slate-400 text-sm">
            {isWinner ? 'You conquered the Forest Valley.' : 'Keep exploring to earn rewards.'}
          </p>
        </div>

        {/* --- DYNAMIC CARD SECTION --- */}
        {isWinner ? (
          /* OPTION A: THE GOLDEN TICKET (Winner) */
          <div className="relative group perspective-1000 animate-[fadeIn_0.5s_ease-out]">
            {/* Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
            
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Ticket Top Bar */}
              <div className="bg-slate-900 text-amber-400 p-4 flex justify-between items-center">
                <span className="font-bold tracking-widest text-xs uppercase">Official Reward</span>
                <span className="text-xs font-mono opacity-80">{timestamp}</span>
              </div>

              {/* Ticket Content */}
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner border border-amber-200">
                  🎁
                </div>
                <h2 className="font-display text-2xl font-bold text-slate-800 mb-1 leading-tight">
                  Jewel Retail Voucher
                </h2>
                <p className="text-sm text-slate-500 mb-6">
                  Redeemable at L1 Concierge
                </p>

                {/* Dashed Cut Line */}
                <div className="border-t-2 border-dashed border-slate-300 my-4 relative">
                  <div className="absolute -left-8 -top-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 bg-slate-900 rounded-full"></div>
                </div>

                {/* Unique ID Box */}
                <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Validation Code</p>
                  <p className="font-mono text-2xl font-bold text-slate-900 tracking-wider">
                    {ticketID}
                  </p>
                </div>
              </div>

              {/* Ticket Bottom Bar */}
              <div className="bg-amber-400 p-3 text-center">
                <p className="text-xs font-bold text-amber-900 uppercase flex items-center justify-center gap-2">
                  <span>📸</span> Screenshot this screen
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* OPTION B: THE TRY AGAIN CARD (Loser) */
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center shadow-xl">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-white mb-2">You Scored {score}/4</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You need a perfect score to unlock the exclusive voucher. Don't worry, the forest is full of clues!
            </p>
            <button 
              onClick={handleRestart}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Try Again ↻
            </button>
          </div>
        )}

        {/* Footer Actions */}
        <div className="text-center pt-4">
          {isWinner && (
            <button 
              onClick={handleRestart}
              className="text-slate-500 hover:text-white text-sm transition-colors border-b border-transparent hover:border-slate-500 pb-0.5"
            >
              Start New Journey
            </button>
          )}
        </div>
      </div>
    </div>
  );
}