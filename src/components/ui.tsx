import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ViewStyle, ActivityIndicator,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../theme';

export function GlassCard({ children, style, onPress }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; accentColor?: string; onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <TouchableOpacity onPress={onPress} activeOpacity={0.75}>{content}</TouchableOpacity> : content;
}

export function ScreenHeader({ eyebrow, title, subtitle, right }: {
  eyebrow?: string; title: string; subtitle?: string; right?: React.ReactNode;
}) {
  return <View style={styles.screenHeader}>
    <View style={{ flex: 1 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.screenTitle}>{title}</Text>
      {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
    </View>
    {right}
  </View>;
}

export function SectionTitle({ label, action }: { label: string; action?: React.ReactNode }) {
  return <View style={styles.sectionTitleRow}><Text style={styles.sectionTitle}>{label}</Text>{action}</View>;
}

export function GradientButton({ label, onPress, colors = Colors.gradPrimary, style, loading, disabled, size = 'md', icon }: {
  label: string; onPress: () => void; colors?: [string, string]; style?: StyleProp<ViewStyle>;
  loading?: boolean; disabled?: boolean; size?: 'sm' | 'md' | 'lg'; icon?: string;
}) {
  const height = { sm: 40, md: 48, lg: 54 }[size];
  const background = disabled ? '#D7DBE0' : colors[0];
  return <TouchableOpacity onPress={onPress} disabled={!!disabled || !!loading} activeOpacity={0.78}
    style={[styles.button, { minHeight: height, backgroundColor: background }, style]}>
    {loading ? <ActivityIndicator color="#FFFFFF" /> : <>
      {icon ? <Text style={styles.buttonIcon}>{icon}</Text> : null}
      <Text style={styles.buttonLabel}>{label}</Text>
    </>}
  </TouchableOpacity>;
}

export function PulseRing({ color = Colors.danger, size = 116, children }: {
  color?: string; size?: number; active?: boolean; children?: React.ReactNode;
}) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: `${color}12`, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.82, height: size * 0.82, borderRadius: size, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>{children}</View>
  </View>;
}

export function SoundWave({ level }: { level: number; color?: string; barCount?: number }) {
  return <View style={styles.soundValue}><Ionicons name="volume-medium-outline" size={18} color={level > 70 ? Colors.warning : Colors.textSecondary} /><Text style={styles.soundValueText}>{level}%</Text></View>;
}

export function StatusBadge({ label, color }: { label: string; color: string }) {
  return <View style={[styles.badge, { backgroundColor: `${color}12` }]}>
    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
    <Text style={[styles.badgeText, { color }]}>{label}</Text>
  </View>;
}

export function ThreatMeter({ score }: { score: number }) {
  const width = `${Math.max(0, Math.min(100, score))}%` as `${number}%`;
  const color = score > 70 ? Colors.warning : Colors.lavender;
  return <View style={{ gap: 8 }}>
    <View style={styles.meterTrack}><View style={[styles.meterFill, { width, backgroundColor: color }]} /></View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.meterHint}>Низкий уровень</Text><Text style={[styles.meterHint, { color, fontWeight: '700' }]}>{score}%</Text><Text style={styles.meterHint}>Высокий уровень</Text>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  screenHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  eyebrow: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 4 },
  screenTitle: { fontSize: 26, fontWeight: '700', color: Colors.white, letterSpacing: -0.3 },
  screenSubtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 5, lineHeight: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  button: { borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 18 },
  buttonIcon: { fontSize: 16 },
  buttonLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', textAlign: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: Radius.full },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meterTrack: { height: 7, backgroundColor: '#E7E9ED', borderRadius: Radius.full, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: Radius.full },
  meterHint: { fontSize: 11, color: Colors.textMuted },
  soundValue: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 7, backgroundColor: Colors.bgCardLight, borderRadius: Radius.md },
  soundValueText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
});
