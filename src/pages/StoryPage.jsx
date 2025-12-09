import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storylineData from '../data/storyline.json';

export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const story = storylineData.find(s => s.id === currentId);
  const [userPhoto, setUserPhoto] = useState(null);

  // Fallback: Use the array from JSON, or an empty array if missing
  const carouselImages = story.images || [];

  const handleContinue = () => {
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

  const handleSharePhoto = async () => {
    if (!userPhoto) return;
    try {
      const response = await fetch(userPhoto);
      const blob = await response.blob();
      const file = new File([blob], `jewel-memory-${currentId}.jpg`, { type: "image/jpeg" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Jewel Memory',
          text: `Captured at ${story.title} - Jewel Changi Airport`
        });
      } else {
        const link = document.createElement('a');
        link.href = userPhoto;
        link.download = `jewel-memory-${currentId}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) { console.error("Error sharing:", error); }
  };

  if (!story) return <div className="min-h-screen bg-white flex items-center justify-center text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-32 relative text-gray-800">
      
      {/* --- CAROUSEL HERO SECTION --- */}
      <div className="relative h-[45vh] w-full group bg-gray-200">
        
        {/* Scrollable Container with Padding for Scrollbar */}
        <div className="flex overflow-x-auto snap-x snap-mandatory w-full h-full scrollbar-minimal scroll-smooth pb-2">
          {carouselImages.map((imgUrl, index) => (
            <img 
              key={index}
              src={imgUrl} 
              // Add onError to help debug missing images
              onError={(e) => {e.target.style.display='none'}}
              alt={`${story.title} view ${index + 1}`} 
              className="w-full h-full flex-shrink-0 object-cover snap-center"
            />
          ))}
        </div>

        {/* Gradient Overlay for Text Visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
        
        {/* Floating Text Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 pointer-events-none">
          <div className="inline-block bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full mb-3 shadow-sm">
            <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">
              Field Note #{currentId}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
            {story.title}
          </h1>
          <p className="text-white/70 text-xs mt-2 italic flex items-center gap-1">
             Swipe for more views <span>👉</span>
          </p>
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="px-6 mt-6 max-w-lg mx-auto space-y-8">
        
        <p className="text-gray-600 leading-relaxed text-lg font-light">
          {story.content}
        </p>

        {/* Fact Card */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex gap-4 items-start">
          <div className="text-2xl mt-1">💡</div>
          <div>
            <h4 className="font-bold text-[#008272] text-xs uppercase mb-1 tracking-wide">Did you know?</h4>
            <p className="text-gray-600 text-sm leading-snug">
              You are standing in a space that offsets over 30 tonnes of CO2 annually.
            </p>
          </div>
        </div>

        {/* --- PHOTO CHALLENGE --- */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-sm">
          <h3 className="font-display font-bold text-lg mb-2 flex items-center justify-center gap-2 text-[#14312b]">
            <span>📸</span> Capture a Memory
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Take a photo of the {story.title} to complete this entry.
          </p>

          {userPhoto ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-[#008272] shadow-md">
                <img src={userPhoto} alt="User memory" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-[#008272] text-white text-xs font-bold px-2 py-1 rounded shadow flex items-center gap-1">
                  <span>✓</span> Ready
                </div>
              </div>
              <button 
                onClick={handleSharePhoto}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <span>📤</span> Share / Save
              </button>
            </div>
          ) : (
            <label className="block w-full py-6 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl cursor-pointer transition-all active:scale-95 border-2 border-dashed border-gray-300 hover:border-[#008272] hover:text-[#008272]">
              Tap to Open Camera
              <input 
                type="file" accept="image/*" capture="environment" className="hidden" 
                onChange={handlePhotoCapture}
              />
            </label>
          )}
        </div>
      </div>

      {/* --- BOTTOM NAV --- */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 z-20">
        <button 
          onClick={handleContinue}
          className="w-full py-4 bg-[#14312b] hover:bg-[#0f2621] text-white rounded-xl font-bold text-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {currentId === 4 ? 'Complete Quest 🏆' : 'Next Challenge ➜'}
        </button>
      </div>
    </div>
  );
}