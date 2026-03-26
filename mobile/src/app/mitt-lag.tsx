import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  Pressable,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/api';

const TEAMS = [
  { name: 'Charter',          emoji: '✈️',  colors: ['#D4A017', '#A07810'] as [string, string] },
  { name: 'Safari',           emoji: '🦁',  colors: ['#CA6F1E', '#A04000'] as [string, string] },
  { name: 'Fjällvandring',    emoji: '⛰️',  colors: ['#148F77', '#0E6655'] as [string, string] },
  { name: 'Tågluff',          emoji: '🚂',  colors: ['#2471A3', '#1A5276'] as [string, string] },
  { name: 'Camping',          emoji: '⛺',  colors: ['#1E8449', '#145A32'] as [string, string] },
  { name: 'Träningsresa',     emoji: '🏋️', colors: ['#C0392B', '#922B21'] as [string, string] },
  { name: 'Backpacking',      emoji: '🎒',  colors: ['#7D3C98', '#5B2C6F'] as [string, string] },
  { name: 'Kryssning',        emoji: '🚢',  colors: ['#1F618D', '#154360'] as [string, string] },
  { name: 'Alpresa',          emoji: '🎿',  colors: ['#717D7E', '#4D5656'] as [string, string] },
  { name: 'Club 33',          emoji: '🍹',  colors: ['#B03A6B', '#8E2456'] as [string, string] },
  { name: 'Storstadsweekend', emoji: '🏙️', colors: ['#6C3483', '#4A235A'] as [string, string] },
  { name: 'Fotbollsresa',     emoji: '⚽',  colors: ['#922B21', '#641E16'] as [string, string] },
];

// Fallback static participants spread evenly across teams
const FALLBACK_PARTICIPANTS: { name: string; team: string }[] = [
  { name: 'Anna Lindqvist',    team: 'Charter' },
  { name: 'Erik Bergström',    team: 'Charter' },
  { name: 'Sofia Karlsson',    team: 'Safari' },
  { name: 'Marcus Johansson',  team: 'Safari' },
  { name: 'Maja Pettersson',   team: 'Fjällvandring' },
  { name: 'Oskar Nilsson',     team: 'Fjällvandring' },
  { name: 'Ida Svensson',      team: 'Tågluff' },
  { name: 'Filip Eriksson',    team: 'Tågluff' },
  { name: 'Lina Gustafsson',   team: 'Camping' },
  { name: 'Viktor Andersson',  team: 'Camping' },
  { name: 'Elin Magnusson',    team: 'Träningsresa' },
  { name: 'Jonas Olsson',      team: 'Träningsresa' },
  { name: 'Klara Henriksson',  team: 'Backpacking' },
  { name: 'Simon Larsson',     team: 'Kryssning' },
  { name: 'Frida Persson',     team: 'Alpresa' },
  { name: 'Adam Björk',        team: 'Club 33' },
];

type BackendTeam = {
  id: string;
  name: string;
  participants?: { id: string; name: string }[];
};

type HostAssignment = {
  id: string;
  guests: { participantName: string }[];
};

type ParticipantEntry = { name: string; team: string };

function buildParticipantMap(
  backendTeams: BackendTeam[] | undefined,
  hostAssignments: HostAssignment[] | undefined
): ParticipantEntry[] {
  // 1. Try teams with participants
  if (backendTeams && backendTeams.length > 0) {
    const entries: ParticipantEntry[] = [];
    for (const bt of backendTeams) {
      if (bt.participants && bt.participants.length > 0) {
        // Match backend team name to local TEAMS by fuzzy match
        const matched = TEAMS.find(
          (t) => t.name.toLowerCase() === bt.name.toLowerCase()
        ) ?? TEAMS.find(
          (t) => bt.name.toLowerCase().includes(t.name.toLowerCase()) ||
                 t.name.toLowerCase().includes(bt.name.toLowerCase())
        );
        const teamName = matched?.name ?? bt.name;
        for (const p of bt.participants) {
          entries.push({ name: p.name, team: teamName });
        }
      }
    }
    if (entries.length > 0) return entries;
  }

  // 2. Try host-assignments guests — distribute across teams by index
  if (hostAssignments && hostAssignments.length > 0) {
    const allGuests: string[] = [];
    for (const ha of hostAssignments) {
      for (const g of ha.guests) {
        if (g.participantName && !allGuests.includes(g.participantName)) {
          allGuests.push(g.participantName);
        }
      }
    }
    if (allGuests.length > 0) {
      return allGuests.map((name, i) => ({
        name,
        team: TEAMS[i % TEAMS.length]!.name,
      }));
    }
  }

  // 3. Fallback static data
  return FALLBACK_PARTICIPANTS;
}

// ---- Animated team card ----
type TeamCardProps = {
  team: (typeof TEAMS)[number];
  index: number;
  highlighted: boolean;
  dimmed: boolean;
  cardWidth: number;
  onPress: () => void;
};

