import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { typography, layout } from '../theme/typography';

interface HeaderProps {
  title?: string;
  showPartnerStatus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showPartnerStatus = true }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { partner } = useAuth();
  const { isPartnerOnline, isPartnerTyping, sendHeartPulse } = useSocket();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.cardBorder }]}>
      <View style={styles.leftRow}>
        {showPartnerStatus && (
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: partner.avatar }} style={styles.avatar} />
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isPartnerOnline ? colors.online : colors.offline },
              ]}
            />
          </View>
        )}
        <View style={styles.titleWrapper}>
          <Text style={[typography.h3, { color: colors.text }]}>
            {title || partner.nickname}
          </Text>
          {showPartnerStatus && (
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {isPartnerTyping ? 'Typing with love...' : isPartnerOnline ? 'Online with you' : 'Away'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightRow}>
        <TouchableOpacity
          onPress={sendHeartPulse}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={20} color={colors.accentRose} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.spacing.md,
    paddingTop: layout.spacing.sm,
    paddingBottom: layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: layout.spacing.sm + 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  titleWrapper: {
    justifyContent: 'center',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

