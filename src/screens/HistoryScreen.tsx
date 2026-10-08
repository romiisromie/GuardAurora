import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ThreatEvent } from '../store/AppContext';
import { GlassCard, ScreenHeader } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';

const EVENT_CFG = {
  sound:  { icon: 'volume-high', label: 'Измерение звука', color: Colors.warning },
  manual: { icon: 'warning',     label: 'Ручной SOS',      color: Colors.danger },
  shake:  { icon: 'phone-portrait', label: 'Тихий SOS',    color: Colors.rose },
} as const;

export default function HistoryScreen() {
  const { threatHistory } = useApp();
  const { t, locale } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fmt = (ts: number) => new Date(ts).toLocaleString(locale, {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          <ScreenHeader
            title={t('Журнал событий')}
          />

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Events */}
            {threatHistory.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="time-outline" size={44} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>{t('Журнал пуст')}</Text>
                <Text style={styles.emptyDesc}>
                  {t('Здесь появятся отметки SOS.')}
                </Text>
              </View>
            ) : (
              <>
                {threatHistory.map(e => {
                  const cfg = EVENT_CFG[e.type];
                  return (
                    <GlassCard key={e.id} style={styles.eventCard} accentColor={cfg.color}>
                      <View style={styles.eventRow}>
                        <View style={[styles.eventIconCircle, { backgroundColor: `${cfg.color}18` }]}>
                          <Ionicons name={cfg.icon} size={20} color={cfg.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventTitle}>{t(cfg.label)}</Text>
                          <Text style={styles.eventTime}>{fmt(e.timestamp)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          {e.resolved && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                              <Ionicons name="checkmark-circle" size={13} color={Colors.mint} />
                              <Text style={{ fontSize: 10, color: Colors.mint }}>{t('Снято')}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  );
                })}
              </>
            )}

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 110 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  statCard: { flex: 1 },
  statInner: { padding: Spacing.md, alignItems: 'center', gap: 4 },
  statNum: { fontSize: 24, fontWeight: '900', color: Colors.white },
  statLabel: { fontSize: 10, color: Colors.textMuted },
  sessionCard: { marginBottom: Spacing.md },
  sessionRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  sessionTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  sessionSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptyDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  eventCard: { marginBottom: 10 },
  eventRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  eventIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  eventTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  levelTag: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  levelText: { fontSize: 11, fontWeight: '700' },
  tipCard: { marginBottom: 10 },
  tipRow: { flexDirection: 'row', padding: Spacing.md, gap: 12, alignItems: 'flex-start' },
  tipTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  tipDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
});
