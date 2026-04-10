import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api/api';
import PressableScale from '@/components/PressableScale';

const CARDS = [
  {
    id: 'forratt',
    title: 'Ledtrådar förrätt',
    subtitle: 'Svara rätt för platsen till Gruppaktivitet 1',
    emoji: '🥗',
    course: 'förrätt',
    colors: ['#2E6B4A', '#1C4F32'] as [string, string],
  },
  {
    id: 'varmratt',
    title: 'Ledtrådar varmrätt',
    subtitle: 'Svara rätt för platsen till Gruppaktivitet 2',
    emoji: '🍖',
    course: 'varmrätt',
    colors: ['#7A2E2E', '#5C1E1E'] as [string, string],
  },
  {
    id: 'efterratt',
    title: 'Ledtrådar efterrätt',
    subtitle: 'Svara rätt för platsen till avslutningsfesten',
    emoji: '🍮',
    course: 'efterrätt',
    colors: ['#4A2E7A', '#321C5C'] as [string, string],
  },
];

type DQuiz = { course: string; questions: { id: string }[] };

function seenKey(course: string) {
  return `ledtrad_seen_count_${course}`;
}

export default function LedtradScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [newByCourse, setNewByCourse] = useState<Record<string, boolean>>({});
  const [unlockTimes, setUnlockTimes] = useState<Record<string, string>>({});

  const checkNew = async () => {
    try {
      const quizzes = await api.get<DQuiz[]>('/api/cykelfest/destination-quizzes');
      const result: Record<string, boolean> = {};
      for (const card of CARDS) {
        const quiz = quizzes.find((q) => q.course === card.course);
        const count = quiz?.questions.length ?? 0;
        const seenRaw = await AsyncStorage.getItem(seenKey(card.course));
        const seen = seenRaw ? parseInt(seenRaw, 10) : 0;
        result[card.course] = count > seen;
      }
      setNewByCourse(result);
    } catch (e) { console.error('[LedtradScreen] checkNew failed:', e); }
  };

  const fetchUnlockTimes = async () => {
    try {
      const s = await api.get<Record<string, string>>('/api/cykelfest/settings');
      setUnlockTimes(s);
    } catch (e) { console.error('[LedtradScreen] fetchUnlockTimes failed:', e); }
  };

  // Check on mount and every time screen gets focus
  useFocusEffect(
    React.useCallback(() => {
      checkNew();
      fetchUnlockTimes();
    }, [])
  );

  const markSeen = async (course: string) => {
    try {
      const quizzes = await api.get<DQuiz[]>('/api/cykelfest/destination-quizzes');
      const quiz = quizzes.find((q) => q.course === course);
      const count = quiz?.questions.length ?? 0;
      await AsyncStorage.setItem(seenKey(course), String(count));
      setNewByCourse((prev) => ({ ...prev, [course]: false }));
    } catch (e) { console.error('[LedtradScreen] markSeen failed:', e); }
  };

  const isCourseUnlocked = (course: string): boolean => {
    const keyMap: Record<string, string> = {
      'förrätt': 'unlock_ledtrad_forratt',
      'varmrätt': 'unlock_ledtrad_varmratt',
      'efterrätt': 'unlock_ledtrad_efterratt',
    };
    const key = keyMap[course];
    if (!key) return true;
    const val = unlockTimes[key];
    if (!val) return true;
    return new Date() >= new Date(val);
  };

  const getUnlockTimeLabel = (course: string): string => {
    const keyMap: Record<string, string> = {
      'förrätt': 'unlock_ledtrad_forratt',
      'varmrätt': 'unlock_ledtrad_varmratt',
      'efterrätt': 'unlock_ledtrad_efterratt',
    };
    const key = keyMap[course];
    if (!key) return '';
    const val = unlockTimes[key];
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `Öppnar kl ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container} testID="ledtrad-screen">
      <LinearGradient
        colors={['#1C4F4A', '#2A6B64']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Text style={styles.headerEyebrow}>KANINENS CYKELFEST 2026</Text>
        <Text style={styles.headerTitle}>Ledtrådar</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {CARDS.map((card) => {
          const hasNew = !!newByCourse[card.course];
          const unlocked = isCourseUnlocked(card.course);
          const unlockLabel = getUnlockTimeLabel(card.course);
          return (
            <PressableScale
              key={card.id}
              style={{ opacity: unlocked ? 1 : 0.75 }}
              testID={`ledtrad-card-${card.id}`}
              onPress={async () => {
                if (!unlocked) return;
                await markSeen(card.course);
                router.push(`/destination-quiz?course=${card.course}`);
              }}
            >
              <LinearGradient
                colors={unlocked ? card.colors : ['#C4814A', '#9E5824']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, !unlocked && { opacity: 0.85 }]}
              >
                {unlocked ? (
                  <>
                    <View style={styles.cardEmojiWrap}>
                      <Text style={styles.cardEmoji}>{card.emoji}</Text>
                      {hasNew ? <View style={styles.notifDot} /> : null}
                    </View>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.lockEmoji}>🔒</Text>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Text style={styles.lockSub}>{unlockLabel || 'Låst'}</Text>
                  </>
                )}
              </LinearGradient>
            </PressableScale>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5DFD1',
  },
  header: {
    paddingBottom: 10,
    paddingHorizontal: 22,
  },
  headerEyebrow: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    letterSpacing: 2,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26,
    color: '#F5EFE0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardEmojiWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  cardEmoji: {
    fontSize: 32,
  },
  notifDot: {
    position: 'absolute',
    top: -3,
    right: -6,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#E05A2B',
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 22,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  lockEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  lockSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
});
