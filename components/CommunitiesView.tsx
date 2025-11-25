
import React, { useState, useRef } from 'react';
import { Users, Plus, CheckCircle, X, Image as ImageIcon } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Button from './Button';

const CommunitiesView: React.FC = () => {
  const { groups, toggleGroupJoin, createGroup, navigateToCommunity } = useAppContext();
  const [isCreating, setIsCreating] = useState(false);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [image, setImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;
    
    createGroup(name, description, category, image || undefined);
    setIsCreating(false);
    
    // Reset form
    setName('');
    setDescription('');
    setCategory('Technology');
    setImage(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Communities</h1>
          <p className="text-slate-500 dark:text-slate-400">Find your tribe and connect with like-minded people.</p>
        </div>
        <Button leftIcon={<Plus size={18} />} onClick={() => setIsCreating(true)}>Create Group</Button>
      </div>

      {/* Create Group Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-200">
             <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Community</h2>
                <button onClick={() => setIsCreating(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition">
                  <X size={24} />
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Group Name</label>
                   <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                     placeholder="e.g. AI Researchers"
                     required
                   />
                </div>
                
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                   <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                   >
                      <option>Technology</option>
                      <option>Art</option>
                      <option>Travel</option>
                      <option>Lifestyle</option>
                      <option>Gaming</option>
                      <option>Science</option>
                      <option>Business</option>
                      <option>General</option>
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                   <textarea 
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                     className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 h-24 resize-none text-slate-900 dark:text-white"
                     placeholder="What is this group about?"
                     required
                   />
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Cover Image</label>
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition min-h-[120px]"
                   >
                      {image ? (
                         <div className="relative w-full h-32">
                            <img src={image} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                            <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"><X size={12} /></button>
                         </div>
                      ) : (
                         <>
                           <ImageIcon className="text-slate-400 mb-2" size={24} />
                           <span className="text-sm text-slate-500 dark:text-slate-400">Upload Cover Image</span>
                         </>
                      )}
                   </div>
                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                </div>

                <Button type="submit" className="w-full" size="lg">Create Community</Button>
             </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div 
            key={group.id} 
            onClick={() => navigateToCommunity(group)}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all group-card cursor-pointer relative"
          >
            <div className="h-32 overflow-hidden relative pointer-events-none">
              <img src={group.image} alt={group.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-3 right-3">
                <span className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-full border border-white/20">
                   {group.category}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2 pointer-events-none">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{group.name}</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-2 pointer-events-none">{group.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs font-medium pointer-events-none">
                  <Users size={14} className="mr-1.5" />
                  {group.members.toLocaleString()} members
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleGroupJoin(group.id); }}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all cursor-pointer relative z-20 ${
                    group.isJoined 
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-none'
                  }`}
                >
                  {group.isJoined ? (
                    <span className="flex items-center"><CheckCircle size={14} className="mr-1" /> Joined</span>
                  ) : 'Join Group'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Placeholder Card */}
        <div 
          onClick={() => setIsCreating(true)}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center p-8 text-center hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition cursor-pointer group"
        >
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 mb-3 transition-colors">
             <Plus size={24} />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Discover More</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Browse categories or create your own community.</p>
        </div>
      </div>
    </div>
  );
};

export default CommunitiesView;
