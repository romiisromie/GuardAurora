import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ViewStyle, TextStyle, ActivityIndicator, StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '../theme';

// ── GlassCard ──────────────────────────────────────────────
export function GlassCard({
  children, style, accentColor, onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accentColor?: string;
  onPress?: () => void;
}) {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, style]}>
        {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
        {children}
      </TouchableOpacity>
    );
  }
  return (
    <View style={[styles.card, style]}>
      {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
      {children}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={{ flex: 1 }}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({
  label,
  action,
}: {
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{label}</Text>
      {action}
    </View>
  );
}

// ── GradientButton ─────────────────────────────────────────
export function GradientButton({
  label, onPress, colors = Colors.gradPrimary,
  style, loading, disabled, size = 'md', icon,
}: {
  label: string;
  onPress: () => void;
  colors?: [string, string];
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
}) {
  const h = { sm: 44, md: 54, lg: 64 }[size];
  const fs = { sm: 14, md: 16, lg: 18 }[size];
  const btnColors: [string, string] = disabled ? ['#333', '#222'] : colors;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!!disabled || !!loading}
      activeOpacity={0.85}
      style={[{ borderRadius: Radius.full }, style]}
    >
      <LinearGradient
        colors={btnColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradBtn, { height: h }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            {icon ? <Text style={{ fontSize: fs + 2 }}>{icon}</Text> : null}
            <Text style={[styles.gradBtnLabel, { fontSize: fs }]}>{label}</Text>
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ── PulseRing ──────────────────────────────────────────────
export function PulseRing({
  color = Colors.rose, size = 120, active = true, children,
}: {
  color?: string;
  size?: number;
  active?: boolean;
  children?: React.ReactNode;
}) {
  const p1 = useRef(new Animated.Value(1)).current;
  const p2 = useRef(new Animated.Value(1)).current;
  const o1 = useRef(new Animated.Value(0.5)).current;
  const o2 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!active) return;
    const a1 = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(p1, { toValue: 1.55, duration: 1500, useNativeDriver: true }),
        Animated.timing(o1, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(p1, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(o1, { toValue: 0.5, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    const a2 = Animated.loop(Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(p2, { toValue: 1.9, duration: 1500, useNativeDriver: true }),
        Animated.timing(o2, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(p2, { toValue: 1, duration: 0, useNativeDriver: true }),
        Animated.timing(o2, { toValue: 0.3, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    a1.start(); a2.start();
    return () => { a1.stop(); a2.stop(); };
  }, [active, color]);

  const inner = size * 0.65;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {active && (
        <>
          <Animated.View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 2, borderColor: color, transform: [{ scale: p2 }], opacity: o2,
          }} />
          <Animated.View style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2,
            borderWidth: 2, borderColor: color, transform: [{ scale: p1 }], opacity: o1,
          }} />
        </>
      )}
      <View style={{
        width: inner, height: inner, borderRadius: inner / 2,
        backgroundColor: `${color}18`,
        borderWidth: 2.5, borderColor: color,
        alignItems: 'center', justifyContent: 'center',
        zIndex: 10,
      }}>
        {children}
      </View>
    </View>
  );
}

// ── SoundWave ──────────────────────────────────────────────
export function SoundWave({ level, color = Colors.rose, barCount = 18 }: {
  level: number;
  color?: string;
  barCount?: number;
}) {
  const anims = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.15))
  ).current;

  useEffect(() => {
    anims.forEach((anim, i) => {
      const target = level > 0
        ? Math.max(0.1, Math.random() * (level / 100) * 0.9 + 0.08)
        : 0.15;
      Animated.spring(anim, { toValue: target, speed: 18 + Math.random() * 8, bounciness: 1, useNativeDriver: true }).start();
    });
  }, [level]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, height: 50 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={{
          width: 3.5, height: 50, borderRadius: 999,
          backgroundColor: color,
          opacity: level > 0 ? 0.6 + (i % 3) * 0.13 : 0.25,
          transform: [{ scaleY: a }],
        }} />
      ))}
    </View>
  );
}

// ── StatusBadge ────────────────────────────────────────────
export function StatusBadge({ label, color }: { label: string; color: string }) {
  const dot = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(dot, { toValue: 0.2, duration: 750, useNativeDriver: true }),
      Animated.timing(dot, { toValue: 1, duration: 750, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return (
    <View style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}45` }]}>
      <Animated.View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, opacity: dot }} />
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ── ThreatMeter ────────────────────────────────────────────
export function ThreatMeter({ score }: { score: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score / 100, duration: 500, useNativeDriver: false }).start();
  }, [score]);
  const color = score >= 80 ? Colors.danger : score >= 50 ? Colors.warning : Colors.safe;
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.meterTrack}>
        <Animated.View style={[styles.meterFill, {
          width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          backgroundColor: color,
        }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 11, color: Colors.textMuted }}>Безопасно</Text>
        <Text style={{ fontSize: 11, color, fontWeight: '700' }}>{score}%</Text>
        <Text style={{ fontSize: 11, color: Colors.danger }}>Угроза</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.lavender,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  accent: { height: 3 },
  gradBtn: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
  },
  gradBtnLabel: { color: '#fff', fontWeight: '700', letterSpacing: 0.2 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meterTrack: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 999, overflow: 'hidden',
  },
  meterFill: { height: '100%', borderRadius: 999 },
});
