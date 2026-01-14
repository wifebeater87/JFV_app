import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { db } from '../firebase';
import countriesList from '../data/countries.json'; 
import jewelLogo from '../assets/jewel-logo.png';

// --- ODOMETER COMPONENT ---
function Odometer({ value }) {
  return (
    <div className="inline-block relative overflow-hidden h-[1.1em]">
      <div 
        className="transition-transform duration-500 ease-out font-mono font-bold text-emerald-600 leading-none"
        key={value} 
      >
        {value}
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  
  const [nationality, setNationality] = useState(null); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasWonToday, setHasWonToday] = useState(false);
  
  // Active User Simulation
  const [activeUsers, setActiveUsers] = useState(134);

  // --- FETCH DATA ---
  useEffect(() => {
    try {
      const nationsRef = collection(db, 'nations');
      const q = query(nationsRef, orderBy('score', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const nationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaderboard(nationsData);
        setLoading(false);
      }, (error) => {
        console.error("Firebase Snapshot Error:", error);
        setLoading(false); 
      });
      
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Init Error:", err);
      setLoading(false);
    }
  }, []);

  // --- CHECK DAILY WIN ---
  useEffect(() => {
    const lastWinDate = localStorage.getItem('lastWinDate');
    const today = new Date().toDateString(); 
    if (lastWinDate === today) setHasWonToday(true);
  }, []);

  // --- SIMULATE LIVE TRAFFIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      const change = Math.floor(Math.random() * 5) - 2; 
      setActiveUsers(prev => prev + change);
    }, 4500); 
    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    if (!nationality) return;

    // 1. Save User Details
    localStorage.setItem('userNation', nationality.code);
    localStorage.setItem('userNationName', nationality.name);
    localStorage.setItem('userNationFlag', nationality.flag);
    
    // 2. Reset Session Score
    sessionStorage.setItem('sessionScore', '0');
    if (!localStorage.getItem('userScore')) {
        localStorage.setItem('userScore', '0');
    }

    // 3. CLEAR PREVIOUS QUIZ ANSWERS
    [1, 2, 3, 4].forEach(id => {
        localStorage.removeItem(`quizState_${id}`);
        sessionStorage.removeItem(`scored_q_${id}`);
    });

    // 4. Navigate
    setActiveUsers(prev => prev + 1);
    navigate('/quiz/1');
  };

  const filteredCountries = countriesList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const userRank = nationality ? safeLeaderboard.findIndex(n => n.id === nationality.code) : -1;
  const isInTop3 = userRank !== -1 && userRank < 3;
  const userNationData = safeLeaderboard[userRank];

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden text-gray-800">
      
      {/* --- JEWEL HEADER --- */}
      <div className="bg-[#14312b] pt-10 pb-12 px-6 shadow-lg rounded-b-[2.5rem] relative overflow-hidden z-10">
        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm z-20">
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">Crowd: Moderate</span>
        </div>

        <div className="flex flex-col items-start mb-8 pl-1">
           <img 
             src={jewelLogo} 
             alt="Jewel Changi Airport" 
             className="h-20 object-contain mb-4 -ml-2" 
           />
            <h1 className="font-display text-4xl font-bold mb-1 shadow-sm text-left leading-tight text-white">
              The Forest Valley Trail
            </h1>
            <p className="text-white text-lg font-medium tracking-wide text-left">
              Jewel Changi Airport
            </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'EST. TIME REQUIRED', value: '30 min', icon: '⏱️' },
            { label: 'TRAIL LENGTH', value: '350 m', icon: '👣' }, 
            { label: 'ELEVATION GAINED', value: '28 m', icon: '⛰️' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0f4c3a] rounded-2xl p-3 text-center shadow-md border border-[#1a6b54]">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="font-display font-bold text-lg text-white">{stat.value}</div>
              <div className="text-[9px] text-emerald-200 font-bold tracking-wider leading-tight mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT BODY --- */}
      <div className="px-6 py-8 -mt-2">
        
        <div className="mb-8 text-center">
            <h2 className="font-display text-xl font-bold text-[#008272] mb-3 px-2 leading-tight">
              Instagram-worthy Pictures and Attractive Vouchers Await You!
            </h2>
            
            <p className="text-gray-600 text-base leading-relaxed mb-6 max-w-md mx-auto">
                Embark on a short, self-guided journey through Jewel Changi Airport’s Forest Valley Trail. Contend with other nations by answering quiz questions and stand a chance to win exciting vouchers!
            </p>
              
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-[13px] text-gray-500 leading-snug text-left">
                  <span className="text-red-500 font-bold mr-1">*</span>
                  <span className="font-semibold text-gray-600">Please note:</span> Each person is limited to one quiz attempt and one voucher redemption per day. Voucher redemption is only available upon completing the trail and achieving a perfect score.
                </p>
            </div>
        </div>

        <div className="space-y-4">
          
          {!hasWonToday && (
            <div className="flex items-center justify-center gap-3 mb-2 animate-[fadeIn_1s_ease-out]">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              
              <div className="text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                <span className="font-bold text-emerald-600 text-xl leading-none">
                  <Odometer value={activeUsers} />
                </span>
                
                <span className="text-sm font-bold relative -top-[2px]">
                  Explorers on the trail
                </span>
              </div>
            </div>
          )}

          {!hasWonToday && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-white border border-gray-200 hover:border-[#008272] rounded-xl p-4 flex items-center justify-between transition-all shadow-sm group"
            >
              {nationality ? (
                <span className="text-base font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-2xl">{nationality.flag}</span>
                  {nationality.name}
                </span>
              ) : (
                <span className="text-base font-medium text-gray-400">
                  Tap to select nationality <span className="text-red-500">*</span>
                </span>
              )}
              <span className="text-gray-300 group-hover:text-[#008272]">▼</span>
            </button>
          )}

          {/* LEADERBOARD */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Top Nations</span>
              <span className="text-xs font-bold text-[#008272]">Live Updates</span>
            </div>
            
            <div className="p-4 space-y-3">
              {loading ? (
                // Skeletons
                [1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse"></div><div className="w-20 h-4 bg-gray-100 rounded animate-pulse"></div></div>
                    <div className="w-8 h-4 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))
              ) : safeLeaderboard.length > 0 ? (
                safeLeaderboard.slice(0, 3).map((nation, idx) => (
                  <div key={nation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border 
                        ${idx === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                          idx === 1 ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                        {idx + 1}
                      </div>
                      <span className="font-bold text-gray-700 text-sm">{nation.flag} {nation.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-gray-400">{nation.score}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <span className="text-3xl block mb-2">🌍</span>
                  <p className="text-gray-400 text-sm italic font-medium">
                    No active nations yet.<br/>Be the first to join the leaderboard!
                  </p>
                </div>
              )}
              
              {!loading && nationality && !isInTop3 && userNationData && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between animate-[fadeIn_0.5s_ease-out]">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center text-xs font-bold">
                        {userRank + 1}
                      </div>
                      <span className="font-bold text-[#008272] text-sm">You ({userNationData.name})</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#008272]">{userNationData.score}</span>
                </div>
              )}
            </div>
          </div>

          {hasWonToday ? (
             <button 
               onClick={() => navigate('/results')}
               className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-xl font-display font-bold text-lg shadow-lg shadow-amber-500/30 transition-all active:scale-95"
             >
               View My Ticket 🎟️
             </button>
          ) : (
            <button 
              onClick={handleStart}
              disabled={!nationality}
              className={`w-full py-4 rounded-xl font-display font-bold text-lg shadow-lg transition-all transform active:scale-95
                ${nationality 
                  ? 'bg-[#008272] text-white hover:bg-[#006e61] shadow-emerald-900/10' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
            >
              Start Journey
            </button>
          )}
        </div>
      </div>

      {/* --- SEARCH MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-[slideUp_0.3s_ease-out]">
          <div className="pt-12 pb-4 px-4 border-b border-gray-100 flex items-center gap-4">
            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 font-bold">✕</button>
            <input 
              autoFocus
              type="text" 
              placeholder="Search country..." 
              className="w-full text-lg font-bold text-gray-800 placeholder-gray-300 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => { setNationality(country); setIsModalOpen(false); setSearchQuery(''); }}
                className="w-full p-4 rounded-xl flex items-center gap-4 hover:bg-emerald-50 transition-colors text-left group"
              >
                <span className="text-3xl">{country.flag}</span>
                <span className="text-base font-bold text-gray-600 group-hover:text-[#008272]">{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}