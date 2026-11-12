import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { getWebRTC } from '../../config/webrtcConfig';
import { typography, layout } from '../../theme/typography';

export const CallScreen: React.FC = () => {
  const { colors } = useTheme();
  const { partner } = useAuth();
  const {
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
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    toggleSpeaker,
    isNativeRTC,
  } = useWebRTC();

  // Pulsing animation for calling & voice call
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (callStatus === 'calling' || (callStatus === 'connected' && callType === 'voice')) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [callStatus, callType, pulseAnim]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const webrtcModule = getWebRTC();
  const RTCView = webrtcModule?.RTCView;

  // 1. Idle State: Couple Call Dashboard
  if (callStatus === 'idle') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.idleHeader}>
          <Text style={[typography.h2, { color: colors.text }]}>Private Call Hub</Text>
          <Text style={[typography.subtext, { color: colors.textSecondary, marginTop: 4 }]}>
            Secure WebRTC P2P direct voice & video
          </Text>
        </View>

        <View style={[styles.partnerCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.cardAvatarWrapper}>
            <Image source={{ uri: partner.avatar }} style={styles.cardAvatar} />
            <View style={[styles.onlineBadge, { backgroundColor: colors.online }]} />
          </View>

          <Text style={[typography.h2, { color: colors.text, marginTop: 14 }]}>
            {partner.name}
          </Text>
          <Text style={[typography.body, { color: colors.primary, marginTop: 2 }]}>
            {partner.nickname}
          </Text>
          <Text style={[typography.subtext, { color: colors.textMuted, marginTop: 6 }]}>
            {partner.statusMessage}
          </Text>

          {/* Call launcher buttons */}
          <View style={styles.launcherButtonsRow}>
            <TouchableOpacity
              onPress={() => startCall('voice')}
              style={[styles.launcherBtn, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: colors.accentLavender }]}>
                <Ionicons name="call" size={24} color={colors.primary} />
              </View>
              <Text style={[typography.bodyBold, { color: colors.text, marginTop: 8 }]}>
                Voice Call
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Encrypted Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => startCall('video')}
              style={[styles.launcherBtn, { backgroundColor: colors.primaryLight }]}
              activeOpacity={0.8}
            >
              <View style={[styles.btnIconCircle, { backgroundColor: colors.primary }]}>
                <Ionicons name="videocam" size={24} color="#FFFFFF" />
              </View>
              <Text style={[typography.bodyBold, { color: colors.text, marginTop: 8 }]}>
                Video Call
              </Text>
              <Text style={[typography.caption, { color: colors.primary }]}>HD WebRTC</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security & STUN information badge */}
        <View style={[styles.stunCard, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>
              Zero-Cloud Peer-to-Peer Privacy
            </Text>
            <Text style={[typography.subtext, { color: colors.textSecondary, fontSize: 11 }]}>
              STUN: stun.l.google.com:19302 (P2P Mesh)
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // 2. Active or Outgoing Call View
  return (
    <View style={[styles.activeCallContainer, { backgroundColor: colors.callBackground }]}>
      <StatusBar barStyle="light-content" />

      {/* Main Video or Audio Backdrop */}
      {callType === 'video' && callStatus === 'connected' ? (
        <View style={StyleSheet.absoluteFill}>
          {isNativeRTC && RTCView && remoteStream ? (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={StyleSheet.absoluteFill}
              objectFit="cover"
            />
          ) : (
            // Simulated HD partner video stream preview
            <View style={StyleSheet.absoluteFill}>
              <Image source={{ uri: partner.avatar }} style={StyleSheet.absoluteFill} blurRadius={1} />
              <View style={[styles.videoOverlay, { backgroundColor: 'rgba(17, 13, 29, 0.45)' }]} />
            </View>
          )}

          {/* Local Floating PiP (Picture in Picture) Video */}
          <View style={[styles.pipContainer, { borderColor: colors.primary }]}>
            {isNativeRTC && RTCView && localStream && !isVideoOff ? (
              <RTCView
                streamURL={localStream.toURL()}
                style={StyleSheet.absoluteFill}
                objectFit="cover"
                zOrder={1}
              />
            ) : (
              <View style={[styles.pipFallback, { backgroundColor: colors.surface }]}>
                <Ionicons
                  name={isVideoOff ? 'videocam-off' : 'person'}
                  size={24}
                  color={colors.primary}
                />
              </View>
            )}
          </View>
        </View>
      ) : (
        // Voice Call or Outgoing Ringing Screen
        <View style={styles.voiceCallCenter}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Image source={{ uri: partner.avatar }} style={styles.voiceAvatar} />
          <Text style={[typography.h1, { color: '#FFFFFF', marginTop: 24 }]}>
            {partner.name}
          </Text>
          <Text style={[typography.body, { color: colors.accent, marginTop: 4 }]}>
            {callStatus === 'calling' ? 'Calling with love...' : 'Private Voice Call'}
          </Text>

          {callStatus === 'connected' && (
            <View style={styles.durationPill}>
              <Text style={styles.durationText}>{formatDuration(durationSeconds)}</Text>
            </View>
          )}
        </View>
      )}

      {/* Top Floating Status Pill for Video Call */}
      {callType === 'video' && callStatus === 'connected' && (
        <SafeAreaView style={styles.topStatusSafeArea} edges={['top']}>
          <View style={styles.topStatusPill}>
            <View style={[styles.smallDot, { backgroundColor: colors.online }]} />
            <Text style={styles.topStatusText}>{partner.name}</Text>
            <Text style={styles.topTimerText}>• {formatDuration(durationSeconds)}</Text>
          </View>
        </SafeAreaView>
      )}

      {/* Bottom Floating Control Bar */}
      <SafeAreaView style={styles.bottomControlSafeArea} edges={['bottom']}>
        <View style={styles.controlsRow}>
          {/* Mute Mic */}
          <TouchableOpacity
            onPress={toggleMute}
            style={[
              styles.controlBtn,
              { backgroundColor: isMuted ? colors.danger : 'rgba(255,255,255,0.2)' },
            ]}
          >
            <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Toggle Video (if video call) */}
          {callType === 'video' && (
            <>
              <TouchableOpacity
                onPress={toggleVideo}
                style={[
                  styles.controlBtn,
                  { backgroundColor: isVideoOff ? colors.danger : 'rgba(255,255,255,0.2)' },
                ]}
              >
                <Ionicons
                  name={isVideoOff ? 'videocam-off' : 'videocam'}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={switchCamera}
                style={[styles.controlBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
              >
                <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}

          {/* Toggle Speaker */}
          <TouchableOpacity
            onPress={toggleSpeaker}
            style={[
              styles.controlBtn,
              { backgroundColor: isSpeakerOn ? colors.primary : 'rgba(255,255,255,0.2)' },
            ]}
          >
            <Ionicons
              name={isSpeakerOn ? 'volume-high' : 'volume-mute'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Hang Up Button */}
          <TouchableOpacity
            onPress={endCall}
            style={[styles.controlBtnHangup, { backgroundColor: colors.danger }]}
            activeOpacity={0.8}
          >
            <Ionicons name="call" size={28} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.spacing.lg,
    justifyContent: 'space-between',
    paddingVertical: layout.spacing.lg,
  },
  idleHeader: {
    marginTop: layout.spacing.sm,
  },
  partnerCard: {
    borderRadius: layout.borderRadius.xl,
    padding: layout.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...layout.shadow.soft,
  },
  cardAvatarWrapper: {
    position: 'relative',
  },
  cardAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  launcherButtonsRow: {
    flexDirection: 'row',
    marginTop: layout.spacing.xl,
    gap: 16,
    width: '100%',
  },
  launcherBtn: {
    flex: 1,
    borderRadius: layout.borderRadius.lg,
    padding: layout.spacing.md,
    alignItems: 'center',
  },
  btnIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stunCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.md,
    gap: 12,
  },
  activeCallContainer: {
    flex: 1,
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  pipContainer: {
    position: 'absolute',
    top: 54,
    right: 18,
    width: 110,
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    backgroundColor: '#000000',
    elevation: 8,
  },
  pipFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceCallCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    opacity: 0.5,
  },
  voiceAvatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  durationPill: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  durationText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 1,
  },
  topStatusSafeArea: {
    position: 'absolute',
    top: 0,
    left: 20,
  },
  topStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  smallDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topStatusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  topTimerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  bottomControlSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: layout.spacing.lg,
    gap: 18,
  },
  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnHangup: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

