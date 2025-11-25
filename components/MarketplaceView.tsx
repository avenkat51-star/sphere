
import React, { useState, useRef } from 'react';
import { ShoppingBag, Plus, DollarSign, Image as ImageIcon, Video as VideoIcon, X, Search, Globe, PlayCircle, MessageCircle, ShieldCheck, Tag } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { Product } from '../types';
import Button from './Button';
import Avatar from './Avatar';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound' },
  { code: 'INR', symbol: '₹', label: 'INR - Indian Rupee' },
  { code: 'JPY', symbol: '¥', label: 'JPY - Japanese Yen' },
  { code: 'CAD', symbol: 'C$', label: 'CAD - Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'AUD - Australian Dollar' },
];

const formatCurrency = (amount: number, currencyCode: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${currencyCode} ${amount}`;
  }
};

const MarketplaceView: React.FC = () => {
  const { products, addProduct, navigateToProfile, startChat } = useAppContext();
  const [isSelling, setIsSelling] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setVideo(null); // Clear video
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const videoUrl = URL.createObjectURL(file);
      setVideo(videoUrl);
      setImage(null); // Clear image
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !description || (!image && !video)) return;

    addProduct(title, parseFloat(price), currency, description, category, image || undefined, video || undefined);
    
    // Reset Form
    setTitle('');
    setPrice('');
    setCurrency('USD');
    setDescription('');
    setImage(null);
    setVideo(null);
    setMediaType('image');
    setIsSelling(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <ShoppingBag className="mr-2 text-indigo-600 dark:text-indigo-400" />
            Global Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Buy and sell items worldwide. Select your currency.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search items..." 
               className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder-slate-400" 
             />
          </div>
          <Button onClick={() => setIsSelling(true)} leftIcon={<Plus size={18} />}>
            Sell Item
          </Button>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedProduct(null)}>
           <div 
             className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row relative"
             onClick={(e) => e.stopPropagation()}
           >
              <button 
                onClick={() => setSelectedProduct(null)} 
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition"
              >
                 <X size={20} />
              </button>

              {/* Media Section */}
              <div className="w-full md:w-1/2 bg-black flex items-center justify-center relative overflow-hidden group">
                 {selectedProduct.video ? (
                    <video src={selectedProduct.video} controls className="w-full h-full object-contain" autoPlay />
                 ) : (
                    <img src={selectedProduct.image || 'https://via.placeholder.com/400'} alt={selectedProduct.title} className="w-full h-full object-contain" />
                 )}
              </div>

              {/* Info Section */}
              <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto bg-white dark:bg-slate-900">
                 <div className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                       <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                          {selectedProduct.category}
                       </span>
                       <span className="text-slate-400 text-sm">{selectedProduct.timestamp}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedProduct.title}</h2>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                       {formatCurrency(selectedProduct.price, selectedProduct.currency)}
                    </div>
                 </div>

                 {/* Seller Info */}
                 <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6 border border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => { setSelectedProduct(null); navigateToProfile(selectedProduct.seller); }}>
                    <Avatar src={selectedProduct.seller.avatar} alt={selectedProduct.seller.name} size="md" />
                    <div className="flex-1">
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedProduct.seller.name}</p>
                       <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          <ShieldCheck size={12} className="mr-1 text-green-500" /> Verified Seller
                       </p>
                    </div>
                    <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">View Profile</button>
                 </div>

                 <div className="flex-1 mb-6">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Description</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                       {selectedProduct.description}
                    </p>
                 </div>

                 <div className="flex space-x-3 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={() => startChat(selectedProduct.seller)}
                    >
                       <MessageCircle size={20} className="mr-2" /> Chat with Seller
                    </Button>
                 </div>
                 <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center">
                    <ShieldCheck size={12} className="mr-1" /> Sphere Purchase Protection covers this item.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Sell Item Modal/Form Area */}
      {isSelling && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">List an Item</h2>
              <button onClick={() => setIsSelling(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                  placeholder="What are you selling?"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Price</label>
                  <div className="flex">
                    <div className="relative w-1/3 min-w-[80px]">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full h-full pl-2 pr-1 py-2 border border-r-0 border-slate-200 dark:border-slate-700 rounded-l-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-0 focus:border-slate-300"
                      >
                         {CURRENCIES.map(c => (
                           <option key={c.code} value={c.code}>{c.code}</option>
                         ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                   <select 
                     value={category}
                     onChange={(e) => setCategory(e.target.value)}
                     className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 dark:text-white"
                   >
                     <option>Electronics</option>
                     <option>Clothing</option>
                     <option>Home & Garden</option>
                     <option>Vehicles</option>
                     <option>Hobbies</option>
                     <option>Real Estate</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none text-slate-900 dark:text-white"
                  placeholder="Describe condition, features, shipping info, etc."
                  required
                />
              </div>

              <div>
                 <div className="flex items-center justify-between mb-2">
                   <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Media</label>
                   <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 space-x-1">
                      <button 
                        type="button" 
                        onClick={() => setMediaType('image')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${mediaType === 'image' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Image
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setMediaType('video')}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition ${mediaType === 'video' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                        Video
                      </button>
                   </div>
                 </div>

                 {mediaType === 'image' ? (
                   <>
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition min-h-[160px]"
                     >
                       {image ? (
                         <div className="relative">
                            <img src={image} alt="Preview" className="h-40 object-contain rounded-lg" />
                            <button onClick={(e) => { e.stopPropagation(); setImage(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                         </div>
                       ) : (
                         <>
                           <ImageIcon className="text-slate-400 mb-2" size={32} />
                           <span className="text-sm text-slate-500 dark:text-slate-400">Upload Product Photo</span>
                           <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">JPG, PNG up to 5MB</span>
                         </>
                       )}
                     </div>
                     <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
                   </>
                 ) : (
                   <>
                     <div 
                       onClick={() => videoInputRef.current?.click()}
                       className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition min-h-[160px]"
                     >
                       {video ? (
                         <div className="relative w-full flex justify-center">
                            <video src={video} className="h-40 rounded-lg bg-black" controls />
                            <button onClick={(e) => { e.stopPropagation(); setVideo(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><X size={12} /></button>
                         </div>
                       ) : (
                         <>
                           <VideoIcon className="text-slate-400 mb-2" size={32} />
                           <span className="text-sm text-slate-500 dark:text-slate-400">Upload Product Video</span>
                           <span className="text-xs text-slate-400 dark:text-slate-500 mt-1">MP4, WebM up to 50MB</span>
                         </>
                       )}
                     </div>
                     <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoSelect} />
                   </>
                 )}
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg">Post Listing</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {products.map((product) => (
           <div 
             key={product.id} 
             onClick={() => setSelectedProduct(product)}
             className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg dark:hover:shadow-indigo-500/10 transition-all duration-300 group cursor-pointer flex flex-col h-full"
           >
             <div className="aspect-square overflow-hidden relative bg-slate-100 dark:bg-slate-800">
               {product.video ? (
                  <div className="w-full h-full relative group-hover:bg-slate-900 transition-colors">
                     <video 
                       src={product.video} 
                       className="w-full h-full object-cover" 
                       muted
                       loop
                       onMouseOver={(e) => e.currentTarget.play()} 
                       onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                     />
                     <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 pointer-events-none group-hover:opacity-0 transition">
                        <PlayCircle size={40} />
                     </div>
                  </div>
               ) : (
                  <img src={product.image || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
               )}
               
               <div className="absolute top-2 right-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 py-1.5 rounded-lg font-bold text-slate-900 dark:text-white shadow-sm text-sm">
                 {formatCurrency(product.price, product.currency)}
               </div>
               {product.currency !== 'USD' && (
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-[10px] font-medium flex items-center">
                    <Globe size={10} className="mr-1" /> Int'l
                  </div>
               )}
             </div>
             <div className="p-4 flex flex-col flex-1">
               <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate text-lg flex-1">{product.title}</h3>
               </div>
               <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{product.description}</p>
               
               <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex items-center space-x-2">
                   <Avatar src={product.seller.avatar} alt={product.seller.name} size="sm" className="w-6 h-6" />
                   <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[100px] font-medium">{product.seller.name}</span>
                 </div>
                 <span className="text-xs text-slate-400">{product.timestamp}</span>
               </div>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
};

export default MarketplaceView;
