

import { User, Post, Group, Product, ARExperience, VirtualEvent, GeoCircle, Memory, MemoryCluster, VaultItem, Badge, IdentityCredential, IdentityDocument, Story } from './types';

// --- Badges ---
export const BADGES: Badge[] = [
  {
    id: 'b1',
    name: 'Community Pillar',
    description: 'Consistently helpful and supportive in comments.',
    icon: 'Shield',
    color: 'text-blue-500',
    category: 'COMMUNITY',
    dateEarned: '2023-12-01',
    isVerified: true,
    issuer: 'SphereDAO'
  },
  {
    id: 'b2',
    name: 'Creative Visionary',
    description: 'Posts high-quality, original artistic content.',
    icon: 'Palette',
    color: 'text-purple-500',
    category: 'CREATIVITY',
    dateEarned: '2024-01-15',
    isVerified: true,
    issuer: 'SphereDAO'
  },
  {
    id: 'b3',
    name: 'Conversation Starter',
    description: 'Sparks engaging and respectful discussions.',
    icon: 'MessageCircle',
    color: 'text-green-500',
    category: 'POSITIVITY',
    dateEarned: '2024-02-10',
    isVerified: false
  },
  {
    id: 'b4',
    name: 'Empathy Star',
    description: 'Recognized for kind and understanding interactions.',
    icon: 'Heart',
    color: 'text-red-500',
    category: 'POSITIVITY',
    dateEarned: '2024-01-20',
    isVerified: false
  },
  {
    id: 'b5',
    name: 'Innovator',
    description: 'Shares cutting-edge tech and ideas.',
    icon: 'Zap',
    color: 'text-yellow-500',
    category: 'CREATIVITY',
    dateEarned: '2023-11-05',
    isVerified: true,
    issuer: 'SphereDAO'
  },
  {
    id: 'b6',
    name: 'Identity Verified',
    description: 'Government ID verification completed.',
    icon: 'Fingerprint',
    color: 'text-cyan-500',
    category: 'IDENTITY',
    dateEarned: '2023-10-10',
    isVerified: true,
    issuer: 'SphereID'
  }
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  handle: '@arivera',
  avatar: 'https://picsum.photos/id/64/150/150',
  bio: 'Digital Explorer | AI Enthusiast | Coffee Lover ☕',
  followers: 1240,
  following: 350,
  reputationScore: 850,
  badges: [BADGES[0], BADGES[2], BADGES[4], BADGES[5]],
  personaType: 'PERSONAL',
  personas: [
    {
      id: 'u1',
      name: 'Alex Rivera',
      handle: '@arivera',
      avatar: 'https://picsum.photos/id/64/150/150',
      bio: 'Digital Explorer | AI Enthusiast | Coffee Lover ☕',
      type: 'PERSONAL'
    },
    {
      id: 'u1-pro',
      name: 'Alex Rivera | Dev',
      handle: '@arivera_tech',
      avatar: 'https://picsum.photos/id/60/150/150',
      bio: 'Senior Frontend Engineer | React & AI Specialist',
      type: 'PROFESSIONAL'
    },
    {
      id: 'u1-art',
      name: 'Alex Captures',
      handle: '@alex_shots',
      avatar: 'https://picsum.photos/id/91/150/150',
      bio: 'Chasing light and shadows. Street photography.',
      type: 'CREATOR'
    }
  ]
};

