import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header } from '../../components/Header';
import { MemoryItem, TimelineNote } from '../../types';
import { RELATIONSHIP_START_DATE } from '../../config/constants';
import { typography, layout } from '../../theme/typography';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - layout.spacing.lg * 2 - 14) / 2;

// Initial romantic memories sample
const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Stargazing at Sunset Peak',
    description: 'We wrapped in a blanket and counted shooting stars until midnight ✨',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80',
    date: '2024-05-18',
    location: 'Sunset Peak',
    category: 'Travel',
    likes: 12,
    authorId: 'partner1',
  },
  {
    id: 'mem-2',
    title: 'Our First Baking Disaster',
    description: 'Flour everywhere, burnt cookies, but the sweetest laughs ever 🍪😂',
    imageUrl: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=600&q=80',
    date: '2024-06-22',
    category: 'Date Night',
    likes: 8,
    authorId: 'partner2',
  },
  {
    id: 'mem-3',
    title: 'The Secret Picnic',
    description: 'Surprise strawberries, lavender tea, and handwritten letters under the willow tree 🌸',
    imageUrl: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
    date: '2024-08-14',
    category: 'Anniversary',
    likes: 19,
    authorId: 'partner1',
  },
  {
    id: 'mem-4',
    title: 'Late Night Coffee Walk',
    description: 'Cold breeze, holding hands inside your oversized coat pocket ☕💫',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    date: '2024-10-03',
    category: 'Random Love',
    likes: 15,
    authorId: 'partner2',
  },
];

const INITIAL_TIMELINE_NOTES: TimelineNote[] = [
  {
    id: 'note-1',
    authorId: 'partner1',
    note: 'Every single day with you feels like reading my favorite poem for the first time.',
    date: 'Yesterday at 11:30 PM',
    moodEmoji: '💖',
  },
  {
    id: 'note-2',
    authorId: 'partner2',
    note: 'Thank you for making our home the warmest, happiest place on earth.',
    date: '3 days ago',
    moodEmoji: '🏡',
  },
  {
    id: 'note-3',
    authorId: 'partner1',
    note: 'Promise me we will always dance in the kitchen when it rains.',
    date: '1 week ago',
    moodEmoji: '🌧️',
  },
];

