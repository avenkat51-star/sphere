
export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
  coverImage?: string;
  location?: string;
  website?: string;
  isFollowing?: boolean;
  personas?: Persona[]; // List of available personas
  personaType?: PersonaType; // Type of the current user instance
  reputationScore?: number; // New: Positive reputation score
  badges?: Badge[]; // New: Earned badges
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  color: string; // Tailwind color class
  category: 'COMMUNITY' | 'CREATIVITY' | 'POSITIVITY' | 'IDENTITY';
  dateEarned: string;
  isVerified?: boolean; // For identity wallet
  issuer?: string;
}

export type PersonaType = 'PERSONAL' | 'PROFESSIONAL' | 'CREATOR';

export interface Persona {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  type: PersonaType;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
}

export type Mood = 'ALL' | 'RELAX' | 'INSPIRE' | 'FOCUS' | 'NEUTRAL';

export type StealthType = 'VISITS' | 'TIME';

export interface StealthConfig {
  type: StealthType;
  visitThreshold?: number; // Number of profile visits required
  startHour?: number; // 0-23
  endHour?: number; // 0-23
}

// --- Interactive Content Types ---

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  isVoted?: boolean; // If current user voted for this
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt?: string;
}

export interface PostGame {
  type: 'CLICKER' | 'TRIVIA' | 'MEMORY';
  title: string;
  description?: string;
  highScore?: number; // Current user's high score
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  video?: string;
  audio?: string; // URL to audio blob
  transcription?: string; // Text transcription of the audio
  poll?: Poll; // New: Interactive Poll
  game?: PostGame; // New: Embedded Mini-Game
  likes: number;
  comments: Comment[];
  timestamp: string;
  isLiked: boolean; // Local state for the current user
  mood?: Mood;
  isAIGenerated?: boolean; // New: Flag if posted by AI
  aiAuthorName?: string;   // New: Name of the AI agent
  matchReason?: string; // For algorithm explanation
  stealthConfig?: StealthConfig; // New: Stealth posting configuration
  price?: number; // New: Monetization price
  currency?: string; // New: Monetization currency
  isPaid?: boolean; // New: If the post is behind a paywall
  isUnlocked?: boolean; // New: If the current user has unlocked it
  groupId?: string; // New: ID of the group this post belongs to
}

export interface FeedPreferences {
  artWeight: number;    // 0-100
  techWeight: number;   // 0-100
  lifeWeight: number;   // 0-100
  politicsWeight: number; // 0-100 (negative weight effectively)
}

export interface Story {
  id: string;
  user: User;
  mediaUrl: string;
  type: 'image' | 'video';
  isViewed: boolean;
}

export interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION';
  actor: User;
  post?: Post; // Optional, for likes/comments
  timestamp: string;
  isRead: boolean;
}

export interface NewsItem {
  id: string;
  type: 'news';
  headline: string;
  summary: string;
  source: string;
  imageUrl: string;
  timestamp: string;
  category: string;
}

export interface JobItem {
  id: string;
  type: 'job';
  title: string;
  company: string;
  location: string;
  salary: string;
  platform: string; // e.g., "LinkedIn", "Indeed"
  tags: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  image: string;
  members: number;
  isJoined: boolean;
  category: string;
}

export interface Product {
  id: string;
  seller: User;
  title: string;
  price: number;
  currency: string;
  description: string;
  image?: string;
  video?: string;
  category: string;
  timestamp: string;
}

export interface AICompanion {
  id: string;
  name: string;
  avatar: string;
  personality: string; // e.g., "Witty", "Professional", "Empathetic"
  tone: 'Casual' | 'Formal' | 'Humorous' | 'Inspirational';
  interests: string[];
  permissions: {
    canPost: boolean;
    canComment: boolean;
    canSummarize: boolean;
  };
}

