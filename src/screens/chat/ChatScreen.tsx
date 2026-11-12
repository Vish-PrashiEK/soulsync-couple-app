import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Header } from '../../components/Header';
import { HeartAnimation } from '../../components/HeartAnimation';
import { ChatMessage } from '../../types';
import { typography, layout } from '../../theme/typography';

export const ChatScreen: React.FC = () => {
  const { colors } = useTheme();
  const { currentUser, partner } = useAuth();
  const {
    messages,
    sendMessage,
    sendTyping,
    isPartnerTyping,
    heartPulseEvent,
    sendHeartPulse,
  } = useSocket();

  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  }, [messages.length]);

  const handleTextChange = (text: string) => {
    setInputText(text);

    // Typing throttle
    sendTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Photo permission is required to send memory snapshots!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !selectedImage) return;

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    sendMessage(inputText.trim(), selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
    sendTyping(false);
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUser.id;

    const formatTime = (ts: number) => {
      const date = new Date(ts);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowRight : styles.messageRowLeft,
        ]}
      >
        {!isMe && (
          <Image source={{ uri: partner.avatar }} style={styles.bubbleAvatar} />
        )}

        <View
          style={[
            styles.bubbleContainer,
            isMe
              ? [styles.bubbleMe, { backgroundColor: colors.bubbleMe }]
              : [
                  styles.bubblePartner,
                  {
                    backgroundColor: colors.bubblePartner,
                    borderColor: colors.cardBorder,
                  },
                ],
          ]}
        >
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.messageImage} />
          )}

          {item.text ? (
            <Text
              style={[
                typography.body,
                { color: isMe ? colors.bubbleMeText : colors.bubblePartnerText },
              ]}
            >
              {item.text}
            </Text>
          ) : null}

          <View style={styles.bubbleFooter}>
            <Text
              style={[
                typography.caption,
                {
                  color: isMe ? 'rgba(255,255,255,0.75)' : colors.textMuted,
                  fontSize: 10,
                },
              ]}
            >
              {formatTime(item.timestamp)}
            </Text>
            {isMe && (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color="rgba(255,255,255,0.8)"
                style={{ marginLeft: 4 }}
              />
            )}
          </View>

          {item.heartsCount ? (
            <View style={[styles.heartBadge, { backgroundColor: colors.surface }]}>
              <Text style={{ fontSize: 11 }}>❤️ {item.heartsCount}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Header />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        {/* Chat Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isPartnerTyping ? (
              <View style={styles.typingContainer}>
                <Image source={{ uri: partner.avatar }} style={styles.typingAvatar} />
                <View
                  style={[
                    styles.typingBubble,
                    { backgroundColor: colors.bubblePartner, borderColor: colors.cardBorder },
                  ]}
                >
                  <Text style={[typography.caption, { color: colors.primary }]}>
                    {partner.name} is typing with love... 💕
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Selected image preview before sending */}
        {selectedImage && (
          <View style={[styles.previewContainer, { backgroundColor: colors.surface }]}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity
              onPress={() => setSelectedImage(null)}
              style={styles.previewCloseBtn}
            >
              <Ionicons name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handlePickImage}
            style={[styles.mediaBtn, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
          >
            <Ionicons name="image-outline" size={22} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={sendHeartPulse}
            style={[styles.mediaBtn, { backgroundColor: colors.surface }]}
            activeOpacity={0.7}
          >
            <Ionicons name="heart" size={20} color={colors.accentRose} />
          </TouchableOpacity>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.inputBg,
                color: colors.text,
              },
            ]}
            placeholder={`Message ${partner.nickname}...`}
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim() && !selectedImage}
            style={[
              styles.sendBtn,
              {
                backgroundColor:
                  inputText.trim() || selectedImage ? colors.primary : colors.surface,
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="send"
              size={18}
              color={inputText.trim() || selectedImage ? '#FFFFFF' : colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Floating hearts animation component */}
      <HeartAnimation trigger={heartPulseEvent} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: layout.spacing.md,
    paddingVertical: layout.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: layout.spacing.md,
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  messageRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    marginBottom: 4,
  },
  bubbleContainer: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: layout.borderRadius.lg,
    position: 'relative',
    ...layout.shadow.soft,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubblePartner: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageImage: {
    width: 220,
    height: 160,
    borderRadius: layout.borderRadius.md,
    marginBottom: 6,
  },
  bubbleFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -10,
    right: 8,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E7DFF8',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  typingAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginRight: 8,
  },
  typingBubble: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingHorizontal: 16,
  },
  previewImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  previewCloseBtn: {
    marginLeft: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.spacing.sm + 4,
    paddingVertical: layout.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  mediaBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    borderRadius: layout.borderRadius.xl,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