export const MOCK_USERS: User[] = [
  {
    id: 'u2',
    name: 'Sarah Chen',
    handle: '@sarahc',
    avatar: 'https://picsum.photos/id/65/150/150',
    followers: 8900,
    following: 120,
    reputationScore: 1200,
    badges: [BADGES[1], BADGES[3]]
  },
  {
    id: 'u3',
    name: 'Marcus Johnson',
    handle: '@mjohnson',
    avatar: 'https://picsum.photos/id/91/150/150',
    followers: 3400,
    following: 400,
    reputationScore: 650,
    badges: [BADGES[2]]
  },
  {
    id: 'u4',
    name: 'Elena Rodriguez',
    handle: '@elena_r',
    avatar: 'https://picsum.photos/id/129/150/150',
    followers: 5600,
    following: 890,
    reputationScore: 920,
    badges: [BADGES[0], BADGES[1], BADGES[4]]
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author: MOCK_USERS[0], // Linked to mock user with badges
    content: 'Just finished a marathon coding session! 🚀 The new features are looking amazing. Can’t wait to share more.',
    likes: 124,
    comments: [
      {
        id: 'c1',
        author: MOCK_USERS[1],
        content: 'Crushing it! 🔥',
        timestamp: '2h ago',
        likes: 5,
      }
    ],
    timestamp: '2h ago',
    isLiked: false,
    image: 'https://picsum.photos/id/1/800/600',
    mood: 'FOCUS'
  },
  // Poll Post Example
  {
    id: 'p-poll-1',
    author: MOCK_USERS[1],
    content: 'Trying to decide on the framework for my next big project. What are you all using?',
    likes: 45,
    comments: [],
    timestamp: '3h ago',
    isLiked: false,
    mood: 'FOCUS',
    poll: {
      id: 'poll-1',
      question: 'Best Frontend Framework 2024?',
      totalVotes: 1250,
      options: [
        { id: 'opt1', text: 'React / Next.js', votes: 850 },
        { id: 'opt2', text: 'Vue / Nuxt', votes: 200 },
        { id: 'opt3', text: 'Svelte', votes: 150 },
        { id: 'opt4', text: 'Angular', votes: 50 }
      ]
    }
  },
  // Game Post Example
  {
    id: 'p-game-1',
    author: MOCK_USERS[2],
    content: 'Bet you can\'t beat my reflex score! ⚡ Tap the targets as fast as you can.',
    likes: 312,
    comments: [],
    timestamp: '4h ago',
    isLiked: true,
    mood: 'RELAX',
    game: {
      type: 'CLICKER',
      title: 'Hyper Reflex',
      description: 'Tap the blue dots before they disappear!',
      highScore: 0
    }
  },
  {
    id: 'p2',
    author: MOCK_USERS[1],
    content: 'Sunset vibes in the city today. Sometimes you just need to pause and look up.',
    likes: 856,
    comments: [],
    timestamp: '5h ago',
    isLiked: true,
    image: 'https://picsum.photos/id/10/800/600',
    mood: 'RELAX'
  },
  {
    id: 'p3',
    author: MOCK_USERS[2],
    content: 'Who else is excited for the upcoming tech conference? I’ll be speaking about the future of generative AI!',
    likes: 2300,
    comments: [],
    timestamp: '1d ago',
    isLiked: false,
    mood: 'INSPIRE'
  },
  // Stealth Post Example
  {
    id: 'p4-stealth',
    author: MOCK_USERS[0],
    content: '👀 You unlocked this secret post by visiting my profile 3 times! Here is a sneak peek of my next project.',
    image: 'https://picsum.photos/id/201/800/600',
    likes: 42,
    comments: [],
    timestamp: 'Hidden',
    isLiked: false,
    mood: 'INSPIRE',
    stealthConfig: {
      type: 'VISITS',
      visitThreshold: 3
    }
  },
  // Premium Post Example
  {
    id: 'p5-paid',
    author: MOCK_USERS[2],
    content: 'Exclusive tutorial: How to build a React app with Gemini API in 10 minutes. 🔒 Pay to unlock full video.',
    timestamp: '3h ago',
    likes: 56,
    comments: [],
    isLiked: false,
    mood: 'FOCUS',
    isPaid: true,
    price: 50,
    currency: 'SPC',
    isUnlocked: false
  }
];

export const TRENDING_TOPICS = [
  { tag: '#GenerativeAI', posts: '240K' },
  { tag: '#WebDev', posts: '180K' },
  { tag: '#Photography', posts: '1.2M' },
  { tag: '#MorningCoffee', posts: '50K' },
  { tag: '#SphereSocial', posts: '12K' },
];

export const INITIAL_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Tech Innovators',
    description: 'A community for developers, designers, and tech enthusiasts pushing boundaries.',
    image: 'https://picsum.photos/id/0/300/200',
    members: 12500,
    isJoined: true,
    category: 'Technology'
  },
  {
    id: 'g2',
    name: 'Digital Art Gallery',
    description: 'Share your art, get feedback, and connect with other creatives.',
    image: 'https://picsum.photos/id/104/300/200',
    members: 8300,
    isJoined: false,
    category: 'Art'
  },
  {
    id: 'g3',
    name: 'Globe Trotters',
    description: 'Travel tips, photography, and stories from around the world.',
    image: 'https://picsum.photos/id/1036/300/200',
    members: 45000,
    isJoined: false,
    category: 'Travel'
  },
  {
    id: 'g4',
    name: 'Minimalist Living',
    description: 'Declutter your life and find focus.',
    image: 'https://picsum.photos/id/1060/300/200',
    members: 3200,
    isJoined: false,
    category: 'Lifestyle'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    seller: MOCK_USERS[1],
    title: 'Vintage Film Camera',
    price: 120,
    currency: 'USD',
    description: 'Fully functional 35mm film camera. Great condition, comes with lens.',
    image: 'https://picsum.photos/id/250/400/300',
    category: 'Electronics',
    timestamp: '2h ago'
  },
  {
    id: 'prod2',
    seller: MOCK_USERS[2],
    title: 'Handmade Ceramic Pot',
    price: 45,
    currency: 'EUR',
    description: 'Unique blue glazed ceramic pot for indoor plants.',
    image: 'https://picsum.photos/id/112/400/300',
    category: 'Home & Garden',
    timestamp: '5h ago'
  },
  {
    id: 'prod3',
    seller: MOCK_USERS[0],
    title: 'Wireless Noise Cancelling Headphones',
    price: 180,
    currency: 'USD',
    description: 'Barely used, original box included. Amazing sound quality.',
    image: 'https://picsum.photos/id/6/400/300',
    category: 'Electronics',
    timestamp: '1d ago'
  },
  {
    id: 'prod4',
    seller: MOCK_USERS[1],
    title: 'Mechanical Keyboard',
    price: 80,
    currency: 'GBP',
    description: 'RGB backlit, blue switches. Perfect for typing.',
    image: 'https://picsum.photos/id/96/400/300',
    category: 'Electronics',
    timestamp: '3d ago'
  }
];

