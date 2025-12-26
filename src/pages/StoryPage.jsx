import { useState } from 'react';
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
  const [showMap, setShowMap] = useState(false); // Transition State

  const carouselImages = story.images || [];

  const handleContinue = () => {
    // Show Map Transition before leaving
    setShowMap(true);
  };

  const onMapDone = () => {
    setShowMap(false);
    if (currentId < 4) {
      navigate(`/quiz/${currentId + 1}`);
    } else {
      navigate('/results');
    }
  };

  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUserPhoto(imageUrl);
    }
  };

  // ... (Keep handleSharePhoto same as before)
  const handleSharePhoto = async () => { /* ... existing code ... */ };

  if (!story) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-40 relative text-gray-800">
      
      {/* TRANSITION */}
      {showMap && <TrailMapTransition onComplete={onMapDone} currentStop={currentId + 1} />}

      {/* CAROUSEL SECTION */}
      <div className="relative h-[45vh] w-full group bg-gray-200">
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

      {/* CONTENT */}
      <div className="px-6 mt-6 max-w-lg mx-auto space-y-6">
        <p className="text-gray-600 leading-relaxed text-lg font-light">{story.content}</p>

        {/* Fun Fact */}
        <button onClick={() => setIsFactOpen(!isFactOpen)} className="w-full text-left bg-white p-5 rounded-2xl border border-gray-200 shadow-sm transition-all active:scale-[0.98] hover:border-[#008272]/50 group">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4"><div className="text-2xl">💡</div><h4 className="font-bold text-[#008272] text-xs uppercase tracking-wide">Did you know?</h4></div>
            <span className={`text-gray-400 text-sm transition-transform duration-300 ${isFactOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
          <div className={`grid transition-all duration-300 ease-in-out ${isFactOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="overflow-hidden"><p className="text-gray-600 text-sm leading-snug pl-[3.2rem]">{story.funFact}</p></div>
          </div>
        </button>

        {/* Next Up */}
        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 flex gap-4 items-start">
          <div className="text-2xl mt-1">🧭</div>
          <div><h4 className="font-bold text-[#14312b] text-xs uppercase mb-1 tracking-wide">Next Up:</h4><p className="text-[#14312b] text-sm leading-snug font-medium">{story.nextUp}</p></div>
        </div>

        {/* Photo */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-sm">
          <h3 className="font-display font-bold text-lg mb-2 flex items-center justify-center gap-2 text-[#14312b]"><span>📸</span> Capture a Memory (Optional)</h3>
          <p className="text-gray-500 text-sm mb-4">Standing at the checkpoint marker, face the Rain Vortex and snap a unique vantage photo to add to your photo gallery!</p>
          {userPhoto ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-[#008272] shadow-md">
                <img src={userPhoto} alt="User memory" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <label className="block w-full py-6 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl cursor-pointer border-2 border-dashed border-gray-300">Tap to Open Camera <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoCapture} /></label>
          )}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-gray-100 z-20 flex flex-col gap-3">
        <button 
          onClick={handleContinue}
          className="w-full py-4 bg-[#14312b] hover:bg-[#0f2621] text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {currentId === 4 ? 'Complete Trail 🏆' : 'Next Challenge ➜'}
        </button>

        {/* NEW BACK BUTTON STYLE */}
        <button 
          onClick={() => navigate(-1)}
          className="w-full py-3 bg-white border-2 border-[#008272] text-[#008272] rounded-xl font-bold shadow-sm transition-transform active:scale-95 hover:bg-emerald-50"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}