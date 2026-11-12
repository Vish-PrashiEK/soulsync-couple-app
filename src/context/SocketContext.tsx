import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatMessage, WebRTCSignalData } from '../types';
import { DEFAULT_SOCKET_URL } from '../config/constants';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isPartnerOnline: boolean;
  isPartnerTyping: boolean;
  messages: ChatMessage[];
  sendMessage: (text: string, imageUrl?: string) => void;
  sendTyping: (isTyping: boolean) => void;
  sendWebRTCSignal: (signal: WebRTCSignalData) => void;
  sendHeartPulse: () => void;
  incomingCall: WebRTCSignalData | null;
  clearIncomingCall: () => void;
  heartPulseEvent: number;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

// Initial sample messages for the couple
const INITIAL_COUPLE_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'partner2',
    text: 'Good morning my love! Hope your day starts beautifully 🌸',
    timestamp: Date.now() - 3600000 * 4,
    isRead: true,
  },
  {
    id: 'msg-2',
    senderId: 'partner1',
    text: 'Morning darling! Counting down the hours until our date tonight ✨',
    timestamp: Date.now() - 3600000 * 3,
    isRead: true,
    heartsCount: 2,
  },
  {
    id: 'msg-3',
    senderId: 'partner2',
    text: "Can't wait. Remember to call me on your lunch break! 💜",
    timestamp: Date.now() - 3600000 * 2,
    isRead: true,
  },
];

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, partner, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isPartnerOnline, setIsPartnerOnline] = useState<boolean>(true);
  const [isPartnerTyping, setIsPartnerTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_COUPLE_MESSAGES);
  const [incomingCall, setIncomingCall] = useState<WebRTCSignalData | null>(null);
  const [heartPulseEvent, setHeartPulseEvent] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Connect to Socket.io signaling & chat server
    const socket = io(DEFAULT_SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('couple:join', { userId: currentUser.id, partnerId: partner.id });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Partner status
    socket.on('couple:partner_status', (data: { userId: string; isOnline: boolean }) => {
      if (data.userId === partner.id) {
        setIsPartnerOnline(data.isOnline);
      }
    });

    // Chat message received
    socket.on('chat:message', (newMsg: ChatMessage) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    // Typing indicators
    socket.on('chat:typing', (data: { senderId: string; isTyping: boolean }) => {
      if (data.senderId === partner.id) {
        setIsPartnerTyping(data.isTyping);
      }
    });

    // Heart pulse
    socket.on('chat:heart_pulse', () => {
      setHeartPulseEvent(Date.now());
    });

    // WebRTC Signaling
    socket.on('webrtc:signal', (signalData: WebRTCSignalData) => {
      if (signalData.type === 'call-request') {
        setIncomingCall(signalData);
      } else if (signalData.type === 'call-ended') {
        setIncomingCall(null);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, currentUser?.id, partner?.id]);

  const sendMessage = (text: string, imageUrl?: string) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: currentUser.id,
      text,
      timestamp: Date.now(),
      imageUrl,
      isRead: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:message', newMsg);
    } else {
      // In offline / standalone test mode, simulate cute partner auto-reply after 2.5s!
      setTimeout(() => {
        const simulatedReply: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderId: partner.id,
          text: getRandomLoveReply(),
          timestamp: Date.now(),
          isRead: true,
        };
        setMessages((prev) => [...prev, simulatedReply]);
      }, 2500);
    }
  };

  const sendTyping = (isTyping: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:typing', {
        senderId: currentUser.id,
        to: partner.id,
        isTyping,
      });
    }
  };

  const sendWebRTCSignal = (signal: WebRTCSignalData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('webrtc:signal', signal);
    }
  };

  const sendHeartPulse = () => {
    setHeartPulseEvent(Date.now());
    if (socketRef.current?.connected) {
      socketRef.current.emit('chat:heart_pulse', { from: currentUser.id, to: partner.id });
    }
  };

  const clearIncomingCall = () => {
    setIncomingCall(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        isPartnerOnline,
        isPartnerTyping,
        messages,
        sendMessage,
        sendTyping,
        sendWebRTCSignal,
        sendHeartPulse,
        incomingCall,
        clearIncomingCall,
        heartPulseEvent,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

function getRandomLoveReply(): string {
  const replies = [
    'I love you to the moon and back! 🌙✨',
    'You always know how to make me smile 🥰',
    'Sending you the warmest hug right now 🫂💜',
    'Cannot wait to hold your hand again soon 💕',
    'You are my favorite person in the whole universe! 💫',
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

