
import React, { useState } from 'react';
import { Heart, UserPlus, MessageCircle, AtSign, CheckCheck, Filter, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';
import Button from './Button';

const NotificationsView: React.FC = () => {
  const { notifications, markNotificationsRead, followUser, users, navigateToPost } = useAppContext();
  const [filter, setFilter] = useState<'ALL' | 'LIKE' | 'COMMENT' | 'MENTION' | 'FOLLOW'>('ALL');

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'LIKE': return <div className="bg-red-100 p-2 rounded-full text-red-500"><Heart size={16} fill="currentColor" /></div>;
      case 'FOLLOW': return <div className="bg-indigo-100 p-2 rounded-full text-indigo-500"><UserPlus size={16} /></div>;
      case 'COMMENT': return <div className="bg-blue-100 p-2 rounded-full text-blue-500"><MessageCircle size={16} fill="currentColor" /></div>;
      default: return <div className="bg-slate-100 p-2 rounded-full text-slate-500"><AtSign size={16} /></div>;
    }
  };

  const getMessage = (type: string) => {
    switch(type) {
      case 'LIKE': return 'liked your post.';
      case 'FOLLOW': return 'started following you.';
      case 'COMMENT': return 'commented on your post.';
      case 'MENTION': return 'mentioned you in a post.';
      default: return 'interacted with you.';
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm">Stay updated with your interactions.</p>
        </div>
        <Button 
           variant="ghost" 
           size="sm" 
           onClick={markNotificationsRead}
           className="text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
        >
           <CheckCheck size={16} className="mr-1.5" /> Mark all read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-2">
         {['ALL', 'LIKE', 'COMMENT', 'MENTION', 'FOLLOW'].map((type) => (
            <button
               key={type}
               onClick={() => setFilter(type as any)}
               className={`px-4 py-2 rounded-full text-xs font-bold transition whitespace-nowrap border ${
                  filter === type 
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white' 
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
               }`}
            >
               {type === 'ALL' ? 'All Activity' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
            </button>
         ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden min-h-[300px]">
        {filteredNotifications.length > 0 ? (
           filteredNotifications.map((notification) => {
             // Resolve the current user state from the users context
             const actor = users.find(u => u.id === notification.actor.id) || notification.actor;
             
             return (
               <div 
                 key={notification.id} 
                 onClick={() => notification.post && navigateToPost(notification.post.id)}
                 className={`p-4 border-b border-slate-50 dark:border-slate-800 flex items-start space-x-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''} ${notification.post ? 'cursor-pointer' : ''}`}
               >
                 {/* Icon Type */}
                 <div className="flex-shrink-0 mt-1">
                   {getIcon(notification.type)}
                 </div>

                 {/* Content */}
                 <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                         <Avatar src={actor.avatar} alt={actor.name} size="sm" />
                         <p className="text-sm text-slate-800 dark:text-slate-200">
                           <span className="font-bold text-slate-900 dark:text-white">{actor.name}</span> {getMessage(notification.type)}
                         </p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{notification.timestamp}</span>
                    </div>
                    
                    {notification.type === 'COMMENT' && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-10 border-l-2 border-slate-200 dark:border-slate-700 pl-3 italic">
                        "Great post! Totally agree."
                      </p>
                    )}

                    {notification.type === 'FOLLOW' && (
                      <div className="mt-3 ml-10" onClick={(e) => e.stopPropagation()}>
                        <Button 
                          size="sm" 
                          variant={actor.isFollowing ? "secondary" : "primary"}
                          onClick={() => followUser(actor.id)}
                          className={actor.isFollowing ? "bg-slate-100 dark:bg-slate-800 text-slate-600" : ""}
                        >
                          {actor.isFollowing ? (
                             <><Check size={14} className="mr-1" /> Following</>
                          ) : (
                             "Follow Back"
                          )}
                        </Button>
                      </div>
                    )}
                 </div>
                 
                 {!notification.isRead && (
                   <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                 )}
               </div>
             );
           })
        ) : (
           <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Filter size={32} className="mb-2 opacity-50" />
              <p>No notifications found.</p>
           </div>
        )}

        {filteredNotifications.length > 0 && (
           <div className="p-4 text-center text-slate-500 dark:text-slate-400 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition border-t border-slate-100 dark:border-slate-800">
             View earlier notifications
           </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
