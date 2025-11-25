
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { User, Post, Comment, Notification, Story, Group, Product, ViewState, Mood, AICompanion, Persona, PersonaType, FeedPreferences, ARExperience, VirtualEvent, GeoCircle, Memory, MemoryCluster, VaultItem, StealthConfig, IdentityCredential, IdentityDocument, Poll, PostGame } from '../types';
import { INITIAL_POSTS, MOCK_USERS, CURRENT_USER, INITIAL_GROUPS, INITIAL_PRODUCTS, INITIAL_AR_EXPERIENCES, INITIAL_VIRTUAL_EVENTS, INITIAL_GEO_CIRCLES, INITIAL_MEMORIES, INITIAL_CLUSTERS, INITIAL_VAULT_ITEMS, INITIAL_CREDENTIALS, INITIAL_DOCUMENTS } from '../constants';
import { analyzePostMood, generateAIPersonaPost, generateDailyBriefing, verifyIdentityAttribute, analyzeDocument } from '../services/geminiService';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
}

interface AppContextType {
  // Auth
  isAuthenticated: boolean;
  currentUser: User;
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  loginWithPhone: (phoneNumber: string) => void;
  logout: () => void;

  // Navigation & Views
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  viewingUser: User | null;
  navigateToProfile: (user: User) => void;
  viewingCommunity: Group | null;
  navigateToCommunity: (group: Group) => void;
  viewingGeoCircle: GeoCircle | null;
  navigateToGeoCircle: (circle: GeoCircle) => void;
  
  // Deep Linking
  viewingPostId: string | null;
  setViewingPostId: (id: string | null) => void;
  navigateToPost: (postId: string) => void;

  // Messaging
  activeConversationUser: User | null;
  setActiveConversationUser: (user: User | null) => void;
  startChat: (user: User) => void;
  blockedUsers: string[];
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  mutedUsers: string[];
  toggleMuteUser: (userId: string) => void;
  chatHistory: Record<string, Message[]>;
  clearChat: (userId: string) => void;
  sendMessage: (userId: string, text: string) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Data
  posts: Post[]; // Raw posts
  filteredPosts: Post[]; // Mood filtered posts
  users: User[];
  notifications: Notification[];
  markNotificationsRead: () => void;
  stories: Story[];
  addStory: (mediaUrl: string, type: 'image' | 'video') => void;
  groups: Group[];
  products: Product[];
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Mixed Reality
  arExperiences: ARExperience[];
  virtualEvents: VirtualEvent[];

  // Geo-Circles
  geoCircles: GeoCircle[];
  toggleGeoCircleJoin: (circleId: string) => void;

  // Memory Lane
  memories: Memory[];
  memoryClusters: MemoryCluster[];
  vaultItems: VaultItem[];
  isVaultUnlocked: boolean;
  hasSetPin: boolean;
  setVaultPin: (pin: string) => void;
  unlockVault: (pin: string) => boolean;
  lockVault: () => void;

  // Identity Wallet
  identityCredentials: IdentityCredential[];
  identityDocuments: IdentityDocument[];
  verifyCredential: (type: string, value: string) => Promise<boolean>;
  addIdentityDocument: (type: IdentityDocument['type'], title: string, imageBase64: string) => Promise<void>;

  // Wallet / Creator Economy
  addFunds: (amount: number) => void;
  tipUser: (userId: string, amount: number) => boolean;
  unlockPost: (postId: string) => boolean;

  // Stealth Logic
  profileVisits: Map<string, number>;
  recordProfileVisit: (userId: string) => void;

  // Feed Engine
  currentMood: Mood;
  setMood: (mood: Mood) => void;
  feedPreferences: FeedPreferences;
  updateFeedPreferences: (prefs: Partial<FeedPreferences>) => void;

  // AI Companion
  aiCompanion: AICompanion | null;
  createAICompanion: (data: Omit<AICompanion, 'id'>) => void;
  updateAICompanion: (data: Partial<AICompanion>) => void;
  triggerAIPost: () => Promise<void>;
  getFeedSummary: () => Promise<string>;

  // Personas
  allPersonas: Persona[];
  switchPersona: (personaId: string) => void;
  addNewPersona: (name: string, handle: string, bio: string, type: PersonaType, avatar: string) => void;

