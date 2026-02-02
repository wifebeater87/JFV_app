import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, doc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import countriesList from '../data/countries.json'; 
import jewelLogo from '../assets/jewel-logo.png';

// --- COUNTDOWN COMPONENT ---
function DailyCountdown() {
  const [timeLeft, setTimeLeft] = useState('--:--:--');

  useEffect(() => {
    const calculateTime = () => {
      const lastTimestamp = parseInt(localStorage.getItem('lastAttemptTimestamp') || '0');
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000; 
      const targetTime = lastTimestamp + cooldown;
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      
      setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    };

    const timer = setInterval(calculateTime, 1000);
    calculateTime();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-4 text-center animate-pulse">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Next Attempt In</p>
      <div className="font-mono text-3xl font-bold text-orange-500 tracking-wider">{timeLeft}</div>
    </div>
  );
}

// --- ODOMETER COMPONENT ---
function Odometer({ value }) {
  return (
    <div className="inline-block relative overflow-hidden h-[1.1em] align-middle">
      <div className="transition-transform duration-500 ease-out font-mono font-bold text-emerald-600 dark:text-emerald-400 leading-none" key={value}>
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
  const [hasDoneToday, setHasDoneToday] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  // Theme State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || null);
  const [showThemeVeil, setShowThemeVeil] = useState(!localStorage.getItem('theme'));

  // Dark Mode Logic
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (theme) localStorage.setItem('theme', theme);
  }, [theme]);

  const selectTheme = (selected) => {
    setTheme(selected);
    setShowThemeVeil(false);
  };

  // Real-time Crowd Counter
  useEffect(() => {
    const sessionId = sessionStorage.getItem('presenceId') || Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('presenceId', sessionId);
    const presenceRef = doc(db, 'presence', sessionId);

    const updatePresence = async () => {
      if (document.visibilityState === 'visible') {
        await setDoc(presenceRef, { timestamp: serverTimestamp(), page: 'landing' });
      }
    };

    updatePresence();
    const heartbeat = setInterval(updatePresence, 10000);
    const handleVisibility = () => { if (document.visibilityState === 'visible') updatePresence(); };
    document.addEventListener("visibilitychange", handleVisibility);

    const presenceCollection = collection(db, 'presence');
    const unsubscribeCount = onSnapshot(presenceCollection, (snapshot) => {
        const now = Date.now();
        const activeCount = snapshot.docs.filter(docItem => {
            const data = docItem.data();
            return data.timestamp && (now - data.timestamp.toMillis() < 30000);
        }).length;
        setActiveUsers(activeCount > 0 ? activeCount : 1);
    });

    const cleanup = () => { deleteDoc(presenceRef); };
    window.addEventListener('beforeunload', cleanup);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener('beforeunload', cleanup);
      unsubscribeCount();
      deleteDoc(presenceRef);
    };
  }, []);

  // Fetch Leaderboard
  useEffect(() => {
    try {
      const nationsRef = collection(db, 'nations');
      const q = query(nationsRef, orderBy('score', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const nationsData = snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() }));
        setLeaderboard(nationsData);
        setLoading(false);
      }, () => setLoading(false));
      return () => unsubscribe();
    } catch (err) { setLoading(false); }
  }, []);

  // Check Attempt Status
  useEffect(() => {
    const lastTimestamp = parseInt(localStorage.getItem('lastAttemptTimestamp') || '0');
    const now = Date.now();
    if (now - lastTimestamp < 24 * 60 * 60 * 1000) setHasDoneToday(true);
    else setHasDoneToday(false);
  }, []);

  const handleStart = () => {
    if (!nationality && !hasDoneToday) return;
    if (!hasDoneToday) {
        localStorage.setItem('userNation', nationality.code);
        localStorage.setItem('userNationName', nationality.name);
        localStorage.setItem('userNationFlag', nationality.flag);
        sessionStorage.setItem('sessionScore', '0');
        if (!localStorage.getItem('userScore')) localStorage.setItem('userScore', '0');
        [1, 2, 3, 4, 5, 6, 7, 8].forEach(id => {
            localStorage.removeItem(`quizState_${id}`);
            sessionStorage.removeItem(`scored_q_${id}`);
        });
    }
    // NAVIGATION START POINT: Quiz 1
    navigate('/quiz/1');
  };

  const filteredCountries = countriesList.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const safeLeaderboard = Array.isArray(leaderboard) ? leaderboard : [];
  const safeLeaderboardSlice = safeLeaderboard.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans overflow-x-hidden text-gray-800 dark:text-gray-100 transition-colors duration-300">
      
      {/* THEME VEIL */}
      {showThemeVeil && (
        <div className="fixed inset-0 z-[100] backdrop-grayscale bg-white/65 flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl scale-110 flex gap-8 items-center">
                <button onClick={() => selectTheme('light')} className="flex flex-col items-center gap-3 group">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-yellow-400 hover:bg-yellow-50 transition-all">
                        {/* Custom Sun Icon SVG */}
                        <svg className="w-12 h-12 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="5" />
                          <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 0l2.12-2.12M4.93 19.07l2.12-2.12m9.9 0l2.12 2.12" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Light Mode</span>
                </button>
                <button onClick={() => selectTheme('dark')} className="flex flex-col items-center gap-3 group">
                    <div className="w-20 h-20 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                        {/* Custom Moon Icon SVG */}
                        <svg className="w-12 h-12 text-gray-400 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M16.5 12A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 0 4.5 4.5z" />
                        </svg>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Dark Mode</span>
                </button>
            </div>
        </div>
      )}

      {/* --- HEADER WITH CUSTOM WAVE --- */}
      <div className="relative bg-[#14312b] dark:bg-[#0a1f1b] pt-10 px-6 transition-colors">
        
        {/* Title */}
        <div className="flex flex-col items-start mb-8 pl-1">
           <img src={jewelLogo} alt="Jewel Changi Airport" className="h-20 object-contain mb-4 -ml-2" />
            <h1 className="font-display text-4xl font-bold mb-1 shadow-sm text-left leading-tight text-white">The Forest Valley Trail</h1>
            <p className="text-white text-lg font-medium tracking-wide text-left">Jewel Changi Airport</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 relative z-10 pb-20">
          {[{ label: 'EST. TIME REQUIRED', value: '12~15 min', icon: '⏱️' }, { label: 'TRAIL LENGTH', value: '160 m', icon: '👣' }, { label: 'ELEVATION GAINED', value: '30 m', icon: '⛰️' }].map((stat, i) => (
            <div key={i} className="bg-[#0f4c3a] dark:bg-[#082e23] rounded-2xl p-3 text-center shadow-md border border-[#1a6b54]">
              <div className="text-xl mb-1">{stat.icon}</div>
              <div className="font-display font-bold text-lg text-white leading-tight">{stat.value}</div>
              <div className="text-[9px] text-emerald-200 font-bold tracking-wider leading-tight mt-2">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* --- CUSTOM WAVE SVG --- */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none z-0">
            <svg 
                className="relative block w-full h-[80px] md:h-[120px]" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 1200 120" 
                preserveAspectRatio="none"
            >
                {/* 1. Lighter Green Underlay (The Green Mark) */}
                <path 
                    d="M0,0 C200,80 400,100 600,80 C800,60 1000,20 1200,0 V120 H0 Z" 
                    className="fill-[#205a4e] dark:fill-[#15423a]"
                ></path>
                
                {/* 2. Main Page Background Overlay (The "Cut") - Creates the Blue Mark Shape */}
                <path 
                    d="M0,20 C250,90 500,110 700,90 C950,65 1100,20 1200,10 V120 H0 Z" 
                    className="fill-gray-50 dark:fill-gray-900"
                ></path>
            </svg>
        </div>
      </div>

      {/* --- BODY CONTENT --- */}
      <div className="px-6 pb-8 pt-6">
        <div className="mb-8 text-center">
            <h2 className="font-display text-xl font-bold text-[#008272] dark:text-emerald-400 mb-3 px-2 leading-tight">Instagram-worthy Pictures and Attractive Vouchers Await You!</h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 max-w-md mx-auto">Embark on a short, self-guided journey through Jewel Changi Airport’s Forest Valley Trail. Contend with other nations by answering quiz questions and stand a chance to win exciting vouchers!</p>
            <div className="bg-orange-50/50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-xl p-4 max-w-md mx-auto">
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-snug text-left">
                  <span className="text-red-500 font-bold mr-1">*</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-300">Please note:</span> Each person is limited to one quiz attempt and one voucher redemption per day.
                </p>
            </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 mb-2 animate-[fadeIn_1s_ease-out]">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div className="text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
              <span className="font-bold text-emerald-600 text-xl leading-none"><Odometer value={activeUsers} /></span>
              <span className="text-sm font-bold relative -top-[2px]">Explorers on the trail</span>
            </div>
          </div>

          {!hasDoneToday ? (
            <button onClick={() => setIsModalOpen(true)} className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#008272] rounded-xl p-4 flex items-center justify-between transition-all shadow-sm group">
              {nationality ? (
                <span className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-3"><span className="text-2xl">{nationality.flag}</span>{nationality.name}</span>
              ) : (
                <span className="text-base font-medium text-gray-400">Tap to select nationality <span className="text-red-500">*</span></span>
              )}
              <span className="text-gray-300 group-hover:text-[#008272]">▼</span>
            </button>
          ) : (
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-center border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">You have completed your daily attempt.</p>
                <DailyCountdown />
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm transition-colors">
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Top Nations</span>
              <span className="text-xs font-bold text-[#008272] dark:text-emerald-400">Live Updates</span>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex justify-between items-center"><div className="flex items-center gap-3"><div className="w-6 h-6 bg-gray-100 dark:bg-gray-700 rounded-full animate-pulse"></div><div className="w-20 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div></div><div className="w-8 h-4 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div></div>
                ))
              ) : safeLeaderboardSlice.length > 0 ? (
                safeLeaderboardSlice.map((nation, idx) => (
                  <div key={nation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border 
                        ${idx === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400' : 
                          idx === 1 ? 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-300' : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-400'}`}>
                        {idx + 1}
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">{nation.flag} {nation.name}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-gray-400">{nation.score}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6"><span className="text-3xl block mb-2">🌍</span><p className="text-gray-400 text-sm italic font-medium">No active nations yet.</p></div>
              )}
            </div>
          </div>

          <button onClick={handleStart} disabled={!hasDoneToday && !nationality} className={`w-full py-4 rounded-xl font-display font-bold text-lg shadow-lg transition-all transform active:scale-95 ${(!hasDoneToday && !nationality) ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed shadow-none' : hasDoneToday ? 'bg-white border-2 border-[#008272] text-[#008272] hover:bg-emerald-50' : 'bg-[#008272] text-white hover:bg-[#006e61] shadow-emerald-900/10'}`}>
            {hasDoneToday ? 'Review My Journey ➜' : 'Start Journey'}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] bg-white dark:bg-gray-900 flex flex-col animate-[slideUp_0.3s_ease-out]">
          <div className="pt-12 pb-4 px-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4">
            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold">✕</button>
            <input autoFocus type="text" placeholder="Search country..." className="w-full text-lg font-bold text-gray-800 dark:text-white bg-transparent placeholder-gray-300 outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {filteredCountries.map((country) => (
              <button key={country.code} onClick={() => { setNationality(country); setIsModalOpen(false); setSearchQuery(''); }} className="w-full p-4 rounded-xl flex items-center gap-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left group">
                <span className="text-3xl">{country.flag}</span>
                <span className="text-base font-bold text-gray-600 dark:text-gray-300 group-hover:text-[#008272] dark:group-hover:text-emerald-400">{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}