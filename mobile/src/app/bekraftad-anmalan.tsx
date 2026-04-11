import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
  PanResponder,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api/api';
import Svg, { Path, Rect } from 'react-native-svg';


const SWISH_NUMBER = '0707109789';
const SWISH_AMOUNT = 100;
const SWISH_MESSAGE = 'Cykelfest 2026';

interface PersonEntry {
  display: string;
  lastName: string;
  fullName: string;
  confirmed: boolean;
}

function toEntries(names: string[]): PersonEntry[] {
  return names.map((name) => {
    const parts = name.trim().split(' ');
    const firstName = parts[0];
    const lastName = parts.length >= 2 ? parts.slice(1).join(' ') : parts[0];
    const display = parts.length >= 2 ? `${lastName} ${firstName}` : name;
    const confirmed = false;
    return { display, lastName, fullName: name, confirmed };
  });
}

function buildSections(entries: PersonEntry[]): { letter: string; entries: PersonEntry[] }[] {
  const sorted = [...entries].sort((a, b) =>
    a.lastName.localeCompare(b.lastName, 'sv')
  );
  const map = new Map<string, PersonEntry[]>();
  for (const entry of sorted) {
    const letter = entry.lastName[0].toUpperCase();
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter)!.push(entry);
  }
  return Array.from(map.entries()).map(([letter, sectionEntries]) => ({ letter, entries: sectionEntries }));
}

interface ParticipantStatus {
  id: string;
  name: string;
  confirmed: boolean;
  phone: string | null;
  dietary: string | null;
  address: string | null;
}

