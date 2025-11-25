
import React from 'react';
import { ArrowLeft, Users, CheckCircle, Plus, Search } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ViewState } from '../types';
import Button from './Button';
import PostCard from './PostCard';
import CreatePost from './CreatePost';

const CommunityDetailView: React.FC = () => {
  const { 
    viewingCommunity, 
    toggleGroupJoin, 
    setCurrentView, 
    posts, 
    currentUser, 
    createPost, 
    likePost, 
    addComment 
  } = useAppContext();

  if (!viewingCommunity) return null;

  // Filter posts for this specific community
  const communityPosts = posts.filter(p => p.groupId === viewingCommunity.id);

  const handleCreateGroupPost = (content: string, image?: string, video?: string, audio?: string, transcription?: string, stealthConfig?: any, poll?: any, game?: any) => {
    createPost(content, image, video, audio, transcription, stealthConfig, poll, game, viewingCommunity.id);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back Button */}
      <button 
        onClick={() => setCurrentView(ViewState.COMMUNITIES)}
        className="flex items-center text-slate-500 hover:text-indigo-600 mb-4 transition font-medium"
      >
        <ArrowLeft size={20} className="mr-1" /> Back to Communities
      </button>

      {/* Cover Image Header */}
      <div className="relative h-64 rounded-2xl overflow-hidden mb-6 group">
        <img 
          src={viewingCommunity.image} 
          alt={viewingCommunity.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 p-6 w-full">
           <div className="flex justify-between items-end">
              <div>
                 <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md mb-2 border border-indigo-500/50">
                    {viewingCommunity.category}
                 </span>
                 <h1 className="text-3xl font-bold text-white mb-2">{viewingCommunity.name}</h1>
                 <div className="flex items-center text-slate-200 text-sm">
                    <Users size={16} className="mr-1.5" />
                    {viewingCommunity.members.toLocaleString()} members
                 </div>
              </div>
              
              <Button 
                onClick={() => toggleGroupJoin(viewingCommunity.id)}
                className={`shadow-lg ${viewingCommunity.isJoined ? 'bg-white text-slate-800 hover:bg-slate-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
              >
                 {viewingCommunity.isJoined ? (
                    <span className="flex items-center"><CheckCircle size={18} className="mr-2 text-green-500" /> Joined</span>
                 ) : (
                    <span className="flex items-center"><Plus size={18} className="mr-2" /> Join Community</span>
                 )}
              </Button>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Feed */}
         <div className="lg:col-span-2">
            {/* Description */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 shadow-sm">
               <h3 className="font-bold text-slate-900 dark:text-white mb-2">About</h3>
               <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  {viewingCommunity.description}
               </p>
            </div>

            {/* Create Post Area (Only if joined) */}
            {viewingCommunity.isJoined ? (
               <div className="mb-6">
                  <CreatePost currentUser={currentUser} onPostCreate={handleCreateGroupPost} />
               </div>
            ) : (
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-6 text-center">
                  <p className="text-indigo-800 dark:text-indigo-200 font-medium">Join this community to start posting and interacting!</p>
               </div>
            )}

            {/* Feed */}
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Community Feed</h3>
            <div className="space-y-6">
               {communityPosts.length > 0 ? (
                  communityPosts.map(post => (
                     <PostCard 
                        key={post.id} 
                        post={post} 
                        onLike={likePost} 
                        onAddComment={addComment} 
                     />
                  ))
               ) : (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-slate-400" />
                     </div>
                     <h3 className="font-bold text-slate-700 dark:text-slate-300">No posts yet</h3>
                     <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Be the first to share something in this community!</p>
                  </div>
               )}
            </div>
         </div>

         {/* Sidebar Info */}
         <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4">Community Rules</h3>
               <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>Be respectful and kind to others.</li>
                  <li>No spam or self-promotion.</li>
                  <li>Keep discussions relevant to the topic.</li>
                  <li>Report unsafe or inappropriate content.</li>
               </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4">Admins</h3>
               <div className="flex items-center space-x-3 mb-3">
                  <img src="https://picsum.photos/id/64/150/150" className="w-10 h-10 rounded-full" alt="Admin" />
                  <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Community Lead</p>
                     <p className="text-xs text-slate-500">@admin_lead</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CommunityDetailView;
