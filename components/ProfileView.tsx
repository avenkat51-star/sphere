
import React, { useState, useEffect } from 'react';
import { Shield, Palette, MessageCircle, Heart, Zap, Award, Star, Info, TrendingUp, Check, UserPlus } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';
import Button from './Button';
import { Badge } from '../types';

const ProfileView: React.FC = () => {
  const { currentUser, viewingUser, posts, followUser, recordProfileVisit, startChat } = useAppContext();
  const [activeTab, setActiveTab] = useState<'POSTS' | 'MEDIA' | 'REPUTATION'>('POSTS');
  const [showBadgeInfo, setShowBadgeInfo] = useState<Badge | null>(null);

  // Use the viewingUser if set, otherwise fallback to currentUser
  const profileUser = viewingUser || currentUser;
  const isOwnProfile = profileUser.id === currentUser.id;

  // Record visit on mount if viewing someone else's profile
  useEffect(() => {
    if (!isOwnProfile && profileUser.id) {
       recordProfileVisit(profileUser.id);
    }
  }, [profileUser.id, isOwnProfile]);

  const getBadgeIcon = (iconName: string, size: number = 16) => {
    switch (iconName) {
      case 'Shield': return <Shield size={size} />;
      case 'Palette': return <Palette size={size} />;
      case 'MessageCircle': return <MessageCircle size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Zap': return <Zap size={size} />;
      default: return <Award size={size} />;
    }
  };

  const reputationLevel = Math.floor((profileUser.reputationScore || 0) / 100);
  const progress = ((profileUser.reputationScore || 0) % 100);

  // Filter posts for this specific user from the global posts array
  const userPosts = posts.filter(p => p.author.id === profileUser.id);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300 mb-20">
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Reputation Badge Overlay */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center space-x-2 border border-white/20">
           <Star size={14} className="text-yellow-300 fill-current" />
           <span className="font-bold text-sm">Lvl {reputationLevel} Contributor</span>
        </div>
      </div>
      
      <div className="px-6 pb-6">
        <div className="relative flex justify-between items-end -mt-16 mb-4">
          <div className="relative">
            <div className="p-1 bg-white dark:bg-slate-900 rounded-full transition-colors duration-300">
              <Avatar src={profileUser.avatar} alt={profileUser.name} size="xl" className="w-32 h-32 border-4 border-white dark:border-slate-800" />
            </div>
          </div>
          
          {isOwnProfile ? (
             <button className="mb-4 px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm">
               Edit Profile
             </button>
          ) : (
             <div className="flex space-x-2 mb-4">
               <Button 
                  onClick={() => followUser(profileUser.id)}
                  className={`px-6 ${profileUser.isFollowing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : ''}`}
                  leftIcon={profileUser.isFollowing ? <Check size={18}/> : <UserPlus size={18}/>}
               >
                  {profileUser.isFollowing ? 'Following' : 'Follow'}
               </Button>
               <Button 
                  variant="secondary"
                  onClick={() => startChat(profileUser)}
                  className="px-3"
               >
                  <MessageCircle size={20} />
               </Button>
             </div>
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2 mb-1">
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{profileUser.name}</h1>
             {/* Top Badge Display */}
             {profileUser.badges && profileUser.badges.length > 0 && (
                <div 
                   className={`p-1 rounded-full ${profileUser.badges[0].color} bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tooltip-trigger`}
                   title={profileUser.badges[0].name}
                >
                   {getBadgeIcon(profileUser.badges[0].icon, 14)}
                </div>
             )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-4">{profileUser.handle}</p>
          <p className="text-slate-700 dark:text-slate-300 mb-6">{profileUser.bio || "No bio available."}</p>
          
          <div className="flex space-x-6 text-sm mb-6">
            <p><span className="font-bold text-slate-900 dark:text-white">{profileUser.following}</span> <span className="text-slate-500 dark:text-slate-400">Following</span></p>
            <p><span className="font-bold text-slate-900 dark:text-white">{profileUser.followers}</span> <span className="text-slate-500 dark:text-slate-400">Followers</span></p>
            <p><span className="font-bold text-slate-900 dark:text-white">{profileUser.reputationScore}</span> <span className="text-slate-500 dark:text-slate-400">Reputation</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-slate-100 dark:border-slate-800">
        <button 
           onClick={() => setActiveTab('POSTS')}
           className={`flex-1 py-4 text-center font-semibold transition ${activeTab === 'POSTS' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
           Posts
        </button>
        <button 
           onClick={() => setActiveTab('MEDIA')}
           className={`flex-1 py-4 text-center font-semibold transition ${activeTab === 'MEDIA' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
           Media
        </button>
        <button 
           onClick={() => setActiveTab('REPUTATION')}
           className={`flex-1 py-4 text-center font-semibold transition flex items-center justify-center space-x-2 ${activeTab === 'REPUTATION' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
           <Award size={16} />
           <span>Reputation</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px] bg-slate-50 dark:bg-slate-950/30 p-4">
         
         {activeTab === 'POSTS' && (
            <div className="grid grid-cols-3 gap-1">
               {userPosts.map(p => (
                  <div key={p.id} className="aspect-square bg-slate-100 dark:bg-slate-800 relative group overflow-hidden cursor-pointer">
                     {p.image ? (
                        <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" />
                     ) : p.video ? (
                        <video src={p.video} className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-sm text-slate-500 dark:text-slate-400 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                           "{p.content.substring(0, 50)}..."
                        </div>
                     )}
                     
                     {/* Stealth Indicator */}
                     {p.stealthConfig && (
                        <div className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white backdrop-blur-sm z-10">
                           <Zap size={10} />
                        </div>
                     )}

                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center opacity-0 group-hover:opacity-100 text-white font-bold">
                        {p.likes} ❤️
                     </div>
                  </div>
               ))}
               {/* Empty State */}
               {userPosts.length === 0 && (
                  <div className="col-span-3 text-center py-10 text-slate-400">
                     No posts yet.
                  </div>
               )}
            </div>
         )}

         {activeTab === 'MEDIA' && (
             <div className="text-center py-10 text-slate-400">
                Media gallery coming soon.
             </div>
         )}

         {activeTab === 'REPUTATION' && (
            <div className="space-y-6">
               {/* Reputation Score Card */}
               <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                           <TrendingUp className="mr-2 text-green-500" /> Reputation Score
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Earned through positive community contributions.</p>
                     </div>
                     <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{profileUser.reputationScore}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <span>Level {reputationLevel}</span>
                        <span>{progress} / 100 to next level</span>
                     </div>
                     <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                     </div>
                  </div>
               </div>

               {/* Badges Grid */}
               <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center">
                     <Award className="mr-2 text-purple-500" /> Earned Badges
                  </h3>
                  
                  {(!profileUser.badges || profileUser.badges.length === 0) ? (
                     <p className="text-slate-500 italic">No badges earned yet.</p>
                  ) : (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {profileUser.badges.map(badge => (
                           <div 
                              key={badge.id} 
                              onClick={() => setShowBadgeInfo(badge)}
                              className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center hover:shadow-md transition cursor-pointer group"
                           >
                              <div className={`w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 ${badge.color}`}>
                                 {getBadgeIcon(badge.icon, 24)}
                              </div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{badge.name}</h4>
                              <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">{badge.category}</span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Badge Details Modal */}
               {showBadgeInfo && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setShowBadgeInfo(null)}>
                     <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in duration-200 text-center" onClick={e => e.stopPropagation()}>
                        <div className={`w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 ${showBadgeInfo.color}`}>
                           {getBadgeIcon(showBadgeInfo.icon, 40)}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{showBadgeInfo.name}</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">{showBadgeInfo.description}</p>
                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-xs text-slate-500 mb-6">
                           Earned on {showBadgeInfo.dateEarned}
                        </div>
                        <Button className="w-full" onClick={() => setShowBadgeInfo(null)}>Close</Button>
                     </div>
                  </div>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default ProfileView;
