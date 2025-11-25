
import React, { useState } from 'react';
import { Mic, Users, Plus, Headphones, Radio, Volume2 } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { VoiceRoom } from '../types';
import Button from './Button';
import ActiveVoiceRoom from './ActiveVoiceRoom';
import Avatar from './Avatar';

const MOCK_ROOMS: VoiceRoom[] = [
  {
    id: 'room-1',
    title: 'Future of Frontend Dev 🚀',
    host: { id: 'u2', name: 'Sarah Chen', handle: '@sarahc', avatar: 'https://picsum.photos/id/65/150/150', followers: 8900, following: 120 },
    listeners: 42,
    speakers: [
      { user: { id: 'u2', name: 'Sarah Chen', handle: '@sarahc', avatar: 'https://picsum.photos/id/65/150/150', followers: 8900, following: 120 }, isSpeaking: true, role: 'HOST' },
      { user: { id: 'u3', name: 'Marcus Johnson', handle: '@mjohnson', avatar: 'https://picsum.photos/id/91/150/150', followers: 3400, following: 400 }, isSpeaking: false, role: 'SPEAKER' }
    ],
    tags: ['Tech', 'Coding', 'React'],
    isLive: true
  },
  {
    id: 'room-2',
    title: 'Morning Mindfulness & Coffee ☕',
    host: { id: 'u4', name: 'Elena Rodriguez', handle: '@elena_r', avatar: 'https://picsum.photos/id/129/150/150', followers: 5600, following: 890 },
    listeners: 156,
    speakers: [
      { user: { id: 'u4', name: 'Elena Rodriguez', handle: '@elena_r', avatar: 'https://picsum.photos/id/129/150/150', followers: 5600, following: 890 }, isSpeaking: false, role: 'HOST' }
    ],
    tags: ['Wellness', 'Morning', 'Chill'],
    isLive: true
  }
];

const VoiceRoomsView: React.FC = () => {
  const { currentUser } = useAppContext();
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoom: VoiceRoom = {
      id: `room-${Date.now()}`,
      title: newRoomTitle,
      host: currentUser,
      listeners: 0,
      speakers: [{ user: currentUser, isSpeaking: false, role: 'HOST' }],
      tags: ['General'],
      isLive: true
    };
    setActiveRoom(newRoom);
    setIsCreating(false);
    setNewRoomTitle('');
  };

  if (activeRoom) {
    return <ActiveVoiceRoom room={activeRoom} onLeave={() => setActiveRoom(null)} />;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
             <Radio className="mr-3 text-red-500 animate-pulse" /> Live Voice Rooms
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-2">
             Join live audio conversations with real-time AI transcription.
           </p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)} 
          leftIcon={<Plus size={20} />}
          className="shadow-lg shadow-indigo-200 dark:shadow-none"
        >
           Start a Room
        </Button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
           <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Start a Voice Room</h2>
              <form onSubmit={handleCreateRoom} className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Room Topic</label>
                    <input 
                      type="text" 
                      value={newRoomTitle}
                      onChange={(e) => setNewRoomTitle(e.target.value)}
                      placeholder="e.g. Late Night Tech Talk" 
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      required
                      autoFocus
                    />
                 </div>
                 <div className="flex space-x-3 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)} className="flex-1">Cancel</Button>
                    <Button type="submit" className="flex-1">Go Live</Button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Active Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {MOCK_ROOMS.map(room => (
           <div 
             key={room.id} 
             onClick={() => setActiveRoom(room)}
             className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 hover:shadow-xl hover:border-indigo-200 dark:hover:border-indigo-800 transition cursor-pointer group"
           >
              <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {room.title}
                 </h3>
                 <span className="flex items-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full animate-pulse">
                    <Radio size={12} className="mr-1" /> LIVE
                 </span>
              </div>
              
              <div className="flex items-center space-x-2 mb-6">
                 <div className="flex -space-x-3">
                    {room.speakers.map((speaker, i) => (
                       <Avatar key={i} src={speaker.user.avatar} alt={speaker.user.name} size="md" className="border-2 border-white dark:border-slate-900" />
                    ))}
                 </div>
                 <span className="text-sm text-slate-500 dark:text-slate-400 pl-2">
                    {room.speakers.map(s => s.user.name.split(' ')[0]).join(', ')} speaking
                 </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex space-x-2">
                    {room.tags.map(tag => (
                       <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{tag}</span>
                    ))}
                 </div>
                 <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                    <Headphones size={16} className="mr-1.5" />
                    {room.listeners}
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default VoiceRoomsView;
