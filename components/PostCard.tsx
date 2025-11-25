
import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Sparkles, Leaf, Flame, Brain, Bot, Play, Pause, FileText, Shield, Palette, Zap, Award, Flag, EyeOff, Bookmark, Ghost, Gamepad2 } from 'lucide-react';
import { Post, Comment, Mood, Poll, PostGame } from '../types';
import Avatar from './Avatar';
import { generateSimulatedComments, generateReplySuggestion } from '../services/geminiService';
import { useAppContext } from '../contexts/AppContext';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onAddComment: (postId: string, comment: string) => void;
}

// Sub-component for Poll
const PollComponent: React.FC<{ poll: Poll, postId: string, onVote: (pid: string, oid: string) => void }> = ({ poll, postId, onVote }) => {
  const hasVoted = poll.options.some(o => o.isVoted);

  return (
    <div className="mt-3 mb-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <h4 className="font-bold text-slate-900 dark:text-white mb-3">{poll.question}</h4>
      <div className="space-y-2">
        {poll.options.map(option => {
           const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
           return (
             <div key={option.id} className="relative">
                <button
                  onClick={() => onVote(postId, option.id)}
                  disabled={hasVoted}
                  className={`w-full text-left py-2 px-3 rounded-lg border relative z-10 transition-all ${
                    hasVoted 
                      ? option.isVoted 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'border-transparent text-slate-500 dark:text-slate-400'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="flex justify-between relative z-10">
                     <span>{option.text}</span>
                     {hasVoted && <span>{percentage}%</span>}
                  </span>
                </button>
                {/* Progress Bar Background */}
                {hasVoted && (
                   <div 
                     className="absolute top-0 left-0 bottom-0 bg-slate-200 dark:bg-slate-700 rounded-lg transition-all duration-500 z-0"
                     style={{ width: `${percentage}%` }}
                   ></div>
                )}
             </div>
           );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-2">{poll.totalVotes} votes • {hasVoted ? 'Poll ended' : 'Vote now'}</p>
    </div>
  );
};

// Sub-component for Mini Game (Simple Clicker)
const MiniGameComponent: React.FC<{ game: PostGame }> = ({ game }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [targetPos, setTargetPos] = useState({ top: '50%', left: '50%' });
  const [gameResult, setGameResult] = useState<string | null>(null);

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(10);
    setGameResult(null);
    moveTarget();
    
    const timer = setInterval(() => {
       setTimeLeft(prev => {
          if (prev <= 1) {
             clearInterval(timer);
             setIsPlaying(false);
             setGameResult(`Time's up! You scored ${score} points!`);
             return 0;
          }
          return prev - 1;
       });
    }, 1000);
  };

  const moveTarget = () => {
     const top = Math.random() * 80 + 10;
     const left = Math.random() * 80 + 10;
     setTargetPos({ top: `${top}%`, left: `${left}%` });
  };

  const handleClick = (e: React.MouseEvent) => {
     e.stopPropagation();
     setScore(s => s + 1);
     moveTarget();
  };

  return (
     <div className="mt-3 mb-2 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-1 overflow-hidden relative">
        <div className="bg-slate-900 rounded-lg h-64 relative overflow-hidden flex flex-col items-center justify-center">
           {!isPlaying && !gameResult && (
              <div className="text-center p-6 z-10">
                 <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Gamepad2 size={32} className="text-white" />
                 </div>
                 <h4 className="text-white font-bold text-xl mb-1">{game.title}</h4>
                 <p className="text-white/60 text-sm mb-4">{game.description}</p>
                 <button 
                   onClick={startGame}
                   className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-full transition"
                 >
                    Play Game
                 </button>
              </div>
           )}

           {gameResult && (
              <div className="text-center p-6 z-10">
                 <h4 className="text-white font-bold text-2xl mb-2">Game Over!</h4>
                 <p className="text-indigo-300 font-mono text-xl mb-4">{score} Points</p>
                 <p className="text-white/60 text-sm mb-6">{gameResult}</p>
                 <button 
                   onClick={startGame}
                   className="px-6 py-2 bg-white text-indigo-900 font-bold rounded-full transition hover:bg-gray-200"
                 >
                    Play Again
                 </button>
              </div>
           )}

           {isPlaying && (
              <>
                 <div className="absolute top-4 left-4 text-white font-mono text-lg font-bold">Score: {score}</div>
                 <div className="absolute top-4 right-4 text-white font-mono text-lg font-bold text-red-400">{timeLeft}s</div>
                 
                 <button 
                    onMouseDown={handleClick}
                    className="absolute w-12 h-12 bg-white rounded-full shadow-[0_0_20px_white] active:scale-90 transition-transform duration-75 border-4 border-indigo-500 cursor-crosshair"
                    style={{ top: targetPos.top, left: targetPos.left, transform: 'translate(-50%, -50%)' }}
                 ></button>
              </>
           )}
           
           {/* Background Decoration */}
           <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
           </div>
        </div>
     </div>
  );
};


