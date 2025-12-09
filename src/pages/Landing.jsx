import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import countriesList from '../data/countries.json'; 
import jewelLogo from '../assets/jewel-logo-final.png';

export default function Landing() {
  const navigate = useNavigate();
  
  const [nationality, setNationality] = useState(null); 
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasWonToday, setHasWonToday] = useState(false);

  // --- FETCH DATA ---
  useEffect(() => {
    const nationsRef = collection(db, 'nations');
    const q = query(nationsRef, orderBy('score', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(nationsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- CHECK DAILY WIN ---
  useEffect(() => {
    const lastWinDate = localStorage.getItem('lastWinDate');
    const today = new Date().toDateString(); 
    if (lastWinDate === today) setHasWonToday(true);
  }, []);

  const handleStart = () => {
    if (!nationality) return;
    localStorage.setItem('userNation', nationality.code);
    localStorage.setItem('userNationName', nationality.name);
    localStorage.setItem('userNationFlag', nationality.flag);
    localStorage.setItem('userScore', '0'); 
    navigate('/quiz/1');
  };

  const filteredCountries = countriesList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const userRank = nationality ? leaderboard.findIndex(n => n.id === nationality.code) : -1;
  const isInTop3 = userRank !== -1 && userRank < 3;
  const userNationData = leaderboard[userRank];

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden text-gray-800">
      
      {/* --- JEWEL HEADER --- */}
      <div className="bg-[#14312b] pt-10 pb-12 px-6 shadow-lg rounded-b-[2.5rem] relative overflow-hidden z-10">
        
        {/* CROWD METER */}
        <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-2 shadow-sm z-20">
          <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse shadow-[0_0_8px_rgba(110,231,183,0.8)]"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-wide">Crowd: Moderate</span>
        </div>

        {/* LEFT ALIGNED CONTENT CONTAINER */}
        <div className="flex flex-col items-start mb-8 pl-1">
           {/* LOGO */}
           <img 
             src={jewelLogo} 
             alt="Jewel Changi Airport" 
             className="h-20 object-contain mb-4 -ml-2" 
           />
           
           {/* TITLE & SUBTITLE */}
            <h1 className="font-display text-4xl font-bold mb-1 shadow-sm text-left leading-tight text-white">
              The Forest Valley Trail
            </h1>
            <p className="text-white text-lg font-medium tracking-wide text-left">
              Jewel Changi Airport
            </p>
        </div>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'EST. TIME REQUIRED', value: '30 min', icon: '⏱️' },
            { label: 'TRAIL LENGTH', value: '350 m', icon: '👣' }, // Changed to 350 m
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
        
        {/* Intro Text */}
        <div className="mb-8 text-center">
            <h2 className="font-display text-xl font-bold text-[#008272] mb-3">Begin Your Journey</h2>
            
            {/* UPDATED BODY TEXT */}
            <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto">
                Embark on a short, self-guided journey through Jewel Changi Airport’s Forest Valley Trail. Compete with other nations by answering quiz questions and stand a chance to win exciting vouchers!
                <span className="block mt-2 text-xs text-gray-400 italic">
                  *Limited to one attempt per device
                </span>
            </p>
        </div>

        <div className="space-y-4">
          {/* Nationality Picker */}
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
                <span className="text-base font-medium text-gray-400">Tap to select nationality...</span>
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
                // SKELETONS
                [1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><div className="w-6 h-6 bg-gray-100 rounded-full animate-pulse"></div><div className="w-20 h-4 bg-gray-100 rounded animate-pulse"></div></div>
                    <div className="w-8 h-4 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                ))
              ) : (
                leaderboard.slice(0, 3).map((nation, idx) => (
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
              )}
              
              {/* User Highlight */}
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

          {/* Start / View Ticket Button */}
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