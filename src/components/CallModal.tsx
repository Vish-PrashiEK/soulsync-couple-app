import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { typography, layout } from '../theme/typography';

interface CallModalProps {
  onAccept: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({ onAccept }) => {
  const { incomingCall, clearIncomingCall, sendWebRTCSignal } = useSocket();
  const { partner, currentUser } = useAuth();
  const { colors } = useTheme();

  if (!incomingCall) return null;

  const handleDecline = () => {
    sendWebRTCSignal({
      type: 'call-ended',
      from: currentUser.id,
      to: partner.id,
    });
    clearIncomingCall();
  };

  const isVideo = incomingCall.callType === 'video';

  return (
    <Modal visible={!!incomingCall} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
              INCOMING {isVideo ? 'VIDEO' : 'VOICE'} CALL
            </Text>
          </View>

          <Image source={{ uri: partner.avatar }} style={styles.avatar} />

          <Text style={[typography.h2, { color: colors.text, marginTop: 12 }]}>
            {partner.name}
          </Text>
          <Text style={[typography.subtext, { color: colors.textSecondary, marginTop: 4 }]}>
            {partner.nickname} is calling you...
          </Text>

          <View style={styles.actionsRow}>
            {/* Decline */}
            <TouchableOpacity
              onPress={handleDecline}
              style={[styles.actionBtn, { backgroundColor: colors.danger }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={26}
                color="#FFFFFF"
                style={{ transform: [{ rotate: '135deg' }] }}
              />
            </TouchableOpacity>

            {/* Accept */}
            <TouchableOpacity
              onPress={onAccept}
              style={[styles.actionBtn, { backgroundColor: colors.online }]}
              activeOpacity={0.8}
            >
              <Ionicons name={isVideo ? 'videocam' : 'call'} size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: layout.borderRadius.xl,
    padding: layout.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...layout.shadow.intense,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 28,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

