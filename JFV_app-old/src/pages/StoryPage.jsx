import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import storyline from '../data/storyline.json';

export default function StoryPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const story = storyline.find(s => s.id === parseInt(id));

    // Phototaking State
    const [stream, setStream] = useState(null);
    const [photo, setPhoto] = useState(null);
    const videoRef = useRef(null);

    if (!story) return <div>Story not found.</div>;

    const startCamera = async () => {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
    };

    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        setPhoto(canvas.toDataURL('image/png'));
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-24">
            <div className="h-[40vh] relative overflow-hidden bg-emerald-900">
                <img src={story.images[0]} alt="Story" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                <div className="absolute bottom-6 px-6">
                    <span className="bg-[#008272] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">Checkpoint {id}</span>
                    <h2 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white leading-tight">{story.title}</h2>
                </div>
            </div>

            <div className="px-6 py-4 space-y-6">
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">{story.content}</p>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border-l-4 border-[#008272]">
                    <span className="text-[#008272] font-bold text-xs uppercase tracking-tighter">Did you know?</span>
                    <p className="text-sm mt-1 font-medium">{story.funFact}</p>
                </div>

                {/* Built-in Camera UI */}
                <div className="mt-8 border-2 border-dashed border-gray-200 rounded-3xl p-4 text-center">
                    {!stream && !photo && (
                        <button onClick={startCamera} className="w-full py-10 flex flex-col items-center">
                            <span className="text-4xl mb-2">📸</span>
                            <span className="font-bold text-gray-500 uppercase text-xs">Capture a Forest Valley Memory</span>
                        </button>
                    )}
                    {stream && (
                        <div className="relative">
                            <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl" />
                            <button onClick={takePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full border-4 border-[#008272]" />
                        </div>
                    )}
                    {photo && (
                        <div className="space-y-4">
                            <img src={photo} alt="Capture" className="w-full rounded-2xl" />
                            <button onClick={() => setPhoto(null)} className="text-xs font-bold text-gray-400">Retake Photo</button>
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-widest">Instruction</p>
                    <p className="text-sm italic text-gray-600 dark:text-gray-400">{story.nextUp}</p>
                </div>

                <button 
                    onClick={() => navigate(`/quiz/${(story.id * 2) - 1}`)}
                    className="w-full py-4 bg-[#008272] text-white rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
                >
                    Continue Journey ➜
                </button>
            </div>
        </div>
    );
}