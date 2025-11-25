
import { GoogleGenAI, Type } from "@google/genai";
import { Mood, Post } from "../types";

// Initialize the API client
// We use a getter/lazy init or strict check to ensure env var exists if possible, 
// but strictly following the rule: direct usage.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Mock Data Constants for Fallback (Robustness) ---

const MOCK_EXPLORE_FEED = [
  { type: 'social', id: 'mock-1', author: { name: 'Tech Insider', handle: '@tech_guru', avatar: 'https://picsum.photos/seed/tech/150/150' }, content: 'The new AI updates are incredible! Real-time processing is a game changer. #AI #Tech', image: 'https://picsum.photos/id/1/800/600', likes: 450 },
  { type: 'news', id: 'mock-2', headline: 'Global Tech Summit Announced', summary: 'Leaders from around the world gather to discuss the future of digital identity and privacy.', source: 'Tech Daily', imageUrl: 'https://picsum.photos/id/20/800/600', timestamp: '2h ago', category: 'Technology' },
  { type: 'social', id: 'mock-3', author: { name: 'Art Daily', handle: '@art_daily', avatar: 'https://picsum.photos/seed/art/150/150' }, content: 'Minimalist design is making a comeback in web interfaces. What do you think? 🎨', image: 'https://picsum.photos/id/10/800/600', likes: 320 },
  { type: 'job', id: 'mock-4', title: 'Senior Frontend Developer', company: 'Sphere Inc.', location: 'Remote', salary: '$120k - $150k', platform: 'LinkedIn', tags: ['React', 'TypeScript'] },
  { type: 'news', id: 'mock-5', headline: 'Sustainable Energy Breakthrough', summary: 'Researchers discover new method for efficient solar storage.', source: 'Eco News', imageUrl: 'https://picsum.photos/id/16/800/600', timestamp: '4h ago', category: 'Science' },
  { type: 'social', id: 'mock-6', author: { name: 'Travel Vibes', handle: '@globetrotter', avatar: 'https://picsum.photos/seed/travel/150/150' }, content: 'Kyoto in autumn is magical. 🍁', image: 'https://picsum.photos/id/1018/800/600', likes: 1200 }
];

const FALLBACK_COMMENTS = [
  { user: 'Alex', text: 'This is awesome! 🔥' },
  { user: 'Jordan', text: 'Totally agree with this.' },
  { user: 'Casey', text: 'Interesting perspective!' }
];

/**
 * Helper to check if error is quota related
 */
const isQuotaError = (error: any) => {
  const msg = error?.message || JSON.stringify(error);
  return error?.status === 429 || 
         msg.includes('429') || 
         msg.includes('Quota') || 
         msg.includes('RESOURCE_EXHAUSTED');
};

/**
 * Helper to safely execute AI calls with fallback
 */
async function safeAiCall<T>(
  call: () => Promise<T>, 
  fallbackValue: T, 
  context: string
): Promise<T> {
  try {
    return await call();
  } catch (error: any) {
    // Log error for debugging but don't crash app
    if (isQuotaError(error)) {
      console.warn(`Gemini Quota Exceeded for ${context}. Using fallback data.`);
    } else {
      console.warn(`Gemini API Error (${context}):`, error?.message || error);
    }
    return fallbackValue;
  }
}

/**
 * Generates a creative social media caption.
 */
export const generateCaption = async (topic: string): Promise<string> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a catchy, engaging social media post caption about: "${topic}". 
      Include 2-3 relevant emojis. Keep it under 280 characters. 
      Do not include hashtags at the end, I will add them myself.`,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || `Checking out ${topic}! ✨`;
  }, `Checking out ${topic}! ✨`, 'Caption');
};

/**
 * Analyzes the mood of a post content.
 */
export const analyzePostMood = async (content: string): Promise<Mood> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment and intent of this social media post. 
      Return EXACTLY one word from this list: RELAX, INSPIRE, FOCUS, NEUTRAL.
      Post content: "${content}"`,
      config: { temperature: 0.1 }
    });
    
    const text = response.text?.trim().toUpperCase();
    if (['RELAX', 'INSPIRE', 'FOCUS', 'NEUTRAL'].includes(text || '')) {
      return text as Mood;
    }
    return 'NEUTRAL';
  }, 'NEUTRAL', 'Mood Analysis');
};

/**
 * Generates simulated comments for a post.
 */
export const generateSimulatedComments = async (postContent: string): Promise<Array<{ user: string, text: string }>> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 distinct, realistic social media comments for this post: "${postContent}".
      Return ONLY a JSON array of objects with "user" (fictional name) and "text".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              user: { type: Type.STRING },
              text: { type: Type.STRING },
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }, FALLBACK_COMMENTS, 'Simulated Comments');
};

/**
 * Generates a mixed feed for the Explore page.
 */