export const INITIAL_AR_EXPERIENCES: ARExperience[] = [
  {
    id: 'ar-game-1',
    type: 'GAME',
    title: 'Coin Collector Challenge',
    description: 'Collect as many floating coins as you can in 30 seconds!',
    locationLabel: 'Local Play',
    thumbnail: 'https://picsum.photos/id/106/300/300',
    arAssetOverlay: '',
    distance: 'On site',
    gameType: 'COLLECTOR'
  },
  {
    id: 'ar1',
    type: 'MURAL',
    title: 'Neon Cyberpunk Mural',
    description: 'A glowing digital graffiti piece by local artist Neo.',
    locationLabel: 'Downtown Plaza',
    thumbnail: 'https://picsum.photos/id/237/300/300',
    arAssetOverlay: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    distance: '0.2 mi'
  },
  {
    id: 'ar2',
    type: 'SCULPTURE',
    title: 'Floating Geometric',
    description: 'Abstract shapes floating in mid-air.',
    locationLabel: 'City Park',
    thumbnail: 'https://picsum.photos/id/238/300/300',
    arAssetOverlay: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    distance: '0.5 mi'
  },
  {
    id: 'ar3',
    type: 'HANGOUT',
    title: 'Chill Lounge AR',
    description: 'A shared social space with lo-fi beats.',
    locationLabel: 'Virtual Space',
    thumbnail: 'https://picsum.photos/id/239/300/300',
    arAssetOverlay: 'https://images.unsplash.com/photo-1554188248-986adbb73be0?q=80&w=1000&auto=format&fit=crop',
    distance: 'Global',
    participants: 12
  }
];

export const INITIAL_VIRTUAL_EVENTS: VirtualEvent[] = [
  {
    id: 'ev1',
    host: MOCK_USERS[0],
    title: 'Sunset Rooftop Concert',
    description: 'Live DJ set streamed directly to your living room in AR.',
    startTime: 'Live Now',
    attendees: 1250,
    type: 'CONCERT',
    coverImage: 'https://picsum.photos/id/453/400/250',
    isLive: true,
    arEffect: 'fireworks'
  },
  {
    id: 'ev2',
    host: MOCK_USERS[2],
    title: 'AI Art Workshop',
    description: 'Learn to prompt like a pro. Meet in the virtual studio.',
    startTime: 'Starts in 2h',
    attendees: 340,
    type: 'WORKSHOP',
    coverImage: 'https://picsum.photos/id/1025/400/250',
    isLive: false
  }
];

export const INITIAL_GEO_CIRCLES: GeoCircle[] = [
  {
    id: 'gc1',
    name: 'Downtown Jazz Fest',
    description: 'Live updates, meetups, and photos from the main stage area.',
    type: 'EVENT',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    radius: 500,
    memberCount: 342,
    activeNow: 128,
    distance: '0.1 mi',
    expiresAt: 'Ends in 4h',
    image: 'https://picsum.photos/id/452/300/200',
    isJoined: false
  },
  {
    id: 'gc2',
    name: 'Westside Traffic Alert',
    description: 'Emergency road closure updates and alternate routes discussion.',
    type: 'EMERGENCY',
    coordinates: { lat: 40.7300, lng: -74.0000 },
    radius: 2000,
    memberCount: 1540,
    activeNow: 890,
    distance: '1.2 mi',
    expiresAt: 'Active Incident',
    isJoined: true
  },
  {
    id: 'gc3',
    name: 'Digital Nomads Cafe',
    description: 'Who is working at The Bean right now? Wi-Fi codes and networking.',
    type: 'COMMUNITY',
    coordinates: { lat: 40.7200, lng: -73.9900 },
    radius: 100,
    memberCount: 56,
    activeNow: 14,
    distance: '0.3 mi',
    image: 'https://picsum.photos/id/435/300/200',
    isJoined: false
  },
  {
    id: 'gc4',
    name: 'Sunset Yoga Popup',
    description: 'Impromptu session in the park. Bring your own mat!',
    type: 'POPUP',
    coordinates: { lat: 40.7150, lng: -74.0100 },
    radius: 200,
    memberCount: 28,
    activeNow: 22,
    distance: '0.5 mi',
    expiresAt: 'Starts in 20m',
    image: 'https://picsum.photos/id/352/300/200',
    isJoined: false
  }
];

