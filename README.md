# SoulSync — Private Couple App Boilerplate 💜

A private, secure, and exclusive mobile application boilerplate built with **React Native (Expo)** designed specifically for **two users**.

---

## 📱 Features

- **Exclusive 2-User Architecture**: Tailored for a couple (e.g. Partner 1 & Partner 2) with profile switching, relationship counter ("Day 428 together 💕"), and personalized themes.
- **Biometric / PIN Passcode Screen**: 4-digit numeric keypad with haptic feedback, error shake animations, and secure storage with `expo-secure-store`.
- **Real-Time Chat (`Socket.io`)**: Instant messaging, live typing status ("Leo is typing with love..."), photo attachments, heart reactions, and floating love pulse animations.
- **Voice & Video Calling (`WebRTC`)**: Direct peer-to-peer audio and video calls powered by `react-native-webrtc` with Google's free STUN servers (`stun:stun.l.google.com:19302`), floating Picture-in-Picture (PiP), mute mic, flip camera, and speaker controls.
- **Memories & Scrapbook**: Aesthetic Polaroid-style photo grid with categories ("Date Night", "Anniversary", "Travel"), date stamps, full-screen viewer, and Love Letters timeline notes.
- **Modern Soft Lavender & Purple Palette**: Clean minimalist aesthetic supporting both **Light Mode** and **Dark Mode** with instant theme toggle.

---

## 🛠️ Tech Stack

- **Framework**: React Native with Expo (SDK 52)
- **Navigation**: React Navigation 7 (Native Stack & Bottom Tabs)
- **Real-time Messaging**: Socket.io Client
- **P2P Audio/Video**: `react-native-webrtc` + `@config-plugins/react-native-webrtc`
- **STUN Infrastructure**: Google STUN (`stun:stun.l.google.com:19302`)
- **Storage & Security**: `expo-secure-store`
- **Media**: `expo-image-picker`
- **Haptics & Animation**: `expo-haptics`, React Native Animated API

---

## 📂 Project Structure

```
CLone App/
├── package.json                   # App dependencies & scripts
├── app.json                       # Expo configuration & WebRTC plugins
├── tsconfig.json                  # TypeScript configuration
├── babel.config.js                # Babel preset
├── App.tsx                        # App entry point with Context Providers
├── server/                        # Companion Node.js + Socket.io Server
│   ├── package.json
│   └── server.js                  # Signaling & real-time messaging server
└── src/
    ├── config/
    │   ├── constants.ts           # Couple profiles, anniversary date, passcode
    │   └── webrtcConfig.ts        # Google STUN servers & WebRTC safe loader
    ├── context/
    │   ├── AuthContext.tsx        # Passcode validation, active partner session
    │   ├── ThemeContext.tsx       # Soft lavender/purple Light & Dark modes
    │   └── SocketContext.tsx      # Socket.io connection, signaling events
    ├── theme/
    │   ├── colors.ts              # Lavender & purple palettes (light/dark)
    │   └── typography.ts          # Spacing, typography, and shadow presets
    ├── types/
    │   └── index.ts               # Complete TypeScript interfaces
    ├── hooks/
    │   └── useWebRTC.ts           # PeerConnection, stream management, tracks
    ├── components/
    │   ├── Header.tsx             # Partner status bar, theme switch, heart button
    │   ├── HeartAnimation.tsx     # Floating flying hearts reaction
    │   └── CallModal.tsx          # Incoming call popup alert
    ├── navigation/
    │   ├── AppNavigator.tsx       # Auth stack vs Bottom tabs
    │   └── TabNavigator.tsx       # Chat, Calls, and Memories tabs
    └── screens/
        ├── auth/
        │   └── PasscodeScreen.tsx # 4-digit PIN screen with partner selector
        ├── chat/
        │   └── ChatScreen.tsx     # Socket.io chat with photo attachments
        ├── call/
        │   └── CallScreen.tsx     # WebRTC voice/video call with PiP
        └── memories/
            └── MemoriesScreen.tsx # Polaroid scrapbook & love timeline
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

In the root directory:
```bash
npm install
```

In the `server` directory (for real-time messaging & WebRTC signaling):
```bash
cd server
npm install
cd ..
```

### 2. Start the Signaling & Chat Server

Run the backend server on port 3000:
```bash
npm run server
```

> **Tip for Physical Device Testing:**  
> Update `DEFAULT_SOCKET_URL` in `src/config/constants.ts` with your computer's local Wi-Fi IP address (e.g., `http://192.168.1.100:3000`) so both phones can reach the server.

### 3. Run the App

#### A. Web / Simulated Expo Go Preview
```bash
npm run start
```
*Note: WebRTC native hardware video requires a native build or Expo Dev Client. Inside Expo Go, the app automatically switches to interactive simulation mode so you can test all screens and workflows.*

#### B. Native Build (iOS / Android with full hardware WebRTC)
Because `react-native-webrtc` includes native audio and video codecs, run using Expo Prebuild or Dev Client:
```bash
# Android
npx expo run:android

# iOS (macOS required)
npx expo run:ios
```

---

## 🔑 Default Credentials

- **Default Couple Passcode**: `2024` (Configurable in `src/config/constants.ts`)
- **Partner 1**: Aria (Sunflower 🌻)
- **Partner 2**: Leo (My Star ✨)

