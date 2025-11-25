
import React, { useEffect, useRef, useState } from 'react';
import { X, Camera, MapPin, Users, Music, Trophy, Target, Scan, AlertTriangle, RefreshCw, UserPlus, CheckCircle } from 'lucide-react';
import { ARExperience, VirtualEvent } from '../types';

interface ARCameraOverlayProps {
  onClose: () => void;
  mode: 'GEO' | 'EVENT' | 'HANGOUT' | 'GAME' | 'SCAN';
  data?: ARExperience | VirtualEvent;
}

const ARCameraOverlay: React.FC<ARCameraOverlayProps> = ({ onClose, mode, data }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [useSimulation, setUseSimulation] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  
  // Game State
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<{id: number, top: number, left: number, scale: number}[]>([]);
  const gameLoopRef = useRef<number | null>(null);

  // Hangout State
  const [hangoutUsers, setHangoutUsers] = useState([
    { id: 1, name: 'Sarah', x: 25, y: 25, img: 'https://picsum.photos/id/64/50/50' },
    { id: 2, name: 'Marcus', x: 75, y: 30, img: 'https://picsum.photos/id/91/50/50' }
  ]);
  
  useEffect(() => {
    startCamera();
    
    if (mode === 'GAME') {
       startGame();
    }

    return () => {
       stopCamera();
       if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

  // Clear feedback message
  useEffect(() => {
    if (feedbackMsg) {
        const timer = setTimeout(() => setFeedbackMsg(null), 2000);
        return () => clearTimeout(timer);
    }
  }, [feedbackMsg]);

  const startCamera = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not available");
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        setUseSimulation(false);
      }
    } catch (err) {
      console.warn("Failed to access camera, switching to simulation mode", err);
      setHasPermission(false);
      setUseSimulation(true);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startGame = () => {
    // Generate targets
    const initialTargets = Array.from({ length: 5 }).map((_, i) => ({
       id: i,
       top: Math.random() * 70 + 15,
       left: Math.random() * 80 + 10,
       scale: 1
    }));
    setTargets(initialTargets);

    // Timer
    gameLoopRef.current = window.setInterval(() => {
       setTimeLeft(prev => {
          if (prev <= 1) {
             // End Game logic could go here
             return 0;
          }
          
          // Move targets randomly
          setTargets(prevTargets => prevTargets.map(t => ({
             ...t,
             top: Math.max(10, Math.min(90, t.top + (Math.random() - 0.5) * 5)),
             left: Math.max(10, Math.min(90, t.left + (Math.random() - 0.5) * 5)),
          })));
          
          return prev - 1;
       });
    }, 1000);
  };

  const handleTargetClick = (id: number) => {
     if (timeLeft === 0) return;
     
     setScore(s => s + 100);
     
     // Respawn target elsewhere
     setTargets(prev => prev.map(t => 
        t.id === id 
        ? { ...t, top: Math.random() * 70 + 15, left: Math.random() * 80 + 10, scale: 0 } // animate scale later
        : t
     ));
     
     // Simple haptic feedback
     if (navigator.vibrate) navigator.vibrate(50);
  };

  const addHangoutPerson = () => {
     const newId = Date.now();
     const randomX = Math.random() * 60 + 20; // Keep somewhat central
     const randomY = Math.random() * 40 + 20;
     setHangoutUsers(prev => [...prev, {
        id: newId,
        name: `Friend ${prev.length + 1}`,
        x: randomX,
        y: randomY,
        img: `https://picsum.photos/seed/${newId}/50/50`
     }]);
     setFeedbackMsg("Friend added to room!");
  };

  const renderARContent = () => {
    if (mode === 'SCAN') {
       return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             {/* Scanning Reticle */}
             <div className="w-64 h-64 border-2 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent h-[20%] w-full animate-[scan_2s_ease-in-out_infinite]"></div>
             </div>
             <div className="mt-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-mono">
                Scanning environment...
             </div>
          </div>
       );
    }

    if (mode === 'GEO' && data) {
      const item = data as ARExperience;
      return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none animate-pulse">
           <img 
             src={item.arAssetOverlay} 
             alt="AR Overlay" 
             className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] opacity-90"
           />
           <div className="absolute -bottom-10 left-0 right-0 text-center">
             <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
               {item.distance} away
             </span>
           </div>
        </div>
      );
    }

    if (mode === 'EVENT' && data) {
      const event = data as VirtualEvent;
      return (
        <div className="absolute inset-0 pointer-events-none">
           {/* Floating Notes/Particles Background */}
           <div className="absolute inset-0 overflow-hidden">
              {[1,2,3,4,5].map(i => (
                 <div key={i} className={`absolute text-2xl animate-bounce delay-${i * 300} duration-[3s]`} style={{ left: `${15 * i}%`, bottom: `${20 + (i * 5)}%`, opacity: 0.6 }}>
                    🎵
                 </div>
              ))}
           </div>

           {/* Simulated Stage at Bottom */}
           <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-purple-900/90 via-purple-900/40 to-transparent flex items-end justify-center pb-32">
              <div className="relative transform scale-110">
                 {/* Spotlights */}
                 <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] animate-pulse"></div>
                 
                 <img src={event.host.avatar} className="w-40 h-40 rounded-full border-4 border-indigo-500 shadow-[0_0_50px_indigo]" alt="Host" />
                 <div className="text-center mt-4 bg-black/40 backdrop-blur-md rounded-xl p-2">
                    <h3 className="text-white font-bold text-xl drop-shadow-md">{event.host.name}</h3>
                    <p className="text-indigo-200 text-sm uppercase font-bold tracking-wider">Live Performance</p>
                 </div>
              </div>
           </div>
        </div>
      );
    }

    if (mode === 'HANGOUT') {
       return (
          <div className="absolute inset-0 pointer-events-none">
             {hangoutUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="absolute animate-float-slow transition-all duration-500"
                  style={{ top: `${user.y}%`, left: `${user.x}%` }}
                >
                   <div className="relative flex flex-col items-center">
                      <img src={user.img} className="w-16 h-16 rounded-full border-4 border-green-400 shadow-lg" alt={user.name} />
                      <div className="mt-1 bg-black/60 px-2 py-0.5 rounded text-white text-xs font-bold backdrop-blur-sm">
                         {user.name}
                      </div>
                      {/* Chat bubble simulation */}
                      <div className="absolute -top-8 bg-white text-black text-xs px-2 py-1 rounded-lg rounded-bl-none shadow-sm opacity-0 animate-[fadeInOut_5s_infinite] delay-1000">
                         👋 Hey there!
                      </div>
                   </div>
                </div>
             ))}
          </div>
       );
    }

    if (mode === 'GAME') {
       return (
          <div className="absolute inset-0">
             {targets.map(t => (
                <div 
                   key={t.id}
                   onClick={() => handleTargetClick(t.id)}
                   className="absolute w-16 h-16 cursor-pointer transition-all duration-500 ease-out animate-bounce"
                   style={{ top: `${t.top}%`, left: `${t.left}%` }}
                >
                   <div className="w-full h-full bg-yellow-400 rounded-full border-4 border-yellow-200 shadow-[0_0_20px_yellow] flex items-center justify-center text-2xl">
                      🪙
                   </div>
                </div>
             ))}
             
             {timeLeft === 0 && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
                   <Trophy size={64} className="text-yellow-400 mb-4" />
                   <h2 className="text-4xl font-bold mb-2">Time's Up!</h2>
                   <p className="text-2xl mb-6">Final Score: <span className="text-yellow-400">{score}</span></p>
                   <button onClick={() => { setScore(0); setTimeLeft(30); startGame(); }} className="px-6 py-3 bg-indigo-600 rounded-full font-bold">Play Again</button>
                </div>
             )}
          </div>
       );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Feedback Toast */}
      {feedbackMsg && (
         <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 text-white px-6 py-2 rounded-full shadow-xl flex items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle size={16} className="mr-2 text-green-400" />
            {feedbackMsg}
         </div>
      )}

      {/* Camera View */}
      <div className="relative flex-1 overflow-hidden bg-gray-900">
        {useSimulation ? (
           // Simulated Camera Feed (Image)
           <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-50" 
                alt="Simulated View" 
              />
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center z-20">
                 <AlertTriangle size={12} className="mr-1" /> Simulation Mode (Camera Unavailable)
              </div>
           </div>
        ) : (
           // Real Camera Feed
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted 
             className="absolute inset-0 w-full h-full object-cover"
           />
        )}
        
        {/* AR Content Overlay */}
        {renderARContent()}

        {/* UI Overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none">
           {/* Header */}
           <div className="flex justify-between items-start pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 text-white min-w-[150px]">
                 <h2 className="font-bold text-lg">{data?.title || (mode === 'SCAN' ? 'Environment Scan' : 'AR Mode')}</h2>
                 <p className="text-sm opacity-80 flex items-center">
                    {mode === 'GEO' && data && <><MapPin size={14} className="mr-1"/> {data['locationLabel']}</>}
                    {mode === 'EVENT' && <><Music size={14} className="mr-1"/> Live Event</>}
                    {mode === 'HANGOUT' && <><Users size={14} className="mr-1"/> {hangoutUsers.length} Active</>}
                    {mode === 'GAME' && <><Target size={14} className="mr-1"/> Score: {score}</>}
                    {mode === 'SCAN' && <><Scan size={14} className="mr-1"/> Analysing...</>}
                 </p>
              </div>
              
              {mode === 'GAME' && (
                 <div className="bg-red-500 text-white font-bold text-xl px-4 py-2 rounded-full shadow-lg animate-pulse">
                    {timeLeft}s
                 </div>
              )}

              <button onClick={onClose} className="p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white rounded-full transition">
                 <X size={24} />
              </button>
           </div>

           {/* Footer Controls */}
           <div className="flex justify-center items-center pointer-events-auto space-x-6 pb-6">
              {mode === 'HANGOUT' && (
                 <button 
                    onClick={() => addHangoutPerson()}
                    className="w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 backdrop-blur-md flex items-center justify-center text-white transition shadow-lg"
                    title="Add Person"
                 >
                    <UserPlus size={20} />
                 </button>
              )}
              
              {/* Main Action Button */}
              <button 
                 onClick={() => { 
                    if (mode === 'SCAN') { navigator.vibrate && navigator.vibrate(50); }
                    if (mode === 'HANGOUT') { addHangoutPerson(); }
                 }}
                 className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group transition-transform active:scale-95 ${mode === 'SCAN' ? 'bg-white/10' : ''} ${mode === 'HANGOUT' ? 'bg-green-500/20 border-green-400' : ''}`}
              >
                 <div className={`w-16 h-16 rounded-full group-hover:scale-90 transition-transform flex items-center justify-center ${mode === 'HANGOUT' ? 'bg-green-500' : 'bg-white'}`}>
                    {mode === 'HANGOUT' ? <UserPlus size={24} className="text-white" /> : <Camera size={32} className="text-black" />}
                 </div>
              </button>

              <button 
                 onClick={() => { setUseSimulation(!useSimulation); }}
                 className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition"
                 title="Toggle Simulation"
              >
                 <RefreshCw size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ARCameraOverlay;
