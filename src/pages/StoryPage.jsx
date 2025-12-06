import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storylineData from '../data/storyline.json';

export default function StoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentId = parseInt(id);
  const story = storylineData.find(s => s.id === currentId);

  // State to hold the user's uploaded/taken photo
  const [userPhoto, setUserPhoto] = useState(null);

  const handleContinue = () => {
    if (currentId < 4) {
      navigate(`/quiz/${currentId + 1}`);
    } else {
      navigate('/results');
    }
  };

  // Handle the Camera/File Input
  const handlePhotoCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a fake local URL to preview the image immediately
      const imageUrl = URL.createObjectURL(file);
      setUserPhoto(imageUrl);
    }
  };

  if (!story) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans pb-32 relative">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[45vh] w-full">
        <img 
          src={story.image} 
          alt={story.title} 
          className="w-full h-full object-cover opacity-80"
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        
        {/* Title Block */}
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="inline-block bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md px-3 py-1 rounded-full mb-3">
            <span className="text-emerald-300 font-bold uppercase tracking-widest text-xs">
              Field Note #{currentId}
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight shadow-sm">
            {story.title}
          </h1>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="px-6 mt-6 max-w-lg mx-auto space-y-8">
        
        {/* Text Content */}
        <p className="text-slate-300 leading-relaxed text-lg font-light">
          {story.content}
        </p>

        {/* Fun Fact Card */}
        <div className="bg-emerald-900/20 p-5 rounded-2xl border border-emerald-500/20 flex gap-4 items-start">
          <div className="text-2xl mt-1">💡</div>
          <div>
            <h4 className="font-bold text-emerald-400 text-xs uppercase mb-1 tracking-wide">Did you know?</h4>
            <p className="text-emerald-200/80 text-sm leading-snug">
              You are standing in a space that offsets over 30 tonnes of CO2 annually.
            </p>
          </div>
        </div>

        {/* --- PHOTO CHALLENGE SECTION --- */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center">
          <h3 className="font-display font-bold text-lg mb-2 flex items-center justify-center gap-2">
            <span>📸</span> Capture a Memory
          </h3>
          <p className="text-slate-400 text-sm mb-4">
            Take a photo of the {story.title} to complete this entry.
          </p>

          {userPhoto ? (
            // State: Photo Taken
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 border-2 border-emerald-500 shadow-lg">
              <img src={userPhoto} alt="User memory" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
                Saved!
              </div>
            </div>
          ) : (
            // State: No Photo Yet
            <label className="block w-full py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl cursor-pointer transition-all active:scale-95 border-2 border-dashed border-slate-600 hover:border-emerald-500">
              Tap to Open Camera
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" // Triggers rear camera on mobile
                className="hidden" 
                onChange={handlePhotoCapture}
              />
            </label>
          )}
        </div>
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-20">
        <button 
          onClick={handleContinue}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/50 transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          {currentId === 4 ? 'Complete Quest 🏆' : 'Next Challenge ➜'}
        </button>
      </div>
    </div>
  );
}