function TeamCard({ team, index, highlighted, dimmed, cardWidth, onPress }: TeamCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withTiming(highlighted ? 1.04 : 1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
    opacity.value = withTiming(dimmed ? 0.4 : 1, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [highlighted, dimmed]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={[styles.cardWrapper, { width: cardWidth }, animStyle]}
      testID={`team-card-${team.name}`}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        <LinearGradient
          colors={team.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.card,
            { width: cardWidth },
            highlighted && styles.cardHighlighted,
          ]}
        >
          <Text style={styles.cardEmoji}>{team.emoji}</Text>
          <Text style={styles.cardName}>{team.name}</Text>
          {highlighted ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={styles.dittLagBadge}
            >
              <Text style={styles.dittLagText}>Mitt lag!</Text>
            </Animated.View>
          ) : null}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ---- Main screen ----
export default function MittLagScreen() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();
  const cardWidth = screenW - 48;
  const [query, setQuery] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  const { data: backendTeams } = useQuery<BackendTeam[]>({
    queryKey: ['cykelfest-teams-members'],
    queryFn: () => api.get<BackendTeam[]>('/api/cykelfest/teams'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: hostAssignments } = useQuery<HostAssignment[]>({
    queryKey: ['cykelfest-host-assignments'],
    queryFn: () => api.get<HostAssignment[]>('/api/cykelfest/host-assignments'),
    staleTime: 5 * 60 * 1000,
  });

  const participants = React.useMemo(
    () => buildParticipantMap(backendTeams, hostAssignments),
    [backendTeams, hostAssignments]
  );

  const suggestions = React.useMemo<ParticipantEntry[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.trim().toLowerCase();
    return participants.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, participants]);

  const handleSelectSuggestion = useCallback((entry: ParticipantEntry) => {
    setQuery(entry.name);
    setSelectedTeam(entry.team);
    setShowDropdown(false);
    inputRef.current?.blur();
  }, []);

  const handleClear = useCallback(() => {
    setQuery('');
    setSelectedTeam(null);
    setShowDropdown(false);
  }, []);

  const handleChangeText = useCallback((text: string) => {
    setQuery(text);
    setSelectedTeam(null);
    setShowDropdown(text.trim().length >= 2);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#1A3A2A', '#2A4A3A']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={22} color="#A8D4B8" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mitt lag</Text>
        <Text style={styles.headerSub}>Kaninens Cykelfest 2026</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => {
          if (showDropdown) {
            setShowDropdown(false);
            inputRef.current?.blur();
          }
        }}
      >
        <Text style={styles.intro}>Vilket är ditt lag?</Text>

        {/* Search box */}
        <View style={styles.searchContainer} testID="search-container">
          <View style={styles.searchBox}>
            <Search size={16} color="#9A8E78" style={styles.searchIcon} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Sök ditt namn..."
              placeholderTextColor="#BDB19E"
              value={query}
              onChangeText={handleChangeText}
              autoCorrect={false}
              autoCapitalize="words"
              returnKeyType="search"
              testID="name-search-input"
            />
            {query.length > 0 && (
              <Pressable onPress={handleClear} hitSlop={10} testID="search-clear-btn">
                <X size={16} color="#9A8E78" />
              </Pressable>
            )}
          </View>

          {/* Dropdown suggestions */}
          {showDropdown && suggestions.length > 0 ? (
            <Animated.View
              entering={FadeIn.duration(150)}
              exiting={FadeOut.duration(100)}
              style={styles.dropdown}
              testID="suggestions-dropdown"
            >
              {suggestions.map((entry, i) => (
                <Pressable
                  key={`${entry.name}-${i}`}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    i < suggestions.length - 1 && styles.suggestionBorder,
                    pressed && styles.suggestionPressed,
                  ]}
                  onPress={() => handleSelectSuggestion(entry)}
                  testID={`suggestion-${i}`}
                >
                  <Text style={styles.suggestionName}>{entry.name}</Text>
                  <Text style={styles.suggestionTeam}>{entry.team}</Text>
                </Pressable>
              ))}
            </Animated.View>
          ) : null}

          {showDropdown && suggestions.length === 0 && query.trim().length >= 2 ? (
            <Animated.View
              entering={FadeIn.duration(150)}
              style={styles.dropdown}
            >
              <View style={styles.suggestionItem}>
                <Text style={styles.noResultText}>Hittade ingen med det namnet</Text>
              </View>
            </Animated.View>
          ) : null}
        </View>

        {/* Team grid — 1 column */}
        {TEAMS.map((team, index) => (
          <TeamCard
            key={team.name}
            team={team}
            index={index}
            highlighted={selectedTeam === team.name}
            dimmed={selectedTeam !== null && selectedTeam !== team.name}
            cardWidth={cardWidth}
            onPress={() => router.push(`/lag/${encodeURIComponent(team.name)}?highlight=${encodeURIComponent(query)}`)}
          />
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF7F2' },
  header: {
    paddingTop: 60,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 58,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(168,212,184,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,212,184,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 30,
    color: '#F5F0E8',
    marginBottom: 4,
  },
  headerSub: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: '#A8D4B8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  intro: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#9A8E78',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  // Search
  searchContainer: {
    marginBottom: 20,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EAD8',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8E0CC',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    gap: 10,
  },
  searchIcon: {
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#3A3228',
    padding: 0,
    margin: 0,
  },
  // Dropdown
  dropdown: {
    backgroundColor: '#FFFDF8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0CC',
    marginTop: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  suggestionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDE7D8',
  },
  suggestionPressed: {
    backgroundColor: '#F5EFE0',
  },
  suggestionName: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#3A3228',
    flex: 1,
  },
  suggestionTeam: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 10,
    color: '#9A8E78',
    marginLeft: 8,
  },
  noResultText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#BDB19E',
    textAlign: 'center',
    flex: 1,
  },
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHighlighted: {
    borderWidth: 2.5,
    borderColor: '#F5D87A',
    shadowColor: '#F5D87A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  dittLagBadge: {
    position: 'absolute',
    top: 6,
    right: 8,
    backgroundColor: 'rgba(245, 216, 122, 0.92)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dittLagText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 8,
    color: '#3A2A0A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cardEmoji: {
    fontSize: 28,
  },
  cardName: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#F5F0E8',
    flex: 1,
  },
});
