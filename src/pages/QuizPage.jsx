import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, increment, setDoc } from 'firebase/firestore'; 
import { db } from '../firebase';
import questionsData from '../data/questions.json';
import Skeleton from '../components/Skeleton'; 

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const questionData = questionsData.find(q => q.id === currentId);

  // State Management
  const [selectedOptions, setSelectedOptions] = useState([]); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); 
  const [userNation, setUserNation] = useState('');
  const [userNationName, setUserNationName] = useState('your nation');
  const [showHint, setShowHint] = useState(false);
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  
  // Logic: Question 4 is the only multi-select question
  const isMultiSelect = currentId === 4; 

  // --- INITIALIZATION EFFECT ---
  useEffect(() => {
    // 1. Reset state when Question ID changes
    setSelectedOptions([]);
    setIsSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    setReadOnlyMode(false);

    // 2. Scroll to top
    window.scrollTo(0, 0);

    // 3. Theme Setup
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 4. Load User Data
    const storedNation = localStorage.getItem('userNation');
    const storedNationName = localStorage.getItem('userNationName');
    if (storedNation) setUserNation(storedNation);
    if (storedNationName) setUserNationName(storedNationName);

    // 5. Check Read-Only Mode (24H Lockout)
    const lastTimestamp = parseInt(localStorage.getItem('lastAttemptTimestamp') || '0');
    const now = Date.now();
    if (now - lastTimestamp < 86400000) {
        setReadOnlyMode(true);
    }

    // 6. Restore saved state
    const savedState = localStorage.getItem(`quizState_${currentId}`);
    if (savedState) {
      const { selectedOptions: savedOptions, isCorrect: savedIsCorrect } = JSON.parse(savedState);
      setSelectedOptions(savedOptions);
      setIsCorrect(savedIsCorrect);
      setIsSubmitted(true);
    }
  }, [currentId]);

  // --- ANSWER LOGIC ---
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((val, index) => val === sortedB[index]);
  };

  const handleOptionClick = (option) => {
    if (isSubmitted || readOnlyMode) return; 
    
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
    if (correct && !sessionStorage.getItem(hasScoredKey) && !readOnlyMode) {
        sessionStorage.setItem(hasScoredKey, 'true');
        const currentSessionScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
        sessionStorage.setItem('sessionScore', currentSessionScore + 1);
        const totalScore = parseInt(localStorage.getItem('userScore') || '0');
        localStorage.setItem('userScore', totalScore + 1);

        // Lock attempt only if this is the final question (Q8)
        if (currentId === 8) {
           localStorage.setItem('lastAttemptTimestamp', Date.now().toString());
        }

        if (userNation) {
            try {
                const nationRef = doc(db, 'nations', userNation);
                const nationFlag = localStorage.getItem('userNationFlag') || '🏳️';
                await setDoc(nationRef, { score: increment(1), name: userNationName, flag: nationFlag }, { merge: true });
            } catch (error) { console.error("Firebase Error:", error); }
        }
    }
  };

  // --- NAVIGATION LOGIC (RECTIFIED) ---
  const handleNext = () => {
    // Correct Flow: Q1->Q2->S1->Q3->Q4->S2->Q5->Q6->S3->Q7->Q8->S4->Results
    const navigationMap = {
        1: '/quiz/2',
        2: '/story/1',  // Corrected: Go to Story 1 after Q2
        3: '/quiz/4',
        4: '/story/2',  // Corrected: Go to Story 2 after Q4
        5: '/quiz/6',
        6: '/story/3',  // Corrected: Go to Story 3 after Q6
        7: '/quiz/8',
        8: '/story/4'   // Corrected: Go to Story 4 after Q8
    };

    const nextPath = navigationMap[currentId];
    
    if (nextPath) {
        navigate(nextPath);
    } else {
        navigate('/');
    }
  };

  const isOptionCorrect = (option) => {
    const correctAnswers = questionData.correctAnswer;
    if (Array.isArray(correctAnswers)) {
      return correctAnswers.includes(option);
    }
    return option === correctAnswers;
  };

  const getCorrectAnswerDisplay = () => {
    if (currentId === 8) return "2 or 3"; 
    if (currentId === 4) return "Connects East/West & Overhead wire suspensions"; 
    return questionData.correctAnswer;
  };

  if (!questionData) return <Skeleton className="w-full h-screen" />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 flex flex-col p-6 relative font-sans transition-colors duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

      {/* HEADER */}
      <div className="mb-8 pt-4 relative z-10">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔭</span>
            <span className="text-[#008272] dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">QUESTION {currentId}/8</span>
          </div>
          <span className="text-[#14312b] dark:text-emerald-300 font-display font-bold text-xl">{Math.round((currentId / 8) * 100)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#008272] rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(currentId / 8) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full relative z-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[#14312b] dark:text-white transition-colors">
            {questionData.question}
          </h2>
          {questionData.image && (
            <div className="mt-4 mb-2">
              <img src={questionData.image} alt="Ref" className="w-full rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900"/>
            </div>
          )}
          {currentId === 1 && questionData.hint && (
            <div className="mt-4">
              <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#008272] dark:text-emerald-400 text-sm font-bold hover:underline focus:outline-none">
                <span>💡</span> Need a hint?
              </button>
              {showHint && <div className="mt-2 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-xl text-sm animate-[fadeIn_0.3s_ease-out]">{questionData.hint}</div>}
            </div>
          )}
          {readOnlyMode && <div className="bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-xs font-bold p-2 rounded mb-2 mt-2">Review Mode (Read Only)</div>}
          {isMultiSelect && !isSubmitted && !readOnlyMode && <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">Select all that apply</p>}
        </div>

        {/* OPTIONS */}
        <div className="grid gap-3">
          {questionData.options.map((option, index) => {
             const isSelected = selectedOptions.includes(option);
             const optionIsCorrect = isOptionCorrect(option);
             let buttonStyle = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#008272] shadow-sm";
             if (isSubmitted) {
                if (isSelected) {
                   buttonStyle = optionIsCorrect 
                    ? "bg-emerald-100 dark:bg-emerald-900 border-emerald-500 text-emerald-900 dark:text-emerald-100" 
                    : "bg-red-100 dark:bg-red-900 border-red-500 text-red-900 dark:text-red-100";
                } else if (optionIsCorrect) {
                   buttonStyle = "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 opacity-60";
                }
             } else if (isSelected) {
                buttonStyle = "bg-emerald-50 dark:bg-emerald-900/30 border-[#008272] text-[#008272] dark:text-emerald-400 ring-1 ring-[#008272]";
             }

             return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isSubmitted || readOnlyMode}
                className={`relative w-full p-5 rounded-xl text-left font-bold text-lg border-2 transition-all duration-200 transform ${!isSubmitted && !readOnlyMode ? 'active:scale-95' : ''} ${buttonStyle}`}
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
        {isMultiSelect && !isSubmitted && !readOnlyMode && (
          <button onClick={() => submitAnswer(selectedOptions)} disabled={selectedOptions.length === 0} className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedOptions.length > 0 ? 'bg-[#14312b] text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            Confirm Answer
          </button>
        )}
      </div>

      {/* NAVIGATION BUTTON */}
      <div className="mt-12 flex flex-col gap-3 w-full max-w-lg mx-auto pb-6">
         <button 
            onClick={() => {
                if (readOnlyMode) {
                     // Updated Review Map
                     const reviewMap = {
                        1: '/quiz/2', 2: '/story/1', 
                        3: '/quiz/4', 4: '/story/2',
                        5: '/quiz/6', 6: '/story/3', 
                        7: '/quiz/8', 8: '/story/4'
                     };
                     navigate(reviewMap[currentId] || '/');
                } else {
                    navigate(-1);
                }
            }}
            className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-[#008272] dark:border-emerald-500 text-[#008272] dark:text-emerald-500 rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-emerald-50 dark:hover:bg-gray-700"
         >
            {readOnlyMode ? (currentId === 8 ? "View Results" : "Next (Review)") : "Go Back"}
         </button>
      </div>

      {/* FEEDBACK POPUP */}
      {isSubmitted && !readOnlyMode && (
        <div className={`fixed inset-x-0 bottom-0 p-6 rounded-t-3xl shadow-[0_-10px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.3s_ease-out] z-50 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors`}>
          <div className="max-w-lg mx-auto">
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4"></div> 
            <h3 className={`font-display text-xl font-bold mb-1 ${isCorrect ? 'text-[#14312b] dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {isCorrect ? 'Excellent work! 🎯' : 'Not quite right...'}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed max-h-40 overflow-y-auto">
              {!isCorrect && (
                <p className="mb-2 font-bold text-gray-700 dark:text-gray-200 bg-red-50 dark:bg-red-900/30 p-2 rounded-lg border border-red-100 dark:border-red-900">
                  Correct Answer: {getCorrectAnswerDisplay()}
                </p>
              )}
              {questionData.explanation}
            </div>
            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2 ${isCorrect ? 'bg-[#14312b] text-white hover:bg-[#0f2621]' : 'bg-gray-800 text-white dark:bg-gray-700'}`}
            >
              Next ➜
            </button>
          </div>
        </div>
      )}
    </div>
  );
}