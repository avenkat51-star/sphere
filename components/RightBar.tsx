
import React from 'react';
import { Search, TrendingUp, UserPlus, Check, Smartphone } from 'lucide-react';
import { TRENDING_TOPICS } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import { ViewState } from '../types';
import Avatar from './Avatar';
import Button from './Button';

const RightBar: React.FC = () => {
  const { users, followUser, setSearchQuery, searchQuery, setCurrentView, setContactSyncOpen } = useAppContext();
  
  // Filter mock users to show only those not currently followed (simulation)
  const suggestedUsers = users.slice(0, 3);

  const handleTopicClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentView(ViewState.HOME);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="hidden lg:block w-80 h-screen sticky top-0 pt-6 pb-4 px-4 overflow-y-auto no-scrollbar border-l border-slate-200 dark:border-slate-800 transition-colors duration-300">
      {/* Search */}
      <div className="relative mb-6 group">
        <input
          type="text"
          placeholder="Search Sphere..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value) setCurrentView(ViewState.HOME);
          }}
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-full py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-sm"
        />
        <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
      </div>

      {/* Sync Contacts Call to Action */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 mb-6 text-white shadow-lg relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-white/20 transition duration-500"></div>
         <div className="relative z-10">
            <h3 className="font-bold text-lg mb-2 flex items-center">
               <Smartphone size={20} className="mr-2" /> Find Friends
            </h3>
            <p className="text-indigo-100 text-sm mb-4">
               Sync your mobile contacts to find people you already know on Sphere.
            </p>
            <Button 
               size="sm" 
               className="w-full bg-white text-indigo-700 hover:bg-indigo-50 border-none shadow-md"
               onClick={() => setContactSyncOpen(true)}
            >
               Sync Contacts
            </Button>
         </div>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center">
          <TrendingUp size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Trending Now
        </h3>
        <div className="space-y-4">
          {TRENDING_TOPICS.map((topic, index) => (
            <div 
              key={index} 
              onClick={() => handleTopicClick(topic.tag)}
              className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 -mx-2 rounded-lg transition-colors"
            >
              <div>
                <p className={`font-semibold transition-colors ${searchQuery === topic.tag ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                   {topic.tag}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{topic.posts} posts</p>
              </div>
              <span className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Users */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center">
          <UserPlus size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Who to follow
        </h3>
        <div className="space-y-4">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar src={user.avatar} alt={user.name} size="md" />
                <div className="overflow-hidden">
                  <p className="font-semibold text-sm text-slate-900 dark:text-white truncate w-24">{user.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-24">{user.handle}</p>
                </div>
              </div>
              <button 
                onClick={() => followUser(user.id)}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all flex items-center ${
                  user.isFollowing 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' 
                    : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                }`}
              >
                {user.isFollowing ? <><Check size={14} className="mr-1"/> Following</> : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 text-xs text-slate-400 text-center space-x-2">
        <a href="#" className="hover:underline">Privacy</a>
        <span>•</span>
        <a href="#" className="hover:underline">Terms</a>
        <span>•</span>
        <a href="#" className="hover:underline">Cookies</a>
        <div className="mt-2">© 2024 Sphere Social Inc.</div>
      </div>
    </div>
  );
};

export default RightBar;