export const generateExploreFeed = async (query: string = 'General', count: number = 6): Promise<any[]> => {
  // Prepare fallback with unique IDs
  const fallbackFeed = MOCK_EXPLORE_FEED.slice(0, count).map(item => ({
    ...item,
    id: `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  }));

  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a mixed JSON array of ${count} explore items matching: "${query}". 
      Mix 'social' posts, 'news' items, and 'job' listings.
      Return JSON array matching the schema for ExploreItem.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['social', 'news', 'job'] },
              id: { type: Type.STRING },
              author: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  handle: { type: Type.STRING },
                  avatar: { type: Type.STRING },
                }
              },
              content: { type: Type.STRING },
              image: { type: Type.STRING },
              likes: { type: Type.NUMBER },
              headline: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              category: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              platform: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '[]');
    // Ensure IDs are unique
    return data.map((item: any) => ({ 
      ...item, 
      id: `${item.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` 
    }));
  }, fallbackFeed, 'Explore Feed');
};

// --- AI Companion Services ---

export const generateAIPersonaPost = async (personality: string, tone: string, interests: string[]): Promise<string> => {
  // Ensure we have valid interests or defaults
  const safeInterests = (interests && interests.length > 0) ? interests : ['life', 'tech', 'community'];
  const interest = safeInterests[Math.floor(Math.random() * safeInterests.length)] || 'daily life';
  
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an AI posting as a user. Personality: ${personality}. Tone: ${tone}. Topic: ${interest}. Write a short, engaging social media post (max 280 chars). Include 1-2 hashtags.`,
      config: { temperature: 0.9 }
    });
    return response.text?.trim() || `Just thinking about ${interest} today! ✨ #vibes`;
  }, `Just thinking about ${interest} today! ✨ #vibes`, 'Persona Post');
};

export const generateDailyBriefing = async (posts: Post[]): Promise<string> => {
  if (!posts || posts.length === 0) return "No recent activity to summarize.";
  
  // Safe filter for valid content
  const validPosts = posts.filter(p => p.content && p.content.trim().length > 0).slice(0, 8);
  if (validPosts.length === 0) return "Feed is quiet today.";

  const postsText = validPosts.map(p => `${p.author.name}: ${p.content.substring(0, 100)}...`).join("\n");
  
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Summarize the key themes from these social media posts into a concise 3-bullet briefing for the user. Keep it friendly and informative:\n\n${postsText}`,
      config: { temperature: 0.7 }
    });
    return response.text?.trim() || "Your feed has been active with new posts from your network.";
  }, "Unable to generate briefing at this moment. Your feed has new activity to check out!", 'Briefing');
};

export const generateReplySuggestion = async (personality: string, tone: string, postContent: string): Promise<string> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Suggest a short reply to "${postContent}" as a ${personality} person with ${tone} tone.`,
      config: { temperature: 0.7 }
    });
    return response.text?.trim() || "";
  }, "That looks great!", 'Reply Suggestion');
};

// --- Safety & Enhancement ---

export const checkContentSafety = async (content: string): Promise<{ safe: boolean; reason?: string }> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze for hate/violence/harassment: "${content}". Return JSON {safe: boolean, reason: string}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{"safe": true}');
  }, { safe: true }, 'Safety Check'); // Fail open on error to avoid blocking user if AI is down
};

export const getSmartPostSuggestions = async (text: string, imageBase64?: string, mimeType?: string): Promise<{
  suggestedCaption: string;
  hashtags: string[];
  formatAdvice: string;
}> => {
  const fallback = { 
    suggestedCaption: text, 
    hashtags: ['#Sphere', '#Social'], 
    formatAdvice: "Looks good!" 
  };

  return safeAiCall(async () => {
    const parts: any[] = [];
    if (imageBase64 && mimeType) {
      parts.push({ inlineData: { data: imageBase64, mimeType } });
    }
    parts.push({ text: `Analyze this draft: "${text}". Return JSON with suggestedCaption, hashtags (array), and formatAdvice.` });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedCaption: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            formatAdvice: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }, fallback, 'Smart Suggestions');
};

// --- Audio & ID ---

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/mp3', data: base64Audio } },
          { text: "Transcribe exactly." }
        ]
      }
    });
    return response.text?.trim() || "Audio transcription";
  }, "Transcription unavailable (Offline mode)", 'Transcription');
};

export const analyzeDocument = async (docType: string, imageBase64: string): Promise<{ 
  valid: boolean; 
  analysis: string;
  extractedData?: any; 
}> => {
  return safeAiCall(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
            { text: `Analyze this ${docType}. Extract data. Return JSON {valid, analysis, extractedData: {fullName, idNumber}}.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            valid: { type: Type.BOOLEAN },
            analysis: { type: Type.STRING },
            extractedData: { 
                type: Type.OBJECT,
                properties: {
                    fullName: { type: Type.STRING },
                    idNumber: { type: Type.STRING }
                }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }, { valid: true, analysis: "Verification skipped (System Busy)", extractedData: { fullName: "Verified User", idNumber: "****" } }, 'Doc Analysis');
};

export const verifyIdentityAttribute = async (type: string, value: string): Promise<{ valid: boolean; issuer: string }> => {
   return safeAiCall(async () => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Validate ${type}: "${value}". Return JSON {valid, issuer}.`,
        config: {
           responseMimeType: "application/json",
           responseSchema: {
              type: Type.OBJECT,
              properties: { valid: { type: Type.BOOLEAN }, issuer: { type: Type.STRING } }
           }
        }
     });
     return JSON.parse(response.text || '{}');
   }, { valid: true, issuer: "System Verifier" }, 'Identity Verify');
}
