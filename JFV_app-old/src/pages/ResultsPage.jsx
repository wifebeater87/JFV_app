import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import { doc, getDoc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import voucherImg from '../assets/jewel-logo.png'; // Using logo as placeholder if voucher image missing

export default function ResultsPage() {
    const navigate = useNavigate();
    const [score, setScore] = useState(0);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [isUpdated, setIsUpdated] = useState(false);

    useEffect(() => {
        // 1. Get Score
        const currentScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
        setScore(currentScore);

        // 2. Mark Attempt as Done for Today
        localStorage.setItem('lastAttemptTimestamp', Date.now().toString());

        // 3. Update Firebase Leaderboard (Only once per page load)
        const updateLeaderboard = async () => {
            const nationCode = localStorage.getItem('userNation');
            const nationName = localStorage.getItem('userNationName');
            const nationFlag = localStorage.getItem('userNationFlag');

            if (nationCode && !isUpdated) {
                try {
                    const nationRef = doc(db, 'nations', nationCode);
                    const nationSnap = await getDoc(nationRef);

                    if (nationSnap.exists()) {
                        await updateDoc(nationRef, { score: increment(currentScore) });
                    } else {
                        await setDoc(nationRef, {
                            name: nationName,
                            flag: nationFlag,
                            score: currentScore
                        });
                    }
                    setIsUpdated(true);
                } catch (error) {
                    console.error("Error updating leaderboard:", error);
                }
            }
        };

        updateLeaderboard();

        // Window resize listener for Confetti
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isUpdated]);

    return (
        <div className="min-h-screen bg-[#14312b] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            
            {/* Confetti only if perfect score */}
            {score === 8 && <Confetti width={windowSize.width} height={windowSize.height} numberOfPieces={200} recycle={false} />}

            <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl p-8 shadow-2xl relative z-10 animate-[fadeIn_0.5s_ease-out]">
                
                {/* Score Badge */}
                <div className="w-24 h-24 bg-[#008272] rounded-full flex items-center justify-center mx-auto -mt-20 border-4 border-[#14312b] shadow-lg">
                    <span className="text-4xl font-bold text-white">{score}/8</span>
                </div>

                <h1 className="text-2xl font-display font-bold mt-6 mb-2 text-gray-800 dark:text-white">
                    {score === 8 ? "Congratulations!" : "Journey Complete!"}
                </h1>

                <p className="text-gray-500 mb-8">
                    {score === 8 
                        ? "You have mastered the Forest Valley trail and answered all questions correctly." 
                        : "You've explored the valley, but you need a perfect score to unlock the voucher."}
                </p>

                {/* VOUCHER SECTION */}
                {score === 8 ? (
                    <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-6 mb-8 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                            Reward Unlocked
                        </div>
                        <img src={voucherImg} alt="Voucher" className="h-16 mx-auto mb-4 object-contain opacity-80" />
                        <h3 className="text-lg font-bold text-gray-800">$5 Jewel Voucher</h3>
                        <p className="text-xs text-gray-500 mt-2">Show this screen to the concierge at L1.</p>
                        <p className="text-[10px] text-gray-400 mt-4">Expires: {new Date().toLocaleDateString()}</p>
                    </div>
                ) : (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
                        <span className="text-4xl block mb-2">🌱</span>
                        <p className="text-sm font-bold text-gray-400 uppercase">Try again tomorrow!</p>
                    </div>
                )}

                <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
                >
                    Back to Home
                </button>
            </div>
        </div>
    );
}