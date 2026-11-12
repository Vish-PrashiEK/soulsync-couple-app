import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { COUPLE_PARTNERS } from '../../config/constants';
import { PartnerId } from '../../types';
import { typography, layout } from '../../theme/typography';

const PIN_LENGTH = 4;

export const PasscodeScreen: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, selectedPartnerId, setSelectedPartnerId } = useAuth();
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [shakeAnim] = useState(new Animated.Value(0));

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      Vibration.vibrate(100);
    }
  };

  const handleKeyPress = async (num: string) => {
    if (pin.length >= PIN_LENGTH) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const nextPin = pin + num;
    setPin(nextPin);
    setErrorMsg('');

    if (nextPin.length === PIN_LENGTH) {
      const success = await login(nextPin, selectedPartnerId);
      if (!success) {
        triggerShake();
        setErrorMsg('Passcode incorrect. Hint: Try 2024');
        setTimeout(() => setPin(''), 500);
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setPin((prev) => prev.slice(0, -1));
      setErrorMsg('');
    }
  };

  const activePartner = COUPLE_PARTNERS[selectedPartnerId];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar with theme toggle */}
      <View style={styles.topRow}>
        <View style={styles.brandingBadge}>
          <Text style={[styles.brandingHeart]}>🔒</Text>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            EXCLUSIVE 2-USER VAULT
          </Text>
        </View>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeBtn, { backgroundColor: colors.surface }]}
        >
          <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Partner Profile Selector */}
      <View style={styles.partnerSelector}>
        <Text style={[typography.subtext, { color: colors.textSecondary, marginBottom: 12 }]}>
          Who is unlocking today?
        </Text>
        <View style={[styles.togglePillContainer, { backgroundColor: colors.surface }]}>
          {(['partner1', 'partner2'] as PartnerId[]).map((pid) => {
            const p = COUPLE_PARTNERS[pid];
            const isSelected = selectedPartnerId === pid;
            return (
              <TouchableOpacity
                key={pid}
                onPress={() => {
                  setSelectedPartnerId(pid);
                  setPin('');
                  setErrorMsg('');
                }}
                style={[
                  styles.partnerPill,
                  isSelected && {
                    backgroundColor: colors.card,
                    ...layout.shadow.soft,
                  },
                ]}
              >
                <Image source={{ uri: p.avatar }} style={styles.pillAvatar} />
                <Text
                  style={[
                    typography.bodyBold,
                    { color: isSelected ? colors.primary : colors.textMuted },
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Hero Welcome */}
      <View style={styles.heroSection}>
        <View style={[styles.avatarCircle, { borderColor: colors.primary }]}>
          <Image source={{ uri: activePartner.avatar }} style={styles.largeAvatar} />
          <View style={[styles.heartBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
          </View>
        </View>
        <Text style={[typography.h2, { color: colors.text, marginTop: 14 }]}>
          Welcome, {activePartner.name}
        </Text>
        <Text style={[typography.subtext, { color: colors.textSecondary, marginTop: 4 }]}>
          Enter our secret couple passcode
        </Text>
      </View>

      {/* Animated PIN Dots */}
      <Animated.View style={[styles.dotsContainer, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length: PIN_LENGTH }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  borderColor: colors.primary,
                  backgroundColor: isFilled ? colors.primary : colors.surface,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {errorMsg ? (
        <Text style={[typography.caption, { color: colors.danger, textAlign: 'center', marginTop: 10 }]}>
          {errorMsg}
        </Text>
      ) : (
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 10 }]}>
          Hint: Default code is 2024
        </Text>
      )}

      {/* Number Pad */}
      <View style={styles.keypadContainer}>
        {[
          ['1', '2', '3'],
          ['4', '5', '6'],
          ['7', '8', '9'],
          ['bio', '0', 'del'],
        ].map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((item) => {
              if (item === 'bio') {
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.keypadBtn, { backgroundColor: colors.surface }]}
                    onPress={() => handleKeyPress('2024'.charAt(pin.length))}
                  >
                    <Ionicons name="finger-print" size={26} color={colors.primary} />
                  </TouchableOpacity>
                );
              }
              if (item === 'del') {
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.keypadBtn, { backgroundColor: colors.surface }]}
                    onPress={handleDelete}
                  >
                    <Ionicons name="backspace-outline" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={item}
                  style={[styles.keypadBtn, { backgroundColor: colors.card }]}
                  onPress={() => handleKeyPress(item)}
                >
                  <Text style={[typography.h2, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: layout.spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: layout.spacing.xl,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: layout.spacing.sm,
  },
  brandingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#EFEBFF',
  },
  brandingHeart: {
    fontSize: 12,
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerSelector: {
    alignItems: 'center',
    marginTop: 8,
  },
  togglePillContainer: {
    flexDirection: 'row',
    borderRadius: layout.borderRadius.xl,
    padding: 4,
    width: '100%',
    maxWidth: 280,
  },
  partnerPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: layout.borderRadius.lg,
    gap: 8,
  },
  pillAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  heroSection: {
    alignItems: 'center',
  },
  avatarCircle: {
    position: 'relative',
    borderWidth: 2,
    borderRadius: 50,
    padding: 3,
  },
  largeAvatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginVertical: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...layout.shadow.soft,
  },
});

