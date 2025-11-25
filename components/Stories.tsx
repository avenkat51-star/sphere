
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, X, Play, ChevronLeft, ChevronRight, Video, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';
import { Story } from '../types';

const Stories: React.FC = () => {
  const { currentUser, stories, addStory } = useAppContext();
  
  // Viewer State
  const [viewingStories, setViewingStories] = useState<Story[] | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressInterval = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Group stories by user
  const storiesByUser = useMemo(() => {
    const map = new Map<string, Story[]>();
    stories.forEach(s => {
      const existing = map.get(s.user.id) || [];
      existing.push(s);
      map.set(s.user.id, existing);
    });
    return map;
  }, [stories]);

  const myStories = storiesByUser.get(currentUser.id) || [];
  
  // Get list of other users who have stories (distinct users)
  // Sort by latest story timestamp (simulated by index here since new ones are prepended)
  const otherUsersWithStories = Array.from(storiesByUser.keys())
    .filter(id => id !== currentUser.id)
    .map(id => storiesByUser.get(id)![0].user);

  const activeStory = viewingStories ? viewingStories[currentStoryIndex] : null;

  // Cleanup timer on unmount or change
  useEffect(() => {
    return () => {
      if (progressInterval.current) window.clearInterval(progressInterval.current);
    };
  }, []);

  // Timer Logic for Images
  useEffect(() => {
    if (!activeStory || isPaused) return;

    setProgress(0);
    if (progressInterval.current) window.clearInterval(progressInterval.current);

    if (activeStory.type === 'image') {
      const DURATION = 5000; // 5 seconds
      const INTERVAL = 50; 
      const step = (INTERVAL / DURATION) * 100;

      progressInterval.current = window.setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextStory();
            return 100;
          }
          return prev + step;
        });
      }, INTERVAL);
    } 
    // For video, progress is driven by onTimeUpdate
  }, [activeStory, isPaused]);

  const nextStory = () => {
    if (viewingStories && currentStoryIndex < viewingStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      closeViewer();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else {
      // Restart current story
      setProgress(0);
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  };

  const openStoryGroup = (storiesToView: Story[]) => {
    if (storiesToView.length === 0) return;
    // Stories are stored Newest -> Oldest. We want to view Oldest -> Newest (Chronological)
    // or Newest first? Instagram usually shows unwatched chronological. 
    // For simplicity, let's reverse to show oldest first (chronological flow).
    const chronological = [...storiesToView].reverse();
    
    setViewingStories(chronological);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const closeViewer = () => {
    setViewingStories(null);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      
      addStory(url, type);
      e.target.value = ''; // Reset input
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (isPaused) return;
    const vid = e.currentTarget;
    if (vid.duration) {
      const p = (vid.currentTime / vid.duration) * 100;
      setProgress(p);
    }
  };

  const togglePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(!isPaused);
    if (videoRef.current) {
      if (isPaused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  return (
    <>
      {/* Story Viewer Overlay */}
      {activeStory && viewingStories && (
        <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center animate-in fade-in duration-200">
           
           {/* Progress Bars Container */}
           <div className="absolute top-4 left-4 right-4 z-20 flex space-x-1">
             {viewingStories.map((_, idx) => (
               <div key={idx} className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
                 <div 
                   className={`h-full bg-white transition-all duration-100 ease-linear ${
                     idx < currentStoryIndex ? 'w-full' : idx === currentStoryIndex ? '' : 'w-0'
                   }`}
                   style={{ width: idx === currentStoryIndex ? `${progress}%` : undefined }}
                 ></div>
               </div>
             ))}
           </div>

           {/* Header */}
           <div className="absolute top-8 left-4 right-4 z-20 flex justify-between items-center">
             <div className="flex items-center space-x-3">
               <Avatar src={activeStory.user.avatar} alt={activeStory.user.name} />
               <div>
                 <p className="text-white font-bold text-shadow text-sm">{activeStory.user.name}</p>
                 <p className="text-white/70 text-xs">
                   {activeStory.type === 'video' ? 'Video Story' : 'Image Story'}
                 </p>
               </div>
             </div>
             <div className="flex items-center space-x-4">
                {isPaused && (
                   <span className="bg-black/50 text-white px-2 py-1 rounded text-xs">PAUSED</span>
                )}
                <button onClick={closeViewer} className="text-white p-2 hover:bg-white/20 rounded-full transition">
                  <X size={24} />
                </button>
             </div>
           </div>

           {/* Story Content */}
           <div className="w-full h-full relative flex items-center justify-center bg-black" onClick={togglePause}>
             {activeStory.type === 'video' ? (
                <video 
                   ref={videoRef}
                   src={activeStory.mediaUrl} 
                   className="w-full h-full object-contain" 
                   autoPlay 
                   playsInline
                   onTimeUpdate={handleVideoUpdate}
                   onEnded={nextStory}
                />
             ) : (
                <img src={activeStory.mediaUrl} className="w-full h-full object-contain" alt="Story" />
             )}
           </div>

           {/* Navigation Click Zones (Invisible) */}
           <div className="absolute inset-0 flex pointer-events-none">
              <div 
                className="w-1/3 h-full pointer-events-auto" 
                onClick={(e) => { e.stopPropagation(); prevStory(); }}
              ></div>
              <div 
                className="w-1/3 h-full pointer-events-auto flex items-center justify-center" 
                onClick={togglePause}
              >
                 {/* Center zone toggles pause */}
              </div> 
              <div 
                className="w-1/3 h-full pointer-events-auto" 
                onClick={(e) => { e.stopPropagation(); nextStory(); }}
              ></div>
           </div>

           {/* Desktop Nav Arrows */}
           <button 
             className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/40 text-white z-30 hidden md:block backdrop-blur-sm"
             onClick={(e) => { e.stopPropagation(); prevStory(); }}
           >
             <ChevronLeft size={24} />
           </button>
           <button 
             className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full hover:bg-white/40 text-white z-30 hidden md:block backdrop-blur-sm"
             onClick={(e) => { e.stopPropagation(); nextStory(); }}
           >
             <ChevronRight size={24} />
           </button>
        </div>
      )}

      {/* Stories Rail */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 mb-6 overflow-x-auto no-scrollbar transition-colors duration-300">
        <div className="flex space-x-4 min-w-max">
          
          {/* Your Story Circle */}
          <div className="flex flex-col items-center space-y-2 cursor-pointer group relative">
            <div className="relative">
              {/* Main Avatar Click Action: View if exists, Upload if empty */}
              <div 
                className={`w-16 h-16 rounded-full p-[2px] ${myStories.length > 0 ? 'bg-gradient-to-tr from-indigo-500 to-purple-600' : 'border-2 border-slate-200 dark:border-slate-700 border-dashed'}`}
                onClick={() => myStories.length > 0 ? openStoryGroup(myStories) : triggerUpload()}
              >
                 <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden relative bg-slate-50 dark:bg-slate-800">
                    <img src={currentUser.avatar} alt="Me" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                    {myStories.length === 0 && (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                          <Plus size={20} className="text-white" />
                       </div>
                    )}
                 </div>
              </div>
              
              {/* Always visible Add Button Overlay */}
              <div 
                 onClick={(e) => { e.stopPropagation(); triggerUpload(); }}
                 className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-1.5 border-2 border-white dark:border-slate-900 hover:scale-110 hover:bg-indigo-700 transition z-10 shadow-sm"
                 title="Add new story"
              >
                <Plus size={12} strokeWidth={3} />
              </div>
            </div>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Your Story</span>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*"
            onChange={handleFileSelect}
            onClick={(e) => (e.target as HTMLInputElement).value = ''}
          />

          {/* Other Users' Story Circles */}
          {otherUsersWithStories.map(user => {
            const userSpecificStories = storiesByUser.get(user.id) || [];
            // Preview the latest story for the thumbnail
            const latestStory = userSpecificStories[0]; 

            return (
              <div 
                key={user.id} 
                onClick={() => openStoryGroup(userSpecificStories)}
                className="flex flex-col items-center space-y-2 cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 group-hover:from-yellow-300 group-hover:to-purple-500 transition-colors">
                  <div className="w-full h-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden relative">
                    {latestStory.type === 'video' ? (
                       <video src={latestStory.mediaUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" muted />
                    ) : (
                       <img src={latestStory.mediaUrl} alt={user.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    )}
                    
                    {/* Video Indicator */}
                    {latestStory.type === 'video' && (
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-md bg-black/20 rounded-full p-1 backdrop-blur-sm">
                          <Play size={12} fill="currentColor" />
                       </div>
                    )}

                    {/* Count Indicator if multiple */}
                    {userSpecificStories.length > 1 && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 h-4 flex justify-center items-center">
                         <div className="flex space-x-0.5">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 w-16 truncate text-center">{user.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Stories;
