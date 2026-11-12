import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  RTC_CONFIGURATION,
  MEDIA_CONSTRAINTS,
  getWebRTC,
  isNativeWebRTCAvailable,
} from '../config/webrtcConfig';
import { CallType, CallStatus, WebRTCSignalData, PartnerId } from '../types';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export interface UseWebRTCReturn {
  callStatus: CallStatus;
  callType: CallType;
  localStream: any;
  remoteStream: any;
  isMuted: boolean;
  isVideoOff: boolean;
  isSpeakerOn: boolean;
  isFrontCamera: boolean;
  durationSeconds: number;
  startCall: (type: CallType) => Promise<void>;
  answerCall: () => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  switchCamera: () => void;
  toggleSpeaker: () => void;
  isNativeRTC: boolean;
}

export const useWebRTC = (): UseWebRTCReturn => {
  const { currentUser, partner } = useAuth();
  const { socket, sendWebRTCSignal, incomingCall, clearIncomingCall } = useSocket();

  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isVideoOff, setIsVideoOff] = useState<boolean>(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState<boolean>(true);
  const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  const [durationSeconds, setDurationSeconds] = useState<number>(0);

  const pcRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isNative = isNativeWebRTCAvailable();

  // Call timer effect
  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDurationSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  // Clean up streams & peer connection
  const cleanup = useCallback(() => {
    if (localStream) {
      localStream.getTracks?.().forEach((track: any) => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close?.();
      pcRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
    setIsMuted(false);
    setIsVideoOff(false);
    clearIncomingCall();
  }, [localStream, clearIncomingCall]);

  // Initialize WebRTC PeerConnection with STUN servers
  const initPeerConnection = useCallback(() => {
    if (!isNative) return null;

    const webrtc = getWebRTC();
    const pc = new webrtc.RTCPeerConnection(RTC_CONFIGURATION);

    // ICE Candidate handler
    pc.onicecandidate = (event: any) => {
      if (event.candidate) {
        sendWebRTCSignal({
          type: 'candidate',
          from: currentUser.id,
          to: partner.id,
          candidate: event.candidate,
        });
      }
    };

    // Remote stream track handler
    pc.ontrack = (event: any) => {
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
      } else if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed'
      ) {
        cleanup();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [isNative, currentUser.id, partner.id, sendWebRTCSignal, cleanup]);

  // Acquire local media stream
  const acquireMedia = async (type: CallType) => {
    if (!isNative) {
      // Mock stream preview object for Expo Go / simulator testing
      return {
        toURL: () => 'mock-local-stream',
        getTracks: () => [
          { enabled: true, stop: () => {}, kind: 'audio' },
          { enabled: true, stop: () => {}, kind: 'video' },
        ],
        getAudioTracks: () => [{ enabled: true, stop: () => {} }],
        getVideoTracks: () => [{ enabled: true, stop: () => {} }],
      };
    }

    const webrtc = getWebRTC();
    const constraints = {
      audio: MEDIA_CONSTRAINTS.audio,
      video: type === 'video' ? MEDIA_CONSTRAINTS.video : false,
    };

    const stream = await webrtc.mediaDevices.getUserMedia(constraints);
    setLocalStream(stream);
    return stream;
  };

  // Start outgoing call
  const startCall = async (type: CallType) => {
    setCallType(type);
    setCallStatus('calling');

    const stream = await acquireMedia(type);

    if (isNative) {
      const pc = initPeerConnection();
      if (pc && stream) {
        stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: type === 'video',
        });
        await pc.setLocalDescription(offer);

        sendWebRTCSignal({
          type: 'offer',
          from: currentUser.id,
          to: partner.id,
          callType: type,
          sdp: offer,
        });
      }
    } else {
      // Send signal to partner
      sendWebRTCSignal({
        type: 'call-request',
        from: currentUser.id,
        to: partner.id,
        callType: type,
      });

      // Simulation timeout: auto-connect after 3s if testing locally without server
      setTimeout(() => {
        setCallStatus('connected');
      }, 3000);
    }
  };

  // Answer incoming call
  const answerCall = async () => {
    const type = incomingCall?.callType || 'video';
    setCallType(type);
    setCallStatus('connected');

    const stream = await acquireMedia(type);

    if (isNative && incomingCall?.sdp) {
      const pc = initPeerConnection();
      if (pc && stream) {
        stream.getTracks().forEach((track: any) => pc.addTrack(track, stream));

        const webrtc = getWebRTC();
        await pc.setRemoteDescription(new webrtc.RTCSessionDescription(incomingCall.sdp));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendWebRTCSignal({
          type: 'answer',
          from: currentUser.id,
          to: partner.id,
          sdp: answer,
        });
      }
    }
    clearIncomingCall();
  };

  // End active call
  const endCall = () => {
    sendWebRTCSignal({
      type: 'call-ended',
      from: currentUser.id,
      to: partner.id,
    });
    cleanup();
  };

  // Toggle Mute
  const toggleMute = () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks?.() || [];
      audioTracks.forEach((track: any) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted((prev) => !prev);
  };

  // Toggle Video
  const toggleVideo = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks?.() || [];
      videoTracks.forEach((track: any) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff((prev) => !prev);
  };

  // Switch front / back camera
  const switchCamera = () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks?.() || [];
      videoTracks.forEach((track: any) => {
        if (typeof track._switchCamera === 'function') {
          track._switchCamera();
        }
      });
    }
    setIsFrontCamera((prev) => !prev);
  };

  // Toggle Speaker
  const toggleSpeaker = () => {
    setIsSpeakerOn((prev) => !prev);
  };

  // Listen to incoming WebRTC signals
  useEffect(() => {
    if (!socket) return;

    const handleSignal = async (signal: WebRTCSignalData) => {
      if (signal.to !== currentUser.id) return;

      if (signal.type === 'answer' && pcRef.current && isNative) {
        const webrtc = getWebRTC();
        await pcRef.current.setRemoteDescription(
          new webrtc.RTCSessionDescription(signal.sdp)
        );
        setCallStatus('connected');
      } else if (signal.type === 'candidate' && pcRef.current && isNative) {
        const webrtc = getWebRTC();
        await pcRef.current.addIceCandidate(
          new webrtc.RTCIceCandidate(signal.candidate)
        );
      } else if (signal.type === 'call-ended') {
        cleanup();
      }
    };

    socket.on('webrtc:signal', handleSignal);
    return () => {
      socket.off('webrtc:signal', handleSignal);
    };
  }, [socket, currentUser.id, isNative, cleanup]);

  return {
    callStatus,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    isSpeakerOn,
    isFrontCamera,
    durationSeconds,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
    isNativeRTC: isNative,
  };
};

