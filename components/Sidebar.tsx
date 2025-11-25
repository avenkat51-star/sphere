
import React, { useState } from 'react';
import { Home, Hash, Bell, User, Settings, LogOut, Bookmark, Zap, MessageSquare, Users, ShoppingBag, Moon, Sun, Bot, ChevronUp, Check, Plus, X, Briefcase, Camera, Glasses, Radio, MapPin, Film, Fingerprint } from 'lucide-react';
import { ViewState, PersonaType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';
import Button from './Button';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { logout, theme, toggleTheme, currentUser, allPersonas, switchPersona, addNewPersona, navigateToProfile } = useAppContext();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showCreatePersona, setShowCreatePersona] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newType, setNewType] = useState<PersonaType>('PERSONAL');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newHandle) return;
    
    // Generate random avatar based on type
    const avatarSeed = Math.floor(Math.random() * 1000);
    const avatar = `https://picsum.photos/seed/${avatarSeed}/150/150`;

    addNewPersona(newName, newHandle, newBio, newType, avatar);
    setShowCreatePersona(false);
    setShowPersonaMenu(false);
    
    // Reset
    setNewName('');
    setNewHandle('');
    setNewBio('');
    setNewType('PERSONAL');
  };

  const handleNavigation = (view: ViewState) => {
    if (view === ViewState.PROFILE) {
      navigateToProfile(currentUser);
    } else {
      onChangeView(view);
    }
  };

  const menuItems = [
    { id: ViewState.HOME, label: 'Home', icon: Home },
    { id: ViewState.EXPLORE, label: 'Explore', icon: Hash },
    { id: ViewState.COMMUNITIES, label: 'Communities', icon: Users },
    { id: ViewState.GEO_CIRCLES, label: 'Geo-Circles', icon: MapPin },
    { id: ViewState.VOICE_ROOMS, label: 'Voice Rooms', icon: Radio }, 
    { id: ViewState.MEMORY_LANE, label: 'Memory Lane', icon: Film },
    { id: ViewState.MARKETPLACE, label: 'Marketplace', icon: ShoppingBag },
    { id: ViewState.MIXED_REALITY, label: 'Mixed Reality', icon: Glasses }, 
    { id: ViewState.AI_COMPANION, label: 'AI Companion', icon: Bot },
    { id: ViewState.IDENTITY_WALLET, label: 'Digital ID', icon: Fingerprint },
    { id: ViewState.NOTIFICATIONS, label: 'Notifications', icon: Bell },
    { id: ViewState.MESSAGES, label: 'Messages', icon: MessageSquare },
    { id: ViewState.PROFILE, label: 'Profile', icon: User },
  ];

  const getPersonaIcon = (type: string) => {
    switch (type) {
      case 'PROFESSIONAL': return <Briefcase size={12} className="text-blue-500" />;
      case 'CREATOR': return <Camera size={12} className="text-pink-500" />;
      default: return <User size={12} className="text-green-500" />;
    }
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pt-6 pb-4 px-4 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-30 transition-colors duration-300">
      
      {/* Create Persona Modal */}
      {showCreatePersona && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-800 p-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Persona</h3>
                 <button onClick={() => setShowCreatePersona(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
              </div>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['PERSONAL', 'PROFESSIONAL', 'CREATOR'].map((type) => (
                         <button
                           type="button"
                           key={type}
                           onClick={() => setNewType(type as PersonaType)}
                           className={`py-2 rounded-lg text-xs font-bold border transition ${
                             newType === type 
                             ? 'bg-indigo-600 text-white border-indigo-600' 
                             : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                           }`}
                         >
                           {type}
                         </button>
                       ))}
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      required
                      placeholder="e.g. John Doe | Photographer"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Handle</label>
                    <input 
                      type="text" 
                      value={newHandle} 
                      onChange={(e) => setNewHandle(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                      required
                      placeholder="@john_shots"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bio</label>
                    <textarea 
                      value={newBio} 
                      onChange={(e) => setNewBio(e.target.value)} 
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white resize-none h-20"
                      placeholder="Short description..."
                    />
                 </div>
                 <Button type="submit" className="w-full">Create Persona</Button>
              </form>
           </div>
        </div>
      )}

      {/* Logo */}
      <div className="flex items-center space-x-2 px-4 mb-8 cursor-pointer group" onClick={() => onChangeView(ViewState.HOME)}>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-indigo-200 dark:shadow-none shadow-lg group-hover:scale-110 transition-transform">
          <Zap size={20} fill="currentColor" />
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Sphere
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm dark:shadow-none' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-transform duration-300 ease-out ${
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Persona Switcher & Bottom Actions */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        
        {/* Active User Card with Switcher */}
        <div className="relative">
          <button 
             onClick={() => setShowPersonaMenu(!showPersonaMenu)}
             className="w-full flex items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700"
          >
             <div className="relative">
                <Avatar src={currentUser.avatar} alt={currentUser.name} size="md" />
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700">
                   {getPersonaIcon(currentUser.personaType || 'PERSONAL')}
                </div>
             </div>
             <div className="ml-3 text-left flex-1 overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.handle}</p>
             </div>
             <ChevronUp size={16} className={`text-slate-400 transition-transform ${showPersonaMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Persona Menu Popup */}
          {showPersonaMenu && (
             <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in slide-in-from-bottom-2">
                <p className="text-xs font-bold text-slate-400 uppercase px-2 py-2">Switch Profile</p>
                <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                   {allPersonas.map(persona => (
                     <button
                       key={persona.id}
                       onClick={() => { switchPersona(persona.id); setShowPersonaMenu(false); }}
                       className={`w-full flex items-center p-2 rounded-lg transition ${currentUser.id === persona.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                     >
                       <Avatar src={persona.avatar} alt={persona.name} size="sm" className="w-8 h-8" />
                       <div className="ml-2 text-left flex-1 overflow-hidden">
                          <p className={`text-sm font-semibold truncate ${currentUser.id === persona.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>{persona.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            {getPersonaIcon(persona.type)} 
                            <span className="ml-1 lowercase">{persona.type}</span>
                          </p>
                       </div>
                       {currentUser.id === persona.id && <Check size={14} className="text-indigo-600" />}
                     </button>
                   ))}
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-2">
                   <button 
                     onClick={() => { setShowCreatePersona(true); }}
                     className="w-full flex items-center justify-center space-x-2 p-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                   >
                     <Plus size={16} />
                     <span>Add Persona</span>
                   </button>
                </div>
             </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="group w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
        >
          {theme === 'light' ? (
             <Moon size={20} className="transition-transform duration-300 ease-out group-hover:rotate-12" />
          ) : (
             <Sun size={20} className="transition-transform duration-300 ease-out group-hover:rotate-90" />
          )}
          <span className="text-sm font-medium">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
        </button>

        <button 
          onClick={logout}
          className="group w-full flex items-center space-x-3 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
        >
          <LogOut size={20} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
