export default function MapModal({ isOpen, onClose, currentCheckpoint }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Overlay Background */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* The Map Card */}
      <div className="relative bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-[scaleIn_0.2s_ease-out]">
        
        {/* Header */}
        <div className="bg-emerald-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-display font-bold text-lg">
            📍 Find Challenge #{currentCheckpoint}
          </h3>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition text-sm"
          >
            ✕
          </button>
        </div>

        {/* The Map Image */}
        <div className="relative bg-gray-100 aspect-square">
          {/* PLACEHOLDER: Replace 'src' below with your actual /map.png later */}
          <img 
            src="https://images.unsplash.com/photo-1570530733671-69468dc2ba44?auto=format&fit=crop&w=800&q=80" 
            alt="Jewel Map" 
            className="w-full h-full object-cover"
          />
          
          {/* "You Are Here" Pin Animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <span className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-500 border-4 border-white shadow-lg items-center justify-center text-xs text-white font-bold">
                {currentCheckpoint}
              </span>
            </span>
          </div>
        </div>

        {/* Footer Instruction */}
        <div className="p-4 text-center">
          <p className="text-sm text-gray-500">
            Go to the location marked <span className="font-bold text-emerald-600">#{currentCheckpoint}</span> to find the answer.
          </p>
          <button 
            onClick={onClose}
            className="mt-4 w-full py-3 bg-emerald-100 text-emerald-800 font-bold rounded-xl hover:bg-emerald-200 transition"
          >
            I'm there, let's solve it
          </button>
        </div>
      </div>
    </div>
  );
}