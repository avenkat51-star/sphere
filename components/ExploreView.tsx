
import React, { useEffect, useState, useRef } from 'react';
import { Search, Sparkles, Briefcase, Globe, Heart, MapPin, DollarSign, ExternalLink, Pause, Play, Zap, Newspaper, TrendingUp, Monitor, Palette, Coins, Rocket } from 'lucide-react';
import { generateExploreFeed } from '../services/geminiService';
import { ExploreItem, NewsItem, JobItem, Post } from '../types';
import Avatar from './Avatar';
import Button from './Button';

const TOPICS = [
  { id: 'Technology', label: 'Technology', icon: Monitor },
  { id: 'Business', label: 'Business', icon: TrendingUp },
  { id: 'Design', label: 'Design', icon: Palette },
  { id: 'Crypto', label: 'Crypto', icon: Coins },
  { id: 'Startups', label: 'Startups', icon: Rocket },
  { id: 'Science', label: 'Science', icon: Zap },
  { id: 'World', label: 'World News', icon: Globe },
];

const ExploreView: React.FC = () => {
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<'all' | 'news' | 'jobs' | 'social'>('all');
  const [activeTopic, setActiveTopic] = useState<string>('Technology');
  const [searchInput, setSearchInput] = useState('');
  
  // Live Updates State
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const updateIntervalRef = useRef<number | null>(null);

  // Fetch Initial Content
  const fetchContent = async (topic: string, count: number = 9, append: boolean = false) => {
    if (!append) setLoading(true);
    else setIsUpdating(true);

    const data = await generateExploreFeed(topic, count);
    
    // Ensure data integrity & add fallback avatars
    const enrichedData = data.map((item: any) => {
       if (item.type === 'social') {
          if (!item.author) item.author = { name: 'Sphere User', handle: '@user', avatar: '' };
          if (!item.author.avatar) item.author.avatar = `https://picsum.photos/seed/${item.author.handle || 'random'}/150/150`;
       }
       return item;
    });
    
    if (append) {
       setItems(prev => [...enrichedData, ...prev]); // Prepend new items for "Live" feel
       setIsUpdating(false);
    } else {
       setItems(enrichedData);
       setLoading(false);
    }
  };

  // Initial Fetch on Topic Change
  useEffect(() => {
    fetchContent(activeTopic);
  }, [activeTopic]);

  // Automatic Live Updates Logic
  useEffect(() => {
    if (isLiveMode && !loading) {
       // Fetch 1 new item every 8 seconds to simulate live feed based on CURRENT topic/search
       updateIntervalRef.current = window.setInterval(() => {
          fetchContent(activeTopic, 1, true);
       }, 8000);
    } else {
       if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    }

    return () => {
       if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [isLiveMode, activeTopic, loading]);

  const handleSearch = (e: React.FormEvent) => {
     e.preventDefault();
     if (!searchInput.trim()) return;
     
     // Update active topic to the search query
     setActiveTopic(searchInput);
     // Reset filters
     setActiveType('all');
     // Ensure live mode is on for the new search
     setIsLiveMode(true);
  };

  const handleTopicChipClick = (topicId: string) => {
     setActiveTopic(topicId);
     setSearchInput(''); // Clear search input when clicking chips
  };

  const filteredItems = items.filter(item => activeType === 'all' || item.type === activeType);

  // --- Render Components ---

  const renderSocialCard = (item: Post & { type: 'social' }) => {
    if (!item.author) return null;
    return (
      <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-4 break-inside-avoid hover:shadow-md transition animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="relative group">
          <img src={item.image} alt="Content" className="w-full h-auto object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button size="sm" variant="secondary">View Post</Button>
          </div>
        </div>
        <div className="p-3">
          <p className="text-slate-800 dark:text-slate-200 text-sm mb-3 line-clamp-3">{item.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar src={item.author.avatar} alt={item.author.name} size="sm" />
              <div className="flex flex-col">
                 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.author.name}</span>
                 <span className="text-[10px] text-slate-500">{item.timestamp || 'Just now'}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 text-xs">
              <Heart size={14} className="text-red-500 fill-current" />
              <span>{item.likes}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsCard = (item: NewsItem) => (
    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden mb-4 break-inside-avoid relative group animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-stretch">
         <div className="w-1/3 relative overflow-hidden">
             <img src={item.imageUrl} alt="News" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
             <div className="absolute top-2 left-2">
                <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-pulse">LIVE</span>
             </div>
         </div>
         <div className="w-2/3 p-4 flex flex-col justify-between">
            <div>
               <div className="flex items-center space-x-2 mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">{item.source}</span>
                  <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
               </div>
               <h3 className="font-bold text-slate-900 dark:text-white leading-snug mb-2 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition text-sm">
                 {item.headline}
               </h3>
               <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.summary}</p>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-50 dark:border-slate-800">
               <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">{item.category}</span>
               <button className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
                  <ExternalLink size={14} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );

  const renderJobCard = (item: JobItem) => (
    <div key={item.id} className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-indigo-100 dark:border-slate-700 p-4 mb-4 break-inside-avoid relative hover:shadow-md transition animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-start mb-3">
         <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-lg shadow-sm flex items-center justify-center text-indigo-600 dark:text-indigo-400">
               <Briefcase size={20} />
            </div>
            <div>
               <h3 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h3>
               <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{item.company}</p>
            </div>
         </div>
         <span className="text-[10px] font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">{item.platform}</span>
      </div>
      
      <div className="flex items-center space-x-4 mb-3 text-xs">
         <div className="flex items-center text-slate-500 dark:text-slate-400">
            <MapPin size={12} className="mr-1" />
            {item.location}
         </div>
         <div className="flex items-center text-green-600 dark:text-green-400 font-bold">
            <DollarSign size={12} className="mr-1" />
            {item.salary}
         </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
         {item.tags?.slice(0, 3).map(tag => (
           <span key={tag} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-medium text-slate-600 dark:text-slate-300">
             {tag}
           </span>
         ))}
      </div>

      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-lg transition shadow-sm shadow-indigo-200 dark:shadow-none">
        Quick Apply
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col pb-20">
      {/* Live Ticker Header */}
      <div className="mb-6">
         <div className="flex items-center justify-between mb-4">
           <div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
               <Sparkles className="mr-2 text-indigo-600 dark:text-indigo-400" />
               Explore Feed
             </h1>
             <div className="flex items-center mt-1 space-x-2">
                <span className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${isLiveMode ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-500'}`}>
                   {isLiveMode && <span className="w-2 h-2 bg-red-600 rounded-full mr-1.5 animate-pulse"></span>}
                   {isLiveMode ? 'LIVE UPDATES ON' : 'UPDATES PAUSED'}
                </span>
                {isUpdating && <span className="text-xs text-slate-400 animate-pulse">Fetching new items...</span>}
             </div>
           </div>
           
           <button 
             onClick={() => setIsLiveMode(!isLiveMode)}
             className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition ${isLiveMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
           >
             {isLiveMode ? <><Pause size={16} /> <span>Pause Live</span></> : <><Play size={16} /> <span>Go Live</span></>}
           </button>
         </div>

         {/* Search & Main Filter Tabs */}
         <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-4">
            <form onSubmit={handleSearch} className="relative flex-1 group">
               <Search className="absolute left-4 top-3 text-slate-400 group-focus-within:text-indigo-500 transition" size={18} />
               <input 
                 type="text" 
                 value={searchInput}
                 onChange={(e) => setSearchInput(e.target.value)}
                 placeholder={`Search ${activeTopic.toLowerCase()} news, jobs, and trends...`}
                 className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-12 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm text-slate-900 dark:text-white placeholder-slate-400"
               />
               <button 
                 type="submit"
                 className="absolute right-2 top-1.5 p-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                 title="AI Search"
               >
                  <Sparkles size={16} />
               </button>
            </form>
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
               {(['all', 'news', 'jobs', 'social'] as const).map(type => (
                 <button
                   key={type}
                   onClick={() => setActiveType(type)}
                   className={`px-4 py-2 rounded-lg text-xs font-bold transition capitalize ${
                     activeType === type 
                       ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                       : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                   }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
         </div>

         {/* Topic Chips (Related Choose) */}
         <div className="flex space-x-3 overflow-x-auto pb-2 no-scrollbar">
            {TOPICS.map(topic => {
               const Icon = topic.icon;
               const isActive = activeTopic === topic.id;
               return (
                  <button
                     key={topic.id}
                     onClick={() => handleTopicChipClick(topic.id)}
                     className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                        isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300' 
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-600'
                     }`}
                  >
                     <Icon size={14} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'} />
                     <span>{topic.label}</span>
                  </button>
               );
            })}
         </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-slate-400 animate-pulse">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
             <Sparkles size={32} className="text-indigo-500 animate-spin" />
          </div>
          <p className="font-medium">Curating live {activeTopic} feed...</p>
        </div>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto pr-2 custom-scrollbar"
        >
           <div className="columns-1 md:columns-2 lg:columns-3 gap-4 pb-20 space-y-4">
              {filteredItems.map((item) => {
                if (item.type === 'social') return renderSocialCard(item as any);
                if (item.type === 'news') return renderNewsCard(item as any);
                if (item.type === 'job') return renderJobCard(item as any);
                return null;
              })}
           </div>
           
           {!loading && filteredItems.length === 0 && (
              <div className="text-center py-20 text-slate-400">
                 <Newspaper size={48} className="mx-auto mb-4 opacity-50" />
                 <p>No items found for this filter.</p>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

export default ExploreView;
