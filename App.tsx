
import React, { useState, useEffect } from 'react';
import { Menu, Zap, Leaf, Flame, Brain, Layers, X, Search } from 'lucide-react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ViewState, User, Mood } from './types';

// Components
import Sidebar from './components/Sidebar';
import RightBar from './components/RightBar';
import CreatePost from './components/CreatePost';
import PostCard from './components/PostCard';
import Avatar from './components/Avatar';
import MessagesView from './components/MessagesView';
import LiveCallModal from './components/LiveCallModal';
import AuthScreen from './components/AuthScreen';
import Stories from './components/Stories';
import NotificationsView from './components/NotificationsView';
import ExploreView from './components/ExploreView';
import CommunitiesView from './components/CommunitiesView';
import CommunityDetailView from './components/CommunityDetailView';
import MarketplaceView from './components/MarketplaceView';
import AICompanionView from './components/AICompanionView';
import MixedRealityView from './components/MixedRealityView';
import VoiceRoomsView from './components/VoiceRoomsView'; 
import GeoCirclesView from './components/GeoCirclesView';
import GeoCircleDetailView from './components/GeoCircleDetailView'; 
import MemoryLaneView from './components/MemoryLaneView'; 
import IdentityWalletView from './components/IdentityWalletView'; 
import ProfileView from './components/ProfileView';
import SuggestedFriendsTicker from './components/SuggestedFriendsTicker';
import SyncContactsModal from './components/SyncContactsModal';

