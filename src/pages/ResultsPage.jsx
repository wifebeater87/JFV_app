import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore'; 
import { db } from '../firebase';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [totalUserScore, setTotalUserScore] = useState(0);
  const [ticketID, setTicketID] = useState('');
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  // Live Leaderboard Data
  const [nationData, setNationData] = useState(null);

  // Survey State
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ age: '', gender: '', feedback: '' });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  useEffect(() => {
    // Theme Sync
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 1. Get Session Score (capped at 4)
    let savedSessionScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
    if (savedSessionScore > 4) savedSessionScore = 4;
    setScore(savedSessionScore);

    // 2. Lock Attempt (Backup check)
    // If user arrived here, ensure lock is set if not already
    const existingLock = localStorage.getItem('lastAttemptTimestamp');
    const now = Date.now();
    if (!existingLock || (now - parseInt(existingLock) > 86400000)) {
        localStorage.setItem('lastAttemptTimestamp', now.toString());
    }

    // 3. Get Total Contribution (Lifetime)
    const savedTotalScore = parseInt(localStorage.getItem('userScore') || '0');
    setTotalUserScore(savedTotalScore);

    const savedNation = localStorage.getItem('userNation');
    const savedNationFlag = localStorage.getItem('userNationFlag');
    const savedNationName = localStorage.getItem('userNationName');

    // 4. Fetch Real-time Nation Data
    if (savedNation) {
        const fetchNation = async () => {
            try {
                const docRef = doc(db, "nations", savedNation);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setNationData(docSnap.data());
                } else {
                    setNationData({ name: savedNationName || 'Your Nation', flag: savedNationFlag || '🏳️', score: 0 });
                }
            } catch (err) {
                console.error("Error fetching nation data:", err);
                setNationData({ name: savedNationName || 'Your Nation', flag: savedNationFlag || '🏳️', score: '...' });
            }
        };
        fetchNation();
    } else {
        setNationData({ name: 'Your Nation', flag: '🏳️', score: 0 });
    }

    // 5. Ticket Generation
    if (savedSessionScore === 4) {
      const existingTicket = localStorage.getItem('dailyTicketID');
      
      if (existingTicket) {
        setTicketID(existingTicket);
      } else {
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const newID = `JWL-${savedNation ? savedNation.substring(0, 2).toUpperCase() : 'XX'}-${randomCode}`;
        setTicketID(newID);
        localStorage.setItem('dailyTicketID', newID);
      }
    }

    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    const surveyTimer = setTimeout(() => {
      if (!localStorage.getItem('surveyDone')) {
        setShowSurvey(true);
      }
    }, 6000); 

    return () => { 
      window.removeEventListener('resize', handleResize); 
      clearTimeout(surveyTimer);
    };
  }, []);

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setSurveySubmitted(true);
    localStorage.setItem('surveyDone', 'true');
    try {
      await addDoc(collection(db, "surveys"), { ...surveyData, timestamp: new Date() });
    } catch (err) { console.log("Survey saved locally"); }
    setTimeout(() => setShowSurvey(false), 2000);
  };

  const isWinner = score === 4;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans pb-32 transition-colors">
      
      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.15} />

      <div className="max-w-md w-full z-10 space-y-6 mt-8">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-2 text-[#14312b] dark:text-emerald-400">Quest Complete!</h1>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed px-4 mb-4">
            You have conquered the Forest Valley (West). Why not challenge yourself with the Forest Valley Trail (East) next?
          </p>

          {/* TOTAL CONTRIBUTION & LIVE STATS */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Contribution</p>
             <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border border-emerald-100 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{nationData ? nationData.flag : '🏳️'}</span>
                    <span className="font-bold text-[#14312b] dark:text-emerald-300">{nationData ? nationData.name : 'Loading...'}</span>
                </div>
                <div className="text-right">
                    <span className="block font-mono font-bold text-xl text-[#008272] dark:text-emerald-400">{nationData ? nationData.score : 0}</span>
                    <span className="text-[10px] text-gray-400 uppercase">Nation Total</span>
                </div>
             </div>
             <div className="mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">You added <b className="text-[#008272] dark:text-emerald-400">{score} pts</b> today!</span>
             </div>
          </div>
        </div>

        {isWinner ? (
          /* WINNER CARD - IMAGE BASED */
          <div className="relative group perspective-1000 animate-[fadeIn_0.5s_ease-out]">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-gray-700">
              
              {/* THE IMAGE VOUCHER */}
              <div className="relative w-full aspect-[2.5/1]">
                  <img 
                    src="/images/voucher.jpg" 
                    alt="Voucher Reward" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {e.target.style.display='none'; e.target.parentElement.classList.add('bg-gray-800');}}
                  />
                  
                  {/* OVERLAY CODE & DATE - UPDATED TO WHITE TEXT FOR TEAL BACKGROUND */}
                  <div className="absolute top-3 right-5 text-right">
                      <p className="text-[9px] font-bold text-white/80 uppercase tracking-wider shadow-sm">Validation Code</p>
                      <p className="font-mono text-xl font-bold text-white tracking-widest drop-shadow-md">{ticketID}</p>
                  </div>
                  <div className="absolute bottom-3 left-5">
                      <p className="text-[8px] font-bold text-white/80 uppercase tracking-wider shadow-sm">Valid Date</p>
                      <p className="font-bold text-xs text-white drop-shadow-sm">{new Date().toLocaleDateString()}</p>
                  </div>
              </div>

            </div>
            <p className="text-center text-sm text-gray-400 mt-6 italic relative z-10">📸 Tip: Take a screenshot to save this voucher!</p>
          </div>
        ) : (
          /* LOSE CARD */
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 text-center shadow-lg">
            <div className="text-4xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You Scored {score}/4</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">You need a perfect score to unlock the exclusive voucher.</p>
            <button onClick={() => { sessionStorage.setItem('sessionScore', '0'); navigate('/'); }} className="w-full py-3 bg-[#14312b] hover:bg-[#0f2621] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg">Back to Home ➜</button>
          </div>
        )}

        {/* EXPLORE LINKS */}
        <div className="flex flex-col gap-3 text-center pt-4 pb-2">
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">More to Explore</p>
           <a href="https://www.jewelchangiairport.com/en/dine.html" target="_blank" rel="noreferrer" className="block w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[#008272] dark:text-emerald-400 font-bold hover:border-[#008272] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm">Dining in Jewel 🍽️</a>
           <a href="https://www.jewelchangiairport.com/en/shop.html" target="_blank" rel="noreferrer" className="block w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[#008272] dark:text-emerald-400 font-bold hover:border-[#008272] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all shadow-sm">Shopping at Jewel 🛍️</a>
        </div>
      </div>
      
      {/* STATIC BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-20 flex justify-center pb-8">
        <button 
          onClick={() => navigate('/')}
          className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-[#008272] text-[#008272] dark:text-emerald-400 dark:border-emerald-400 rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-emerald-50 dark:hover:bg-gray-800"
        >
          Back to Home
        </button>
      </div>

      {/* SURVEY OVERLAY */}
      {showSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-[slideUp_0.3s_ease-out]">
            <button onClick={() => setShowSurvey(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 font-bold transition-colors">✕</button>
            {!surveySubmitted ? (
              <form onSubmit={handleSurveySubmit}>
                <div className="mb-6 text-center"><div className="text-2xl mb-2">📋</div><h3 className="font-display font-bold text-xl text-[#14312b] dark:text-white">We Value Your Feedback</h3><p className="text-gray-500 dark:text-gray-400 text-sm mt-2 leading-relaxed">Thank you for completing the trail. Please optionally fill out this survey to improve services at Changi Jewel Airport.</p></div>
                <div className="space-y-4">
                  <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Age Group</label><select className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-[#008272] text-sm dark:text-white" value={surveyData.age} onChange={(e) => setSurveyData({...surveyData, age: e.target.value})} required><option value="" disabled>Select Age</option><option value="Under 18">Under 18</option><option value="18-24">18-24</option><option value="25-34">25-34</option><option value="35-44">35-44</option><option value="45-54">45-54</option><option value="55-64">55-64</option><option value="65 and above">65 and above</option></select></div>
                  <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Gender</label><select className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-[#008272] text-sm dark:text-white" value={surveyData.gender} onChange={(e) => setSurveyData({...surveyData, gender: e.target.value})} required><option value="" disabled>Select Gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option><option value="Prefer not to say">Prefer not to say</option></select></div>
                  <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-1">Feedback & Recommendations</label><textarea className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-[#008272] text-sm h-24 resize-none dark:text-white" placeholder="Share your thoughts..." value={surveyData.feedback} onChange={(e) => setSurveyData({...surveyData, feedback: e.target.value})}></textarea></div>
                  <p className="text-[10px] text-gray-400 text-center leading-tight px-2">* All data is collected anonymously and in accordance with Singapore PDPA regulations.</p>
                  <button type="submit" className="w-full py-3 bg-[#14312b] hover:bg-[#0f2621] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Submit Survey</button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8"><div className="text-4xl mb-4 animate-bounce">✅</div><h3 className="font-bold text-xl text-[#14312b] dark:text-white">Thank You!</h3><p className="text-gray-500 text-sm mt-2">Your feedback helps us create better experiences.</p></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}