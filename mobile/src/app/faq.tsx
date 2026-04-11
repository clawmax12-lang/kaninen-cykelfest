import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api/api';

interface Question {
  id: string;
  text: string;
  answer: string | null;
  createdAt: string;
}

export default function FAQScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    api.get<Question[]>('/api/cykelfest/questions')
      .then((data) => {
        const answered = (data ?? []).filter((q) => q.answer != null);
        setQuestions(answered);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.root} testID="faq-screen">
      {/* HEADER */}
      <LinearGradient
        colors={['#C0392B', '#922B21']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        {/* Subtle diagonal texture stripes */}
        <View style={styles.headerTexture} pointerEvents="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.textureStripe, { left: i * 28 - 120 }]} />
          ))}
        </View>

        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          testID="back-button"
        >
          <ChevronLeft size={22} color="#FFCDD2" strokeWidth={2} />
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Fråga kaninen</Text>
          <Text style={styles.headerSubtitle}>Frågor & svar</Text>
        </View>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerState} testID="loading-indicator">
            <ActivityIndicator size="small" color="#1C4F4A" />
          </View>
        ) : questions.length === 0 ? (
          <View style={styles.centerState} testID="empty-view">
            <Text style={styles.emptyEmoji}>🐇</Text>
            <Text style={styles.emptyText}>
              Inga svar ännu — kom tillbaka lite senare!
            </Text>
          </View>
        ) : (
          <View style={styles.cardList} testID="faq-list">
            {questions.map((item, index) => {
              const isExpanded = expandedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={({ pressed }) => [
                    styles.cardItem,
                    pressed && styles.cardItemPressed,
                  ]}
                  onPress={() => toggleItem(item.id)}
                  testID={`faq-toggle-${item.id}`}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                >
                  <View style={styles.questionRow}>
                    <Text style={styles.questionText}>{item.text}</Text>
                    {isExpanded ? (
                      <ChevronUp size={18} color="#1C4F4A" strokeWidth={2} style={styles.chevron} />
                    ) : (
                      <ChevronDown size={18} color="#9A8E78" strokeWidth={2} style={styles.chevron} />
                    )}
                  </View>
                  {!isExpanded && item.answer != null && (
                    <View style={styles.answerBadge}>
                      <Text style={styles.answerBadgeText}>Kaninen svarar</Text>
                    </View>
                  )}
                  {isExpanded ? (
                    <View style={styles.answerBlock} testID={`faq-answer-${item.id}`}>
                      <Text style={styles.answerLabel}>🐇 Kaninen svarar</Text>
                      <Text style={styles.answerText}>{item.answer}</Text>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E5DFD1',
  },

  // HEADER
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerTexture: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  textureStripe: {
    position: 'absolute',
    top: -200,
    bottom: -200,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.022)',
    transform: [{ rotate: '-55deg' }],
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168,212,184,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,212,184,0.2)',
  },
  headerTextBlock: {
    gap: 3,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26,
    color: '#F5EFE0',
    lineHeight: 30,
  },
  headerSubtitle: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9.5,
    color: 'rgba(168,212,184,0.7)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // SCROLL
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // STATES
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#9A8E78',
    textAlign: 'center',
    lineHeight: 20,
  },

  // CARD LIST
  cardList: {
    gap: 10,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0EAD8',
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E0CC',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardItemPressed: {
    backgroundColor: '#F9F5EC',
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  chevron: {
    marginTop: 2,
    flexShrink: 0,
  },

  // QUESTION
  questionText: {
    flex: 1,
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14.5,
    color: '#1C2A28',
    lineHeight: 21,
  },

  // ANSWER
  answerBlock: {
    backgroundColor: '#F5F1E8',
    borderRadius: 10,
    padding: 14,
    gap: 6,
  },
  answerLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: '#1C4F4A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.8,
    marginBottom: 2,
  },
  answerText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#4A4030',
    lineHeight: 21,
  },
  answerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FAF5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C8E6D4',
  },
  answerBadgeText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#1C4F4A',
  },
});