export default function BekraftadAnmalanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [apiData, setApiData] = useState<ParticipantStatus[]>([]);
  const [confirmedNames, setConfirmedNames] = useState<Set<string>>(new Set());
  const [participantIds, setParticipantIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<ParticipantStatus[]>('/api/cykelfest/participants/confirmation-status')
      .then((data) => {
        if (data && data.length > 0) {
          setApiData(data);
          const ids: Record<string, string> = {};
          const confirmed = new Set<string>();
          const dietary: Record<string, string> = {};
          const phone: Record<string, string> = {};
          const address: Record<string, string> = {};
          for (const p of data) {
            ids[p.name] = p.id;
            if (p.confirmed) confirmed.add(p.name);
            if (p.phone) phone[p.name] = p.phone.replace(/[\s\-]/g, '');
            if (p.dietary) dietary[p.name] = p.dietary;
            if (p.address) address[p.name] = p.address;
          }
          setParticipantIds(ids);
          setConfirmedNames(confirmed);
          setDietaryInfo(dietary);
          setPhoneInfo(phone);
          setAddressInfo(address);
        }
      })
      .catch(() => {
        // API unavailable — screen works with local state only
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const [dietaryInfo, setDietaryInfo] = useState<Record<string, string>>({});
  const [phoneInfo, setPhoneInfo] = useState<Record<string, string>>({});
  const [addressInfo, setAddressInfo] = useState<Record<string, string>>({});

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PersonEntry | null>(null);
  const [isAlreadyConfirmed, setIsAlreadyConfirmed] = useState(false);
  const [dietaryInput, setDietaryInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [swishPaid, setSwishPaid] = useState(false);
  const [swishCopied, setSwishCopied] = useState(false);

  const allEntries = toEntries(apiData.map((p) => p.name)).map((e) => ({
    ...e,
    confirmed: confirmedNames.has(e.fullName),
  }));
  const sections = buildSections(allEntries);
  const letters = sections.map((s) => s.letter);

  const confirmedCount = confirmedNames.size;

  const scrollRef = useRef<ScrollView>(null);
  const sectionOffsets = useRef<Record<string, number>>({});
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  function scrollToLetter(letter: string, idx: number) {
    const offset = sectionOffsets.current[letter];
    if (offset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: offset, animated: false });
      setActiveLetter(letter);
      setActiveIndex(idx);
    }
  }

  const alphabarRef = useRef<View>(null);
  const alphabarTop = useRef(0);
  const alphabarHeight = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const y = evt.nativeEvent.pageY - alphabarTop.current;
        const idx = Math.max(0, Math.min(letters.length - 1, Math.floor((y / alphabarHeight.current) * letters.length)));
        const letter = letters[idx];
        if (letter) scrollToLetter(letter, idx);
      },
      onPanResponderMove: (evt) => {
        const y = evt.nativeEvent.pageY - alphabarTop.current;
        const idx = Math.max(0, Math.min(letters.length - 1, Math.floor((y / alphabarHeight.current) * letters.length)));
        const letter = letters[idx];
        if (letter) scrollToLetter(letter, idx);
      },
      onPanResponderRelease: () => {
        setTimeout(() => { setActiveLetter(null); setActiveIndex(-1); }, 600);
      },
    })
  ).current;

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <LinearGradient
        colors={['#1a4a45', '#0a2220']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <View style={styles.headerTexture} pointerEvents="none">
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={[styles.textureStripe, { left: i * 28 - 120 }]} />
          ))}
        </View>

        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={22} color="#A8D4B8" strokeWidth={2} />
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>Bekräfta deltagande</Text>
          <Text style={styles.headerSubtitle}>Kaninens Cykelfest 2026</Text>
        </View>
      </LinearGradient>

      {/* LIST */}
      {loading ? (
        <View style={styles.loadingContainer} testID="loading-indicator">
          <ActivityIndicator size="large" color="#1C4F4A" />
        </View>
      ) : (
      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.introLabel}>
            Tryck på ditt namn för att fylla i dina uppgifter och bekräfta din anmälan.
          </Text>

          <View style={styles.card}>
            {sections.map((section, si) => (
              <View
                key={section.letter}
                onLayout={(e) => {
                  sectionOffsets.current[section.letter] = e.nativeEvent.layout.y;
                }}
              >
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionLetter}>{section.letter}</Text>
                  <View style={styles.sectionLine} />
                </View>

                {section.entries.map((entry, ni) => {
                  const isLast = si === sections.length - 1 && ni === section.entries.length - 1;
                  return (
                    <View key={entry.display}>
                      <View style={styles.nameRow}>
                        <Pressable
                          style={styles.nameTextBlock}
                          onPress={() => {
                            setSelectedEntry(entry);
                            setIsAlreadyConfirmed(confirmedNames.has(entry.fullName));
                            setDietaryInput(dietaryInfo[entry.fullName] ?? '');
                            setSaveSuccess(false);
                            setSwishPaid(false);
                            setModalVisible(true);
                          }}
                        >
                          <Text style={[styles.nameText, entry.confirmed && styles.nameTextConfirmed]}>
                            {entry.display}
                          </Text>
                        </Pressable>
                        {entry.confirmed ? (
                          <View style={styles.confirmedBadge}>
                            <Text style={styles.confirmedText}>✓ Bekräftad</Text>
                          </View>
                        ) : (
                          <View style={styles.unconfirmedBadge}>
                            <Text style={styles.unconfirmedText}>Ej bekräftad</Text>
                          </View>
                        )}
                      </View>
                      {!isLast ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>

          <Text style={styles.countNote}>
            {confirmedCount} av {apiData.length} har bekräftat
          </Text>
        </ScrollView>

      </View>
      )}

      {/* DIETARY MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>{selectedEntry?.display}</Text>

            {isAlreadyConfirmed ? (
              <View style={styles.alreadyConfirmedContainer}>
                <Text style={styles.alreadyConfirmedText}>Information bekräftad</Text>
              </View>
            ) : (
              <>
                <Text style={styles.allergiLabel}>Uppge eventuell allergi eller överkänslighet</Text>
                <TextInput
                  style={styles.modalInput}
                  value={dietaryInput}
                  onChangeText={setDietaryInput}
                  placeholder=""
                  placeholderTextColor="#B0A899"
                  multiline={false}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    if (selectedEntry) {
                      setDietaryInfo((prev) => ({ ...prev, [selectedEntry.fullName]: dietaryInput.trim() }));
                      setConfirmedNames((prev) => new Set([...prev, selectedEntry.fullName]));
                      const pid = participantIds[selectedEntry.fullName];
                      if (pid) {
                        api.patch(`/api/cykelfest/participants/${pid}/confirm`, {
                          dietary: dietaryInput.trim(),
                        }).catch(() => {});
                      }
                      setSaveSuccess(true);
                      setTimeout(() => {
                        setModalVisible(false);
                        setSaveSuccess(false);
                      }, 1200);
                    } else {
                      setModalVisible(false);
                    }
                  }}
                />

                <Text style={styles.gdprText}>
                    Kaninen lovar att radera all gästinformation inom 30 dagar efter festen, i enlighet med GDPR. Informationen används enbart för att koordinera Kaninens Cykelfest.
                  </Text>

                {/* Swish-betalning */}
                <View style={styles.swishSection}>
                  {/* Header */}
                  <View style={styles.swishHeader}>
                    <Image
                      source={require('../../assets/images/swish-logo.png')}
                      style={{ width: 56, height: 56, resizeMode: 'contain' }}
                    />
                    <Text style={styles.swishTitle}>Anmälningsavgift 100 kr. Swisha till numret nedan och bekräfta.</Text>
                  </View>

                  {/* General message */}
                  <Text style={styles.swishSub}>Anmälningsavgift 100 kr. Swisha till numret nedan och bekräfta.</Text>

                  {/* Number box */}
                  <View style={styles.swishNumberBox}>
                    <Text selectable={true} style={styles.swishNumber}>{SWISH_NUMBER}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const { Share } = require('react-native');
                        // Copy to clipboard via Clipboard API
                        try {
                          const Clipboard = require('@react-native-clipboard/clipboard').default;
                          Clipboard.setString(SWISH_NUMBER);
                        } catch {
                          // fallback: no-op
                        }
                        // Also show a brief visual feedback via state
                        setSwishCopied(true);
                        setTimeout(() => setSwishCopied(false), 2000);
                      }}
                      style={styles.copyChip}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.copyChipText}>{swishCopied ? '✓ Kopierat' : 'Kopiera'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.swishRecipient}>Mottagare av anmälningsavgiften är Anders Gustafsson</Text>

                  {/* Checkbox */}
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => setSwishPaid((v) => !v)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, swishPaid && styles.checkboxChecked]}>
                      {swishPaid ? <Text style={styles.checkboxMark}>✓</Text> : null}
                    </View>
                    <Text style={styles.checkboxLabel}>Jag har swishat 100 kr</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalBtnSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnSecondaryText}>Stäng</Text>
              </TouchableOpacity>
              {!isAlreadyConfirmed ? (
                <TouchableOpacity
                  style={[styles.modalBtnPrimary, !swishPaid && { opacity: 0.4 }]}
                  disabled={!swishPaid}
                  onPress={() => {
                    if (selectedEntry) {
                      setDietaryInfo((prev) => ({ ...prev, [selectedEntry.fullName]: dietaryInput.trim() }));
                      setConfirmedNames((prev) => new Set([...prev, selectedEntry.fullName]));
                      const pid = participantIds[selectedEntry.fullName];
                      if (pid) {
                        api.patch(`/api/cykelfest/participants/${pid}/confirm`, {
                          dietary: dietaryInput.trim(),
                        }).catch(() => {});
                      }
                      setSaveSuccess(true);
                      setTimeout(() => {
                        setModalVisible(false);
                        setSaveSuccess(false);
                      }, 1200);
                    } else {
                      setModalVisible(false);
                    }
                  }}
                >
                  <Text style={styles.modalBtnPrimaryText}>Bekräfta</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {saveSuccess ? (
              <View style={styles.successBanner} testID="success-banner">
                <Text style={styles.successBannerText}>Anmalan bekraftad!</Text>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#E5DFD1',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 22,
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
    gap: 4,
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
  scroll: {
    flex: 1,
    paddingRight: 0,
  },
  scrollContent: {
    paddingTop: 20,
    paddingLeft: 16,
    paddingRight: 16,
  },
  introLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: '#7A7060',
    lineHeight: 18,
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8E0CC',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    gap: 10,
    backgroundColor: '#F8F5EE',
  },
  sectionLetter: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    color: '#1C4F4A',
    letterSpacing: 0.5,
    minWidth: 14,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8E0CC',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 12,
    gap: 10,
  },
  nameTextBlock: {
    flex: 1,
    gap: 2,
  },
  nameText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#2A2A2A',
  },
  nameTextConfirmed: {
    color: '#7A7060',
  },
  dietaryChip: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#C4814A',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DFF0E8',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confirmedText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#1C4F4A',
  },
  unconfirmedBadge: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  unconfirmedText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#C0392B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EAD8',
    marginLeft: 16,
  },
  countNote: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: '#9A8E78',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    gap: 14,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4C9B0',
    alignSelf: 'center',
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 20,
    color: '#1C1C1C',
  },
  allergiLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#8A7E6E',
    marginBottom: 4,
  },
  modalLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: '#9A8E78',
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: '#F5EFE0',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#E8E0CC',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalBtnSecondary: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E8E0CC',
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#7A7060',
  },
  modalBtnPrimary: {
    flex: 1,
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#1C4F4A',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#A8D4B8',
  },
  gdprBox: {
    // removed — no longer used
  },
  gdprText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#6B7E6B',
    lineHeight: 17,
    textAlign: 'left',
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alphabar: {
    position: 'absolute',
    right: 6,
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    top: 0,
    bottom: 0,
  },
  alphabarItem: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 4,
  },
  alphabarLetter: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 9,
    color: '#1C4F4A',
    lineHeight: 11,
  },
  alphabarLetterNear: {
    fontSize: 11,
    color: '#0f3330',
  },
  alphabarLetterActive: {
    fontSize: 15,
    color: '#0f3330',
    fontFamily: 'DMSans_700Bold',
  },
  letterBubble: {
    position: 'absolute',
    right: 28,
    top: '50%',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C4F4A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  letterBubbleText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#fff',
  },

  alreadyConfirmedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  alreadyConfirmedText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#9A8E78',
    textAlign: 'center',
  },

  // Success banner
  successBanner: {
    backgroundColor: '#1C4F4A',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  successBannerText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
    color: '#A8D4B8',
  },

  // Swish
  swishSection: {
    backgroundColor: '#E8F4FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B3D9F5',
    padding: 16,
    gap: 12,
  },
  swishHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  swishLogo: {
    backgroundColor: '#4CAF74',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  swishLogoText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.5,
  },
  swishTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#1A3A5C',
  },
  swishSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#4A6B8A',
  },
  swishNumberBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B3D9F5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  swishNumber: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 24,
    color: '#1A3A5C',
    letterSpacing: 1,
  },
  swishAmountLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#4A6B8A',
  },
  swishLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    color: '#4A6B8A',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1A3A5C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#1A3A5C',
    borderColor: '#1A3A5C',
  },
  checkboxMark: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#A8D4B8',
  },
  copyChip: {
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#B3D9F5',
  },
  copyChipText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#1A3A5C',
  },
  swishRecipient: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#4A6B8A',
    fontStyle: 'italic',
  },
  checkboxLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#2A2A2A',
    flex: 1,
  },
});