const PostCard: React.FC<PostCardProps> = ({ post, onLike, onAddComment }) => {
  const { aiCompanion, navigateToProfile, hidePost, votePoll } = useAppContext();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSimulatingComments, setIsSimulatingComments] = useState(false);
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  const audioRef = React.useRef<HTMLAudioElement>(null);

  const handleSimulateComments = async () => {
    setIsSimulatingComments(true);
    setShowComments(true); 
    
    const simulated = await generateSimulatedComments(post.content);
    
    for (const sim of simulated) {
      onAddComment(post.id, `${sim.user}: ${sim.text}`);
      await new Promise(r => setTimeout(r, 800));
    }
    setIsSimulatingComments(false);
  };

  const handleGetAISuggestion = async () => {
    if (!aiCompanion) return;
    setIsGettingSuggestion(true);
    const suggestion = await generateReplySuggestion(aiCompanion.personality, aiCompanion.tone, post.content);
    setCommentText(suggestion);
    setIsGettingSuggestion(false);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText('');
  };

  const toggleAudio = () => {
     if (audioRef.current) {
        if (isPlayingAudio) {
           audioRef.current.pause();
        } else {
           audioRef.current.play();
        }
        setIsPlayingAudio(!isPlayingAudio);
     }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateToProfile(post.author);
  };

  const handleMenuAction = (action: string) => {
    setShowMenu(false);
    if (action === 'hide') {
      hidePost(post.id);
    } else if (action === 'report') {
      alert("Post reported. Thanks for helping keep the community safe.");
    } else if (action === 'save') {
      alert("Post saved to bookmarks.");
    }
  };

  const getMoodIcon = (mood?: Mood) => {
    switch(mood) {
      case 'RELAX': return <Leaf size={14} className="text-emerald-500" />;
      case 'INSPIRE': return <Flame size={14} className="text-orange-500" />;
      case 'FOCUS': return <Brain size={14} className="text-indigo-500" />;
      default: return null;
    }
  };

  const getBadgeIcon = (iconName: string, size: number = 10) => {
    switch (iconName) {
      case 'Shield': return <Shield size={size} />;
      case 'Palette': return <Palette size={size} />;
      case 'Zap': return <Zap size={size} />;
      default: return <Award size={size} />;
    }
  };

  const getMoodLabel = (mood?: Mood) => {
    if (!mood || mood === 'NEUTRAL' || mood === 'ALL') return null;
    
    const styles = {
      'RELAX': 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      'INSPIRE': 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      'FOCUS': 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
    };

    return (
      <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-semibold ${styles[mood]}`}>
        {getMoodIcon(mood)}
        <span>{mood}</span>
      </span>
    );
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${post.isAIGenerated ? 'border-indigo-200 dark:border-indigo-900/50' : 'border-slate-100 dark:border-slate-800'} ${post.stealthConfig ? 'border-purple-200 dark:border-purple-800 ring-1 ring-purple-100 dark:ring-purple-900/20' : ''} mb-6 overflow-visible transition-colors duration-300 relative`}>
      
      {/* Stealth Badge */}
      {post.stealthConfig && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center z-10">
          <Ghost size={12} className="mr-1" />
          Stealth Post Unlocked
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer group" onClick={handleProfileClick}>
          <div className="relative">
             <Avatar src={post.author.avatar} alt={post.author.name} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
               <h3 className="font-semibold text-slate-900 dark:text-white group-hover:underline">{post.author.name}</h3>
               
               {/* Display Author Top Badge if available */}
               {post.author.badges && post.author.badges.length > 0 && (
                 <div className="tooltip-trigger" title={post.author.badges[0].name}>
                    <div className={`p-0.5 rounded-full ${post.author.badges[0].color} bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                       {getBadgeIcon(post.author.badges[0].icon, 10)}
                    </div>
                 </div>
               )}

               {post.isAIGenerated && (
                 <span className="flex items-center space-x-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                   <Bot size={10} />
                   <span>Via {post.aiAuthorName || 'AI'}</span>
                 </span>
               )}
               {getMoodLabel(post.mood)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{post.author.handle} • {post.timestamp}</p>
          </div>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <MoreHorizontal size={20} />
          </button>
          
          {showMenu && (
             <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 animate-in fade-in zoom-in-95 duration-100">
                <div className="py-1">
                   <button onClick={() => handleMenuAction('save')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center">
                      <Bookmark size={16} className="mr-2" /> Save Post
                   </button>
                   <button onClick={() => handleMenuAction('hide')} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center">
                      <EyeOff size={16} className="mr-2" /> Hide Post
                   </button>
                   <button onClick={() => handleMenuAction('report')} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center">
                      <Flag size={16} className="mr-2" /> Report
                   </button>
                </div>
             </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-2">
        {/* Audio Player if Voice Post */}
        {post.audio && (
           <div className="mb-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-3 border border-indigo-100 dark:border-indigo-900/30">
              <div className="flex items-center space-x-3">
                 <button 
                   onClick={toggleAudio}
                   className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition"
                 >
                    {isPlayingAudio ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                 </button>
                 <div className="flex-1">
                    <div className="h-8 flex items-center space-x-0.5">
                       {/* Simulated Waveform */}
                       {[...Array(30)].map((_, i) => (
                          <div 
                             key={i} 
                             className="w-1 bg-indigo-300 dark:bg-indigo-700 rounded-full" 
                             style={{ 
                                height: `${Math.random() * 80 + 20}%`,
                                opacity: isPlayingAudio ? 1 : 0.7
                             }}
                          ></div>
                       ))}
                    </div>
                 </div>
              </div>
              <audio 
                ref={audioRef} 
                src={post.audio} 
                onEnded={() => setIsPlayingAudio(false)} 
                className="hidden" 
              />
              
              {post.transcription && (
                 <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/30">
                    <button 
                       onClick={() => setShowTranscript(!showTranscript)}
                       className="flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1"
                    >
                       <FileText size={12} />
                       <span>{showTranscript ? 'Hide Transcript' : 'Show Transcript'}</span>
                    </button>
                    {showTranscript && (
                       <p className="text-sm text-slate-600 dark:text-slate-300 italic">"{post.transcription}"</p>
                    )}
                 </div>
              )}
           </div>
        )}

        {/* Text Content */}
        {(!post.audio || (post.audio && !post.transcription)) && (
          <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
        )}
        
        {/* Interactive Poll */}
        {post.poll && (
           <PollComponent poll={post.poll} postId={post.id} onVote={votePoll} />
        )}

        {/* Interactive Game */}
        {post.game && (
           <MiniGameComponent game={post.game} />
        )}
      </div>

      {/* Image */}
      {post.image && (
        <div className="mt-2 w-full">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-[600px]" />
        </div>
      )}

      {/* Video */}
      {post.video && (
        <div className="mt-2 w-full">
          <video 
            src={post.video} 
            controls 
            className="w-full h-auto max-h-[600px] bg-black" 
          />
        </div>
      )}

      {/* Stats Row */}
      <div className="px-4 py-3 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 border-b border-slate-50 dark:border-slate-800">
        <span>{post.likes} likes</span>
        <span>{post.comments.length} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="px-2 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              post.isLiked 
                ? 'text-red-500 bg-red-50 dark:bg-red-900/10' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="font-medium">Like</span>
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <MessageCircle size={20} />
            <span className="font-medium">Comment</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <Share2 size={20} />
            <span className="font-medium">Share</span>
          </button>
        </div>
        
        <button 
          onClick={handleSimulateComments}
          disabled={isSimulatingComments}
          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-slate-800 rounded-full transition"
          title="Simulate AI Discussion"
        >
          <Sparkles size={18} className={isSimulatingComments ? "animate-pulse" : ""} />
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-4 mb-4">
            {post.comments.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-2">No comments yet. Be the first!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                   <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0 cursor-pointer" onClick={() => navigateToProfile(comment.author)}>
                      {comment.author.name.charAt(0)}
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-lg rounded-tl-none shadow-sm flex-1">
                     <div className="flex items-center justify-between mb-1">
                       <span className="font-semibold text-sm text-slate-900 dark:text-white cursor-pointer hover:underline" onClick={() => navigateToProfile(comment.author)}>{comment.author.name}</span>
                       <span className="text-xs text-slate-400">{comment.timestamp}</span>
                     </div>
                     <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                   </div>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 relative">
            <Avatar src="https://picsum.photos/id/64/150/150" alt="Me" size="sm" />
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              
              {/* AI Reply Suggestion Button */}
              {aiCompanion && (
                <button 
                   type="button"
                   onClick={handleGetAISuggestion}
                   disabled={isGettingSuggestion}
                   className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-400 transition"
                   title={`Ask ${aiCompanion.name} for a suggestion`}
                >
                   {isGettingSuggestion ? <Sparkles size={16} className="animate-spin" /> : <Bot size={16} />}
                </button>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={!commentText.trim()}
              className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-300 transition"
            >
               <Share2 size={16} className="rotate-45" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
