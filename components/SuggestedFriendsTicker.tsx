
import React, { useRef, useEffect, useState } from 'react';
import { UserPlus, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';

const SuggestedFriendsTicker: React.FC = () => {
  const { users, followUser } = useAppContext();
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  // Filter users who are not yet followed
  const suggestedUsers = users.filter(u => !u.isFollowing).slice(0, 10);
  
  // If we don't have enough users, duplicate them to create an infinite loop effect
  const displayUsers = suggestedUsers.length < 5 ? [...suggestedUsers, ...suggestedUsers, ...suggestedUsers] : [...suggestedUsers, ...suggestedUsers];

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (!isHovered && scrollRef.current) {
        setOffset((prev) => {
          const newOffset = prev + 0.5; // Adjust speed here
          // Reset when we've scrolled past half the content (since we duplicated it)
          if (newOffset >= scrollRef.current!.scrollWidth / 2) {
             return 0;
          }
          return newOffset;
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, displayUsers.length]);

  if (suggestedUsers.length === 0) return null;

  return (
    <div className="mb-6 relative overflow-hidden group">
       <div className="flex items-center justify-between px-1 mb-2">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">People You May Know</h3>
          <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 px-2 py-0.5 rounded-full">
             Auto-scrolling
          </span>
       </div>
       
       <div 
         className="overflow-hidden w-full relative"
         onMouseEnter={() => setIsHovered(true)}
         onMouseLeave={() => setIsHovered(false)}
       >
          <div 
             ref={scrollRef}
             className="flex space-x-3 transition-transform duration-75 ease-linear will-change-transform"
             style={{ transform: `translateX(-${offset}px)` }}
          >
             {displayUsers.map((user, index) => (
                <div 
                   key={`${user.id}-${index}`} 
                   className="flex-shrink-0 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow relative"
                >
                   <Avatar src={user.avatar} alt={user.name} size="md" className="mb-2" />
                   <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate w-full">{user.name}</h4>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 truncate w-full">{user.handle}</p>
                   
                   <button 
                      onClick={(e) => { e.stopPropagation(); followUser(user.id); }}
                      className="w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center transition-colors bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
                   >
                      <UserPlus size={12} className="mr-1" /> Follow
                   </button>
                </div>
             ))}
          </div>

          {/* Gradient Masks for fade effect */}
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none"></div>
       </div>
    </div>
  );
};

export default SuggestedFriendsTicker;
