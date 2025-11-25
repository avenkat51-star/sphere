
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Users, Zap, Send, Shield, Navigation, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ViewState } from '../types';
import Button from './Button';
import Avatar from './Avatar';

const GeoCircleDetailView: React.FC = () => {
  const { viewingGeoCircle, toggleGeoCircleJoin, setCurrentView, currentUser } = useAppContext();
  const [messageText, setMessageText] = useState('');
  // Mock feed for the circle
  const [feed, setFeed] = useState([
    { id: 1, user: 'Sarah', text: 'Traffic is clearing up on 5th Ave.', time: '2m ago' },
    { id: 2, user: 'Mike', text: 'Anyone near the north entrance?', time: '5m ago' },
    { id: 3, user: 'Admin', text: 'Emergency crews have arrived.', time: '10m ago', isOfficial: true }
  ]);

  if (!viewingGeoCircle) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    setFeed([{ 
      id: Date.now(), 
      user: currentUser.name.split(' ')[0], 
      text: messageText, 
      time: 'Just now' 
    }, ...feed]);
    setMessageText('');
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'EMERGENCY': return 'bg-red-500 text-white';
      case 'EVENT': return 'bg-purple-500 text-white';
      case 'COMMUNITY': return 'bg-green-500 text-white';
      case 'POPUP': return 'bg-orange-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getTypeLabel = (type: string) => {
     if (type === 'EMERGENCY') return 'Active Incident';
     if (type === 'POPUP') return 'Popup Event';
     return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
         <button 
           onClick={() => setCurrentView(ViewState.GEO_CIRCLES)}
           className="flex items-center text-slate-500 hover:text-indigo-600 transition font-medium"
         >
           <ArrowLeft size={20} className="mr-1" /> Back to Map
         </button>
      </div>

      {/* Circle Info Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex-shrink-0 mb-4">
         <div className="relative h-32 bg-slate-200 dark:bg-slate-800">
            {viewingGeoCircle.image ? (
               <img src={viewingGeoCircle.image} alt={viewingGeoCircle.name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/20">
                  <Navigation size={40} className="text-indigo-300" />
               </div>
            )}
            <div className="absolute top-4 right-4">
               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm flex items-center ${getTypeColor(viewingGeoCircle.type)}`}>
                  {viewingGeoCircle.type === 'EMERGENCY' && <AlertTriangle size={12} className="mr-1 animate-pulse"/>}
                  {getTypeLabel(viewingGeoCircle.type)}
               </span>
            </div>
         </div>
         
         <div className="p-5">
            <div className="flex justify-between items-start">
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{viewingGeoCircle.name}</h1>
                  <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                     <MapPin size={14} className="mr-1" /> {viewingGeoCircle.distance} away
                     <span className="mx-2">•</span>
                     <Users size={14} className="mr-1" /> {viewingGeoCircle.memberCount} members
                  </div>
               </div>
               <Button 
                  onClick={() => toggleGeoCircleJoin(viewingGeoCircle.id)}
                  variant={viewingGeoCircle.isJoined ? "secondary" : "primary"}
                  size="sm"
               >
                  {viewingGeoCircle.isJoined ? 'Leave Circle' : 'Join Circle'}
               </Button>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-3">{viewingGeoCircle.description}</p>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
               <Zap size={16} className="text-yellow-500 mr-2" /> Live Activity
            </h3>
            <span className="text-xs text-green-600 dark:text-green-400 font-semibold flex items-center">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
               {viewingGeoCircle.activeNow} Active Now
            </span>
         </div>

         {/* Feed List */}
         <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-900/20">
            {!viewingGeoCircle.isJoined && (
               <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                  <Shield size={48} className="text-slate-300 mb-4" />
                  <p className="font-semibold text-slate-600 dark:text-slate-300">Members Only Feed</p>
                  <p className="text-sm text-slate-500 max-w-xs mt-1">Join this Geo-Circle to view live updates and chat with people nearby.</p>
               </div>
            )}

            {viewingGeoCircle.isJoined && feed.map(post => (
               <div key={post.id} className="flex items-start space-x-3 animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${post.isOfficial ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                     {post.user.charAt(0)}
                  </div>
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                     <div className="flex items-baseline justify-between mb-1">
                        <span className={`font-bold text-xs mr-2 ${post.isOfficial ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>
                           {post.user} {post.isOfficial && <span className="ml-1 px-1 bg-indigo-100 text-indigo-700 rounded text-[8px] uppercase">Official</span>}
                        </span>
                        <span className="text-[10px] text-slate-400">{post.time}</span>
                     </div>
                     <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{post.text}</p>
                  </div>
               </div>
            ))}
         </div>

         {/* Input Area */}
         {viewingGeoCircle.isJoined && (
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
               <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <Avatar src={currentUser.avatar} alt={currentUser.name} size="sm" />
                  <input 
                     type="text" 
                     value={messageText}
                     onChange={(e) => setMessageText(e.target.value)}
                     placeholder={`Message ${viewingGeoCircle.name}...`}
                     className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                  />
                  <button 
                     type="submit" 
                     disabled={!messageText.trim()}
                     className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                  >
                     <Send size={16} />
                  </button>
               </form>
            </div>
         )}
      </div>
    </div>
  );
};

export default GeoCircleDetailView;
