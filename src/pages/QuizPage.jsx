import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, increment, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import questionsData from '../data/questions.json';
import MapModal from '../components/MapModal';
import Skeleton from '../components/Skeleton'; 

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const questionData = questionsData.find(q => q.id === currentId);

  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null); 
  const [userNation, setUserNation] = useState('');
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const storedNation = localStorage.getItem('userNation');
    if (storedNation) setUserNation(storedNation);
  }, []);

  const handleOptionClick = async (option) => {
    if (selectedOption) return;
    
    setSelectedOption(option);
    const correct = option === questionData.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      if (userNation) {
        try {
          const nationRef = doc(db, 'nations', userNation);
          const nationName = localStorage.getItem('userNationName') || userNation;
          const nationFlag = localStorage.getItem('userNationFlag') || '🏳️';
          await setDoc(nationRef, { 
            score: increment(1),
            name: nationName,
            flag: nationFlag
          }, { merge: true });
        } catch (error) { console.error("Firebase Error:", error); }
      }
      const currentScore = parseInt(localStorage.getItem('userScore') || '0');
      localStorage.setItem('userScore', currentScore + 1);
    }
  };

  const handleNext = () => {
    navigate(`/story/${currentId}`);
  };

  // --- SKELETON LOADING ---
  if (!questionData) return (
    <div className="min-h-screen bg-jewel-light flex flex-col p-6 relative">
      <div className="mb-6 pt-4">
         <div className="flex justify-between items-end mb-3">
            <Skeleton className="w-32 h-6 bg-gray-200" />
            <Skeleton className="w-10 h-6 bg-gray-200" />
         </div>
         <Skeleton className="w-full h-2 rounded-full bg-gray-200" />
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full pb-20">
         <Skeleton className="w-24 h-6 mb-4 bg-gray-200" /> 
         <Skeleton className="w-full h-10 mb-2 bg-gray-200" /> 
         <Skeleton className="w-3/4 h-10 mb-8 bg-gray-200" /> 
         <div className="grid gap-3">
           {[1, 2, 3, 4].map(i => (
             <Skeleton key={i} className="w-full h-16 rounded-2xl bg-gray-200" />
           ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-jewel-light text-gray-800 flex flex-col p-6 relative font-sans overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-jewel-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="mb-8 pt-4 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔭</span>
            <span className="text-jewel-500 text-xs font-bold uppercase tracking-widest">Field Challenge {currentId}/4</span>
          </div>
          <span className="text-jewel-900 font-display font-bold text-xl">{currentId * 25}%</span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-jewel-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentId / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full pb-20 relative z-10">
        
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => setIsMapOpen(true)}
            className="text-jewel-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1 hover:text-jewel-800 transition bg-white px-3 py-1.5 rounded-full border border-jewel-100 shadow-sm"
          >
            <span>📍</span> Show Location
          </button>
        </div>

        <div className="mb-6">
          <div className="inline-block bg-jewel-50 border border-jewel-100 rounded-lg px-3 py-1 mb-4">
            <p className="text-jewel-900 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <span>👁️</span> Observe your surroundings
            </p>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-jewel-900">
            {questionData.question.replace('Challenge: ', '')}
          </h2>
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {questionData.options.map((option, index) => {
             const isSelected = selectedOption === option;
             const isRight = isSelected && isCorrect;
             const isWrong = isSelected && !isCorrect;
             
             // Light Theme Button Styles
             let buttonStyle = "bg-white border-gray-200 text-gray-700 hover:border-jewel-500 hover:text-jewel-900 shadow-sm";
             
             if (isRight) buttonStyle = "bg-jewel-50 border-jewel-500 text-jewel-900 ring-1 ring-jewel-500";
             if (isWrong) buttonStyle = "bg-red-50 border-red-200 text-red-700";
             if (selectedOption && !isSelected && option === questionData.correctAnswer) buttonStyle = "bg-emerald-50 border-emerald-200 text-emerald-700";

             return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
                className={`
                  relative w-full p-5 rounded-xl text-left font-bold text-lg border-2 transition-all duration-200 transform
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

      {/* --- FEEDBACK POPUP --- */}
      {selectedOption && (
        <div className={`fixed inset-x-0 bottom-0 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-[slideUp_0.3s_ease-out] z-40 bg-white`}>
          <div className="max-w-lg mx-auto">
            <h3 className={`font-display text-xl font-bold mb-1 ${isCorrect ? 'text-jewel-900' : 'text-red-600'}`}>
              {isCorrect ? 'Excellent work! 🎯' : 'Not quite right...'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {isCorrect ? `You earned +1 point for ${userNation}.` : `The correct answer was: ${questionData.correctAnswer}`}
            </p>
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2
                ${isCorrect ? 'bg-jewel-900 text-white' : 'bg-gray-800 text-white'}`}
            >
              See Field Notes ➜
            </button>
          </div>
        </div>
      )}

      <MapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} currentCheckpoint={currentId} />
    </div>
  );
}