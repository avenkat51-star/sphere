
import React, { useState } from 'react';
import { MapPin, Glasses, Users, Calendar, ArrowRight, Play, Gamepad2, Map as MapIcon, List, X, Info } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { ARExperience, VirtualEvent } from '../types';
import ARCameraOverlay from './ARCameraOverlay';
import Button from './Button';

const MixedRealityView: React.FC = () => {
  const { arExperiences, virtualEvents } = useAppContext();
  const [activeExperience, setActiveExperience] = useState<ARExperience | VirtualEvent | undefined>(undefined);
  const [activeMode, setActiveMode] = useState<'GEO' | 'EVENT' | 'HANGOUT' | 'GAME' | 'SCAN' | null>(null);
  
  // View States
  const [showMap, setShowMap] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const startAR = (data: ARExperience | VirtualEvent, mode: 'GEO' | 'EVENT' | 'HANGOUT' | 'GAME') => {
    setActiveExperience(data);
    setActiveMode(mode);
  };

  const startScan = () => {
    setActiveExperience(undefined);
    setActiveMode('SCAN');
  };

  // Simulate more events for "View All"
  const displayEvents = showAllEvents 
    ? [...virtualEvents, ...virtualEvents.map((e, i) => ({...e, id: e.id + '_dup_' + i, title: 'Encore: ' + e.title}))] 
    : virtualEvents;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {activeMode && (
        <ARCameraOverlay 
          data={activeExperience} 
          mode={activeMode} 
          onClose={() => { setActiveExperience(undefined); setActiveMode(null); }} 
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-3xl p-8 text-white mb-10 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1626379953822-baec19c3accd?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-4">
             <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                <Glasses size={24} className="text-indigo-300" />
             </div>
             <span className="text-indigo-200 font-semibold tracking-wide uppercase text-sm">Mixed Reality</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Discover the World Layer</h1>
          <p className="text-lg text-indigo-100 max-w-lg mb-8">
            Explore geolocation-based art, attend virtual concerts, play local AR games, and hang out in spaces.
          </p>
          <Button onClick={startScan} className="bg-white text-indigo-900 hover:bg-indigo-50 border-none shadow-lg">
             Scan Surroundings
          </Button>
        </div>
      </div>

      {/* AR Games Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
             <Gamepad2 className="mr-2 text-yellow-500" /> Local AR Games
           </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {arExperiences.filter(e => e.type === 'GAME').map(game => (
             <div 
               key={game.id} 
               onClick={() => startAR(game, 'GAME')}
               className="bg-slate-900 rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:ring-4 ring-yellow-500/50 transition-all group"
             >
                <div className="h-40 relative">
                   <img src={game.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition" alt={game.title} />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                         <Play size={24} className="text-white ml-1" fill="currentColor" />
                      </div>
                   </div>
                </div>
                <div className="p-4 text-white">
                   <h3 className="font-bold text-lg mb-1">{game.title}</h3>
                   <p className="text-slate-300 text-sm">{game.description}</p>
                   <div className="mt-3 inline-block bg-yellow-500/20 text-yellow-300 text-xs px-2 py-1 rounded font-bold uppercase">
                      Local Challenge
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Live Events Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
             <Calendar className="mr-2 text-pink-500" /> Live Virtual Events
           </h2>
           <button 
             onClick={() => setShowAllEvents(!showAllEvents)}
             className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition"
           >
             {showAllEvents ? 'Show Less' : 'View All'}
           </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {displayEvents.map(event => (
             <div key={event.id} className="group relative bg-slate-900 rounded-2xl overflow-hidden aspect-video shadow-lg cursor-pointer hover:ring-4 ring-pink-500/30 transition-all animate-in fade-in duration-300">
                <img src={event.coverImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" alt={event.title} />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                   <div className="flex justify-between items-end">
                      <div>
                        {event.isLive && (
                           <span className="inline-block bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase mb-2 animate-pulse">Live Now</span>
                        )}
                        <h3 className="text-white text-xl font-bold mb-1">{event.title}</h3>
                        <p className="text-slate-300 text-sm">{event.host.name} • {event.attendees} attending</p>
                      </div>
                      <button 
                        onClick={() => startAR(event, 'EVENT')}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"
                      >
                         <Play size={20} fill="currentColor" />
                      </button>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* AR Drops Section */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
             <MapPin className="mr-2 text-indigo-500" /> Nearby AR Drops
           </h2>
           <button 
             onClick={() => setShowMap(!showMap)}
             className={`text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline flex items-center bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg transition ${showMap ? 'bg-indigo-100 dark:bg-indigo-900/40' : ''}`}
           >
             {showMap ? <><List size={16} className="mr-1"/> List View</> : <><MapIcon size={16} className="mr-1"/> Open Map</>}
           </button>
        </div>

        {showMap ? (
           <div className="w-full h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl relative overflow-hidden shadow-inner group animate-in fade-in zoom-in duration-300">
              {/* Simulated Map */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop')] bg-cover opacity-50"></div>
              
              {/* Map Pins */}
              {arExperiences.filter(e => e.type !== 'HANGOUT' && e.type !== 'GAME').map((exp, idx) => (
                 <div 
                    key={exp.id}
                    className="absolute flex flex-col items-center cursor-pointer hover:scale-110 transition-transform hover:z-10"
                    style={{ top: `${30 + (idx * 20)}%`, left: `${20 + (idx * 25)}%` }}
                    onClick={() => startAR(exp, 'GEO')}
                 >
                    <div className="bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
                       <MapPin size={20} fill="currentColor" />
                    </div>
                    <div className="mt-1 bg-white dark:bg-slate-900 text-xs font-bold px-2 py-1 rounded shadow-md text-slate-900 dark:text-white whitespace-nowrap">
                       {exp.title}
                    </div>
                 </div>
              ))}
              
              <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg shadow-md text-xs font-bold flex items-center">
                 <Info size={12} className="mr-1" /> Simulated Map View
              </div>
           </div>
        ) : (
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {arExperiences.filter(e => e.type !== 'HANGOUT' && e.type !== 'GAME').map(exp => (
                <div key={exp.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition cursor-pointer group" onClick={() => startAR(exp, 'GEO')}>
                   <div className="h-48 overflow-hidden relative">
                      <img src={exp.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={exp.title} />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                         {exp.distance}
                      </div>
                   </div>
                   <div className="p-4">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-1">{exp.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{exp.locationLabel}</p>
                      <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold group-hover:translate-x-1 transition-transform">
                         View in AR <ArrowRight size={16} className="ml-1" />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Social Spaces Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
             <Users className="mr-2 text-green-500" /> Social Hangouts
           </h2>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-1">
           {arExperiences.filter(e => e.type === 'HANGOUT').map(space => (
             <div key={space.id} className="flex items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer" onClick={() => startAR(space, 'HANGOUT')}>
                <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden mr-4">
                   <img src={space.thumbnail} className="w-full h-full object-cover" alt={space.title} />
                </div>
                <div className="flex-1">
                   <h3 className="font-bold text-slate-900 dark:text-white">{space.title}</h3>
                   <p className="text-sm text-slate-500 dark:text-slate-400">{space.description}</p>
                </div>
                <div className="text-right">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      {space.participants} Online
                   </span>
                   <button className="block mt-2 text-sm text-indigo-600 font-semibold hover:text-indigo-700">Join Room</button>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default MixedRealityView;
