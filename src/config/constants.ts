import { PartnerProfile } from '../types';

export const COUPLE_PARTNERS: Record<'partner1' | 'partner2', PartnerProfile> = {
  partner1: {
    id: 'partner1',
    name: 'Aria',
    nickname: 'Sunflower 🌻',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    avatarPlaceholderColor: '#C084FC',
    statusMessage: 'Thinking about you 💕',
    isOnline: true,
  },
  partner2: {
    id: 'partner2',
    name: 'Leo',
    nickname: 'My Star ✨',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    avatarPlaceholderColor: '#8A4FFF',
    statusMessage: 'Forever yours 💫',
    isOnline: true,
  },
};

export const RELATIONSHIP_START_DATE = '2024-01-01'; // YYYY-MM-DD
export const DEFAULT_COUPLE_PASSCODE = '2024';

// Production backend server URL (Hosted on Render)
export const DEFAULT_SOCKET_URL = 'https://soulsync-server-tawo.onrender.com';

export const STORAGE_KEYS = {
  PASSCODE: '@soulsync_passcode',
  CURRENT_USER: '@soulsync_current_user',
  THEME_MODE: '@soulsync_theme_mode',
  MEMORIES: '@soulsync_memories',
  TIMELINE: '@soulsync_timeline',
  CHAT_HISTORY: '@soulsync_chat_history',
};

