/**
 * WebRTC Configuration with free Google STUN servers
 */
export const RTC_CONFIGURATION = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
  iceCandidatePoolSize: 10,
};

/**
 * Media Stream constraints for private calls
 */
export const MEDIA_CONSTRAINTS = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 },
    frameRate: { min: 15, ideal: 30, max: 30 },
    facingMode: 'user',
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
};

/**
 * Safe runtime loader for react-native-webrtc
 * This enables the app to run in Expo Dev Client / bare builds
 * while offering graceful fallback preview if tested inside Expo Go.
 */
let WebRTCModule: any = null;

try {
  WebRTCModule = require('react-native-webrtc');
} catch (error) {
  console.warn(
    '[SoulSync WebRTC] Native react-native-webrtc module not found in current environment (e.g. running in Expo Go). Simulated WebRTC mode active. For full hardware video/audio, run `npx expo run:android` or `npx expo run:ios`.'
  );
}

export const getWebRTC = () => WebRTCModule;
export const isNativeWebRTCAvailable = () => WebRTCModule !== null;

