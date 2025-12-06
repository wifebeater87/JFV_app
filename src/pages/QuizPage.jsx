import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import questionsData from '../data/questions.json';
import MapModal from '../components/MapModal';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  
  // Find the specific question for this checkpoint
  const questionData = questionsData.find(q => q.id === currentId);

  // State Management
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); 
  const [userNation, setUserNation] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false); // Controls the Map Popup

  // Load User's Nation on mount
  useEffect(() => {
    const storedNation = localStorage.getItem('userNation');
    if (storedNation) setUserNation(storedNation);
  }, []);

  const handleOptionClick = async (option) => {
    if (selectedOption) return; // Prevent double clicking
    
    setSelectedOption(option);
    const correct = option === questionData.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      // 1. Update Global Leaderboard in Firebase
      if (userNation) {
        try {
          const nationRef = doc(db, 'nations', userNation);
          await updateDoc(nationRef, { score: increment(1) });
        } catch (error) { console.error("Firebase Error:", error); }
      }
      
      // 2. Update Local User Score (for the Golden Ticket)
      const currentScore = parseInt(localStorage.getItem('userScore') || '0');
      localStorage.setItem('userScore', currentScore + 1);
    }
  };

  const handleNext = () => {
    // Navigate to the Storyline page for this checkpoint
    navigate(`/story/${currentId}`);
  };

  if (!questionData) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col p-6 relative font-sans overflow-hidden">
      
      {/* Background Decor (Subtle Gradient Glow) */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-900/20 blur-3xl rounded-full pointer-events-none -translate-y-1/2"></div>

      {/* --- HEADER SECTION --- */}
      <div className="mb-6 pt-4 relative z-10">
        <div className="flex justify-between items-end mb-3">
          {/* Scavenger Hunt Label */}
          <div className="flex items-center gap-2">
            <span className="text-xl">🔭</span>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Field Challenge {currentId}/4</span>
          </div>
          {/* Progress % */}
          <span className="text-slate-500 font-display font-bold text-xl">{currentId * 25}%</span>
        </div>
        
        {/* Animated Progress Bar */}
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentId / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* --- QUESTION AREA --- */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full pb-20 relative z-10">
        
        {/* Map Button (Right Aligned) */}
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => setIsMapOpen(true)}
            className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-emerald-300 transition bg-emerald-900/30 px-3 py-1.5 rounded-full border border-emerald-500/30"
          >
            <span>📍</span> Show Location
          </button>
        </div>

        {/* Observation Prompt */}
        <div className="mb-6">
          <div className="inline-block bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 mb-4">
            <p className="text-slate-300 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <span>👁️</span> Observe your surroundings
            </p>
          </div>
          
          {/* The Question Title */}
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug text-white">
            {questionData.question.replace('Challenge: ', '')}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid gap-3">
          {questionData.options.map((option, index) => {
             const isSelected = selectedOption === option;
             const isRight = isSelected && isCorrect;
             const isWrong = isSelected && !isCorrect;
             
             // Dynamic Button Styling
             let buttonStyle = "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-500";
             
             if (isRight) buttonStyle = "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]";
             if (isWrong) buttonStyle = "bg-rose-600 border-rose-500 text-white";
             if (selectedOption && !isSelected && option === questionData.correctAnswer) buttonStyle = "bg-emerald-900/40 border-emerald-500/40 text-emerald-400 opacity-60";

             return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                className={`
                  relative w-full p-5 rounded-2xl text-left font-semibold text-lg border-2 transition-all duration-200 transform
                  ${selectedOption === null ? 'active:scale-95' : ''}
                  ${buttonStyle}
                `}
              >
                <div className="flex justify-between items-center">
                  <span>{option}</span>
                  {isRight && <span>✨</span>}
                  {isWrong && <span>❌</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- FEEDBACK POPUP (Appears after answering) --- */}
      {selectedOption && (
        <div className={`fixed inset-x-0 bottom-0 p-6 rounded-t-3xl shadow-2xl animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)] z-40
          ${isCorrect ? 'bg-emerald-50' : 'bg-rose-50'}
        `}>
          <div className="max-w-lg mx-auto">
            <h3 className={`font-display text-xl font-bold mb-1 ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
              {isCorrect ? 'Excellent work! 🎯' : 'Not quite right...'}
            </h3>
            <p className={`text-sm mb-4 ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isCorrect ? `You earned +1 point for ${userNation}.` : `The correct answer was: ${questionData.correctAnswer}`}
            </p>
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2
                ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 text-white'}`}
            >
              See Field Notes ➜
            </button>
          </div>
        </div>
      )}

      {/* --- MAP MODAL (Hidden by default) --- */}
      <MapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        currentCheckpoint={currentId} 
      />

    </div>
  );
}