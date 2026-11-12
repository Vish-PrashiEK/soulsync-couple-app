export type PartnerId = 'partner1' | 'partner2';

export interface PartnerProfile {
  id: PartnerId;
  name: string;
  nickname: string;
  avatar: string;
  avatarPlaceholderColor: string;
  statusMessage: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  senderId: PartnerId;
  text: string;
  timestamp: number;
  imageUrl?: string;
  isRead: boolean;
  heartsCount?: number;
}

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface CallSession {
  status: CallStatus;
  callType: CallType;
  isCaller: boolean;
  startTime?: number;
  durationSeconds: number;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isFrontCamera: boolean;
}

export interface MemoryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location?: string;
  category: 'Anniversary' | 'Date Night' | 'Travel' | 'Random Love' | 'Milestone';
  likes: number;
  authorId: PartnerId;
}

export interface TimelineNote {
  id: string;
  authorId: PartnerId;
  note: string;
  date: string;
  moodEmoji: string;
}

export interface WebRTCSignalData {
  type: 'offer' | 'answer' | 'candidate' | 'call-request' | 'call-response' | 'call-ended';
  from: PartnerId;
  to: PartnerId;
  callType?: CallType;
  sdp?: any;
  candidate?: any;
  accepted?: boolean;
}

