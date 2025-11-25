
import React, { useEffect, useState, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Users, MessageSquare, Hand, Smile, AlertCircle, X } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { VoiceRoom } from '../types';
import Avatar from './Avatar';
import Button from './Button';

interface ActiveVoiceRoomProps {
  room: VoiceRoom;
  onLeave: () => void;
}

const REACTION_EMOJIS = ["❤️", "👏", "🔥", "😂", "😮", "👍"];

const ActiveVoiceRoom: React.FC<ActiveVoiceRoomProps> = ({ room, onLeave }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, char: string}[]>([]);
  
  const [transcripts, setTranscripts] = useState<{user: string, text: string}[]>([]);
  const [connectionState, setConnectionState] = useState<'CONNECTING' | 'CONNECTED' | 'ERROR'>('CONNECTING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const initializedRef = useRef(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (!initializedRef.current) {
        initializedRef.current = true;
        connectToGeminiLive();
    }
    return () => cleanup();
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptContainerRef.current) {
        transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcripts]);

  const connectToGeminiLive = async () => {
    try {
      setConnectionState('CONNECTING');
      setErrorMessage(null);

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Voice Room Connected");
            setConnectionState('CONNECTED');
            
            // Audio In Setup
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData, inputCtx.sampleRate);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
             // Handle Transcript with buffering/merging
             const updateTranscript = (user: string, text: string) => {
                if (!text) return;
                setTranscripts(prev => {
                    const last = prev[prev.length - 1];
                    // Merge if same user to create fluid sentences
                    if (last && last.user === user) {
                        return [...prev.slice(0, -1), { ...last, text: last.text + text }];
                    }
                    return [...prev, { user, text }];
                });
             };

             if (message.serverContent?.outputTranscription) {
                updateTranscript('AI Host', message.serverContent.outputTranscription.text);
             }
             if (message.serverContent?.inputTranscription) {
                updateTranscript('You', message.serverContent.inputTranscription.text);
             }

             // Handle Audio Out
             const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
             if (base64Audio) {
                const ctx = audioContextRef.current;
                if (ctx && ctx.state !== 'closed') {
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                    
                    const source = ctx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(ctx.destination);
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                }
             }
          },
          onclose: () => {
             console.log("Connection closed");
             if (initializedRef.current) setConnectionState('ERROR');
          },
          onerror: (err) => {
              console.error("Connection error:", err);
              setErrorMessage("Connection failed. Please try again.");
              setConnectionState('ERROR');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          // Use empty objects to enable default transcription models
          inputAudioTranscription: {}, 
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `You are hosting a social audio room about "${room.title}". Engage with the user, ask questions, and keep the conversation flowing naturally.`
        }
      });
    } catch (e: any) {
      console.error("Voice connection failed", e);
      setErrorMessage(e.message || "Failed to access microphone or connect.");
      setConnectionState('ERROR');
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    // Safely close contexts
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
        inputContextRef.current.close().catch(console.error);
    }
    inputContextRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
    }
    audioContextRef.current = null;
    
    initializedRef.current = false;
  };

  const toggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
  };

  const triggerReaction = (emoji: string) => {
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, char: emoji }]);
    setShowEmojiPicker(false);
    
    // Remove emoji after animation
    setTimeout(() => {
        setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
  };

  function createBlob(data: Float32Array, sampleRate: number): { data: string, mimeType: string } {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) int16[i] = data[i] * 32768;
    return {
      data: btoa(String.fromCharCode(...new Uint8Array(int16.buffer))),
      mimeType: `audio/pcm;rate=${sampleRate}`,
    };
  }
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  }
  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col">
       {/* Room Header */}
       <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
          <div>
             <h2 className="text-xl font-bold">{room.title}</h2>
             <div className="flex items-center space-x-2 text-sm text-slate-400">
                <span className="flex items-center"><Users size={14} className="mr-1"/> {room.listeners + 1} listening</span>
                
                {connectionState === 'CONNECTING' && (
                    <span className="text-yellow-500 font-medium flex items-center"><span className="w-2 h-2 bg-yellow-500 rounded-full mr-1 animate-pulse"></span> Connecting...</span>
                )}
                {connectionState === 'CONNECTED' && (
                    <span className="text-green-500 font-medium flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span> Live</span>
                )}
                {connectionState === 'ERROR' && (
                    <span className="text-red-500 font-medium flex items-center"><AlertCircle size={12} className="mr-1"/> {errorMessage || 'Connection Lost'}</span>
                )}
             </div>
          </div>
          <Button onClick={() => { cleanup(); onLeave(); }} className="bg-slate-800 hover:bg-slate-700 text-white border-none">
             Leave Quietly <PhoneOff size={16} className="ml-2" />
          </Button>
       </div>

       {/* Main Stage */}
       <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-900 to-indigo-950/20">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
             {room.speakers.map((speaker, i) => (
                <div key={i} className="flex flex-col items-center group relative">
                   <div className="relative">
                      <div className={`w-24 h-24 rounded-full p-1 ${speaker.isSpeaking ? 'bg-gradient-to-tr from-indigo-500 to-purple-500 animate-pulse' : 'bg-slate-800'}`}>
                         <Avatar src={speaker.user.avatar} alt={speaker.user.name} className="w-full h-full border-4 border-slate-900" />
                      </div>
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-700">
                         {speaker.role === 'HOST' ? '👑 Host' : 'Speaker'}
                      </div>
                   </div>
                   <span className="mt-3 font-medium text-sm">{speaker.user.name}</span>
                </div>
             ))}
             
             {/* Self */}
             <div className="flex flex-col items-center relative">
                   <div className="relative">
                      <div className={`w-24 h-24 rounded-full p-1 ${!isMuted ? 'bg-gradient-to-tr from-green-500 to-emerald-500' : 'bg-slate-800'}`}>
                         <Avatar src="https://picsum.photos/id/64/150/150" alt="Me" className="w-full h-full border-4 border-slate-900" />
                      </div>
                      
                      {/* Mute Indicator */}
                      {isMuted && (
                         <div className="absolute bottom-0 right-0 bg-red-500 rounded-full p-1 border-2 border-slate-900">
                            <MicOff size={12} />
                         </div>
                      )}

                      {/* Hand Raise Indicator */}
                      {isHandRaised && (
                         <div className="absolute top-0 right-0 bg-yellow-500 rounded-full p-1.5 border-2 border-slate-900 animate-bounce">
                            <Hand size={14} className="text-slate-900" />
                         </div>
                      )}

                      {/* Floating Reactions */}
                      {floatingEmojis.map(emoji => (
                         <div 
                            key={emoji.id}
                            className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-3xl animate-float-up pointer-events-none select-none"
                         >
                            {emoji.char}
                         </div>
                      ))}
                   </div>
                   <span className="mt-3 font-medium text-sm">You</span>
             </div>
          </div>

          {/* Live Transcription Feed */}
          <div className="max-w-2xl mx-auto bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 min-h-[200px] flex flex-col">
             <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center shrink-0">
               <MessageSquare size={14} className="mr-2" /> Live Captions
             </h3>
             <div 
                ref={transcriptContainerRef}
                className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar flex-1"
             >
                {transcripts.length === 0 ? (
                   <p className="text-slate-500 italic text-center py-4">
                      {connectionState === 'ERROR' ? 'Transcription unavailable.' : 'Waiting for conversation...'}
                   </p>
                ) : (
                   transcripts.map((t, i) => (
                      <div key={i} className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                         <span className={`font-bold text-sm mr-2 ${t.user === 'You' ? 'text-green-400' : 'text-indigo-400'}`}>{t.user}:</span>
                         <span className="text-slate-200 leading-relaxed">{t.text}</span>
                      </div>
                   ))
                )}
             </div>
          </div>
       </div>

       {/* Footer Controls */}
       <div className="p-6 bg-slate-900 border-t border-slate-800 flex justify-center space-x-6 relative">
          <button 
             onClick={() => setIsMuted(!isMuted)}
             className={`p-4 rounded-full transition ${isMuted ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700' : 'bg-white text-slate-900 hover:bg-slate-200'}`}
             title={isMuted ? "Unmute" : "Mute"}
          >
             {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          
          <button 
             onClick={toggleHandRaise}
             className={`p-4 rounded-full transition ${isHandRaised ? 'bg-yellow-500 text-slate-900 hover:bg-yellow-400' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
             title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
             <Hand size={24} />
          </button>
          
          <div className="relative">
             <button 
               onClick={() => setShowEmojiPicker(!showEmojiPicker)}
               className={`p-4 rounded-full transition ${showEmojiPicker ? 'bg-slate-700 text-white' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
               title="React"
             >
                <Smile size={24} />
             </button>

             {/* Emoji Picker Popover */}
             {showEmojiPicker && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 flex space-x-1 animate-in zoom-in duration-200">
                   {REACTION_EMOJIS.map(emoji => (
                      <button
                         key={emoji}
                         onClick={() => triggerReaction(emoji)}
                         className="p-2 hover:bg-slate-700 rounded-lg text-xl transition hover:scale-110"
                      >
                         {emoji}
                      </button>
                   ))}
                   <div className="w-0 h-0 absolute top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-800"></div>
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

export default ActiveVoiceRoom;
