
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Check, RefreshCw, AudioLines } from 'lucide-react';
import Button from './Button';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(10));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        setAudioBlob(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start Timer
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Start Visualizer
      setupVisualizer(stream);

    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const setupVisualizer = (stream: MediaStream) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    
    analyserRef.current = analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    dataArrayRef.current = dataArray;

    const draw = () => {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample diverse frequencies for the 20 bars
      const newData = [];
      const step = Math.floor(dataArray.length / 20);
      for (let i = 0; i < 20; i++) {
        newData.push(dataArray[i * step] / 2.5); // Normalize height
      }
      setVisualizerData(newData);
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopRecordingCleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    
    // Safely close AudioContext
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    
    setIsRecording(false);
  };

  const handleStop = () => {
    stopRecordingCleanup();
  };

  const handleConfirm = () => {
    if (audioBlob) {
      onRecordingComplete(audioBlob);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-red-500 font-semibold animate-pulse">
           <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-slate-400'}`}></div>
           <span>{isRecording ? 'Recording...' : 'Recorded'}</span>
        </div>
        <span className="font-mono text-slate-700 dark:text-slate-200 font-bold">{formatTime(duration)}</span>
      </div>

      {/* Visualizer */}
      <div className="h-16 flex items-end justify-center space-x-1 mb-6">
         {visualizerData.map((height, i) => (
           <div 
             key={i} 
             className="w-1.5 bg-indigo-500 rounded-t-sm transition-all duration-75"
             style={{ height: `${Math.max(10, height)}%`, opacity: isRecording ? 1 : 0.5 }}
           ></div>
         ))}
      </div>

      <div className="flex justify-center space-x-4">
        {isRecording ? (
          <button 
            onClick={handleStop}
            className="flex items-center justify-center w-12 h-12 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition"
          >
            <Square size={20} fill="currentColor" />
          </button>
        ) : (
          <>
             <button 
               onClick={onCancel}
               className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition"
               title="Delete"
             >
               <Trash2 size={18} />
             </button>
             <button 
               onClick={() => { setAudioBlob(null); setDuration(0); startRecording(); }}
               className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition"
               title="Redo"
             >
               <RefreshCw size={18} />
             </button>
             <button 
               onClick={handleConfirm}
               className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition"
               title="Use Recording"
             >
               <Check size={24} />
             </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
