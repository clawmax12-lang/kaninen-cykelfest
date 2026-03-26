import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CykelfestHeaderProps {
  showCountdown?: boolean;
  subtitle?: string;
}

function getDaysUntil(targetDate: Date): number {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CykelfestHeader({ showCountdown = true, subtitle }: CykelfestHeaderProps) {
  const insets = useSafeAreaInsets();
  const eventDate = new Date('2026-05-30T15:00:00');
  const daysLeft = getDaysUntil(eventDate);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Diagonal texture stripes */}
      <View style={styles.stripeOverlay} />

      {/* Location line */}
      <Text style={styles.location}>SUNNERSTA · 2026</Text>

      {/* Title */}
      <Text style={styles.title}>Kaninens</Text>
      <Text style={[styles.title, styles.titleItalic]}>Cykelfest</Text>

      {/* Theme row */}
      <View style={styles.themeRow}>
        <Text style={styles.temaLabel}>TEMA</Text>
        <Text style={styles.themeText}>Semesterresor vi minns</Text>
      </View>

      {showCountdown ? (
        <View style={styles.countdownRow}>
          {/* Days number + label */}
          <View style={styles.daysGroup}>
            <Text style={styles.daysNumber}>{daysLeft}</Text>
            <Text style={styles.daysLabel}>{'dagar kvar'}</Text>
          </View>


        </View>
      ) : null}

      {!showCountdown && subtitle != null ? (
        <Text style={styles.screenSubtitle}>{subtitle}</Text>
      ) : null}

      <View style={styles.bottomPad} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1C4F4A',
    paddingHorizontal: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  stripeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.04,
    backgroundColor: '#fff',
  },
  location: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 8.5,
    color: 'rgba(168, 212, 184, 0.6)',
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 38,
    color: '#F5EFE0',
    lineHeight: 44,
    letterSpacing: -0.5,
  },
  titleItalic: {
    fontFamily: 'DMSerifDisplay_400Regular_Italic',
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  temaLabel: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 8,
    color: 'rgba(168,212,184,0.7)',
    letterSpacing: 1,
  },
  themeBadge: {
    backgroundColor: '#A8D4B8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  themeText: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9.5,
    color: 'rgba(168,212,184,0.85)',
    letterSpacing: 0.3,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 16,
  },
  daysGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  daysNumber: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 56,
    color: '#F5EFE0',
    lineHeight: 60,
  },
  daysLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#A8D4B8',
    lineHeight: 20,
  },
  dateBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(168,212,184,0.25)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dateDay: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 11,
    color: 'rgba(168,212,184,0.85)',
    letterSpacing: 0.5,
  },
  dateYear: {
    fontFamily: 'SpaceMono_400Regular',
    fontSize: 9,
    color: '#A8D4B8',
    letterSpacing: 1,
  },
  screenSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#A8D4B8',
    marginTop: 8,
  },
  bottomPad: { height: 20 },
});