  // Actions
  createPost: (content: string, image?: string, video?: string, audio?: string, transcription?: string, stealthConfig?: StealthConfig, poll?: Poll, game?: PostGame, groupId?: string) => void;
  likePost: (postId: string) => void;
  hidePost: (postId: string) => void;
  votePoll: (postId: string, optionId: string) => void;
  addComment: (postId: string, text: string) => void;
  followUser: (userId: string) => void;
  toggleGroupJoin: (groupId: string) => void;
  addProduct: (title: string, price: number, currency: string, description: string, category: string, image?: string, video?: string) => void;
  createGroup: (name: string, description: string, category: string, image?: string) => void;

  // Contact Sync
  isContactSyncOpen: boolean;
  setContactSyncOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_STORIES: Story[] = [
  { id: 's1', user: MOCK_USERS[0], mediaUrl: 'https://picsum.photos/id/1015/300/500', type: 'image', isViewed: false },
  { id: 's2', user: MOCK_USERS[1], mediaUrl: 'https://picsum.photos/id/1035/300/500', type: 'image', isViewed: false },
  { id: 's3', user: MOCK_USERS[2], mediaUrl: 'https://picsum.photos/id/1040/300/500', type: 'image', isViewed: false },
];

// Updated notifications to link to specific posts for navigation demonstration
const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'LIKE', actor: MOCK_USERS[0], timestamp: '2m ago', isRead: false, post: INITIAL_POSTS[0] },
  { id: 'n2', type: 'FOLLOW', actor: MOCK_USERS[1], timestamp: '1h ago', isRead: false },
  { id: 'n3', type: 'COMMENT', actor: MOCK_USERS[2], timestamp: '3h ago', isRead: true, post: INITIAL_POSTS[1] },
  { id: 'n4', type: 'MENTION', actor: MOCK_USERS[0], timestamp: '5h ago', isRead: true, post: INITIAL_POSTS[2] },
  { id: 'n5', type: 'LIKE', actor: MOCK_USERS[2], timestamp: '1d ago', isRead: true, post: INITIAL_POSTS[0] },
];

