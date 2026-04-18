import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, ThreatEvent } from '../store/AppContext';
import { GlassCard, StatusBadge, ScreenHeader, SectionTitle } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

const EVENT_CFG = {
  sound:  { icon: '🎙', label: 'Звуковая угроза', color: Colors.warning },
  manual: { icon: '🚨', label: 'Ручной SOS',      color: Colors.danger },
  shake:  { icon: '📳', label: 'Тихий SOS',        color: Colors.rose },
};
const LEVEL_COLOR = { low: Colors.mint, medium: Colors.warning, high: Colors.danger };
const LEVEL_LABEL = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

const TIPS = [
  { icon: '📳', t: 'Тихий SOS', d: 'Встряхни телефон 3 раза — контакты получат сигнал без звука' },
  { icon: '🔋', t: 'Заряд батареи', d: 'Держи телефон заряженным на 50%+ для надёжной защиты' },
  { icon: '📡', t: 'Интернет', d: 'Для GPS и ИИ-чата нужен мобильный интернет' },
  { icon: '👥', t: 'Контакты', d: 'Добавь 2–3 доверенных человека с разными операторами' },
];

export default function HistoryScreen() {
  const { threatHistory, isMonitoring, trustedContacts } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fmt = (ts: number) => new Date(ts).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  return (
    <LinearGradient colors={['#0d0118', '#160d24']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          <ScreenHeader
            eyebrow="Incident Timeline"
            title="Журнал событий"
            subtitle={`${threatHistory.length} записей в истории защиты`}
          />

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Stats */}
            <View style={styles.statsRow}>
              {[
                { num: threatHistory.filter(e => e.type === 'manual').length, label: 'SOS', icon: '🚨', color: Colors.rose },
                { num: threatHistory.filter(e => e.level === 'high').length, label: 'Угрозы', icon: '⚠️', color: Colors.warning },
                { num: trustedContacts.length, label: 'Контакты', icon: '👥', color: Colors.mint },
              ].map((s, i) => (
                <GlassCard key={i} style={styles.statCard} accentColor={s.color}>
                  <View style={styles.statInner}>
                    <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                    <Text style={styles.statNum}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                </GlassCard>
              ))}
            </View>

            {/* Monitoring badge */}
            {isMonitoring && (
              <GlassCard style={styles.sessionCard} accentColor={Colors.lavender}>
                <View style={styles.sessionRow}>
                  <Text style={{ fontSize: 26 }}>👁️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sessionTitle}>Сессия мониторинга активна</Text>
                    <Text style={styles.sessionSub}>ИИ анализирует звуки окружения</Text>
                  </View>
                  <StatusBadge label="Активно" color={Colors.lavender} />
                </View>
              </GlassCard>
            )}

            {/* Events */}
            {threatHistory.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 60 }}>📋</Text>
                <Text style={styles.emptyTitle}>Журнал пуст</Text>
                <Text style={styles.emptyDesc}>
                  Здесь появятся SOS-сигналы, обнаруженные угрозы и сессии мониторинга
                </Text>
              </View>
            ) : (
              <>
                <SectionTitle label="Последние события" />
                {threatHistory.map(e => {
                  const cfg = EVENT_CFG[e.type];
                  return (
                    <GlassCard key={e.id} style={styles.eventCard} accentColor={cfg.color}>
                      <View style={styles.eventRow}>
                        <View style={[styles.eventIconCircle, { backgroundColor: `${cfg.color}18` }]}>
                          <Text style={{ fontSize: 22 }}>{cfg.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.eventTitle}>{cfg.label}</Text>
                          <Text style={styles.eventTime}>{fmt(e.timestamp)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <View style={[styles.levelTag, { backgroundColor: `${LEVEL_COLOR[e.level]}18` }]}>
                            <Text style={[styles.levelText, { color: LEVEL_COLOR[e.level] }]}>
                              {LEVEL_LABEL[e.level]}
                            </Text>
                          </View>
                          {e.resolved && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                              <Ionicons name="checkmark-circle" size={13} color={Colors.mint} />
                              <Text style={{ fontSize: 10, color: Colors.mint }}>Снято</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </GlassCard>
                  );
                })}
              </>
            )}

            {/* Tips */}
            <SectionTitle label="Советы безопасности" />
            {TIPS.map((tip, i) => (
              <GlassCard key={i} style={styles.tipCard}>
                <View style={styles.tipRow}>
                  <Text style={{ fontSize: 22 }}>{tip.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipTitle}>{tip.t}</Text>
                    <Text style={styles.tipDesc}>{tip.d}</Text>
                  </View>
                </View>
              </GlassCard>
            ))}

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
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
