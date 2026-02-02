import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionsData from '../data/questions.json';

export default function QuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const questionId = parseInt(id);
    const question = questionsData.find(q => q.id === questionId);

    const [selectedOptions, setSelectedOptions] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Reset state when the question ID changes
    useEffect(() => {
        setSelectedOptions([]);
        setIsSubmitted(false);
        setIsCorrect(false);
        window.scrollTo(0, 0);
    }, [id]);

    if (!question) return <div className="p-10 text-center">Question not found.</div>;

    const isMultiSelect = Array.isArray(question.correctAnswer) && question.id === 4;

    const handleOptionClick = (option) => {
        if (isSubmitted) return;

        if (isMultiSelect) {
            setSelectedOptions(prev => 
                prev.includes(option) ? prev.filter(item => item !== option) : [...prev, option]
            );
        } else {
            setSelectedOptions([option]);
        }
    };

    const handleSubmit = () => {
        let correct = false;

        if (isMultiSelect) {
            // Check if arrays match exactly for Question 4
            const isMatch = question.correctAnswer.every(val => selectedOptions.includes(val)) &&
                            selectedOptions.length === question.correctAnswer.length;
            correct = isMatch;
        } else if (Array.isArray(question.correctAnswer)) {
            // Check if the single selection is one of the valid answers (Question 8)
            correct = question.correctAnswer.includes(selectedOptions[0]);
        } else {
            // Standard single-choice check
            correct = selectedOptions[0] === question.correctAnswer;
        }

        setIsCorrect(correct);
        setIsSubmitted(true);

        // Update global score if correct
        if (correct) {
            const currentScore = parseInt(sessionStorage.getItem('sessionScore') || '0');
            sessionStorage.setItem('sessionScore', (currentScore + 1).toString());
        }
    };

    const handleNext = () => {
        // Logic: Move to next question or next story segment
        if (questionId % 2 === 0) {
            const nextStoryId = (questionId / 2) + 1;
            if (nextStoryId > 4) {
                navigate('/results');
            } else {
                navigate(`/story/${nextStoryId}`);
            }
        } else {
            navigate(`/quiz/${questionId + 1}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex flex-col">
            <div className="mb-8">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${(questionId / 8) * 100}%` }}
                    ></div>
                </div>
                <p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">Question {questionId} of 8</p>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
                {question.question}
            </h2>

            <div className="space-y-3 flex-1">
                {question.options.map((option) => {
                    const isSelected = selectedOptions.includes(option);
                    let buttonClass = "w-full p-4 rounded-xl border-2 text-left transition-all ";

                    if (isSubmitted) {
                        const isThisCorrect = Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.includes(option)
                            : option === question.correctAnswer;
                        
                        if (isThisCorrect) {
                            buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                        } else if (isSelected) {
                            buttonClass += "border-red-500 bg-red-50 text-red-700";
                        } else {
                            buttonClass += "border-gray-100 opacity-50";
                        }
                    } else {
                        buttonClass += isSelected 
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md" 
                            : "border-white bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-600 dark:text-gray-300 shadow-sm";
                    }

                    return (
                        <button 
                            key={option} 
                            onClick={() => handleOptionClick(option)}
                            className={buttonClass}
                        >
                            <span className="font-bold">{option}</span>
                        </button>
                    );
                })}
            </div>

            {isSubmitted && (
                <div className={`mt-6 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                    <p className="font-bold mb-1">{isCorrect ? 'Correct!' : 'Not quite!'}</p>
                    <p className="text-sm leading-relaxed">{question.explanation}</p>
                </div>
            )}

            <button
                onClick={isSubmitted ? handleNext : handleSubmit}
                disabled={selectedOptions.length === 0}
                className={`mt-8 w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedOptions.length === 0 ? 'bg-gray-200 text-gray-400' : 'bg-[#008272] text-white shadow-lg shadow-emerald-900/10'
                }`}
            >
                {isSubmitted ? 'Continue ➜' : 'Check Answer'}
            </button>
        </div>
    );
}