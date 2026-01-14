import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, increment, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import questionsData from '../data/questions.json';
import Skeleton from '../components/Skeleton'; 
import { PassportStamp } from '../components/Transitions'; 

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const questionData = questionsData.find(q => q.id === currentId);

  // State
  const [selectedOptions, setSelectedOptions] = useState([]); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); 
  const [userNation, setUserNation] = useState('');
  const [userNationName, setUserNationName] = useState('your nation');
  const [showHint, setShowHint] = useState(false);
  
  // Transition State
  const [showPassport, setShowPassport] = useState(false);

  const isMultiSelect = currentId === 4; 

  useEffect(() => {
    const storedNation = localStorage.getItem('userNation');
    const storedNationName = localStorage.getItem('userNationName');
    if (storedNation) setUserNation(storedNation);
    if (storedNationName) setUserNationName(storedNationName);

    // Restore state
    const savedState = localStorage.getItem(`quizState_${currentId}`);
    if (savedState) {
      const { selectedOptions: savedOptions, isCorrect: savedIsCorrect } = JSON.parse(savedState);
      setSelectedOptions(savedOptions);
      setIsCorrect(savedIsCorrect);
      setIsSubmitted(true);
    }
  }, [currentId]);

  // --- LOGIC ---
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const handleOptionClick = (option) => {
    if (isSubmitted) return; 
    if (isMultiSelect) {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option));
      } else {
        if (selectedOptions.length < 4) setSelectedOptions([...selectedOptions, option]);
      }
    } else {
      submitAnswer([option]);
    }
  };

  const submitAnswer = async (finalSelection) => {
    setSelectedOptions(finalSelection);
    setIsSubmitted(true);

    let correct = false;
    const correctAnswers = questionData.correctAnswer;

    if (isMultiSelect) {
      correct = Array.isArray(correctAnswers) 
        ? arraysEqual(finalSelection, correctAnswers)
        : false;
    } else {
      if (Array.isArray(correctAnswers)) {
        correct = correctAnswers.includes(finalSelection[0]);
      } else {
        correct = finalSelection[0] === correctAnswers;
      }
    }

    setIsCorrect(correct);
    localStorage.setItem(`quizState_${currentId}`, JSON.stringify({ selectedOptions: finalSelection, isCorrect: correct }));

    const hasScoredKey = `scored_q_${currentId}`;
    if (correct && !sessionStorage.getItem(hasScoredKey)) {
        sessionStorage.setItem(hasScoredKey, 'true');
        const currentSessionScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
        sessionStorage.setItem('sessionScore', currentSessionScore + 1);
        const totalScore = parseInt(localStorage.getItem('userScore') || '0');
        localStorage.setItem('userScore', totalScore + 1);

        if (userNation) {
            try {
                const nationRef = doc(db, 'nations', userNation);
                const nationFlag = localStorage.getItem('userNationFlag') || '🏳️';
                await setDoc(nationRef, { score: increment(1), name: userNationName, flag: nationFlag }, { merge: true });
            } catch (error) { console.error("Firebase Error:", error); }
        }
    }
  };

  const handleNext = () => {
    if (isCorrect) {
      setShowPassport(true); // Trigger animation
    } else {
      navigate(`/story/${currentId}`); // Skip animation if wrong
    }
  };

  const onPassportDone = () => {
    setShowPassport(false);
    navigate(`/story/${currentId}`);
  };

  const isOptionCorrect = (option) => {
    const correctAnswers = questionData.correctAnswer;
    if (Array.isArray(correctAnswers)) {
      return correctAnswers.includes(option);
    }
    return option === correctAnswers;
  };

  // Helper to get display text for correct answer based on ID
  const getCorrectAnswerDisplay = () => {
    if (currentId === 3) return "2 and 3";
    if (currentId === 4) return "Option 2 and 4"; // Hardcoded description for the long text options
    return questionData.correctAnswer;
  };

  if (!questionData) return <Skeleton className="w-full h-screen" />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col p-6 relative font-sans">
      
      {/* ANIMATION OVERLAY */}
      {showPassport && <PassportStamp onComplete={onPassportDone} currentId={currentId} />}

      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="mb-8 pt-4 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔭</span>
            <span className="text-[#008272] text-xs font-bold uppercase tracking-widest">QUESTION {currentId}/4</span>
          </div>
          <span className="text-[#14312b] font-display font-bold text-xl">{currentId * 25}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#008272] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentId / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* --- MAIN CONTENT (Flex Grow) --- */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full relative z-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[#14312b]">
            {questionData.question}
          </h2>
          
          {questionData.image && (
            <div className="mt-4 mb-2">
              <img src={questionData.image} alt="Ref" className="w-full rounded-2xl shadow-sm border border-emerald-100"/>
            </div>
          )}

          {/* Hint */}
          {currentId === 1 && questionData.hint && (
            <div className="mt-4">
              <button 
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-[#008272] text-sm font-bold hover:underline focus:outline-none"
              >
                <span>💡</span> Need a hint?
              </button>
              {showHint && (
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-gray-600 text-sm animate-[fadeIn_0.3s_ease-out]">
                  {questionData.hint}
                </div>
              )}
            </div>
          )}

          {isMultiSelect && !isSubmitted && (
            <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">Select all that apply</p>
          )}
        </div>

        {/* Options */}
        <div className="grid gap-3">
          {questionData.options.map((option, index) => {
             const isSelected = selectedOptions.includes(option);
             const optionIsCorrect = isOptionCorrect(option);
             
             let buttonStyle = "bg-white border-gray-200 text-gray-700 hover:border-[#008272] shadow-sm";
             
             if (isSubmitted) {
                if (isSelected) {
                   buttonStyle = optionIsCorrect 
                    ? "bg-emerald-100 border-emerald-500 text-emerald-900" 
                    : "bg-red-100 border-red-500 text-red-900";
                } else if (optionIsCorrect) {
                   buttonStyle = "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-60";
                }
             } else if (isSelected) {
                buttonStyle = "bg-emerald-50 border-[#008272] text-[#008272] ring-1 ring-[#008272]";
             }

             return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isSubmitted}
                className={`relative w-full p-5 rounded-xl text-left font-bold text-lg border-2 transition-all duration-200 transform ${!isSubmitted ? 'active:scale-95' : ''} ${buttonStyle}`}
              >
                <div className="flex justify-between items-center">
                  <span className="leading-snug pr-4">{option}</span>
                  {isSubmitted && (
                    <>
                      {optionIsCorrect ? (
                         (isSelected && isCorrect) ? (
                             isMultiSelect ? (
                                <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full whitespace-nowrap">Correct</span>
                             ) : (
                                <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full whitespace-nowrap">+1 pt for {userNationName}</span>
                             )
                         ) : <span>✅</span>
                      ) : (
                         isSelected && <span>❌</span>
                      )}
                    </>
                  )}
                  {!isSubmitted && isMultiSelect && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#008272] bg-[#008272]' : 'border-gray-300'}`}>
                       {isSelected && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {isMultiSelect && !isSubmitted && (
          <button
            onClick={() => submitAnswer(selectedOptions)}
            disabled={selectedOptions.length === 0}
            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedOptions.length > 0 ? 'bg-[#14312b] text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Confirm Answer
          </button>
        )}
      </div>

      {/* --- STATIC BUTTONS (Bottom Flow) --- */}
      <div className="mt-12 flex flex-col gap-3 w-full max-w-lg mx-auto pb-6">
         <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-white border-2 border-[#008272] text-[#008272] rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-emerald-50"
         >
            Go Back
         </button>
      </div>

      {/* --- FEEDBACK POPUP --- */}
      {isSubmitted && !showPassport && (
        <div className={`fixed inset-x-0 bottom-0 p-6 rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease-out] z-50 bg-white border-t border-gray-100`}>
          <div className="max-w-lg mx-auto">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4"></div> 
            <h3 className={`font-display text-xl font-bold mb-1 ${isCorrect ? 'text-[#14312b]' : 'text-red-600'}`}>
              {isCorrect ? 'Excellent work! 🎯' : 'Not quite right...'}
            </h3>
            <div className="text-sm text-gray-500 mb-6 leading-relaxed max-h-40 overflow-y-auto">
              {!isCorrect && (
                <p className="mb-2 font-bold text-gray-700 bg-red-50 p-2 rounded-lg border border-red-100">
                  Correct Answer: {getCorrectAnswerDisplay()}
                </p>
              )}
              {questionData.explanation}
            </div>
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${isCorrect ? 'bg-[#14312b] text-white' : 'bg-gray-800 text-white'}`}
            >
              Next ➜
            </button>
          </div>
        </div>
      )}
    </div>
  );
}