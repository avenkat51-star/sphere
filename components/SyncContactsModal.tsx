
import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, Search, UserPlus, X, Loader, Shield } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Button from './Button';
import Avatar from './Avatar';
import { MOCK_USERS } from '../constants';

const SyncContactsModal: React.FC = () => {
  const { isContactSyncOpen, setContactSyncOpen, followUser, users } = useAppContext();
  const [step, setStep] = useState<'PERMISSION' | 'SCANNING' | 'RESULTS'>('PERMISSION');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
     if (isContactSyncOpen) {
        setStep('PERMISSION');
        setProgress(0);
     }
  }, [isContactSyncOpen]);

  // Simulate scanning process
  useEffect(() => {
     if (step === 'SCANNING') {
        const interval = setInterval(() => {
           setProgress(prev => {
              if (prev >= 100) {
                 clearInterval(interval);
                 setTimeout(() => setStep('RESULTS'), 500);
                 return 100;
              }
              return prev + 2; // Speed of scan
           });
        }, 30);
        return () => clearInterval(interval);
     }
  }, [step]);

  // Generate some "found" contacts by taking existing mock users
  // In a real app, this would match phone numbers
  const foundContacts = users.slice(0, 4);

  if (!isContactSyncOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
       <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
          
          <button 
             onClick={() => setContactSyncOpen(false)} 
             className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition z-10"
          >
             <X size={20} />
          </button>

          {step === 'PERMISSION' && (
             <div className="p-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                   <Smartphone size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Sync Mobile Contacts</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                   Find your friends who are already on Sphere. We'll securely hash your contact list to find matches without storing your data.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-left mb-8 flex items-start">
                   <Shield size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                   <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white">Privacy First</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                         Contacts are only used to find friends. No spam, ever.
                      </p>
                   </div>
                </div>

                <Button size="lg" className="w-full" onClick={() => setStep('SCANNING')}>
                   Continue & Sync
                </Button>
             </div>
          )}

          {step === 'SCANNING' && (
             <div className="p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative w-32 h-32 mb-8">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle
                         cx="64"
                         cy="64"
                         r="56"
                         stroke="currentColor"
                         strokeWidth="8"
                         fill="transparent"
                         className="text-slate-100 dark:text-slate-800"
                      />
                      <circle
                         cx="64"
                         cy="64"
                         r="56"
                         stroke="currentColor"
                         strokeWidth="8"
                         fill="transparent"
                         strokeDasharray={351.86}
                         strokeDashoffset={351.86 - (351.86 * progress) / 100}
                         className="text-indigo-600 transition-all duration-75 ease-linear"
                         strokeLinecap="round"
                      />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold text-xl">
                      {progress}%
                   </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Scanning Contacts...</h3>
                <p className="text-slate-500 dark:text-slate-400">Looking for matches on Sphere</p>
             </div>
          )}

          {step === 'RESULTS' && (
             <div className="flex flex-col h-[500px]">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                      <CheckCircle className="text-green-500 mr-2" size={24} />
                      {foundContacts.length} Friends Found
                   </h2>
                   <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      These people from your contacts are on Sphere.
                   </p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {foundContacts.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                         <div className="flex items-center space-x-3">
                            <Avatar src={user.avatar} alt={user.name} size="md" />
                            <div>
                               <h4 className="font-bold text-slate-900 dark:text-white">{user.name}</h4>
                               <p className="text-xs text-slate-500 dark:text-slate-400">{user.handle}</p>
                            </div>
                         </div>
                         <Button 
                            size="sm" 
                            variant={user.isFollowing ? "secondary" : "primary"}
                            onClick={() => followUser(user.id)}
                            className={user.isFollowing ? "opacity-70" : ""}
                         >
                            {user.isFollowing ? "Following" : "Follow"}
                         </Button>
                      </div>
                   ))}
                   {/* Fake extra list item for realism */}
                   <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl opacity-60">
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold">JD</div>
                         <div>
                            <h4 className="font-bold text-slate-900 dark:text-white">John Doe</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Not on Sphere yet</p>
                         </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-xs">Invite</Button>
                   </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                   <Button className="w-full" onClick={() => setContactSyncOpen(false)}>
                      Done
                   </Button>
                </div>
             </div>
          )}
       </div>
    </div>
  );
};

export default SyncContactsModal;