const UNWANTED_KEYWORDS = ['spam', 'buy crypto', 'hate', 'angry', 'politics'];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [viewingPostId, setViewingPostId] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [allPersonas, setAllPersonas] = useState<Persona[]>(CURRENT_USER.personas || []);
  const [viewingUser, setViewingUser] = useState<User | null>(CURRENT_USER);
  const [viewingCommunity, setViewingCommunity] = useState<Group | null>(null);
  const [viewingGeoCircle, setViewingGeoCircle] = useState<GeoCircle | null>(null);
  
  const [activeConversationUser, setActiveConversationUser] = useState<User | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [mutedUsers, setMutedUsers] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>({
    // Initialize with some mock data for the mock users
    'u2': [
       { id: 1, sender: 'them', text: 'Hey! Did you see the new update?', time: '10:30 AM' },
       { id: 2, sender: 'me', text: 'Yeah, looking great! The AI features are wild.', time: '10:32 AM' },
       { id: 3, sender: 'them', text: 'Totally. We should catch up soon.', time: '10:33 AM' }
    ],
    'u3': [
       { id: 1, sender: 'them', text: 'Are you going to the tech conference?', time: 'Yesterday' }
    ]
  });

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [hiddenPostIds, setHiddenPostIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [groups, setGroups] = useState<Group[]>(INITIAL_GROUPS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  
  const [arExperiences, setArExperiences] = useState<ARExperience[]>(INITIAL_AR_EXPERIENCES);
  const [virtualEvents, setVirtualEvents] = useState<VirtualEvent[]>(INITIAL_VIRTUAL_EVENTS);

  const [geoCircles, setGeoCircles] = useState<GeoCircle[]>(INITIAL_GEO_CIRCLES);

  const [memories, setMemories] = useState<Memory[]>(INITIAL_MEMORIES);
  const [memoryClusters, setMemoryClusters] = useState<MemoryCluster[]>(INITIAL_CLUSTERS);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(INITIAL_VAULT_ITEMS);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultPin, setVaultPinState] = useState<string | null>(null);

  const [identityCredentials, setIdentityCredentials] = useState<IdentityCredential[]>(INITIAL_CREDENTIALS);
  const [identityDocuments, setIdentityDocuments] = useState<IdentityDocument[]>(INITIAL_DOCUMENTS);

  const [profileVisits, setProfileVisits] = useState<Map<string, number>>(new Map());

  const [currentMood, setCurrentMood] = useState<Mood>('ALL');
  const [feedPreferences, setFeedPreferences] = useState<FeedPreferences>({
    artWeight: 50,
    techWeight: 50,
    lifeWeight: 50,
    politicsWeight: 10
  });

  const [aiCompanion, setAiCompanion] = useState<AICompanion | null>(null);
  
  const [isContactSyncOpen, setContactSyncOpen] = useState(false);

  const isStealthPostVisible = (post: Post): boolean => {
    if (!post.stealthConfig) return true;
    if (post.author.id === currentUser.id) return true;

    const config = post.stealthConfig;

    if (config.type === 'VISITS' && config.visitThreshold) {
      const visits = profileVisits.get(post.author.id) || 0;
      return visits >= config.visitThreshold;
    }

    if (config.type === 'TIME' && config.startHour !== undefined && config.endHour !== undefined) {
      const currentHour = new Date().getHours();
      if (config.startHour > config.endHour) {
        return currentHour >= config.startHour || currentHour < config.endHour;
      } else {
        return currentHour >= config.startHour && currentHour < config.endHour;
      }
    }

    return false;
  };

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      // Filter out group posts from main feed
      if (post.groupId) return false;

      if (hiddenPostIds.has(post.id)) return false;
      if (blockedUsers.includes(post.author.id)) return false; // Hide posts from blocked users
      if (!isStealthPostVisible(post)) return false;
      
      // Search Logic
      if (searchQuery) {
        const query = searchQuery.toLowerCase().replace(/^#/, '');
        const content = post.content.toLowerCase();
        const author = post.author.name.toLowerCase();
        const handle = post.author.handle.toLowerCase();
        
        const matches = content.includes(query) || 
                        content.includes(searchQuery.toLowerCase()) || 
                        author.includes(query) || 
                        handle.includes(query);
                        
        if (!matches) return false;
      }

      if (currentMood !== 'ALL' && post.mood !== currentMood) {
        return false;
      }
      const contentLower = post.content.toLowerCase();
      if (UNWANTED_KEYWORDS.some(keyword => contentLower.includes(keyword))) {
        return false;
      }
      return true;
    });

    const scoredPosts = filtered.map(post => {
      let score = 50;
      let matchReason = '';

      const content = post.content.toLowerCase();
      
      const isArt = content.includes('art') || content.includes('photo') || content.includes('design') || content.includes('color');
      const isTech = content.includes('tech') || content.includes('ai') || content.includes('code') || content.includes('dev');
      const isLife = content.includes('life') || content.includes('coffee') || content.includes('travel') || content.includes('vibes');
      const isPolitics = content.includes('politics') || content.includes('news') || content.includes('vote');

      if (isArt) score += feedPreferences.artWeight;
      if (isTech) score += feedPreferences.techWeight;
      if (isLife) score += feedPreferences.lifeWeight;
      if (isPolitics) score -= (100 - feedPreferences.politicsWeight); 

      if (isArt && feedPreferences.artWeight > 70) matchReason = 'Matches your Art interest';
      else if (isTech && feedPreferences.techWeight > 70) matchReason = 'Matches your Tech interest';
      else if (isLife && feedPreferences.lifeWeight > 70) matchReason = 'Matches your Lifestyle interest';

      return { ...post, score, matchReason: matchReason || post.matchReason };
    });

    scoredPosts.sort((a, b) => b.score - a.score);

    return scoredPosts;
  }, [posts, currentMood, feedPreferences, hiddenPostIds, profileVisits, searchQuery, blockedUsers]);

  const updateFeedPreferences = (prefs: Partial<FeedPreferences>) => {
    setFeedPreferences(prev => ({ ...prev, ...prefs }));
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const login = (email: string) => {
    setIsAuthenticated(true);
  };

  const signup = (name: string, email: string) => {
    const newUser = {
      ...CURRENT_USER,
      name: name,
      handle: `@${name.toLowerCase().replace(/\s/g, '')}`,
    };
    setCurrentUser(newUser);
    setAllPersonas(newUser.personas || []);
    setIsAuthenticated(true);
  };

  const loginWithPhone = (phoneNumber: string) => {
    const last4 = phoneNumber.slice(-4);
    const newUser = {
      ...CURRENT_USER,
      id: `u-phone-${Date.now()}`,
      name: `Mobile User ${last4}`,
      handle: `@user${last4}`,
      avatar: `https://picsum.photos/seed/${phoneNumber}/150/150`,
      personas: [] 
    };
    if (!newUser.personas || newUser.personas.length === 0) {
      newUser.personas = [{
        id: newUser.id,
        name: newUser.name,
        handle: newUser.handle,
        avatar: newUser.avatar,
        bio: newUser.bio || '',
        type: 'PERSONAL'
      }];
    }
    setCurrentUser(newUser);
    setAllPersonas(newUser.personas);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const navigateToProfile = (user: User) => {
    setViewingUser(user);
    setCurrentView(ViewState.PROFILE);
  };

  const navigateToCommunity = (group: Group) => {
    setViewingCommunity(group);
    setCurrentView(ViewState.COMMUNITY_DETAIL);
  };

  const navigateToGeoCircle = (circle: GeoCircle) => {
    setViewingGeoCircle(circle);
    setCurrentView(ViewState.GEO_CIRCLE_DETAIL);
  };

  const navigateToPost = (postId: string) => {
    setSearchQuery('');
    setCurrentMood('ALL');
    setViewingPostId(postId);
    setCurrentView(ViewState.HOME);
  };

  const startChat = (user: User) => {
    setActiveConversationUser(user);
    setCurrentView(ViewState.MESSAGES);
  };

  const blockUser = (userId: string) => {
    setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return Array.from(newSet);
    });
  };

  const unblockUser = (userId: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userId));
  };

  const toggleMuteUser = (userId: string) => {
    setMutedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const clearChat = (userId: string) => {
    setChatHistory(prev => {
      const newState = { ...prev };
      newState[userId] = [];
      return newState;
    });
  };

  const sendMessage = (userId: string, text: string) => {
     const newMessage = { 
       id: Date.now(), 
       sender: 'me', 
       text, 
       time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
     };
     setChatHistory(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), newMessage]
     }));
  };

  const switchPersona = (personaId: string) => {
    const selected = allPersonas.find(p => p.id === personaId);
    if (selected) {
      setCurrentUser(prev => ({
        ...prev,
        id: selected.id,
        name: selected.name,
        handle: selected.handle,
        avatar: selected.avatar,
        bio: selected.bio,
        personaType: selected.type
      }));
    }
  };

  const addNewPersona = (name: string, handle: string, bio: string, type: PersonaType, avatar: string) => {
    const newPersona: Persona = {
      id: `u-persona-${Date.now()}`,
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      bio,
      type,
      avatar
    };
    
    const updatedPersonas = [...allPersonas, newPersona];
    setAllPersonas(updatedPersonas);
    
    setCurrentUser(prev => ({
      ...prev,
      personas: updatedPersonas, 
      id: newPersona.id,
      name: newPersona.name,
      handle: newPersona.handle,
      avatar: newPersona.avatar,
      bio: newPersona.bio,
      personaType: newPersona.type
    }));
  };

  const createAICompanion = (data: Omit<AICompanion, 'id'>) => {
    setAiCompanion({
      ...data,
      id: `ai-${Date.now()}`
    });
  };

  const updateAICompanion = (data: Partial<AICompanion>) => {
    if (aiCompanion) {
      setAiCompanion({ ...aiCompanion, ...data });
    }
  };

  const triggerAIPost = async () => {
    if (!aiCompanion) return;
    
    try {
      const content = await generateAIPersonaPost(
        aiCompanion.personality, 
        aiCompanion.tone, 
        aiCompanion.interests
      );

      if (!content) return;

      const tempId = `ai-post-${Date.now()}`;
      const newPost: Post = {
        id: tempId,
        author: currentUser,
        content,
        likes: 0,
        comments: [],
        timestamp: 'Just now',
        isLiked: false,
        mood: 'NEUTRAL',
        isAIGenerated: true,
        aiAuthorName: aiCompanion.name
      };
      
      setPosts(prev => [newPost, ...prev]);

      analyzePostMood(content).then(mood => {
         setPosts(prev => prev.map(p => p.id === tempId ? { ...p, mood } : p));
      });
    } catch (e) {
      console.error("Error triggering AI post:", e);
      throw e;
    }
  };

  const getFeedSummary = async (): Promise<string> => {
    return generateDailyBriefing(posts);
  };

  const recordProfileVisit = (userId: string) => {
    if (userId === currentUser.id) return;

    setProfileVisits(prev => {
      const newMap = new Map<string, number>(prev);
      const count = newMap.get(userId) || 0;
      newMap.set(userId, count + 1);
      return newMap;
    });
  };

  const verifyCredential = async (type: string, value: string): Promise<boolean> => {
    const verification = await verifyIdentityAttribute(type, value);
    
    if (verification.valid) {
      const newCred: IdentityCredential = {
        id: `cred-${Date.now()}`,
        type: type as any,
        value: value,
        status: 'VERIFIED',
        verifiedAt: new Date().toLocaleDateString(),
        issuer: verification.issuer || 'Sphere Identity'
      };
      setIdentityCredentials(prev => [...prev, newCred]);
      return true;
    }
    return false;
  };

  const addIdentityDocument = async (type: IdentityDocument['type'], title: string, imageBase64: string) => {
     const analysis = await analyzeDocument(type, imageBase64);

     const newDoc: IdentityDocument = {
       id: `doc-${Date.now()}`,
       type,
       title,
       imageUrl: `data:image/jpeg;base64,${imageBase64}`,
       status: analysis.valid ? 'VERIFIED' : 'REJECTED',
       uploadDate: new Date().toLocaleDateString(),
       extractedData: analysis.extractedData,
       aiAnalysis: analysis.analysis
     };
     
     setIdentityDocuments(prev => [newDoc, ...prev]);
  };

  const addFunds = (amount: number) => {
  };

  const tipUser = (userId: string, amount: number): boolean => {
    return true;
  };

  const unlockPost = (postId: string): boolean => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.price) return false;
    
    if (tipUser(post.author.id, post.price)) {
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, isUnlocked: true } : p
      ));
      return true;
    }
    return false;
  };

  const createPost = async (content: string, image?: string, video?: string, audio?: string, transcription?: string, stealthConfig?: StealthConfig, poll?: Poll, game?: PostGame, groupId?: string) => {
    const tempId = Date.now().toString();
    const newPost: Post = {
      id: tempId,
      author: currentUser,
      content,
      image,
      video,
      audio,
      transcription,
      stealthConfig,
      poll,
      game,
      groupId,
      likes: 0,
      comments: [],
      timestamp: 'Just now',
      isLiked: false,
      mood: 'NEUTRAL'
    };
    
    setPosts(prev => [newPost, ...prev]);

    try {
      if (content) {
        const detectedMood = await analyzePostMood(content);
        setPosts(prev => prev.map(p => {
          if (p.id === tempId) {
            return { ...p, mood: detectedMood };
          }
          return p;
        }));
      }
    } catch (e) {
      console.error("Failed to analyze post mood", e);
    }
  };

  const likePost = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const votePoll = (postId: string, optionId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.poll) {
        const poll = post.poll;
        const hasVoted = poll.options.some(opt => opt.isVoted);
        if (hasVoted) return post;

        return {
          ...post,
          poll: {
            ...poll,
            totalVotes: (poll.totalVotes || 0) + 1,
            options: poll.options.map(opt => 
              opt.id === optionId 
                ? { ...opt, votes: (opt.votes || 0) + 1, isVoted: true } 
                : opt
            )
          }
        };
      }
      return post;
    }));
  };

  const hidePost = (postId: string) => {
    setHiddenPostIds(prev => new Set(prev).add(postId));
  };

  const addComment = (postId: string, text: string) => {
    let author = currentUser;
    let content = text;

    if (text.includes(": ")) {
        const parts = text.split(": ");
        if (parts.length > 1) {
             content = parts.slice(1).join(": ");
             author = {
                 ...currentUser,
                 id: `sim-${Date.now()}-${Math.random()}`,
                 name: parts[0],
                 handle: `@${parts[0].replace(/\s/g, '').toLowerCase()}`,
                 avatar: `https://picsum.photos/seed/${parts[0]}/150/150`,
                 followers: 0,
                 following: 0
             };
        }
    }

    const newComment: Comment = {
      id: Date.now().toString() + Math.random(),
      author: author,
      content: content,
      timestamp: 'Just now',
      likes: 0
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment]
        };
      }
      return post;
    }));
  };

  const markNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const followUser = (userId: string) => {
    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === userId) {
        return { ...user, isFollowing: !user.isFollowing };
      }
      return user;
    }));
    
    if (viewingUser && viewingUser.id === userId) {
      setViewingUser(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null);
    }
  };

  const toggleGroupJoin = (groupId: string) => {
    setGroups(groups.map(group => {
      if (group.id === groupId) {
        return { 
          ...group, 
          isJoined: !group.isJoined,
          members: group.isJoined ? group.members - 1 : group.members + 1
        };
      }
      return group;
    }));
    // Update viewing community if it's the same one
    if (viewingCommunity && viewingCommunity.id === groupId) {
       setViewingCommunity(prev => prev ? {
          ...prev, 
          isJoined: !prev.isJoined,
          members: prev.isJoined ? prev.members - 1 : prev.members + 1
       } : null);
    }
  };

  const createGroup = (name: string, description: string, category: string, image?: string) => {
    const newGroup: Group = {
      id: `g-${Date.now()}`,
      name,
      description,
      image: image || `https://picsum.photos/seed/${name}/300/200`,
      members: 1,
      isJoined: true,
      category
    };
    setGroups(prev => [newGroup, ...prev]);
  };

  const addProduct = (title: string, price: number, currency: string, description: string, category: string, image?: string, video?: string) => {
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      seller: currentUser,
      title,
      price,
      currency,
      description,
      image,
      video,
      category,
      timestamp: 'Just now'
    };
    setProducts([newProduct, ...products]);
  };

  const toggleGeoCircleJoin = (circleId: string) => {
    setGeoCircles(prev => prev.map(gc => {
      if (gc.id === circleId) {
        return {
          ...gc,
          isJoined: !gc.isJoined,
          memberCount: gc.isJoined ? gc.memberCount - 1 : gc.memberCount + 1
        };
      }
      return gc;
    }));
    // Update viewing GeoCircle if active
    if (viewingGeoCircle && viewingGeoCircle.id === circleId) {
       setViewingGeoCircle(prev => prev ? {
          ...prev,
          isJoined: !prev.isJoined,
          memberCount: prev.isJoined ? prev.memberCount - 1 : prev.memberCount + 1
       } : null);
    }
  };

  const setVaultPin = (pin: string) => {
    setVaultPinState(pin);
    setIsVaultUnlocked(true);
  };

  const unlockVault = (pin: string) => {
    if (!vaultPin) return false;
    if (pin === vaultPin) { 
      setIsVaultUnlocked(true);
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  const addStory = (mediaUrl: string, type: 'image' | 'video') => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      user: currentUser,
      mediaUrl,
      type,
      isViewed: false
    };
    setStories(prev => [newStory, ...prev]);
  };

  return (
    <AppContext.Provider value={{
      isAuthenticated,
      currentUser,
      login,
      signup,
      loginWithPhone,
      logout,
      currentView,
      setCurrentView,
      viewingUser,
      navigateToProfile,
      viewingCommunity,
      navigateToCommunity,
      viewingGeoCircle,
      navigateToGeoCircle,
      viewingPostId,
      setViewingPostId,
      navigateToPost,
      activeConversationUser,
      setActiveConversationUser,
      startChat,
      blockedUsers,
      blockUser,
      unblockUser,
      mutedUsers,
      toggleMuteUser,
      chatHistory,
      clearChat,
      sendMessage,
      theme,
      toggleTheme,
      posts, 
      filteredPosts, 
      users,
      notifications,
      markNotificationsRead,
      stories,
      addStory,
      groups,
      products,
      searchQuery,
      setSearchQuery,
      arExperiences,
      virtualEvents,
      geoCircles,
      toggleGeoCircleJoin,
      memories,
      memoryClusters,
      vaultItems,
      isVaultUnlocked,
      hasSetPin: !!vaultPin,
      setVaultPin,
      unlockVault,
      lockVault,
      profileVisits,
      recordProfileVisit,
      currentMood,
      setMood: setCurrentMood,
      feedPreferences,
      updateFeedPreferences,
      aiCompanion,
      createAICompanion,
      updateAICompanion,
      triggerAIPost,
      getFeedSummary,
      createPost,
      likePost,
      hidePost,
      votePoll,
      addComment,
      followUser,
      toggleGroupJoin,
      createGroup,
      addProduct,
      allPersonas,
      switchPersona,
      addNewPersona,
      addFunds,
      tipUser,
      unlockPost,
      identityCredentials,
      identityDocuments,
      verifyCredential,
      addIdentityDocument,
      isContactSyncOpen,
      setContactSyncOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
