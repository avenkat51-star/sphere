
import React, { useState, useEffect } from 'react';
import { Phone, Video, Search, MoreVertical, Send, ArrowLeft, Ban, BellOff, Bell, User as UserIcon, Trash2, Unlock, MessageCircle, CheckCircle } from 'lucide-react';
import { User } from '../types';
import Avatar from './Avatar';
import Button from './Button';
import { useAppContext } from '../contexts/AppContext';

interface MessagesViewProps {
  onStartCall: (user: User, video: boolean) => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ onStartCall }) => {
  const { 
    activeConversationUser, 
    setActiveConversationUser, 
    navigateToProfile, 
    users, 
    blockedUsers, 
    blockUser, 
    unblockUser,
    mutedUsers,
    toggleMuteUser,
    chatHistory,
    clearChat,
    sendMessage
  } = useAppContext();
  
  const [messageText, setMessageText] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);

  // Get messages from context for active user
  const messages = activeConversationUser ? (chatHistory[activeConversationUser.id] || []) : [];

  const isBlocked = activeConversationUser ? blockedUsers.includes(activeConversationUser.id) : false;
  const isMuted = activeConversationUser ? mutedUsers.includes(activeConversationUser.id) : false;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversationUser) return;
    
    sendMessage(activeConversationUser.id, messageText);
    setMessageText('');
  };

  const handleBlockUser = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    setShowChatMenu(false);
    if (activeConversationUser && window.confirm(`Are you sure you want to block ${activeConversationUser.name}? You will no longer receive messages from them.`)) {
        blockUser(activeConversationUser.id);
    }
  };

  const handleUnblockUser = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    setShowChatMenu(false);
    if (activeConversationUser && window.confirm(`Unblock ${activeConversationUser.name}?`)) {
        unblockUser(activeConversationUser.id);
    }
  };

  const handleClearChat = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowChatMenu(false);
      if (activeConversationUser && window.confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
          clearChat(activeConversationUser.id);
      }
  };

  const handleMuteNotifications = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowChatMenu(false);
      if (activeConversationUser) {
          toggleMuteUser(activeConversationUser.id);
      }
  };

  const handleViewProfile = () => {
      if (activeConversationUser) {
          navigateToProfile(activeConversationUser);
          setShowChatMenu(false);
      }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-2rem)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
      {/* Contact List */}
      <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 flex-col ${activeConversationUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h2>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {users.slice(0, 5).map(user => {
            const isUserBlocked = blockedUsers.includes(user.id);
            const isUserMuted = mutedUsers.includes(user.id);
            const userMessages = chatHistory[user.id] || [];
            const lastMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : 'Start a conversation';
            const lastTime = userMessages.length > 0 ? userMessages[userMessages.length - 1].time : '';

            return (
                <div 
                key={user.id}
                onClick={() => setActiveConversationUser(user)}
                className={`p-4 flex items-center space-x-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${activeConversationUser?.id === user.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}
                >
                <div className="relative">
                    <Avatar src={user.avatar} alt={user.name} />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center space-x-1 overflow-hidden">
                        <span className={`font-semibold text-sm truncate ${activeConversationUser?.id === user.id ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-900 dark:text-white'}`}>{user.name}</span>
                        {isUserMuted && <BellOff size={12} className="text-slate-400" />}
                    </div>
                    <span className="text-xs text-slate-400">{lastTime}</span>
                    </div>
                    <p className={`text-xs truncate ${isUserBlocked ? 'text-red-500 italic font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {isUserBlocked ? 'Blocked' : lastMessage}
                    </p>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex-col min-w-0 ${activeConversationUser ? 'flex' : 'hidden md:flex'}`}>
        {activeConversationUser ? (
          <>
            {/* Chat Header */}
            <div className="p-3 md:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={handleViewProfile}>
                {/* Back Button for Mobile */}
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveConversationUser(null); }}
                  className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>

                <Avatar src={activeConversationUser.avatar} alt={activeConversationUser.name} />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-tight flex items-center">
                      {activeConversationUser.name}
                      {isMuted && <BellOff size={14} className="ml-2 text-slate-400" />}
                  </h3>
                  {isBlocked ? (
                      <p className="text-xs text-red-500 font-bold bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-full inline-block mt-0.5">Blocked</p>
                  ) : (
                      <p className="text-xs text-green-600 font-medium">Online</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 md:space-x-2">
                {!isBlocked && (
                    <>
                        <button 
                        onClick={() => onStartCall(activeConversationUser, false)}
                        className="p-2 md:p-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition"
                        title="Voice Call"
                        >
                        <Phone size={20} />
                        </button>
                        <button 
                        onClick={() => onStartCall(activeConversationUser, true)}
                        className="p-2 md:p-2.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition"
                        title="Video Call"
                        >
                        <Video size={20} />
                        </button>
                    </>
                )}
                
                {/* Options Dropdown */}
                <div className="relative">
                    <button 
                        onClick={() => setShowChatMenu(!showChatMenu)}
                        className={`p-2 md:p-2.5 text-slate-600 dark:text-slate-300 rounded-full transition ${showChatMenu ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        <MoreVertical size={20} />
                    </button>

                    {showChatMenu && (
                        <>
                            {/* Backdrop */}
                            <div className="fixed inset-0 z-10" onClick={() => setShowChatMenu(false)}></div>
                            
                            {/* Menu */}
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                <div className="py-1">
                                    <button 
                                        onClick={handleViewProfile}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                                    >
                                        <UserIcon size={16} className="mr-2.5 text-slate-400" /> View Profile
                                    </button>
                                    <button 
                                        onClick={handleMuteNotifications}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                                    >
                                        {isMuted ? (
                                            <><Bell size={16} className="mr-2.5 text-slate-400" /> Unmute Notifications</>
                                        ) : (
                                            <><BellOff size={16} className="mr-2.5 text-slate-400" /> Mute Notifications</>
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleClearChat}
                                        className="w-full text-left px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center"
                                    >
                                        <Trash2 size={16} className="mr-2.5 text-slate-400" /> Clear Chat
                                    </button>
                                    <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                                    
                                    {isBlocked ? (
                                        <button 
                                            onClick={handleUnblockUser}
                                            className="w-full text-left px-4 py-3 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center font-medium"
                                        >
                                            <Unlock size={16} className="mr-2.5" /> Unblock User
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleBlockUser}
                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center font-medium"
                                        >
                                            <Ban size={16} className="mr-2.5" /> Block User
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 md:space-y-6 bg-slate-50 dark:bg-slate-950/50">
              {messages.length > 0 ? (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                      {msg.sender !== 'me' && <Avatar src={activeConversationUser.avatar} alt={activeConversationUser.name} size="sm" className="mr-2 self-end" />}
                      <div className={`max-w-[75%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                        msg.sender === 'me' 
                          ? 'bg-indigo-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.time}</p>
                      </div>
                    </div>
                  ))
              ) : (
                  <div className="flex h-full items-center justify-center text-slate-400 text-sm flex-col">
                      <MessageCircle size={40} className="mb-2 opacity-20" />
                      <p className="mb-1 font-medium">No messages yet.</p>
                      <p className="text-xs opacity-70">Start the conversation!</p>
                  </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              {isBlocked ? (
                  <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/50 rounded-xl flex flex-col items-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <Ban size={24} className="text-red-400 mb-2" />
                      <span className="font-bold text-slate-700 dark:text-slate-200 mb-1">You have blocked this user.</span>
                      <span className="text-xs mb-3 opacity-70">You can't send messages or see their new messages.</span>
                      <button 
                        onClick={handleUnblockUser} 
                        className="px-5 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition shadow-sm flex items-center"
                      >
                        <Unlock size={12} className="mr-2" /> Unblock to send message
                      </button>
                  </div>
              ) : (
                  <form onSubmit={handleSend} className="flex items-center space-x-2">
                    <input 
                      type="text" 
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                    <Button type="submit" size="md" className="!px-3 !rounded-full" disabled={!messageText.trim()}>
                      <Send size={18} />
                    </Button>
                  </form>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search size={32} />
            </div>
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesView;
