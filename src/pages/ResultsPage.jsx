import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { doc, addDoc, collection } from 'firebase/firestore'; 
import { db } from '../firebase';

export default function ResultsPage() {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const [ticketID, setTicketID] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [totalUserScore, setTotalUserScore] = useState(0);

  // Survey State
  const [showSurvey, setShowSurvey] = useState(false);
  const [surveyData, setSurveyData] = useState({ age: '', gender: '', feedback: '' });
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  useEffect(() => {
    // Get session score for the current quiz
    let savedScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
    if (savedScore > 4) savedScore = 4;
    setScore(savedScore);

    // Get total user score from localStorage
    const savedTotalScore = parseInt(localStorage.getItem('userScore') || '0');
    setTotalUserScore(savedTotalScore);

    const savedNation = localStorage.getItem('userNation') || 'TR';

    // Generate Ticket if Winner
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

    // Timer for Clock
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Resize Handler for Confetti
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);

    // --- SURVEY TIMER (6 Seconds) ---
    const surveyTimer = setTimeout(() => {
      if (!localStorage.getItem('surveyDone')) {
        setShowSurvey(true);
      }
    }, 6000); 

    return () => { 
      window.removeEventListener('resize', handleResize); 
      clearInterval(timer); 
      clearTimeout(surveyTimer);
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    setSurveySubmitted(true);
    localStorage.setItem('surveyDone', 'true');
    
    try {
      await addDoc(collection(db, "surveys"), {
        ...surveyData,
        timestamp: new Date()
      });
    } catch (err) {
      console.log("Survey saved locally only");
    }

    setTimeout(() => setShowSurvey(false), 2000);
  };

  const isWinner = score === 4;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Back Button */}
      <button onClick={handleBack} className="absolute top-6 left-6 z-20 p-2 text-gray-600 hover:text-[#008272] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>

      <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={400} gravity={0.15} />

      <div className="max-w-md w-full z-10 space-y-6 mt-12">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold mb-2 text-[#14312b]">
            Quest Complete!
          </h1>
          <p className="text-gray-500 leading-relaxed px-4 mb-4">
            You have conquered the Forest Valley (West). Why not challenge yourself with the Forest Valley Trail (East) next?
          </p>

          {/* ADDED TOTAL SCORE */}
          <div className="inline-block bg-[#008272]/10 px-4 py-2 rounded-full">
            <p className="text-[#008272] font-bold text-sm">
              Total Contribution: {totalUserScore} points
            </p>
          </div>
        </div>

        {isWinner ? (
          /* --- GOLDEN TICKET --- */
          <div className="relative group perspective-1000 animate-[fadeIn_0.5s_ease-out]">
            
            <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
              
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
            
            <p className="text-center text-sm text-gray-400 mt-6 italic relative z-10">
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
              onClick={() => { 
                // Reset session score but keep user score
                sessionStorage.setItem('sessionScore', '0');
                navigate('/'); 
              }}
              className="w-full py-3 bg-[#14312b] hover:bg-[#0f2621] text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg"
            >
              Try Again ↻
            </button>
          </div>
        )}

        {/* --- EXPLORE LINKS --- */}
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

      {/* --- SURVEY OVERLAY --- */}
      {showSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 relative animate-[slideUp_0.3s_ease-out]">
            
            <button 
              onClick={() => setShowSurvey(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold transition-colors"
            >
              ✕
            </button>

            {!surveySubmitted ? (
              <form onSubmit={handleSurveySubmit}>
                <div className="mb-6 text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-display font-bold text-xl text-[#14312b]">We Value Your Feedback</h3>
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Thank you for completing the trail. Please optionally fill out this survey to improve services at Changi Jewel Airport.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Age Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Age Group</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#008272] text-sm"
                      value={surveyData.age}
                      onChange={(e) => setSurveyData({...surveyData, age: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Age</option>
                      <option value="Under 18">Under 18</option>
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-54">45-54</option>
                      <option value="55-64">55-64</option>
                      <option value="65 and above">65 and above</option>
                    </select>
                  </div>

                  {/* Gender Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Gender</label>
                    <select 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#008272] text-sm"
                      value={surveyData.gender}
                      onChange={(e) => setSurveyData({...surveyData, gender: e.target.value})}
                      required
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>

                  {/* Feedback Textarea */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">Feedback & Recommendations</label>
                    <textarea 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#008272] text-sm h-24 resize-none"
                      placeholder="Share your thoughts..."
                      value={surveyData.feedback}
                      onChange={(e) => setSurveyData({...surveyData, feedback: e.target.value})}
                    ></textarea>
                  </div>

                  {/* ADDED DISCLAIMER */}
                  <p className="text-[10px] text-gray-400 text-center leading-tight px-2">
                    * All data is collected anonymously and in accordance with Singapore PDPA regulations.
                  </p>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#14312b] hover:bg-[#0f2621] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
                  >
                    Submit Survey
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-bounce">✅</div>
                <h3 className="font-bold text-xl text-[#14312b]">Thank You!</h3>
                <p className="text-gray-500 text-sm mt-2">Your feedback helps us create better experiences.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}