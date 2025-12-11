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

  // State
  const [selectedOptions, setSelectedOptions] = useState([]); 
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false); 
  const [userNation, setUserNation] = useState('');
  const [userNationName, setUserNationName] = useState('your nation');

  const isMultiSelect = currentId === 4; 

  useEffect(() => {
    const storedNation = localStorage.getItem('userNation');
    const storedNationName = localStorage.getItem('userNationName');
    if (storedNation) setUserNation(storedNation);
    if (storedNationName) setUserNationName(storedNationName);
  }, []);

  // --- HANDLERS ---
  const handleOptionClick = (option) => {
    if (isSubmitted) return; 

    if (isMultiSelect) {
      if (selectedOptions.includes(option)) {
        setSelectedOptions(selectedOptions.filter(o => o !== option));
      } else {
        if (selectedOptions.length < 4) { 
          setSelectedOptions([...selectedOptions, option]);
        }
      }
    } else {
      submitAnswer([option]);
    }
  };

  const submitAnswer = async (finalSelection) => {
    setSelectedOptions(finalSelection);
    setIsSubmitted(true);

    let correct = false;
    if (isMultiSelect) {
      correct = finalSelection.length === 1 && finalSelection[0] === questionData.correctAnswer;
    } else {
      correct = finalSelection[0] === questionData.correctAnswer;
    }

    setIsCorrect(correct);

    if (correct) {
      if (userNation) {
        try {
          const nationRef = doc(db, 'nations', userNation);
          const nationFlag = localStorage.getItem('userNationFlag') || '🏳️';
          await setDoc(nationRef, { 
            score: increment(1),
            name: userNationName,
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
    <div className="min-h-screen bg-gray-50 flex flex-col p-6 relative">
      <div className="mb-6 pt-4">
         <Skeleton className="w-32 h-6 bg-gray-200 mb-3" />
         <Skeleton className="w-full h-2 rounded-full bg-gray-200" />
      </div>
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full pb-20">
         <Skeleton className="w-24 h-6 mb-4 bg-gray-200" /> 
         <Skeleton className="w-full h-10 mb-2 bg-gray-200" /> 
         <Skeleton className="w-3/4 h-10 mb-8 bg-gray-200" /> 
         <div className="grid gap-3">
           {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full h-16 rounded-2xl bg-gray-200" />)}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col p-6 relative font-sans overflow-hidden">
      
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

      {/* --- QUESTION AREA --- */}
      <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full pb-20 relative z-10">
        <div className="mb-6">
          <div className="inline-block bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1 mb-4">
            <p className="text-[#14312b] text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <span>👁️</span> Observe your surroundings
            </p>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight text-[#14312b]">
            {questionData.question}
          </h2>
          
          {/* --- 🟢 THIS IS THE PART THAT WAS LIKELY MISSING OR BROKEN 🟢 --- */}
          {questionData.image && (
            <div className="mt-4 mb-2">
              <img 
                src={questionData.image} 
                alt="Question Reference" 
                className="w-full rounded-2xl shadow-sm border border-emerald-100"
              />
            </div>
          )}
          {/* ----------------------------------------------------------------- */}

          {isMultiSelect && !isSubmitted && (
            <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">
              Select all that apply
            </p>
          )}
        </div>

        {/* Options Grid */}
        <div className="grid gap-3">
          {questionData.options.map((option, index) => {
             const isSelected = selectedOptions.includes(option);
             let buttonStyle = "bg-white border-gray-200 text-gray-700 hover:border-[#008272] shadow-sm";
             
             if (isSubmitted) {
                if (isSelected) {
                   if (isCorrect) {
                     buttonStyle = "bg-emerald-100 border-emerald-500 text-emerald-900";
                   } else {
                     buttonStyle = "bg-red-100 border-red-500 text-red-900";
                   }
                } else if (!isCorrect && option === questionData.correctAnswer && !isMultiSelect) {
                   buttonStyle = "bg-emerald-50 border-emerald-200 text-emerald-700 opacity-60";
                }
             } else {
                if (isSelected) {
                   buttonStyle = "bg-emerald-50 border-[#008272] text-[#008272] ring-1 ring-[#008272]";
                }
             }

             return (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={isSubmitted}
                className={`
                  relative w-full p-5 rounded-xl text-left font-bold text-lg border-2 transition-all duration-200 transform
                  ${!isSubmitted ? 'active:scale-95' : ''}
                  ${buttonStyle}
                `}
              >
                <div className="flex justify-between items-center">
                  <span className="leading-snug pr-4">{option}</span>
                  
                  {isSubmitted && isSelected && isCorrect && (
                    <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded-full whitespace-nowrap">
                      +1 pt for {userNationName}
                    </span>
                  )}
                  {isSubmitted && isSelected && !isCorrect && (
                    <span>❌</span>
                  )}
                  {!isSubmitted && isMultiSelect && (
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${isSelected ? 'border-[#008272] bg-[#008272]' : 'border-gray-300'}
                    `}>
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
            className={`mt-6 w-full py-4 rounded-xl font-bold text-lg transition-all
              ${selectedOptions.length > 0 
                ? 'bg-[#14312b] text-white shadow-lg hover:bg-[#0f2621]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            Confirm Answer
          </button>
        )}
      </div>

      {/* --- FEEDBACK POPUP --- */}
      {isSubmitted && (
        <div className={`fixed inset-x-0 bottom-0 p-6 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-[slideUp_0.3s_ease-out] z-40 bg-white`}>
          <div className="max-w-lg mx-auto">
            <h3 className={`font-display text-xl font-bold mb-1 ${isCorrect ? 'text-[#14312b]' : 'text-red-600'}`}>
              {isCorrect ? 'Excellent work! 🎯' : 'Not quite right...'}
            </h3>
            
            <div className="text-sm text-gray-500 mb-6 leading-relaxed">
              {!isCorrect && (
                <p className="mb-2 font-bold text-gray-700 bg-red-50 p-2 rounded-lg border border-red-100">
                  Correct Answer: {questionData.correctAnswer}
                </p>
              )}
              {questionData.explanation}
            </div>

            <button 
              onClick={handleNext}
              className={`w-full py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex justify-center items-center gap-2
                ${isCorrect ? 'bg-[#14312b] text-white' : 'bg-gray-800 text-white'}`}
            >
              Next ➜
            </button>
          </div>
        </div>
      )}
    </div>
  );
}