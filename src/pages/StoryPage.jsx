import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storylineData from '../data/storyline.json';
import { TrailMapTransition } from '../components/Transitions';

export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const story = storylineData.find(s => s.id === currentId);
  const [userPhoto, setUserPhoto] = useState(null);
  const [isFactOpen, setIsFactOpen] = useState(false);
  
  // Transition State
  const [showMap, setShowMap] = useState(false);

  // Review Mode State
  const [isReviewMode, setIsReviewMode] = useState(false);

  const carouselImages = story.images || [];

  // --- 1. DARK MODE & REVIEW CHECK ---
  useEffect(() => {
    // Apply Theme
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Check Review Mode (24H ROLLING)
    const lastTimestamp = parseInt(localStorage.getItem('lastAttemptTimestamp') || '0');
    const now = Date.now();
    // If less than 24 hours (86400000 ms) has passed since last completion
    if (now - lastTimestamp < 86400000) {
        setIsReviewMode(true);
    }
  }, []);

  const handleContinue = () => {
    // If last story (Story 4), go to results
    if (currentId === 4) {
      navigate('/results');
      return;
    }

    // Calculate next quiz ID: (StoryID * 2) + 1
    // Story 1 -> Quiz 3
    // Story 2 -> Quiz 5
    // Story 3 -> Quiz 7
    const nextQuizId = (currentId * 2) + 1;

    // If Review Mode, SKIP ANIMATION
    if (isReviewMode) {
        navigate(`/quiz/${nextQuizId}`);
    } else {
        // Normal Mode: Show Animation
        setShowMap(true);
    }
  };

  const onMapDone = () => {
    setShowMap(false);
    // Navigate to next Quiz (S1 -> Q3, S2 -> Q5...)
    navigate(`/quiz/${(currentId * 2) + 1}`);
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserPhoto(imageUrl);
    }
  };

  if (!story) return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans relative text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-300">
      
      {/* TRANSITION */}
      {showMap && <TrailMapTransition onComplete={onMapDone} currentStop={currentId + 1} />}

      {/* CAROUSEL SECTION */}
      <div className="relative h-[45vh] w-full group bg-gray-200 dark:bg-gray-800 flex-shrink-0 transition-colors">
        <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scrollbar-minimal scroll-smooth pb-2">
          {carouselImages.map((imgUrl, index) => (
            <img key={index} src={imgUrl} onError={(e) => {e.target.style.display='none'}} alt="" className="w-full h-full flex-shrink-0 object-cover snap-center"/>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 pointer-events-none">
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full mb-3 shadow-sm">
            <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">Checkpoint {currentId}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">{story.title}</h1>
          <p className="text-white/70 text-xs mt-2 italic flex items-center gap-1">Swipe for more views <span>👉</span></p>
        </div>
      </div>

      {/* CONTENT (Flex Grow to push buttons down) */}
      <div className="px-6 mt-6 max-w-lg mx-auto space-y-6 flex-grow">
        {/* Story Content */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg font-light whitespace-pre-line transition-colors">
            {story.content}
        </p>

        {/* Fun Fact */}
        <button onClick={() => setIsFactOpen(!isFactOpen)} className="w-full text-left bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-all active:scale-[0.98] hover:border-[#008272]/50 dark:hover:border-emerald-500/50 group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="text-2xl">💡</div>
                <h4 className="font-bold text-[#008272] dark:text-emerald-400 text-xs uppercase tracking-wide">Did you know?</h4>
            </div>
            <span className={`text-gray-400 text-sm transition-transform duration-300 ${isFactOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
          <div className={`grid transition-all duration-300 ease-in-out ${isFactOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden">
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-snug pl-[3.2rem]">{story.funFact}</p>
            </div>
          </div>
        </button>

        {/* Next Up - Hides if empty */}
        {story.nextUp && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex gap-4 items-start transition-colors">
            <div className="text-2xl mt-1">🧭</div>
            <div>
                <h4 className="font-bold text-[#14312b] dark:text-emerald-300 text-xs uppercase mb-1 tracking-wide">Next Up:</h4>
                <p className="text-[#14312b] dark:text-emerald-100 text-sm leading-snug font-medium">{story.nextUp}</p>
            </div>
          </div>
        )}

        {/* Photo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center shadow-sm transition-colors">
          <h3 className="font-display font-bold text-lg mb-2 flex items-center justify-center gap-2 text-[#14312b] dark:text-white"><span>📸</span> Capture a Memory (Optional)</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Standing at the checkpoint marker, face the Rain Vortex and snap a unique vantage photo to add to your photo gallery!</p>
          {userPhoto ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-[#008272] shadow-md">
                <img src={userPhoto} alt="User memory" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <label className="block w-full py-6 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-xl cursor-pointer border-2 border-dashed border-gray-300 dark:border-gray-600 transition-colors">
                Tap to Open Camera 
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} />
            </label>
          )}
        </div>
      </div>

      {/* STATIC BUTTONS */}
      <div className="mt-12 flex flex-col gap-3 px-6 pb-8 max-w-lg mx-auto w-full">
        <button 
          onClick={handleContinue}
          className="w-full py-4 bg-[#14312b] hover:bg-[#0f2621] text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {currentId === 4 ? 'Complete Trail 🏆' : (isReviewMode ? 'Next (Review) ➜' : 'Next Challenge ➜')}
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="w-full py-3 bg-white dark:bg-gray-800 border-2 border-[#008272] dark:border-emerald-500 text-[#008272] dark:text-emerald-500 rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}