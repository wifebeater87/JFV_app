import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import countriesList from '../data/countries.json'; // Load the full list

export default function Landing() {
  const navigate = useNavigate();
  
  // State for Selection
  const [nationality, setNationality] = useState(null); // Stores the full object {code, name, flag}
  
  // State for Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  
  // State for Search Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch real-time leaderboard
  useEffect(() => {
    const nationsRef = collection(db, 'nations');
    const q = query(nationsRef, orderBy('score', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const nationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeaderboard(nationsData);
    });
    return () => unsubscribe();
  }, []);

  const handleStart = () => {
    if (!nationality) return;
    
    // Save the full nation details so we can create it in DB later if needed
    localStorage.setItem('userNation', nationality.code);
    localStorage.setItem('userNationName', nationality.name);
    localStorage.setItem('userNationFlag', nationality.flag);
    
    // Reset Score & Start
    localStorage.setItem('userScore', '0'); 
    navigate('/quiz/1');
  };

  // Filter countries based on search
  const filteredCountries = countriesList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-teal-900 text-white font-sans overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="relative pt-12 pb-6 px-6">
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2 z-20">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-semibold text-green-100 uppercase tracking-wide">Crowd: Moderate</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-white leading-tight">
          Forest Valley
        </h1>
        <p className="text-green-200/80 text-lg md:text-xl font-light tracking-wide">Jewel Changi Airport</p>
      </div>

      {/* Stats Row */}
      <div className="flex justify-between gap-3 px-6 mb-8">
        {[
          { label: 'Time', value: '30 min', icon: '⏱️' },
          { label: 'Distance', value: '1.2 km', icon: '👣' },
          { label: 'Elevation', value: '15 m', icon: '⛰️' }
        ].map((stat, i) => (
          <div key={i} className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-center shadow-lg">
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="font-display font-bold text-lg">{stat.value}</div>
            <div className="text-xs text-green-200/70 uppercase font-semibold">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Interactive Card */}
      <div className="bg-white rounded-t-[2.5rem] min-h-screen px-6 py-8 text-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-emerald-900 mb-2">Begin Your Journey</h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            Explore one of the world's largest indoor gardens. Find the checkpoints and represent your country.
          </p>
        </div>

        <div className="space-y-6">
          {/* Custom Searchable Select Button */}
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Select Nationality
            </label>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-gray-50 border-2 border-gray-100 hover:border-emerald-500 rounded-2xl p-4 text-left flex items-center justify-between transition-all group"
            >
              {nationality ? (
                <span className="text-lg font-bold text-gray-900 flex items-center gap-3">
                  <span className="text-2xl">{nationality.flag}</span>
                  {nationality.name}
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-400">Tap to search...</span>
              )}
              <span className="text-gray-400 group-hover:text-emerald-500">▼</span>
            </button>
          </div>

          {/* Compact Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-end mb-3 px-1">
                <span className="text-xs font-bold text-gray-400 uppercase">Top Nations</span>
                <span className="text-xs font-bold text-emerald-600">Live Updates</span>
              </div>
              <div className="space-y-3">
                {leaderboard.slice(0, 3).map((nation, idx) => (
                  <div key={nation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold 
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          idx === 1 ? 'bg-gray-200 text-gray-600' : 'bg-orange-100 text-orange-700'}`}>
                        {idx + 1}
                      </div>
                      <span className="font-bold text-gray-700">{nation.flag} {nation.name}</span>
                    </div>
                    <span className="font-display font-bold text-sm text-gray-400">{nation.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Start Button */}
          <button 
            onClick={handleStart}
            disabled={!nationality}
            className={`w-full py-4 rounded-2xl font-display font-bold text-lg shadow-xl shadow-emerald-500/20 transition-all transform active:scale-95
              ${nationality 
                ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Enter the Valley
          </button>
        </div>
        
        <div className="h-12"></div>
      </div>

      {/* --- SEARCH MODAL POPUP --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-[slideUp_0.3s_ease-out]">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-4 shadow-sm">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 font-bold"
            >
              ✕
            </button>
            <div className="flex-1">
              <input 
                autoFocus
                type="text" 
                placeholder="Search country..." 
                className="w-full text-lg font-bold text-gray-800 placeholder-gray-400 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Country List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredCountries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setNationality(country);
                  setIsModalOpen(false);
                  setSearchQuery('');
                }}
                className="w-full p-4 rounded-xl flex items-center gap-4 hover:bg-emerald-50 transition-colors text-left"
              >
                <span className="text-3xl">{country.flag}</span>
                <span className="text-lg font-bold text-gray-700">{country.name}</span>
              </button>
            ))}
            
            {filteredCountries.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                No countries found.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}