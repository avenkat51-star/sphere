
import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, Shield, CheckCircle, FileText, Lock, Plus, X, Globe, CreditCard, ScanLine, Share2, Copy, Eye, EyeOff, Smartphone, QrCode, Download, Key } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Button from './Button';
import Avatar from './Avatar';
import { IdentityDocument } from '../types';

const IdentityWalletView: React.FC = () => {
  const { 
    currentUser, 
    identityDocuments,
    addIdentityDocument,
    isVaultUnlocked,
    unlockVault,
    lockVault,
    hasSetPin,
    setVaultPin
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'ID_CARD' | 'VAULT'>('ID_CARD');
  
  // Unlock / Setup State
  const [pin, setPin] = useState('');
  const [setupPin, setSetupPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [vaultError, setVaultError] = useState('');
  
  // Document Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docType, setDocType] = useState<IdentityDocument['type']>('PASSPORT');
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Scanner Mode State
  const [isScanMode, setIsScanMode] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus PIN input
  const pinInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!isVaultUnlocked && pinInputRef.current) {
      pinInputRef.current.focus();
    }
  }, [isVaultUnlocked]);

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

  const handleSetupPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPin.length < 4) {
      setVaultError('PIN must be at least 4 digits');
      return;
    }
    if (setupPin !== confirmPin) {
      setVaultError('PINs do not match');
      return;
    }
    setVaultPin(setupPin);
    setSetupPin('');
    setConfirmPin('');
    setVaultError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !selectedFile) return;
    
    setIsUploading(true);
    try {
       const base64 = await fileToBase64(selectedFile);
       await addIdentityDocument(docType, docTitle, base64);
       
       setShowUploadModal(false);
       setDocTitle('');
       setSelectedFile(null);
       setPreviewUrl(null);
    } catch (e) {
       console.error(e);
    } finally {
       setIsUploading(false);
    }
  };

  const getDocIcon = (type: string) => {
    switch(type) {
      case 'PASSPORT': return <Globe size={20} />;
      case 'DRIVER_LICENSE': return <CreditCard size={20} />;
      default: return <FileText size={20} />;
    }
  };

  // Lock Screen Component
  if (!isVaultUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
         <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 text-center max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400 shadow-inner">
               <Fingerprint size={48} strokeWidth={1.5} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Identity Vault</h1>
            
            {!hasSetPin ? (
               // Create PIN Flow
               <>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                     Create a secure 4-digit PIN to encrypt and protect your identity documents.
                  </p>
                  <form onSubmit={handleSetupPin} className="space-y-4">
                     <div className="space-y-2">
                        <input 
                           type="password" 
                           maxLength={4}
                           value={setupPin}
                           onChange={(e) => setSetupPin(e.target.value)}
                           className="w-full text-center text-xl tracking-widest font-bold py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
                           placeholder="New PIN"
                           required
                        />
                        <input 
                           type="password" 
                           maxLength={4}
                           value={confirmPin}
                           onChange={(e) => setConfirmPin(e.target.value)}
                           className="w-full text-center text-xl tracking-widest font-bold py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-slate-900 dark:text-white transition-colors"
                           placeholder="Confirm PIN"
                           required
                        />
                     </div>
                     {vaultError && (
                        <div className="text-red-500 text-xs font-bold animate-bounce flex items-center justify-center">
                           <Lock size={12} className="mr-1" /> {vaultError}
                        </div>
                     )}
                     <Button type="submit" size="lg" className="w-full shadow-lg shadow-indigo-200 dark:shadow-none">
                        Create & Open Vault
                     </Button>
                  </form>
               </>
            ) : (
               // Unlock Flow
               <>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                     Enter your secure PIN to access your government documents and digital ID.
                  </p>
                  <form onSubmit={handleUnlock}>
                     <div className="flex justify-center mb-8 relative">
                        <input 
                           ref={pinInputRef}
                           type="password" 
                           maxLength={4}
                           value={pin}
                           onChange={(e) => setPin(e.target.value)}
                           className="text-center text-4xl tracking-[0.5em] font-bold w-48 bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none pb-2 text-slate-900 dark:text-white transition-colors pl-4"
                           placeholder="••••"
                        />
                     </div>
                     {vaultError && (
                        <div className="text-red-500 text-xs font-bold mb-4 animate-bounce flex items-center justify-center">
                           <Lock size={12} className="mr-1" /> {vaultError}
                        </div>
                     )}
                     <Button type="submit" size="lg" className="w-full shadow-lg shadow-indigo-200 dark:shadow-none" disabled={pin.length < 4}>
                        Decrypt & Open
                     </Button>
                  </form>
               </>
            )}
            
            <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-wider">End-to-End Encrypted</p>
         </div>
      </div>
    );
  }

  // Scanner Mode Overlay
  if (isScanMode) {
     return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 animate-in zoom-in duration-300">
           <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>
           
           <button 
             onClick={() => setIsScanMode(false)}
             className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition z-50"
           >
              <X size={32} />
           </button>
           
           <div className="w-full max-w-md relative z-10">
               <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-500/30">
                     <Shield size={12} />
                     <span>Secure Identity Bridge</span>
                  </div>
                  <h2 className="text-white text-3xl font-bold">Share Credentials</h2>
                  <p className="text-slate-400 mt-2">Scan this code to import verified documents.</p>
               </div>

               <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative overflow-hidden">
                   {/* Scanning Line Animation */}
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[10%] w-full animate-[scan_3s_ease-in-out_infinite] pointer-events-none"></div>
                   
                   <div className="aspect-square bg-slate-900 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center border-4 border-slate-900">
                      <QrCode size={280} className="text-white" />
                      
                      {/* Logo in center */}
                      <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                            <Fingerprint size={40} className="text-indigo-600" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center space-x-3">
                            <Avatar src={currentUser.avatar} alt="Me" size="sm" />
                            <div className="text-left">
                               <p className="text-xs text-slate-500 uppercase font-bold">Identity</p>
                               <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                            </div>
                         </div>
                         <CheckCircle size={20} className="text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                               <FileText size={16} />
                            </div>
                            <div className="text-left">
                               <p className="text-xs text-slate-500 uppercase font-bold">Documents Included</p>
                               <p className="text-sm font-bold text-slate-900">{identityDocuments.length} Verified Items</p>
                            </div>
                         </div>
                         <CheckCircle size={20} className="text-green-500" />
                      </div>
                   </div>
               </div>

               <div className="mt-8 flex justify-center space-x-4">
                  <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition font-semibold">
                     <Copy size={18} />
                     <span>Copy Link</span>
                  </button>
                  <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition font-semibold shadow-lg shadow-indigo-900/50">
                     <Share2 size={18} />
                     <span>Share</span>
                  </button>
               </div>
           </div>
        </div>
     );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
             Digital ID Wallet
           </h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Manage, secure, and share your government-issued documents.</p>
        </div>
        <div className="flex space-x-3">
           <Button variant="secondary" onClick={lockVault} leftIcon={<Lock size={16}/>}>Lock Vault</Button>
           <Button onClick={() => setShowUploadModal(true)} leftIcon={<Plus size={16}/>}>Add Document</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8 max-w-md">
         <button 
           onClick={() => setActiveTab('ID_CARD')}
           className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'ID_CARD' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
         >
            Identity Card
         </button>
         <button 
           onClick={() => setActiveTab('VAULT')}
           className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${activeTab === 'VAULT' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
         >
            Document Vault
         </button>
      </div>

      {activeTab === 'ID_CARD' && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Holographic Card Container */}
           <div className="relative w-full max-w-md aspect-[1.586/1] mb-10 group perspective-1000">
              <div className="relative w-full h-full transition-transform duration-700 transform-style-3d group-hover:rotate-y-12 shadow-2xl rounded-2xl">
                 
                 {/* Card Background */}
                 <div className="absolute inset-0 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border border-white/10">
                    {/* Noise Texture */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                    
                    {/* Holographic Sheen */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    
                    {/* Decorative Circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl"></div>

                    {/* Card Content */}
                    <div className="relative z-10 p-6 h-full flex flex-col justify-between text-white">
                       {/* Header */}
                       <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-1">
                             <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                                <Shield size={18} fill="currentColor" />
                             </div>
                             <span className="font-bold tracking-wider text-sm">SPHERE ID</span>
                          </div>
                          <div className="w-12 h-8 rounded bg-gradient-to-r from-yellow-200 to-yellow-500 opacity-80 shadow-inner border border-yellow-600/30"></div>
                       </div>

                       {/* User Details */}
                       <div className="flex items-center space-x-5">
                          <div className="w-24 h-24 rounded-xl border-2 border-white/30 shadow-lg overflow-hidden relative">
                             <img src={currentUser.avatar} alt="User" className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                          </div>
                          <div>
                             <h2 className="text-2xl font-bold tracking-tight mb-1">{currentUser.name}</h2>
                             <p className="text-indigo-200 text-xs font-mono mb-2">{currentUser.id.toUpperCase()}</p>
                             <div className="flex items-center space-x-2">
                                <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Verified</span>
                                <span className="text-white/50 text-[10px] uppercase tracking-wide">Lvl {Math.floor((currentUser.reputationScore || 0) / 100)}</span>
                             </div>
                          </div>
                       </div>

                       {/* Footer */}
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] text-white/40 uppercase tracking-widest">Attributes</p>
                             <div className="flex space-x-1">
                                {currentUser.badges?.slice(0, 3).map((badge, i) => (
                                   <div key={i} className={`w-2 h-2 rounded-full ${badge.color.replace('text-', 'bg-')}`}></div>
                                ))}
                             </div>
                          </div>
                          <div className="font-mono text-xs text-white/60 tracking-widest">
                             {new Date().getFullYear()} • 12 • 31
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Actions Grid */}
           <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <button 
                onClick={() => setIsScanMode(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-2"
              >
                 <ScanLine size={32} />
                 <span className="font-bold">Scan & Share ID</span>
              </button>

              <button 
                onClick={() => setShowSensitiveData(!showSensitiveData)}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white p-4 rounded-2xl shadow-sm transition transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-2"
              >
                 {showSensitiveData ? <EyeOff size={32} className="text-slate-400" /> : <Eye size={32} className="text-slate-400" />}
                 <span className="font-bold">{showSensitiveData ? 'Hide Details' : 'View Details'}</span>
              </button>
           </div>
           
           {/* Detailed Info (Conditional) */}
           {showSensitiveData && (
              <div className="w-full max-w-md mt-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 animate-in fade-in slide-in-from-top-2">
                 <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-sm">Full Name</span>
                       <span className="text-slate-900 dark:text-white font-medium text-sm">{currentUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-sm">Handle</span>
                       <span className="text-slate-900 dark:text-white font-medium text-sm">{currentUser.handle}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-sm">User ID</span>
                       <span className="text-slate-900 dark:text-white font-medium text-sm font-mono">{currentUser.id}</span>
                    </div>
                    <div className="flex justify-between">
                       <span className="text-slate-500 text-sm">Location</span>
                       <span className="text-slate-900 dark:text-white font-medium text-sm">{currentUser.location || 'Unknown'}</span>
                    </div>
                 </div>
              </div>
           )}
        </div>
      )}

      {activeTab === 'VAULT' && (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Cards */}
              {identityDocuments.map(doc => (
                 <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg dark:hover:shadow-indigo-900/10 transition group cursor-pointer relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                       <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400">
                             {getDocIcon(doc.type)}
                          </div>
                          <div>
                             <h3 className="font-bold text-slate-900 dark:text-white">{doc.title}</h3>
                             <p className="text-xs text-slate-500">{doc.type.replace('_', ' ')}</p>
                          </div>
                       </div>
                       {doc.status === 'VERIFIED' ? (
                          <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                             <CheckCircle size={10} className="mr-1" /> VERIFIED
                          </span>
                       ) : (
                          <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 text-[10px] font-bold px-2 py-1 rounded-full flex items-center">
                             Processing
                          </span>
                       )}
                    </div>

                    {/* Doc Preview */}
                    <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative group-hover:ring-2 ring-indigo-500/50 transition-all">
                       <img src={doc.imageUrl} alt={doc.title} className="w-full h-full object-cover filter blur-[2px] group-hover:blur-0 transition duration-500" />
                       <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-100 group-hover:opacity-0 transition">
                          <Lock size={20} className="text-white drop-shadow-md" />
                       </div>
                       
                       {/* Overlay Actions */}
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 space-x-3">
                          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm" title="View">
                             <Eye size={18} />
                          </button>
                          <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm" title="Share">
                             <Share2 size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="mt-4 flex justify-between items-center text-xs text-slate-400">
                       <span>Uploaded: {doc.uploadDate}</span>
                       {doc.expiryDate && <span>Expires: {doc.expiryDate}</span>}
                    </div>

                    {doc.extractedData && (
                        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800">
                            <p className="text-xs font-semibold text-slate-500 mb-1">Extracted Data:</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                                    <span className="block text-slate-400 text-[10px]">Name</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{doc.extractedData.fullName}</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 p-1.5 rounded">
                                    <span className="block text-slate-400 text-[10px]">ID Number</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">••••{doc.extractedData.idNumber?.slice(-4)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
              ))}

              {/* Add New Card */}
              <button 
                onClick={() => setShowUploadModal(true)}
                className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition flex flex-col items-center justify-center min-h-[250px] group"
              >
                 <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <Plus size={32} className="text-slate-400 group-hover:text-indigo-500" />
                 </div>
                 <h3 className="font-bold text-slate-600 dark:text-slate-300">Add Document</h3>
                 <p className="text-sm text-slate-400 mt-1">Passport, ID, or License</p>
              </button>
           </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Secure Document Upload</h3>
                  <button onClick={() => setShowUploadModal(false)}><X size={20} className="text-slate-400" /></button>
               </div>
               
               <form onSubmit={handleUploadSubmit} className="space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Document Type</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['PASSPORT', 'DRIVER_LICENSE', 'NATIONAL_ID'].map(type => (
                           <button
                             type="button"
                             key={type}
                             onClick={() => setDocType(type as any)}
                             className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center space-y-2 ${docType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 ring-1 ring-indigo-500' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                           >
                              {getDocIcon(type)}
                              <span className="text-[10px] text-center">{type.replace('_', ' ')}</span>
                           </button>
                        ))}
                     </div>
                  </div>

                  <div>
                     <label className="block text-xs font-bold text-slate-500 mb-1">Document Title</label>
                     <input 
                       type="text" 
                       value={docTitle}
                       onChange={(e) => setDocTitle(e.target.value)}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white"
                       placeholder="e.g. 2024 Passport"
                       required
                     />
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group"
                  >
                     {previewUrl ? (
                        <div className="relative w-full h-40">
                           <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                           <button onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 transition"><X size={14}/></button>
                        </div>
                     ) : (
                        <>
                           <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <ScanLine className="text-slate-400 group-hover:text-indigo-500" size={24} />
                           </div>
                           <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Click to Upload or Scan</span>
                           <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</span>
                        </>
                     )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />

                  <div className="pt-2">
                    <Button type="submit" className="w-full" size="lg" isLoading={isUploading}>
                       {isUploading ? 'Encrypting & Verifying...' : 'Secure Upload'}
                    </Button>
                  </div>
                  <p className="text-[10px] text-center text-slate-400 flex items-center justify-center">
                     <Lock size={10} className="mr-1" /> Documents are encrypted before storage.
                  </p>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default IdentityWalletView;
