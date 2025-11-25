
import React, { useState, useRef } from 'react';
import { Image, Sparkles, X, Smile, Paperclip, Video, Wand2, AlertTriangle, Check, Lightbulb, Mic, Ghost, Clock, Users, BarChart2, Gamepad2, PlusCircle, Trash2, Plus } from 'lucide-react';
import { User, StealthConfig, Poll, PollOption, PostGame } from '../types';
import Avatar from './Avatar';
import Button from './Button';
import { checkContentSafety, getSmartPostSuggestions, transcribeAudio } from '../services/geminiService';
import VoiceRecorder from './VoiceRecorder';

interface CreatePostProps {
  currentUser: User;
  onPostCreate: (content: string, image?: string, video?: string, audio?: string, transcription?: string, stealthConfig?: StealthConfig, poll?: Poll, game?: PostGame) => void;
}

const COMMON_EMOJIS = ["😀", "😂", "🤣", "😍", "🥰", "😎", "🤔", "😭", "😡", "👍", "👎", "🔥", "✨", "🎉", "❤️", "💔", "💯", "🚀", "👋", "🙏"];

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreate }) => {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Voice Mode
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  // Interactive Content State
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

  const [showGameSelector, setShowGameSelector] = useState(false);
  const [selectedGameType, setSelectedGameType] = useState<PostGame['type'] | null>(null);

  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSmartAssist, setShowSmartAssist] = useState(false);
  const [suggestions, setSuggestions] = useState<{caption: string, hashtags: string[], advice: string} | null>(null);

  // Stealth Mode State
  const [showStealthConfig, setShowStealthConfig] = useState(false);
  const [stealthConfig, setStealthConfig] = useState<StealthConfig | null>(null);
  const [stealthType, setStealthType] = useState<'VISITS' | 'TIME'>('VISITS');
  const [visitThreshold, setVisitThreshold] = useState(3);
  const [startHour, setStartHour] = useState(22); // 10 PM
  const [endHour, setEndHour] = useState(6);   // 6 AM
  
  // Safety State
  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [safetyReason, setSafetyReason] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedVideo(null); // Clear video
      setSelectedAudio(null);
      setSuggestions(null); // Reset suggestions
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const videoUrl = URL.createObjectURL(file);
      setSelectedVideo(videoUrl);
      setSelectedImage(null);
      setSelectedAudio(null);
      setSuggestions(null);
    }
  };

  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      
      if (file.type.startsWith('image/')) {
        setSelectedImage(url);
        setSelectedVideo(null);
      } else if (file.type.startsWith('video/')) {
        setSelectedVideo(url);
        setSelectedImage(null);
      }
      setSuggestions(null);
    }
  };

  // Poll Functions
  const handleAddPollOption = () => {
    if (pollOptions.length < 5) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const handleRemovePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = [...pollOptions];
      newOptions.splice(index, 1);
      setPollOptions(newOptions);
    }
  };

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  // Helper to convert file to base64 for Gemini
  const fileToBase64 = (file: File | Blob): Promise<string> => {
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

  const handleVoiceRecordingComplete = async (blob: Blob) => {
    setShowVoiceRecorder(false);
    const audioUrl = URL.createObjectURL(blob);
    setSelectedAudio(audioUrl);
    
    // Auto Transcribe
    setIsTranscribing(true);
    try {
       const base64 = await fileToBase64(blob);
       const text = await transcribeAudio(base64);
       // Append transcription to content or set it
       setContent(prev => prev ? `${prev}\n\n[Voice Transcript]: ${text}` : text);
    } catch (e) {
       console.error("Transcription error", e);
    } finally {
       setIsTranscribing(false);
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSmartAssist = async () => {
    setIsGenerating(true);
    setShowSmartAssist(true);
    
    try {
      let imageBase64: string | undefined;
      let mimeType: string | undefined;

      if (selectedImage && selectedFile && selectedFile.type.startsWith('image/')) {
         imageBase64 = await fileToBase64(selectedFile);
         mimeType = selectedFile.type;
      }

      const result = await getSmartPostSuggestions(content, imageBase64, mimeType);
      
      setSuggestions({
        caption: result.suggestedCaption,
        hashtags: result.hashtags || [],
        advice: result.formatAdvice
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const applySuggestion = () => {
    if (suggestions) {
      const tags = suggestions.hashtags.map(t => t.startsWith('#') ? t : `#${t}`).join(' ');
      setContent(`${suggestions.caption}\n\n${tags}`);
      setSuggestions(null);
      setShowSmartAssist(false);
    }
  };

  const handleStealthSave = () => {
    let config: StealthConfig = { type: stealthType };
    if (stealthType === 'VISITS') {
      config.visitThreshold = visitThreshold;
    } else {
      config.startHour = startHour;
      config.endHour = endHour;
    }
    setStealthConfig(config);
    setShowStealthConfig(false);
  };

  const handlePostClick = async () => {
    if (!content.trim() && !selectedImage && !selectedVideo && !selectedAudio && !showPollCreator && !selectedGameType) return;
    
    setIsPosting(true);
    
    // 1. Check Safety
    if (content.trim()) {
      const safetyResult = await checkContentSafety(content);
      if (!safetyResult.safe) {
        setSafetyReason(safetyResult.reason || "Content detected as potentially unsafe.");
        setShowSafetyWarning(true);
        setIsPosting(false);
        return;
      }
    }
    
    // 2. If Safe, Post
    executePost();
  };

  const executePost = () => {
    let poll: Poll | undefined;
    let game: PostGame | undefined;

    if (showPollCreator && pollQuestion && pollOptions.every(o => o.trim())) {
      poll = {
        id: `poll-${Date.now()}`,
        question: pollQuestion,
        totalVotes: 0,
        options: pollOptions.map((text, idx) => ({
          id: `opt-${idx}`,
          text,
          votes: 0
        }))
      };
    }

    if (showGameSelector && selectedGameType) {
      game = {
        type: selectedGameType,
        title: selectedGameType === 'CLICKER' ? 'Reflex Challenge' : selectedGameType === 'TRIVIA' ? 'Daily Trivia' : 'Memory Match',
        description: 'Challenge your friends!'
      };
    }

    // If audio is present, we pass the content as the transcription essentially, but the card handles it.
    onPostCreate(
      content, 
      selectedImage || undefined, 
      selectedVideo || undefined, 
      selectedAudio || undefined, 
      selectedAudio ? content : undefined,
      stealthConfig || undefined,
      poll,
      game
    );
    
    // Reset Everything
    setContent('');
    setSelectedImage(null);
    setSelectedVideo(null);
    setSelectedAudio(null);
    setSelectedFile(null);
    setShowEmojiPicker(false);
    setShowSmartAssist(false);
    setShowSafetyWarning(false);
    setStealthConfig(null);
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowGameSelector(false);
    setSelectedGameType(null);
    setIsPosting(false);

    // Explicitly reset file inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  }

  // Helper to ensure clicking input works even if same file is selected
  const onInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    (e.target as HTMLInputElement).value = '';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 mb-6 relative transition-colors duration-300 group hover:shadow-md">
      
      {/* Safety Warning Modal */}
      {showSafetyWarning && (
        <div className="absolute inset-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-200">
           <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle size={24} />
           </div>
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Review Content</h3>
           <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
             Our AI detected that this post might contain sensitive content: <br/>
             <span className="font-semibold text-red-500">"{safetyReason}"</span>
           </p>
           <div className="flex space-x-3">
              <Button variant="secondary" size="sm" onClick={() => setShowSafetyWarning(false)}>Edit Post</Button>
              <Button variant="danger" size="sm" onClick={executePost}>Post Anyway</Button>
           </div>
        </div>
      )}

      {/* Stealth Config Modal/Popover */}
      {showStealthConfig && (
        <div className="absolute top-full left-0 mt-2 z-20 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 animate-in slide-in-from-top-2">
           <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                 <Ghost size={16} className="mr-2 text-indigo-500" /> Stealth Mode
              </h3>
              <button onClick={() => setShowStealthConfig(false)} className="text-slate-400"><X size={16} /></button>
           </div>
           
           <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 mb-4">
              <button 
                onClick={() => setStealthType('VISITS')} 
                className={`flex-1 text-xs font-bold py-2 rounded-md transition ${stealthType === 'VISITS' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
              >
                Profile Visits
              </button>
              <button 
                onClick={() => setStealthType('TIME')} 
                className={`flex-1 text-xs font-bold py-2 rounded-md transition ${stealthType === 'TIME' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500'}`}
              >
                Time Window
              </button>
           </div>

           {stealthType === 'VISITS' ? (
              <div className="mb-4">
                 <label className="block text-xs font-semibold text-slate-500 mb-2">Required Profile Visits</label>
                 <div className="flex items-center space-x-3">
                    <Users size={20} className="text-slate-400" />
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={visitThreshold} 
                      onChange={(e) => setVisitThreshold(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600"
                    />
                    <span className="font-bold text-slate-900 dark:text-white w-6 text-center">{visitThreshold}</span>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-2">
                    Users must visit your profile {visitThreshold} times to unlock this post.
                 </p>
              </div>
           ) : (
              <div className="mb-4">
                 <label className="block text-xs font-semibold text-slate-500 mb-2">Visible Hours (24h)</label>
                 <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-slate-400" />
                    <input 
                      type="number" 
                      min="0" 
                      max="23" 
                      value={startHour} 
                      onChange={(e) => setStartHour(parseInt(e.target.value))}
                      className="w-16 p-1 text-sm border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-center"
                    />
                    <span className="text-slate-400">to</span>
                    <input 
                      type="number" 
                      min="0" 
                      max="23" 
                      value={endHour} 
                      onChange={(e) => setEndHour(parseInt(e.target.value))}
                      className="w-16 p-1 text-sm border rounded bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-center"
                    />
                 </div>
                 <p className="text-[10px] text-slate-400 mt-2">
                    Post is only visible between {startHour}:00 and {endHour}:00.
                 </p>
              </div>
           )}

           <Button size="sm" className="w-full" onClick={handleStealthSave}>Set Stealth Conditions</Button>
        </div>
      )}

      <div className="flex space-x-4">
        <Avatar src={currentUser.avatar} alt={currentUser.name} />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isTranscribing ? "Transcribing audio..." : `What's on your mind, ${currentUser.name.split(' ')[0]}?`}
            className="w-full border-none focus:ring-0 resize-none text-slate-700 dark:text-slate-200 placeholder-slate-400 text-lg bg-transparent p-0"
            rows={2}
            disabled={isTranscribing}
          />
          
          {/* Voice Recorder Interface */}
          {showVoiceRecorder && (
             <VoiceRecorder 
                onRecordingComplete={handleVoiceRecordingComplete} 
                onCancel={() => setShowVoiceRecorder(false)} 
             />
          )}

          {/* Interactive Content Creators */}
          
          {/* Poll Creator */}
          {showPollCreator && (
             <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mt-3 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                     <BarChart2 size={16} className="mr-2 text-indigo-500"/> Create Poll
                   </h3>
                   <button onClick={() => setShowPollCreator(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                </div>
                <input 
                  type="text" 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Ask a question..."
                  className="w-full mb-3 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
                <div className="space-y-2">
                   {pollOptions.map((opt, i) => (
                      <div key={i} className="flex space-x-2">
                         <input 
                            type="text"
                            value={opt}
                            onChange={(e) => handlePollOptionChange(i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                         />
                         {pollOptions.length > 2 && (
                            <button onClick={() => handleRemovePollOption(i)} className="text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                         )}
                      </div>
                   ))}
                </div>
                {pollOptions.length < 5 && (
                   <button onClick={handleAddPollOption} className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center hover:underline">
                      <PlusCircle size={14} className="mr-1"/> Add Option
                   </button>
                )}
             </div>
          )}

          {/* Game Selector */}
          {showGameSelector && (
             <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mt-3 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center">
                     <Gamepad2 size={16} className="mr-2 text-indigo-500"/> Attach Mini-Game
                   </h3>
                   <button onClick={() => setShowGameSelector(false)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => setSelectedGameType('CLICKER')}
                     className={`p-3 rounded-lg border text-left transition ${selectedGameType === 'CLICKER' ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}`}
                   >
                      <div className="font-bold text-sm text-slate-900 dark:text-white">Reflex Challenge</div>
                      <div className="text-xs text-slate-500">Test reaction speed</div>
                   </button>
                   {/* More games could be added here */}
                   <button className="p-3 rounded-lg border text-left bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">Trivia (Coming Soon)</div>
                      <div className="text-xs text-slate-500">Knowledge quiz</div>
                   </button>
                </div>
             </div>
          )}

          {/* Media Previews */}
          {selectedImage && (
            <div className="relative mt-3 mb-3 inline-block group/media">
              <img src={selectedImage} alt="Selected" className="rounded-lg max-h-60 object-cover shadow-sm" />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition opacity-0 group-hover/media:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {selectedVideo && (
            <div className="relative mt-3 mb-3 inline-block group/media">
              <video src={selectedVideo} controls className="rounded-lg max-h-60 object-cover bg-black shadow-sm" />
              <button
                onClick={clearSelection}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition opacity-0 group-hover/media:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {selectedAudio && (
             <div className="relative mt-3 mb-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                   <Mic size={20} />
                </div>
                <div className="flex-1">
                   <p className="text-xs text-indigo-900 dark:text-indigo-200 font-bold uppercase">Voice Tweet</p>
                   <audio src={selectedAudio} controls className="w-full h-8 mt-1" />
                </div>
                <button
                  onClick={() => { setSelectedAudio(null); setContent(''); }}
                  className="p-1 hover:bg-black/10 rounded-full"
                >
                  <X size={16} />
                </button>
             </div>
          )}
          
          {/* Smart Assist Panel */}
          {showSmartAssist && (
            <div className="mt-4 mb-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-2">
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                     <Sparkles size={18} className="text-indigo-600 dark:text-indigo-400 animate-pulse" />
                     <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 text-sm">Smart Assist</h3>
                  </div>
                  <button onClick={() => setShowSmartAssist(false)} className="text-indigo-400 hover:text-indigo-600"><X size={16}/></button>
               </div>
               
               {isGenerating ? (
                 <div className="py-4 flex justify-center space-x-2 items-center text-indigo-600 dark:text-indigo-400 text-sm">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                    <span>Analyzing context...</span>
                 </div>
               ) : suggestions ? (
                 <div className="space-y-3">
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-1">Suggested Format</p>
                       <div className="flex items-start space-x-2">
                          <Lightbulb size={16} className="text-yellow-500 mt-0.5" />
                          <p className="text-sm text-slate-700 dark:text-slate-300">{suggestions.advice}</p>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-100 dark:border-slate-700">
                       <p className="text-xs font-bold text-slate-400 uppercase mb-1">Enhanced Caption</p>
                       <p className="text-sm text-slate-800 dark:text-slate-200 mb-2">{suggestions.caption}</p>
                       <div className="flex flex-wrap gap-1 mb-2">
                         {suggestions.hashtags.map(tag => (
                           <span key={tag} className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                             {tag.startsWith('#') ? tag : `#${tag}`}
                           </span>
                         ))}
                       </div>
                       <button 
                         onClick={applySuggestion}
                         className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
                       >
                         <Check size={14} className="mr-1" /> Use This Caption
                       </button>
                    </div>
                 </div>
               ) : null}
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-3 grid grid-cols-5 gap-2 w-64 mt-2">
               {COMMON_EMOJIS.map(emoji => (
                 <button 
                   key={emoji} 
                   onClick={() => handleAddEmoji(emoji)} 
                   className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-1.5 transition flex items-center justify-center"
                 >
                   {emoji}
                 </button>
               ))}
            </div>
          )}

          {/* Stealth Config Preview */}
          {stealthConfig && (
             <div className="mt-3 flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <div className="flex items-center text-xs text-indigo-700 dark:text-indigo-300">
                   <Ghost size={14} className="mr-2" />
                   <span className="font-semibold mr-1">Stealth Mode Active:</span>
                   {stealthConfig.type === 'VISITS' 
                      ? `${stealthConfig.visitThreshold} profile visits required` 
                      : `Visible ${stealthConfig.startHour}:00 - ${stealthConfig.endHour}:00`}
                </div>
                <button onClick={() => setStealthConfig(null)} className="text-indigo-400 hover:text-indigo-600"><X size={14}/></button>
             </div>
          )}

          <div className="border-t border-slate-100 dark:border-slate-800 mt-3 pt-3 flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition"
                title="Add Photo"
              >
                <Image size={20} />
              </button>
              <button
                onClick={() => videoInputRef.current?.click()}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition relative"
                title="Add Video"
              >
                <Video size={20} />
                <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-[1px] border border-white dark:border-slate-800">
                   <Plus size={8} strokeWidth={4} />
                </div>
              </button>
              <button 
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className={`p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition ${showVoiceRecorder ? 'bg-red-50 text-red-600' : ''}`}
                title="Record Voice"
              >
                 <Mic size={20} />
              </button>
              <button 
                onClick={() => { setShowPollCreator(!showPollCreator); setShowGameSelector(false); }}
                className={`p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition ${showPollCreator ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
                title="Create Poll"
              >
                <BarChart2 size={20} />
              </button>
              <button 
                onClick={() => { setShowGameSelector(!showGameSelector); setShowPollCreator(false); }}
                className={`p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition ${showGameSelector ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
                title="Attach Mini-Game"
              >
                <Gamepad2 size={20} />
              </button>
              <button 
                onClick={() => attachmentInputRef.current?.click()}
                className="p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition" 
                title="Add Attachment"
              >
                <Paperclip size={20} />
              </button>
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition ${showEmojiPicker ? 'bg-indigo-100 dark:bg-slate-800' : ''}`} 
                title="Add Emoji"
              >
                <Smile size={20} />
              </button>
              <button 
                 onClick={() => setShowStealthConfig(!showStealthConfig)}
                 className={`p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-full transition ${stealthConfig ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}`}
                 title="Stealth Post"
              >
                 <Ghost size={20} />
              </button>
              
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2 self-center"></div>

              <button
                onClick={handleSmartAssist}
                disabled={isGenerating}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition text-sm font-medium ${
                    showSmartAssist 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800'
                }`}
                title="AI Smart Assist"
              >
                <Wand2 size={16} />
                <span className="hidden sm:inline">Smart Assist</span>
              </button>
            </div>
            
            <Button 
              onClick={handlePostClick} 
              disabled={(!content.trim() && !selectedImage && !selectedVideo && !selectedAudio && !showPollCreator && !selectedGameType) || isPosting || isTranscribing}
              size="md"
              isLoading={isPosting || isTranscribing}
            >
              {isTranscribing ? 'Transcribing...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
        onClick={onInputClick}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={handleVideoSelect}
        onClick={onInputClick}
      />
      <input
        type="file"
        ref={attachmentInputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={handleAttachmentSelect}
        onClick={onInputClick}
      />
    </div>
  );
};

export default CreatePost;
