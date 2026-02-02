import { useEffect } from 'react';

// --- CUSTOM KEYFRAMES FOR MAP MOVEMENT ---
// Image Reference: 610px x 671px

const mapStyles = `
  /* PATH 1: CP1 -> Zig-Zag Stairs -> Green Corridor -> CP2 */
  @keyframes walk1to2 {
    0%   { left: 91.1%; top: 83.5%; opacity: 0; }
    5%   { left: 91.1%; top: 83.5%; opacity: 1; }  /* Start CP1 */
    10%  { left: 84.1%; top: 83.0%; }              
    15%  { left: 84.3%; top: 77.8%; }              
    18%  { left: 84.3%; top: 72.7%; }              
    21%  { left: 90.8%; top: 72.7%; }              
    24%  { left: 91.1%; top: 66.9%; }              
    27%  { left: 91.0%; top: 61.4%; }              
    30%  { left: 84.3%; top: 61.1%; }              
    33%  { left: 77.5%; top: 60.2%; }              
    36%  { left: 74.1%; top: 59.6%; }              /* Start Long Walk */
    85%  { left: 17.9%; top: 59.2%; }              /* End Long Walk */
    95%  { left: 18.0%; top: 63.9%; opacity: 1; }  /* End CP2 */
    100% { left: 18.0%; top: 63.9%; opacity: 0; }
  }

  /* PATH 2: CP2 -> Zig-Zag Stairs -> Blue Corridor -> CP3 */
  @keyframes walk2to3 {
    0%   { left: 17.9%; top: 64.7%; opacity: 0; }
    5%   { left: 17.9%; top: 64.7%; opacity: 1; }  /* Start CP2 */
    10%  { left: 18.0%; top: 59.9%; }              
    15%  { left: 10.2%; top: 59.8%; }              
    25%  { left: 10.2%; top: 46.8%; }              /* Climb Stairs */
    28%  { left: 13.9%; top: 46.0%; }              
    31%  { left: 18.2%; top: 45.2%; }              
    34%  { left: 21.3%; top: 45.2%; }              
    37%  { left: 21.5%; top: 39.3%; }              
    40%  { left: 24.3%; top: 39.3%; }              
    43%  { left: 26.4%; top: 39.0%; }              
    46%  { left: 28.9%; top: 38.3%; }              /* Start Long Walk */
    85%  { left: 72.8%; top: 38.2%; }              /* End Long Walk */
    95%  { left: 73.0%; top: 41.3%; opacity: 1; }  /* End CP3 */
    100% { left: 73.0%; top: 41.3%; opacity: 0; }
  }

  /* PATH 3: CP3 -> Zig-Zag Stairs -> Pink Corridor -> CP4 */
  @keyframes walk3to4 {
    0%   { left: 73.0%; top: 41.3%; opacity: 0; }
    5%   { left: 73.0%; top: 41.3%; opacity: 1; }  /* Start CP3 */
    10%  { left: 72.5%; top: 36.5%; }              
    15%  { left: 75.2%; top: 36.5%; }              
    20%  { left: 79.0%; top: 35.6%; }              
    25%  { left: 83.1%; top: 35.8%; }              /* Base of Stairs */
    45%  { left: 83.4%; top: 19.2%; }              /* Top of Stairs */
    50%  { left: 79.5%; top: 18.8%; }              
    55%  { left: 76.9%; top: 17.7%; }              
    60%  { left: 73.4%; top: 16.7%; }              /* Start Long Walk */
    90%  { left: 54.8%; top: 16.7%; opacity: 1; }  /* End CP4 */
    100% { left: 54.8%; top: 16.7%; opacity: 0; }
  }

  /* Shared Animation Settings */
  .animate-path-1-2 { animation: walk1to2 5s infinite linear; }
  .animate-path-2-3 { animation: walk2to3 5s infinite linear; }
  .animate-path-3-4 { animation: walk3to4 5s infinite linear; }
`;

export function TrailMapTransition({ onComplete, currentStop }) {
  
  useEffect(() => {
    // Total Page Duration: 15 Seconds
    const timer = setTimeout(onComplete, 15000); 
    return () => clearTimeout(timer);
  }, [onComplete]);

  let animationClass = "";
  let message = "";
  let startStyle = {}; 

  // Determine path & message based on destination
  if (currentStop === 2) {
    animationClass = "animate-path-1-2";
    message = "Proceeding to Checkpoint 2...";
    startStyle = { left: '91.1%', top: '83.5%' }; 
  } else if (currentStop === 3) {
    animationClass = "animate-path-2-3";
    message = "Ascending to Checkpoint 3...";
    startStyle = { left: '17.9%', top: '64.7%' }; 
  } else if (currentStop === 4) {
    animationClass = "animate-path-3-4";
    message = "Final stretch to Checkpoint 4...";
    startStyle = { left: '72.6%', top: '41.9%' }; 
  } else {
    animationClass = "animate-pulse"; 
    message = "Loading next location...";
  }

  return (
    <>
      <style>{mapStyles}</style>
      
      {/* Container: Warm Green Background */}
      <div className="fixed inset-0 z-[60] bg-[#1a3c34] flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
        
        {/* HEADER TEXT */}
        <div className="mb-8 text-center w-full px-6 z-20">
          <h2 className="text-emerald-300 font-display font-bold text-xl uppercase tracking-widest animate-pulse drop-shadow-md">
            {message}
          </h2>
        </div>

        {/* Map Container */}
        <div className="relative w-full max-w-md p-6">
            <div className="relative w-full aspect-[3/3.5] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2a5e52]">
                
                {/* THE MAP IMAGE */}
                <img 
                    src="/images/floorplan.jpg" 
                    alt="Trail Map" 
                    className="w-full h-full object-cover"
                />

                {/* LEGEND HIDER (White Patch) - Adjusted to 70% width */}
                <div className="absolute bottom-0 left-0 w-[70%] h-[27%] bg-white z-10"></div>

                {/* USER AVATAR (The Walker) */}
                <div 
                  className={`absolute w-6 h-6 z-30 ${animationClass} pointer-events-none`}
                  style={{ ...startStyle, transform: 'translate(-50%, -50%)' }}
                >
                    <div className="w-full h-full bg-orange-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(249,115,22,0.8)] relative">
                        <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-75"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center text-[10px]">🚶</div>
                </div>

            </div>
        </div>
      </div>
    </>
  );
}

export function PassportStamp({ onComplete }) {
    useEffect(() => { onComplete(); }, [onComplete]); 
    return null; 
}