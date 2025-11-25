
import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Settings, FileText, Send, User, Brain, Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import Avatar from './Avatar';
import Button from './Button';

const AICompanionView: React.FC = () => {
  const { aiCompanion, createAICompanion, updateAICompanion, triggerAIPost, getFeedSummary } = useAppContext();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings'>('dashboard');
  
  // Creation Form State
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('Professional');
  const [tone, setTone] = useState<'Casual' | 'Formal' | 'Humorous' | 'Inspirational'>('Casual');
  const [interestsInput, setInterestsInput] = useState('');

  // Dashboard State
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
         setSuccessMessage(null);
         setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createAICompanion({
      name: name || 'My AI Twin',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name || 'ai'}`,
      personality,
      tone,
      interests: interestsInput.split(',').map(s => s.trim()).filter(Boolean),
      permissions: {
        canPost: false,
        canComment: false,
        canSummarize: true
      }
    });
  };

  const handleGenerateSummary = async () => {
    if (isSummarizing) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setIsSummarizing(true);
      const text = await getFeedSummary();
      if (!text || text.includes("Unable to generate")) {
         setSummary("Feed is currently quiet. Try again later when there is more activity.");
      } else {
         setSummary(text);
         setSuccessMessage("Briefing generated successfully.");
      }
    } catch (error) {
      console.error("Failed to generate summary:", error);
      setSummary("Unable to generate summary at this time. Please check connection.");
      setErrorMessage("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleTriggerPost = async () => {
    if (isGeneratingPost) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setIsGeneratingPost(true);
      await triggerAIPost();
      setSuccessMessage("Post published to your feed!");
    } catch (error) {
      console.error("Failed to trigger post:", error);
      setErrorMessage("Failed to generate post. Please try again.");
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // If no AI profile exists, show creation screen
  if (!aiCompanion) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
             <Bot size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Create Your Digital Twin</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
            Build an autonomous AI profile that understands you. It can draft posts, summarize your feed, and help you engage with your community while you focus on what matters.
          </p>

          <form onSubmit={handleCreate} className="max-w-md mx-auto space-y-6 text-left">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Name your AI</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jarvis, Neo, or YourName AI"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Personality</label>
                  <select 
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option>Professional</option>
                    <option>Witty</option>
                    <option>Empathetic</option>
                    <option>Bold</option>
                    <option>Creative</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tone</label>
                  <select 
                    value={tone}
                    onChange={(e) => setTone(e.target.value as any)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option>Casual</option>
                    <option>Formal</option>
                    <option>Humorous</option>
                    <option>Inspirational</option>
                  </select>
               </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Core Interests (comma separated)</label>
              <input 
                type="text" 
                value={interestsInput}
                onChange={(e) => setInterestsInput(e.target.value)}
                placeholder="Tech, Art, Travel, Coffee..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">Initialize AI Profile</Button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="max-w-4xl mx-auto pb-10">
      {/* Messages Toast */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-100 dark:bg-green-900/90 text-green-800 dark:text-green-200 px-4 py-3 rounded-xl shadow-lg flex items-center animate-in slide-in-from-top-2 fade-in duration-300 border border-green-200 dark:border-green-800">
           <CheckCircle size={20} className="mr-2" />
           <span className="font-medium">{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 dark:bg-red-900/90 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl shadow-lg flex items-center animate-in slide-in-from-top-2 fade-in duration-300 border border-red-200 dark:border-red-800">
           <AlertCircle size={20} className="mr-2" />
           <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-6">
             <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full p-2 border-2 border-white/30">
               <img src={aiCompanion.avatar} alt="AI Avatar" className="w-full h-full rounded-full bg-slate-100" />
             </div>
             <div>
               <h1 className="text-3xl font-bold mb-2">{aiCompanion.name}</h1>
               <div className="flex items-center space-x-3 text-white/80 text-sm">
                 <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{aiCompanion.personality}</span>
                 <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">{aiCompanion.tone}</span>
                 <span className="flex items-center"><Activity size={14} className="mr-1" /> Active</span>
               </div>
             </div>
          </div>
          <div className="flex space-x-3">
             <button 
               onClick={() => setActiveTab('dashboard')}
               className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'dashboard' ? 'bg-white text-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
             >
               Dashboard
             </button>
             <button 
               onClick={() => setActiveTab('settings')}
               className={`px-4 py-2 rounded-lg font-semibold transition ${activeTab === 'settings' ? 'bg-white text-indigo-600' : 'bg-white/10 hover:bg-white/20'}`}
             >
               Settings
             </button>
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Daily Briefing Card */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 md:col-span-2">
             <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                  <Brain className="mr-2 text-indigo-500" /> Daily Briefing
                </h2>
                <Button 
                   size="sm" 
                   variant="secondary" 
                   onClick={handleGenerateSummary}
                   isLoading={isSummarizing}
                   leftIcon={<Sparkles size={16} />}
                >
                  {isSummarizing ? 'Analyzing Feed...' : 'Generate Summary'}
                </Button>
             </div>
             <div className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800 min-h-[100px]">
                {isSummarizing ? (
                   <div className="flex items-center justify-center h-full text-slate-400">
                      <Sparkles className="animate-spin mr-2" /> AI is reading your feed...
                   </div>
                ) : summary ? (
                  <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 animate-in fade-in">
                    <p className="whitespace-pre-wrap leading-relaxed">{summary}</p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center py-4 flex flex-col items-center">
                    <FileText size={32} className="mb-2 opacity-50" />
                    Your AI hasn't analyzed your feed yet today. Click generate to get a summary of what you missed.
                  </p>
                )}
             </div>
           </div>

           {/* Autonomous Actions */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                 <Zap className="mr-2 text-yellow-500" /> Quick Actions
              </h2>
              <div className="space-y-4">
                 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                    <div className="flex justify-between items-center mb-2">
                       <span className="font-semibold text-slate-800 dark:text-slate-200">Auto-Post</span>
                       <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Ready</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-3">
                      Generate and publish a post based on your interests ({aiCompanion.interests.length > 0 ? aiCompanion.interests.join(', ') : 'General'}).
                    </p>
                    <Button 
                      className="w-full" 
                      onClick={handleTriggerPost}
                      isLoading={isGeneratingPost}
                      disabled={isGeneratingPost}
                    >
                      {isGeneratingPost ? 'Creating Post...' : 'Trigger Now'}
                    </Button>
                 </div>
              </div>
           </div>

           {/* Stats */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
                 <Activity className="mr-2 text-green-500" /> Performance
              </h2>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Posts Created</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">12</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Comments Replied</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">45</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <span className="text-slate-600 dark:text-slate-400">Feed Summaries</span>
                    <span className="font-bold text-xl text-slate-900 dark:text-white">8</span>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">AI Configuration</h2>
           
           <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                 <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Auto-Posting Permission</h3>
                    <p className="text-sm text-slate-500">Allow {aiCompanion.name} to post autonomously once a day.</p>
                 </div>
                 <div 
                   onClick={() => updateAICompanion({ permissions: { ...aiCompanion.permissions, canPost: !aiCompanion.permissions.canPost } })}
                   className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${aiCompanion.permissions.canPost ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                 >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${aiCompanion.permissions.canPost ? 'right-0.5' : 'left-0.5'}`}></div>
                 </div>
              </div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                 <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">Reply Suggestions</h3>
                    <p className="text-sm text-slate-500">Show AI suggested replies in comment sections.</p>
                 </div>
                 <div 
                   onClick={() => updateAICompanion({ permissions: { ...aiCompanion.permissions, canComment: !aiCompanion.permissions.canComment } })}
                   className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${aiCompanion.permissions.canComment ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                 >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${aiCompanion.permissions.canComment ? 'right-0.5' : 'left-0.5'}`}></div>
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Update Personality</label>
                 <select 
                    value={aiCompanion.personality}
                    onChange={(e) => updateAICompanion({ personality: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <option>Professional</option>
                    <option>Witty</option>
                    <option>Empathetic</option>
                    <option>Bold</option>
                    <option>Creative</option>
                  </select>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AICompanionView;