export const MemoriesScreen: React.FC = () => {
  const { colors } = useTheme();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'scrapbook' | 'timeline'>('scrapbook');
  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);
  const [notes, setNotes] = useState<TimelineNote[]>(INITIAL_TIMELINE_NOTES);

  // Modal State for adding memory
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('Date Night');

  // Modal State for viewing photo
  const [selectedMemory, setSelectedMemory] = useState<MemoryItem | null>(null);

  // Calculate days together
  const calculateDaysTogether = () => {
    const start = new Date(RELATIONSHIP_START_DATE).getTime();
    const now = Date.now();
    const diff = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
    return diff;
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setNewImageUri(result.assets[0].uri);
    }
  };

  const handleSaveMemory = () => {
    if (!newTitle.trim() || !newImageUri) return;

    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'A cherished moment forever in our hearts.',
      imageUrl: newImageUri,
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      likes: 1,
      authorId: currentUser.id,
    };

    setMemories([newMem, ...memories]);
    setIsAddModalVisible(false);
    setNewTitle('');
    setNewDesc('');
    setNewImageUri(null);
  };

  const handleLikeMemory = (id: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
    if (selectedMemory && selectedMemory.id === id) {
      setSelectedMemory((prev) => (prev ? { ...prev, likes: prev.likes + 1 } : null));
    }
  };

  const renderScrapbookCard = ({ item }: { item: MemoryItem }) => {
    return (
      <TouchableOpacity
        onPress={() => setSelectedMemory(item)}
        style={[
          styles.polaroidCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            width: COLUMN_WIDTH,
          },
        ]}
        activeOpacity={0.88}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.polaroidImage} />

        <View style={styles.polaroidContent}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.surface }]}>
            <Text style={[typography.caption, { color: colors.primary, fontSize: 10 }]}>
              {item.category}
            </Text>
          </View>

          <Text
            style={[typography.bodyBold, { color: colors.text, fontSize: 13, marginTop: 4 }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>

          <View style={styles.polaroidFooter}>
            <Text style={[typography.caption, { color: colors.textMuted, fontSize: 10 }]}>
              {item.date}
            </Text>
            <View style={styles.likesRow}>
              <Ionicons name="heart" size={12} color={colors.accentRose} />
              <Text style={[typography.caption, { color: colors.textSecondary, fontSize: 10, marginLeft: 2 }]}>
                {item.likes}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <Header title="Our Scrapbook" showPartnerStatus={false} />

      {/* Relationship Days Counter Banner */}
      <View style={[styles.counterBanner, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <View style={styles.counterLeft}>
          <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
            CHAPTER OF US
          </Text>
          <Text style={[typography.h1, { color: colors.text, marginTop: 2 }]}>
            Day {calculateDaysTogether()} 💕
          </Text>
          <Text style={[typography.subtext, { color: colors.textSecondary }]}>
            {memories.length} captured memories together
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher: Scrapbook Photos vs Timeline Notes */}
      <View style={[styles.tabSwitcher, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('scrapbook')}
          style={[
            styles.tabButton,
            activeTab === 'scrapbook' && { backgroundColor: colors.card, ...layout.shadow.soft },
          ]}
        >
          <Ionicons
            name="images"
            size={16}
            color={activeTab === 'scrapbook' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              typography.bodyBold,
              { color: activeTab === 'scrapbook' ? colors.primary : colors.textMuted, marginLeft: 6 },
            ]}
          >
            Photo Scrapbook
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('timeline')}
          style={[
            styles.tabButton,
            activeTab === 'timeline' && { backgroundColor: colors.card, ...layout.shadow.soft },
          ]}
        >
          <Ionicons
            name="heart-half"
            size={16}
            color={activeTab === 'timeline' ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              typography.bodyBold,
              { color: activeTab === 'timeline' ? colors.primary : colors.textMuted, marginLeft: 6 },
            ]}
          >
            Love Letters
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Tab View */}
      {activeTab === 'scrapbook' ? (
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={renderScrapbookCard}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.scrapbookList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.timelineList} showsVerticalScrollIndicator={false}>
          {notes.map((n, index) => (
            <View key={n.id} style={styles.timelineCardRow}>
              {/* Timeline Marker */}
              <View style={styles.timelineMarkerCol}>
                <View style={[styles.timelineDot, { backgroundColor: colors.primary }]}>
                  <Text style={{ fontSize: 10 }}>{n.moodEmoji}</Text>
                </View>
                {index < notes.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: colors.cardBorder }]} />
                )}
              </View>

              {/* Note Card */}
              <View
                style={[
                  styles.timelineCard,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
                  {n.date}
                </Text>
                <Text style={[typography.body, { color: colors.text, marginTop: 6 }]}>
                  {n.note}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal: Add New Memory */}
      <Modal visible={isAddModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[typography.h3, { color: colors.text }]}>Add Couple Memory</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handlePickImage}
              style={[styles.imagePickerPlaceholder, { backgroundColor: colors.surface }]}
            >
              {newImageUri ? (
                <Image source={{ uri: newImageUri }} style={styles.pickedImage} />
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 6 }]}>
                    Choose Photo from Library
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              placeholder="Memory Title (e.g. Rainy cafe date)"
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <TextInput
              style={[
                styles.modalInput,
                styles.modalTextarea,
                { backgroundColor: colors.inputBg, color: colors.text },
              ]}
              placeholder="Describe this beautiful moment..."
              placeholderTextColor={colors.textMuted}
              value={newDesc}
              onChangeText={setNewDesc}
              multiline
            />

            <TouchableOpacity
              onPress={handleSaveMemory}
              disabled={!newTitle.trim() || !newImageUri}
              style={[
                styles.saveBtn,
                {
                  backgroundColor:
                    newTitle.trim() && newImageUri ? colors.primary : colors.surface,
                },
              ]}
            >
              <Text
                style={[
                  typography.bodyBold,
                  { color: newTitle.trim() && newImageUri ? '#FFFFFF' : colors.textMuted },
                ]}
              >
                Save to Scrapbook
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal: View Fullscreen Memory */}
      <Modal visible={!!selectedMemory} animationType="fade" transparent>
        <View style={styles.modalBackdrop}>
          {selectedMemory && (
            <View
              style={[
                styles.viewMemoryCard,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <Image source={{ uri: selectedMemory.imageUrl }} style={styles.fullPhoto} />

              <View style={{ padding: layout.spacing.lg }}>
                <View style={styles.viewMemoryTopRow}>
                  <Text style={[typography.caption, { color: colors.primary, fontWeight: '700' }]}>
                    {selectedMemory.category.toUpperCase()} • {selectedMemory.date}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleLikeMemory(selectedMemory.id)}
                    style={styles.heartAction}
                  >
                    <Ionicons name="heart" size={22} color={colors.accentRose} />
                    <Text style={[typography.bodyBold, { color: colors.text, marginLeft: 4 }]}>
                      {selectedMemory.likes}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[typography.h2, { color: colors.text, marginTop: 8 }]}>
                  {selectedMemory.title}
                </Text>
                <Text style={[typography.body, { color: colors.textSecondary, marginTop: 8 }]}>
                  {selectedMemory.description}
                </Text>

                <TouchableOpacity
                  onPress={() => setSelectedMemory(null)}
                  style={[styles.closeDetailBtn, { backgroundColor: colors.surface }]}
                >
                  <Text style={[typography.bodyBold, { color: colors.text }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  counterBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: layout.spacing.md,
    marginTop: layout.spacing.sm,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.xl,
    borderWidth: 1,
  },
  counterLeft: {
    flex: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...layout.shadow.soft,
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: layout.spacing.md,
    marginTop: layout.spacing.md,
    padding: 4,
    borderRadius: layout.borderRadius.lg,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: layout.borderRadius.md,
  },
  scrapbookList: {
    paddingHorizontal: layout.spacing.md,
    paddingTop: layout.spacing.md,
    paddingBottom: layout.spacing.xxl,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: layout.spacing.md,
  },
  polaroidCard: {
    borderRadius: layout.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    ...layout.shadow.soft,
  },
  polaroidImage: {
    width: '100%',
    height: 130,
  },
  polaroidContent: {
    padding: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  polaroidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  likesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineList: {
    paddingHorizontal: layout.spacing.md,
    paddingTop: layout.spacing.lg,
    paddingBottom: layout.spacing.xxl,
  },
  timelineCardRow: {
    flexDirection: 'row',
    marginBottom: layout.spacing.md,
  },
  timelineMarkerCol: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    padding: layout.spacing.md,
    borderRadius: layout.borderRadius.lg,
    borderWidth: 1,
    ...layout.shadow.soft,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.md,
  },
  modalContent: {
    width: '100%',
    borderRadius: layout.borderRadius.xl,
    padding: layout.spacing.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.spacing.md,
  },
  imagePickerPlaceholder: {
    height: 140,
    borderRadius: layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: layout.spacing.md,
  },
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  modalInput: {
    borderRadius: layout.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 10,
  },
  modalTextarea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveBtn: {
    borderRadius: layout.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  viewMemoryCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: layout.borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  fullPhoto: {
    width: '100%',
    height: 240,
  },
  viewMemoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heartAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeDetailBtn: {
    marginTop: layout.spacing.lg,
    borderRadius: layout.borderRadius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
});

