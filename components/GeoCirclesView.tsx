
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, AlertTriangle, Calendar, Users, Zap, Shield, Lock, Eye, ArrowRight, Wifi, Signal, RefreshCw } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { GeoCircle } from '../types';
import Button from './Button';

const GeoCirclesView: React.FC = () => {
  const { geoCircles, toggleGeoCircleJoin, currentUser, navigateToGeoCircle } = useAppContext();
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<string>('Detecting...');
  
  // Use Browser Geolocation API
  const enableLocation = () => {
    setIsScanning(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      setIsScanning(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });

        // Simulate Network Information
        const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (conn) {
           setNetworkInfo(conn.type === 'wifi' ? 'WiFi Network' : '5G/LTE Area');
        } else {
           setNetworkInfo('WiFi Area'); // Default fallback
        }

        // Slight delay for scanning effect
        setTimeout(() => {
            setIsLocationEnabled(true);
            setIsScanning(false);
        }, 800);
      },
      (error) => {
        // Error
        let msg = "Unable to retrieve your location.";
        if (error.code === 1) msg = "Location permission denied. Please enable it in your browser settings.";
        else if (error.code === 2) msg = "Location unavailable. Please check your GPS.";
        else if (error.code === 3) msg = "Location request timed out.";
        
        setErrorMsg(msg);
        setIsScanning(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'EMERGENCY': return 'text-red-500 bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800';
      case 'EVENT': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
      case 'COMMUNITY': return 'text-green-500 bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'POPUP': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
      default: return 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'EMERGENCY': return <AlertTriangle size={18} className="animate-pulse" />;
      case 'EVENT': return <Calendar size={18} />;
      case 'COMMUNITY': return <Users size={18} />;
      case 'POPUP': return <Zap size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  if (!isLocationEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
         <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center overflow-hidden relative">
            {/* Background Map Graphic */}
            <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
               <div className="w-full h-full bg-[radial-gradient(circle,rgba(99,102,241,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>

            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400 relative z-10">
               <Navigation size={40} className={isScanning ? "animate-spin" : ""} />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 relative z-10">Discover Geo-Circles</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto relative z-10">
              Connect with smart local communities, active events, and real-time emergency alerts in your immediate vicinity.
            </p>

            {errorMsg && (
               <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-xl mb-6 text-sm font-semibold flex items-center justify-center">
                  <AlertTriangle size={16} className="mr-2" />
                  {errorMsg}
               </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 text-left mb-8 max-w-md mx-auto relative z-10 border border-slate-100 dark:border-slate-700">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                 <Shield size={18} className="mr-2 text-green-500" /> Privacy First
               </h3>
               <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  <li className="flex items-start">
                    <Lock size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <span>Your exact location is never shared publicly.</span>
                  </li>
                  <li className="flex items-start">
                    <Eye size={16} className="mr-2 mt-0.5 text-slate-400" />
                    <span>You only become visible when you explicitly join a circle.</span>
                  </li>
               </ul>
            </div>

            <Button 
               size="lg" 
               onClick={enableLocation} 
               disabled={isScanning}
               className="relative z-10 w-full max-w-xs shadow-lg shadow-indigo-200 dark:shadow-none"
               leftIcon={isScanning ? <RefreshCw className="animate-spin" size={18}/> : <Navigation size={18}/>}
            >
               {isScanning ? 'Locating...' : 'Enable Location Discovery'}
            </Button>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Radar Header */}
      <div className="bg-slate-900 rounded-3xl p-6 mb-8 text-white relative overflow-hidden shadow-2xl min-h-[280px] flex items-center justify-center">
         {/* Radar Animation */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-[600px] h-[600px] border border-white/10 rounded-full absolute animate-ping duration-[3000ms]"></div>
            <div className="w-[400px] h-[400px] border border-white/10 rounded-full absolute animate-ping delay-500 duration-[3000ms]"></div>
            <div className="w-[200px] h-[200px] border border-white/20 rounded-full absolute animate-ping delay-1000 duration-[3000ms]"></div>
            <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,1)]"></div>
         </div>
         
         {/* Blips */}
         <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
            <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_green]"></div>
            <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_purple]"></div>
         </div>

         <div className="relative z-10 w-full max-w-md">
            <div className="text-center bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10">
               <h2 className="text-2xl font-bold mb-2">4 Active Circles Found</h2>
               
               {/* Location Stats */}
               <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center text-indigo-300">
                     <MapPin size={14} className="mr-1.5" />
                     <span>
                        {coordinates 
                          ? `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}` 
                          : currentUser.location || 'Unknown Location'}
                     </span>
                  </div>
                  <div className="w-px h-4 bg-white/20"></div>
                  <div className="flex items-center text-green-400">
                     <Signal size={14} className="mr-1.5" />
                     <span>{networkInfo}</span>
                  </div>
               </div>
            </div>
         </div>
         
         <div className="absolute bottom-4 right-4 z-10">
            <button 
               onClick={() => { setIsLocationEnabled(false); setCoordinates(null); }}
               className="text-xs text-white/50 hover:text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-md transition flex items-center"
            >
               <RefreshCw size={10} className="mr-1" /> Recalibrate
            </button>
         </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {geoCircles.map(circle => (
          <div 
             key={circle.id} 
             onClick={() => navigateToGeoCircle(circle)}
             className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer relative group ${
                circle.type === 'EMERGENCY' 
                ? 'border-red-200 dark:border-red-900/50 shadow-red-100 dark:shadow-none' 
                : 'border-slate-100 dark:border-slate-800'
             }`}
          >
             {circle.image && (
                <div className="h-32 w-full overflow-hidden rounded-t-2xl relative pointer-events-none">
                   <img src={circle.image} className="w-full h-full object-cover" alt={circle.name} />
                   <div className="absolute inset-0 bg-black/10"></div>
                </div>
             )}
             
             <div className="p-5">
                <div className="flex justify-between items-start mb-3 pointer-events-none">
                   <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getTypeColor(circle.type)}`}>
                      <span className="mr-1.5">{getTypeIcon(circle.type)}</span>
                      {circle.type}
                   </div>
                   <div className="flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                      <Navigation size={12} className="mr-1" />
                      {circle.distance}
                   </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 pointer-events-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{circle.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 pointer-events-none">{circle.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                   <div className="flex space-x-4 text-xs font-medium text-slate-500 dark:text-slate-400 pointer-events-none">
                      <span className="flex items-center"><Users size={14} className="mr-1" /> {circle.memberCount}</span>
                      <span className="flex items-center text-green-600 dark:text-green-400"><Zap size={14} className="mr-1" /> {circle.activeNow} Active</span>
                   </div>

                   {circle.expiresAt && (
                      <span className="text-xs text-orange-500 font-semibold pointer-events-none">{circle.expiresAt}</span>
                   )}
                </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleGeoCircleJoin(circle.id); }}
                  className={`w-full mt-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center transition cursor-pointer relative z-20 ${
                     circle.isJoined 
                     ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' 
                     : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none'
                  }`}
                >
                   {circle.isJoined ? 'Leave Circle' : <>Enter Circle <ArrowRight size={16} className="ml-1" /></>}
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GeoCirclesView;
