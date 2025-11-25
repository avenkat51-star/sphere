
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User as UserIcon } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from "@google/genai";
import { User } from '../types';
import Avatar from './Avatar';

interface LiveCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User;
  initialVideoEnabled?: boolean;
}

const LiveCallModal: React.FC<LiveCallModalProps> = ({ 
  isOpen, 
  onClose, 
  targetUser, 
  initialVideoEnabled = false 
}) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(initialVideoEnabled);
  const [volume, setVolume] = useState(0); // For visualizer

  // Refs for audio/video processing
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      cleanup();
    }
    return () => cleanup();
  }, [isOpen]);

  // Handle video toggle
  useEffect(() => {
    if (!streamRef.current) return;
    
    streamRef.current.getVideoTracks().forEach(track => {
      track.enabled = isVideoEnabled;
    });

    if (isVideoEnabled) {
      startVideoStreaming();
    } else {
      if (frameIntervalRef.current) {
        window.clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }
  }, [isVideoEnabled]);

  const startCall = async () => {
    try {
      setStatus('connecting');
      
      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;

      // Get Media Stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true // Always ask for video to have the track ready, even if disabled initially
      });
      streamRef.current = stream;

      // Setup Video Element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Prevent feedback
      }

      // Initial video state
      stream.getVideoTracks().forEach(t => t.enabled = isVideoEnabled);

      // Connect to Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Connected");
            setStatus('connected');
            
            // Stream audio from the microphone to the model.
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return; // Don't send if muted
              
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData, inputCtx.sampleRate);
              
              // Solely rely on sessionPromise resolves
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            
            // Start Video Streaming if enabled
            if (isVideoEnabled) {
              startVideoStreaming(sessionPromise);
            }

            // Save session ref for video toggling later
            sessionRef.current = sessionPromise;
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            
            if (base64Audio) {
              const ctx = audioContextRef.current;
              if (!ctx) return;

              // Simple volume visualization from chunk size
              setVolume(Math.min(base64Audio.length / 1000, 1));
              setTimeout(() => setVolume(0), 200);

              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                ctx,
                24000,
                1
              );
              
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Gemini Live Closed");
            setStatus('ended');
          },
          onerror: (err) => {
            console.error("Gemini Live Error", err);
            setStatus('ended');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are simulating a video call. Your name is ${targetUser.name}. You are talking to a friend on Sphere Social. Keep your responses concise, casual, and friendly, like a real phone/video conversation.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      }).catch((err) => {
          console.error("Failed to connect:", err);
          setStatus('ended');
          return Promise.reject(err);
      });

    } catch (err) {
      console.error("Failed to start call", err);
      setStatus('ended');
    }
  };

  const startVideoStreaming = (existingSessionPromise?: Promise<any>) => {
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);

    const FPS = 1; // Low FPS for demo to save bandwidth/latency
    
    frameIntervalRef.current = window.setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isVideoEnabled) return;
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      canvas.width = video.videoWidth * 0.5; // Downscale for performance
      canvas.height = video.videoHeight * 0.5;
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
      
      const promise = existingSessionPromise || sessionRef.current;
      if (promise) {
        promise.then((session: any) => {
          session.sendRealtimeInput({
            media: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          });
        });
      }
    }, 1000 / FPS);
  };

  const cleanup = () => {
    // Stop Media Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close Audio Contexts safely and nullify refs
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
      inputContextRef.current.close().catch(e => console.debug('Input context close error', e));
    }
    inputContextRef.current = null;

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(e => console.debug('Output context close error', e));
    }
    audioContextRef.current = null;
    
    // Clear Intervals
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    
    // Stop Audio Sources
    sourcesRef.current.forEach(s => {
        try { s.stop(); } catch (e) { console.debug('Source stop error', e); }
    });
    sourcesRef.current.clear();
  };

  const handleEndCall = () => {
    cleanup();
    onClose();
  };

  // --- Helper Functions ---

  function createBlob(data: Float32Array, sampleRate: number): Blob {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: `audio/pcm;rate=${sampleRate}`,
    };
  }

  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh] max-h-[800px]">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 z-10 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
          <div>
             <h2 className="text-white text-2xl font-bold tracking-tight">{targetUser.name}</h2>
             <p className="text-white/70 text-sm font-medium flex items-center space-x-2">
               <span className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
               <span>{status === 'connected' ? '00:42' : 'Connecting...'}</span>
             </p>
          </div>
        </div>

        {/* Main Content Area (Remote User) */}
        <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
           {/* Visualizer Ring around avatar */}
           <div 
             className="absolute rounded-full border border-white/10 bg-white/5 transition-all duration-100"
             style={{ 
               width: `${160 + volume * 100}px`, 
               height: `${160 + volume * 100}px`,
               opacity: 0.5 + volume 
             }}
           ></div>
           
           <Avatar 
             src={targetUser.avatar} 
             alt={targetUser.name} 
             className="w-40 h-40 border-4 border-white/20 shadow-2xl z-10" 
           />
        </div>

        {/* Self View (Video) */}
        {isVideoEnabled && (
          <div className="absolute top-6 right-6 w-32 h-48 bg-black rounded-2xl overflow-hidden shadow-lg border-2 border-white/20 z-20">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
             />
             <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Controls */}
        <div className="p-8 pb-10 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center space-x-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all duration-200 ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>

          <button 
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-200"
          >
            <PhoneOff size={32} />
          </button>

          <button 
            onClick={() => setIsVideoEnabled(!isVideoEnabled)}
            className={`p-4 rounded-full transition-all duration-200 ${!isVideoEnabled ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            {isVideoEnabled ? <Video size={28} /> : <VideoOff size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveCallModal;