// Mixed Reality Types
export interface ARExperience {
  id: string;
  type: 'GEO_FILTER' | 'MURAL' | 'SCULPTURE' | 'HANGOUT' | 'GAME';
  title: string;
  description: string;
  locationLabel: string; // e.g., "Central Park"
  thumbnail: string;
  arAssetOverlay: string; // Image URL to overlay in AR view
  distance: string;
  participants?: number; // For hangouts
  gameType?: 'COLLECTOR' | 'TARGET'; // For AR Games
}

export interface VirtualEvent {
  id: string;
  host: User;
  title: string;
  description: string;
  startTime: string;
  attendees: number;
  type: 'CONCERT' | 'MEETUP' | 'WORKSHOP';
  coverImage: string;
  isLive: boolean;
  arEffect?: string; // Specific effect to load
}

// Voice Room Types
export interface VoiceRoom {
  id: string;
  title: string;
  host: User;
  listeners: number;
  speakers: VoiceRoomParticipant[];
  tags: string[];
  isLive: boolean;
  isPaid?: boolean; // New: Monetized room
  pricePerMinute?: number; // New: Rate
  currency?: string;
}

export interface VoiceRoomParticipant {
  user: User;
  isSpeaking: boolean;
  role: 'HOST' | 'SPEAKER' | 'LISTENER';
}

// Geo-Circles Types
export interface GeoCircle {
  id: string;
  name: string;
  description: string;
  type: 'EVENT' | 'EMERGENCY' | 'COMMUNITY' | 'POPUP';
  coordinates: { lat: number; lng: number };
  radius: number; // meters
  memberCount: number;
  activeNow: number;
  distance: string; // formatted string
  expiresAt?: string; // For events/emergencies
  image?: string;
  isJoined: boolean;
}

// Memory Lane Types
export interface Memory {
  id: string;
  title: string;
  date: string;
  mediaUrl: string;
  type: 'PHOTO' | 'VIDEO' | 'POST';
  description: string;
  tags: string[];
  mood: Mood;
  location?: string;
  people?: string[]; // Names of people in the memory
}

export interface MemoryCluster {
  id: string;
  name: string;
  type: 'PERSON' | 'PLACE' | 'EMOTION' | 'YEAR';
  coverImage: string;
  count: number;
}

export interface VaultItem {
  id: string;
  title: string;
  content: string; // URL or text
  date: string;
  type: 'NOTE' | 'PHOTO' | 'VIDEO';
}

// Identity Wallet Types
export interface IdentityCredential {
  id: string;
  type: 'EMAIL' | 'PHONE' | 'GOVT_ID' | 'PORTFOLIO';
  value: string; // Masked value
  status: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  verifiedAt?: string;
  issuer: string;
}

export interface IdentityDocument {
  id: string;
  type: 'PASSPORT' | 'DRIVER_LICENSE' | 'NATIONAL_ID';
  title: string;
  imageUrl: string;
  status: 'VERIFIED' | 'PROCESSING' | 'REJECTED';
  uploadDate: string;
  expiryDate?: string;
  extractedData?: {
    fullName: string;
    dob: string;
    idNumber: string;
  };
  aiAnalysis?: string; // Gemini verification note
}

export type ExploreItem = (Post & { type: 'social' }) | NewsItem | JobItem;

export enum ViewState {
  HOME = 'HOME',
  PROFILE = 'PROFILE',
  EXPLORE = 'EXPLORE',
  COMMUNITIES = 'COMMUNITIES',
  COMMUNITY_DETAIL = 'COMMUNITY_DETAIL',
  MARKETPLACE = 'MARKETPLACE',
  NOTIFICATIONS = 'NOTIFICATIONS',
  MESSAGES = 'MESSAGES',
  SETTINGS = 'SETTINGS',
  AI_COMPANION = 'AI_COMPANION',
  MIXED_REALITY = 'MIXED_REALITY',
  VOICE_ROOMS = 'VOICE_ROOMS',
  GEO_CIRCLES = 'GEO_CIRCLES',
  GEO_CIRCLE_DETAIL = 'GEO_CIRCLE_DETAIL', // New View
  MEMORY_LANE = 'MEMORY_LANE',
  IDENTITY_WALLET = 'IDENTITY_WALLET' 
}
