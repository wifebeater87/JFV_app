import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function Landing() {
  const navigate = useNavigate();
  const [nationality, setNationality] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleStart = () => {
    if (!nationality) return;
    
    // 1. Save the nation
    localStorage.setItem('userNation', nationality);
    
    // 2. CRITICAL FIX: Force reset the score to 0 for a new session
    localStorage.setItem('userScore', '0'); 
    
    // 3. Go to first checkpoint
    navigate('/quiz/1');
  };

  const userRank = leaderboard.findIndex(n => n.id === nationality);
  const isInTop3 = userRank !== -1 && userRank < 3;
  const userNationData = leaderboard[userRank];

  return (
    // Background with a deep green gradient
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-teal-900 text-white font-sans overflow-x-hidden">
      
      {/* Hero Section */}
      <div className="relative pt-12 pb-8 px-6">
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-green-100 uppercase tracking-wide">Live Crowd: Moderate</span>
        </div>

        <h1 className="font-display text-4xl font-extrabold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-200 to-white">
          Forest Valley
        </h1>
        <p className="text-green-200/80 text-lg font-light tracking-wide">Jewel Changi Airport</p>
      </div>

      {/* Glass Stats Row */}
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

      {/* Main Card (White Sheet) */}
      <div className="bg-white rounded-t-[2.5rem] min-h-screen px-6 py-8 text-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
        
        {/* Description */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-bold text-emerald-900 mb-2">Begin Your Journey</h2>
          <p className="text-gray-500 leading-relaxed text-sm">
            Explore one of the world's largest indoor gardens. Find the checkpoints, answer trivia, and represent your country on the global stage.
          </p>
        </div>

        {/* Form Area */}
        <div className="space-y-6">
          <div className="relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
              Select Nationality
            </label>
            <div className="relative">
              <select 
                className="w-full appearance-none bg-gray-50 border-2 border-gray-100 hover:border-emerald-500 focus:border-emerald-600 rounded-2xl p-4 text-lg font-bold text-gray-700 outline-none transition-all shadow-sm"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
              >
                <option value="">Select your team...</option>
                {leaderboard.map(n => (
                  <option key={n.id} value={n.id}>{n.flag} {n.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
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
                {/* User Row Highlight */}
                {nationality && !isInTop3 && userNationData && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
                        {userRank + 1}
                      </div>
                      <span className="font-bold text-emerald-900">You ({userNationData.name})</span>
                    </div>
                    <span className="font-display font-bold text-sm text-emerald-600">{userNationData.score}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sticky-feel Button */}
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
        
        {/* Extra padding for bottom scroll */}
        <div className="h-12"></div>
      </div>
    </div>
  );
}