const MoodSelector: React.FC = () => {
  const { currentMood, setMood } = useAppContext();

  const moods: { id: Mood; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'ALL', label: 'All', icon: Layers, color: 'text-slate-500' },
    { id: 'RELAX', label: 'Relax', icon: Leaf, color: 'text-emerald-500' },
    { id: 'INSPIRE', label: 'Inspire', icon: Flame, color: 'text-orange-500' },
    { id: 'FOCUS', label: 'Focus', icon: Brain, color: 'text-indigo-500' },
  ];

  return (
    <div className="flex space-x-2 mb-6 overflow-x-auto no-scrollbar pb-1">
      {moods.map((m) => {
        const Icon = m.icon;
        const isActive = currentMood === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMood(m.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              isActive
                ? 'bg-white dark:bg-slate-800 border-indigo-500 ring-1 ring-indigo-500 shadow-sm'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Icon size={16} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : m.color} />
            <span className={isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { 
    currentUser, 
    filteredPosts, 
    createPost, 
    likePost, 
    addComment,
    currentView,
    setCurrentView,
    searchQuery,
    setSearchQuery,
    setMood,
    viewingPostId,
    setViewingPostId
  } = useAppContext();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Call State
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callTarget, setCallTarget] = useState<User | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);

  // Scroll to specific post when navigated from notification
  useEffect(() => {
    if (viewingPostId && currentView === ViewState.HOME) {
      // Timeout to ensure rendering is complete after filter reset
      setTimeout(() => {
        const element = document.getElementById(`post-${viewingPostId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a highlight animation class
          element.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-slate-950', 'transition-all', 'duration-500');
          
          // Remove highlight after animation
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-slate-950');
            setViewingPostId(null); // Reset state
          }, 2000);
        }
      }, 300);
    }
  }, [viewingPostId, currentView, filteredPosts]);

  const startCall = (user: User, video: boolean) => {
    setCallTarget(user);
    setIsVideoCall(video);
    setIsCallOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex justify-center transition-colors duration-300">
      {/* Global Modals */}
      <SyncContactsModal />

      {/* Main Container constrained to max width */}
      <div className="w-full max-w-7xl flex relative">
        
        {/* Left Sidebar */}
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-50 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
           <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
               <Zap size={20} fill="currentColor" />
             </div>
             <span className="font-bold text-lg text-slate-900 dark:text-white">Sphere</span>
           </div>
           <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
             <Menu size={24} />
           </button>
        </div>

        {/* Main Feed Area */}
        <main className={`flex-1 min-w-0 border-r border-slate-200 dark:border-slate-800 md:ml-0 pt-20 md:pt-6 transition-colors duration-300 ${currentView === ViewState.MESSAGES ? 'h-screen md:h-auto overflow-hidden md:overflow-visible' : ''}`}>
          <div className={`max-w-3xl mx-auto ${currentView === ViewState.MESSAGES ? 'h-full' : 'px-4 pb-20'}`}>
            
            {/* Conditional Views */}
            {currentView === ViewState.HOME && (
              <>
                 <Stories />
                 
                 {/* Auto-scrolling Suggested Friends Ticker */}
                 <SuggestedFriendsTicker />
                 
                 <CreatePost currentUser={currentUser} onPostCreate={createPost} />
                 
                 {/* Search Banner */}
                 {searchQuery && (
                   <div className="flex items-center justify-between mb-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in fade-in slide-in-from-top-2">
                      <div className="flex items-center space-x-2">
                        <Search size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-sm text-indigo-900 dark:text-indigo-100">
                           Results for <span className="font-bold">"{searchQuery}"</span>
                        </span>
                      </div>
                      <button 
                        onClick={() => setSearchQuery('')} 
                        className="p-1.5 hover:bg-white/50 dark:hover:bg-white/10 rounded-full text-indigo-700 dark:text-indigo-300 transition"
                      >
                        <X size={16} />
                      </button>
                   </div>
                 )}

                 {/* AI Mood Feed Engine */}
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Feed Engine</h3>
                   <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Safe Mode On</span>
                 </div>
                 <MoodSelector />

                 {/* Posts Feed */}
                 <div className="space-y-6">
                   {filteredPosts.length > 0 ? (
                     filteredPosts.map(post => (
                       <div key={post.id} id={`post-${post.id}`} className="rounded-xl transition-all duration-300">
                         <PostCard 
                           post={post} 
                           onLike={likePost} 
                           onAddComment={addComment} 
                         />
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-10 text-slate-500">
                       <p>No posts found matching your criteria.</p>
                       <button 
                         onClick={() => { setSearchQuery(''); setMood('ALL'); }} 
                         className="text-indigo-600 font-semibold mt-2"
                       >Clear Filters</button>
                     </div>
                   )}
                 </div>
              </>
            )}

            {currentView === ViewState.MESSAGES && (
              <MessagesView onStartCall={startCall} />
            )}

            {currentView === ViewState.NOTIFICATIONS && (
              <NotificationsView />
            )}

            {currentView === ViewState.EXPLORE && (
              <ExploreView />
            )}

            {currentView === ViewState.COMMUNITIES && (
              <CommunitiesView />
            )}

            {currentView === ViewState.COMMUNITY_DETAIL && (
              <CommunityDetailView />
            )}

            {currentView === ViewState.VOICE_ROOMS && (
              <VoiceRoomsView />
            )}
            
            {currentView === ViewState.GEO_CIRCLES && (
              <GeoCirclesView />
            )}

            {currentView === ViewState.GEO_CIRCLE_DETAIL && (
              <GeoCircleDetailView />
            )}

            {currentView === ViewState.MARKETPLACE && (
              <MarketplaceView />
            )}

            {currentView === ViewState.AI_COMPANION && (
              <AICompanionView />
            )}
            
            {currentView === ViewState.MIXED_REALITY && (
              <MixedRealityView />
            )}

            {currentView === ViewState.MEMORY_LANE && (
              <MemoryLaneView />
            )}

            {currentView === ViewState.IDENTITY_WALLET && (
              <IdentityWalletView />
            )}

            {currentView === ViewState.SETTINGS && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                  <p className="text-slate-500 dark:text-slate-400">Manage your account preferences</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Private Account</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Only followers can see your posts</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Push notifications for new activities</p>
                    </div>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                      <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === ViewState.PROFILE && (
              <ProfileView />
            )}

          </div>
        </main>

        {/* Right Sidebar */}
        <div className={currentView === ViewState.MESSAGES ? 'hidden xl:block' : ''}>
           <RightBar />
        </div>

      </div>
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-slate-900 transition-colors duration-300">
           <div className="pt-20 px-6 space-y-4">
              <button 
                onClick={() => {setCurrentView(ViewState.HOME); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Home</button>
              <button 
                onClick={() => {setCurrentView(ViewState.MESSAGES); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Messages</button>
              <button 
                onClick={() => {setCurrentView(ViewState.COMMUNITIES); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Communities</button>
              <button 
                onClick={() => {setCurrentView(ViewState.MARKETPLACE); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Marketplace</button>
              <button 
                onClick={() => {setCurrentView(ViewState.AI_COMPANION); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >AI Companion</button>
              <button 
                onClick={() => {setCurrentView(ViewState.IDENTITY_WALLET); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Digital ID</button>
              <button 
                onClick={() => {setCurrentView(ViewState.VOICE_ROOMS); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Voice Rooms</button>
              <button 
                onClick={() => {setCurrentView(ViewState.GEO_CIRCLES); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Geo-Circles</button>
              <button 
                onClick={() => {setCurrentView(ViewState.MEMORY_LANE); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Memory Lane</button>
              <button 
                onClick={() => {setCurrentView(ViewState.MIXED_REALITY); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Mixed Reality</button>
              <button 
                onClick={() => {setCurrentView(ViewState.PROFILE); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Profile</button>
              <button 
                onClick={() => {setCurrentView(ViewState.EXPLORE); setIsMobileMenuOpen(false)}}
                className="block w-full text-left text-xl font-semibold py-2 text-slate-900 dark:text-white"
              >Explore</button>
           </div>
        </div>
      )}

      {/* Live Call Modal */}
      {isCallOpen && callTarget && (
        <LiveCallModal 
          isOpen={isCallOpen}
          targetUser={callTarget}
          initialVideoEnabled={isVideoCall}
          onClose={() => setIsCallOpen(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAppContext();
  return isAuthenticated ? <MainLayout /> : <AuthScreen />;
}

export default App;
