

import React, { useState } from 'react';
import { Film, Lock, Calendar, MapPin, Users, Heart, Play, Pause, ChevronRight, Unlock, KeyRound } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Button from './Button';

const MemoryLaneView: React.FC = () => {
  const { memories, memoryClusters, vaultItems, isVaultUnlocked, unlockVault, lockVault } = useAppContext();
  const [isPlayingDoc, setIsPlayingDoc] = useState(false);
  const [pin, setPin] = useState('');
  const [vaultError, setVaultError] = useState('');
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'CLUSTERS' | 'VAULT'>('TIMELINE');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockVault(pin)) {
      setPin('');
      setVaultError('');
    } else {
      setVaultError('Incorrect PIN');
      setPin('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      {/* Hero Header - AI Documentary */}
      <div className="relative rounded-3xl overflow-hidden mb-10 shadow-2xl group cursor-pointer" onClick={() => setIsPlayingDoc(!isPlayingDoc)}>
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
         {isPlayingDoc ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
               <div className="absolute inset-0 overflow-hidden">
                  <img src="https://picsum.photos/id/1015/1000/600" className="w-full h-full object-cover opacity-50 animate-pulse scale-105" alt="Memory" />
               </div>
               <div className="z-20 text-center">
                  <div className="w-16 h-16 border-4 border-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                        <Pause size={24} className="text-black ml-0.5" fill="currentColor" />
                     </div>
                  </div>
                  <h2 className="text-white text-2xl font-bold">Generating Your 2024 Story...</h2>
                  <p className="text-white/70 text-sm mt-2">AI is stitching together your best moments</p>
               </div>
            </div>
         ) : (
            <div className="w-full aspect-video bg-slate-900 relative">
               <img src="https://picsum.photos/id/1018/1000/600" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" alt="Cover" />
               <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <div className="flex justify-between items-end">
                     <div>
                        <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-flex items-center mb-3">
                           <Film size={12} className="mr-1.5" /> AI Documentary
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">My 2024 Journey</h1>
                        <p className="text-indigo-100 max-w-lg">A cinematic recap of your travels, friendships, and milestones auto-generated from your archives.</p>
                     </div>
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition border border-white/40">
                        <Play size={28} className="text-white ml-1" fill="currentColor" />
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-8">
         <button 
           onClick={() => setActiveTab('TIMELINE')}
           className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'TIMELINE' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
         >
            Timeline
         </button>
         <button 
           onClick={() => setActiveTab('CLUSTERS')}
           className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'CLUSTERS' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
         >
            Smart Clusters
         </button>
         <button 
           onClick={() => setActiveTab('VAULT')}
           className={`flex-1 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center ${activeTab === 'VAULT' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-500 dark:text-red-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
         >
            <Lock size={14} className="mr-1.5" /> Private Vault
         </button>
      </div>

      {/* Content Area */}
      
      {activeTab === 'TIMELINE' && (
         <div className="space-y-8 relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"></div>
            
            {memories.map((memory) => (
               <div key={memory.id} className="relative pl-16">
                  {/* Timeline Node */}
                  <div className="absolute left-[1.15rem] top-6 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 bg-indigo-500 shadow-sm z-10"></div>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition">
                     {memory.mediaUrl && (
                        <div className="h-48 overflow-hidden relative group">
                           <img src={memory.mediaUrl} alt={memory.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" />
                           <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                              {memory.date}
                           </div>
                        </div>
                     )}
                     <div className="p-5">
                        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wider">
                           <span>{memory.type}</span>
                           <span>•</span>
                           <span>{memory.mood}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{memory.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{memory.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                           {memory.location && (
                              <span className="inline-flex items-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                 <MapPin size={12} className="mr-1" /> {memory.location}
                              </span>
                           )}
                           {memory.people && memory.people.map(p => (
                              <span key={p} className="inline-flex items-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                 <Users size={12} className="mr-1" /> {p}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'CLUSTERS' && (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {memoryClusters.map(cluster => (
               <div key={cluster.id} className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-lg transition cursor-pointer group">
                  <div className="aspect-square rounded-xl overflow-hidden relative mb-3">
                     <img src={cluster.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={cluster.name} />
                     <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                     <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-xs font-medium uppercase opacity-90 mb-1">{cluster.type}</p>
                        <h3 className="text-xl font-bold">{cluster.name}</h3>
                     </div>
                     <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-lg border border-white/20">
                        {cluster.count} Memories
                     </div>
                  </div>
                  <div className="px-2 pb-2 flex justify-between items-center">
                     <div className="flex -space-x-2 overflow-hidden">
                        {[1,2,3].map(i => (
                           <div key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200">
                              <img src={`https://picsum.photos/seed/${cluster.id}-${i}/50/50`} className="h-full w-full rounded-full object-cover" alt="" />
                           </div>
                        ))}
                     </div>
                     <ChevronRight size={18} className="text-slate-400" />
                  </div>
               </div>
            ))}
         </div>
      )}

      {activeTab === 'VAULT' && (
         <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[400px] flex items-center justify-center relative overflow-hidden">
            {!isVaultUnlocked ? (
               <div className="text-center z-10 max-w-sm w-full p-6">
                  <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
                     <Lock size={40} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Private Vault</h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your PIN to access hidden memories.</p>
                  
                  <form onSubmit={handleUnlock}>
                     <div className="flex justify-center mb-6">
                        <input 
                           type="password" 
                           maxLength={4}
                           value={pin}
                           onChange={(e) => setPin(e.target.value)}
                           className="text-center text-3xl tracking-[1em] font-bold w-48 bg-transparent border-b-2 border-slate-300 dark:border-slate-700 focus:border-indigo-500 outline-none pb-2 text-slate-900 dark:text-white"
                           placeholder="••••"
                           autoFocus
                        />
                     </div>
                     {vaultError && <p className="text-red-500 text-sm font-bold mb-4 animate-bounce">{vaultError}</p>}
                     <Button type="submit" size="lg" className="w-full">Unlock Vault</Button>
                     <p className="text-xs text-slate-400 mt-4">Hint: The PIN is 1234 for demo.</p>
                  </form>
               </div>
            ) : (
               <div className="w-full h-full p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        <Unlock className="mr-2 text-green-500" /> Unlocked
                     </h2>
                     <Button variant="secondary" onClick={lockVault} leftIcon={<Lock size={16}/>}>Lock</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                     {vaultItems.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex space-x-4">
                           <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <KeyRound size={24} />
                           </div>
                           <div className="flex-1">
                              <h3 className="font-bold text-slate-900 dark:text-white">{item.title}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{item.date}</p>
                              {item.type === 'PHOTO' ? (
                                 <img src={item.content} alt="Hidden" className="rounded-lg h-32 w-full object-cover opacity-50 hover:opacity-100 transition duration-300 filter blur-sm hover:blur-0" />
                              ) : (
                                 <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg text-sm">{item.content}</p>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
            
            {/* Background Pattern */}
            {!isVaultUnlocked && (
               <div className="absolute inset-0 opacity-5 pointer-events-none">
                  <div className="w-full h-full bg-[radial-gradient(circle,rgba(0,0,0,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
               </div>
            )}
         </div>
      )}
    </div>
  );
};

export default MemoryLaneView;