// --- Memory Lane Mock Data ---

export const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'm1',
    title: 'Trip to Kyoto',
    date: '2023-11-12',
    mediaUrl: 'https://picsum.photos/id/1018/800/600',
    type: 'PHOTO',
    description: 'The autumn colors were absolutely breathtaking near the temple.',
    tags: ['Travel', 'Japan', 'Autumn'],
    mood: 'RELAX',
    location: 'Kyoto, Japan',
    people: ['Sarah', 'Mike']
  },
  {
    id: 'm2',
    title: 'Graduation Day',
    date: '2023-05-20',
    mediaUrl: 'https://picsum.photos/id/142/800/600',
    type: 'PHOTO',
    description: 'We finally did it! Four years of hard work paid off.',
    tags: ['Milestone', 'Friends'],
    mood: 'INSPIRE',
    location: 'University Campus',
    people: ['Class of 2023']
  },
  {
    id: 'm3',
    title: 'Hackathon Win',
    date: '2024-01-15',
    mediaUrl: 'https://picsum.photos/id/60/800/600',
    type: 'POST',
    description: 'First place at the Global AI Hackathon! The sleepless nights were worth it.',
    tags: ['Tech', 'Coding', 'Win'],
    mood: 'FOCUS',
    people: ['Team Alpha']
  },
  {
    id: 'm4',
    title: 'Beach Bonfire',
    date: '2023-07-04',
    mediaUrl: 'https://picsum.photos/id/305/800/600',
    type: 'VIDEO',
    description: 'Summer nights like this are unforgettable.',
    tags: ['Summer', 'Fun'],
    mood: 'RELAX',
    location: 'Venice Beach'
  }
];

export const INITIAL_CLUSTERS: MemoryCluster[] = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    type: 'PERSON',
    coverImage: 'https://picsum.photos/id/65/300/300',
    count: 142
  },
  {
    id: 'c2',
    name: 'Tokyo Trip',
    type: 'PLACE',
    coverImage: 'https://picsum.photos/id/1019/300/300',
    count: 56
  },
  {
    id: 'c3',
    name: '2023 Rewind',
    type: 'YEAR',
    coverImage: 'https://picsum.photos/id/1015/300/300',
    count: 365
  },
  {
    id: 'c4',
    name: 'Happy Moments',
    type: 'EMOTION',
    coverImage: 'https://picsum.photos/id/301/300/300',
    count: 89
  }
];

export const INITIAL_VAULT_ITEMS: VaultItem[] = [
  {
    id: 'v1',
    title: 'Personal Journal - Jan 2024',
    content: 'Today was a tough day, but I learned a lot about resilience...',
    date: '2024-01-10',
    type: 'NOTE'
  },
  {
    id: 'v2',
    title: 'Family Receipt',
    content: 'https://picsum.photos/id/500/800/600',
    date: '2023-12-25',
    type: 'PHOTO'
  }
];

// --- Identity Wallet Mock Data ---

export const INITIAL_CREDENTIALS: IdentityCredential[] = [
  {
    id: 'cred1',
    type: 'EMAIL',
    value: 'alex***@gmail.com',
    status: 'VERIFIED',
    verifiedAt: '2023-01-15',
    issuer: 'Google Auth'
  },
  {
    id: 'cred2',
    type: 'PHONE',
    value: '+1 (555) ***-9012',
    status: 'VERIFIED',
    verifiedAt: '2023-02-20',
    issuer: 'Sphere Mobile Verification'
  },
  {
    id: 'cred3',
    type: 'GOVT_ID',
    value: 'Passport ****5678',
    status: 'VERIFIED',
    issuer: 'Clear Identity Services'
  }
];

export const INITIAL_DOCUMENTS: IdentityDocument[] = [
  {
    id: 'doc1',
    type: 'PASSPORT',
    title: 'US Passport',
    imageUrl: 'https://picsum.photos/id/88/400/300', // Mock document image
    status: 'VERIFIED',
    uploadDate: '2023-11-10',
    expiryDate: '2030-05-15',
    extractedData: {
      fullName: 'Alex Rivera',
      dob: '1995-08-12',
      idNumber: 'A12345678'
    }
  },
  {
    id: 'doc2',
    type: 'DRIVER_LICENSE',
    title: 'CA Driver License',
    imageUrl: 'https://picsum.photos/id/20/400/250',
    status: 'PROCESSING',
    uploadDate: '2024-03-01'
  }
];
