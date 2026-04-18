import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Alert, Vibration, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { useLocation } from '../hooks/useLocation';
import { useShakeDetector } from '../hooks/useShakeDetector';
import {
  GlassCard,
  PulseRing,
  SoundWave,
  StatusBadge,
  ThreatMeter,
  GradientButton,
  ScreenHeader,
  SectionTitle,
} from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

const LOGO = require('../../assets/logo.png');

export default function HomeScreen() {
  const {
    status, isMonitoring, sosActive, soundLevel, threatScore,
    trustedContacts, threatHistory, toggleMonitoring, activateSOS, deactivateSOS,
  } = useApp();

  const { requestPermission } = useAudioMonitor();
  const { requestPermission: requestLocation } = useLocation();
  useShakeDetector();

  const [countdown, setCountdown] = useState<number | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sosScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (sosActive) {
      const a = Animated.loop(Animated.sequence([
        Animated.timing(sosScale, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(sosScale, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]));
      a.start();
      return () => a.stop();
    }
    sosScale.setValue(1);
  }, [sosActive, sosScale]);

  const cancelCountdown = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setCountdown(null);
  };

  const handleSOS = () => {
    if (sosActive) {
      Alert.alert('Остановить SOS?', 'Запись и отправка экстренного сигнала будут остановлены.', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Остановить', style: 'destructive', onPress: deactivateSOS },
      ]);
      return;
    }

    setCountdown(3);
    let c = 3;
    countRef.current = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(countRef.current!);
        countRef.current = null;
        setCountdown(null);
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 160, 90, 160]);
        }
        activateSOS();
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  const handleToggleMonitor = async () => {
    if (!isMonitoring) {
      await requestPermission();
      await requestLocation();
    }
    toggleMonitoring();
  };

  const statusCfg = {
    safe: {
      label: 'Под защитой',
      color: Colors.mint,
      ring: Colors.mint,
      summary: 'Система готова. Экстренный сигнал и доверенные контакты доступны.',
    },
    monitoring: {
      label: 'Фоновый мониторинг',
      color: Colors.lavender,
      ring: Colors.lavender,
      summary: 'Микрофон и геолокация работают в фоне, окружение анализируется.',
    },
    alert: {
      label: 'Обнаружен риск',
      color: Colors.warning,
      ring: Colors.warning,
      summary: 'GuardAurora заметил аномалию и усилил отслеживание обстановки.',
    },
    sos: {
      label: 'Экстренный режим',
      color: Colors.danger,
      ring: Colors.danger,
      summary: 'SOS активирован. Идёт запись, доверенные контакты уведомляются.',
    },
  } as const;

  const cfg = statusCfg[status];
  const recentIncidents = threatHistory.slice(0, 3);

  return (
    <LinearGradient colors={['#07111f', '#09172a', '#07111f']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScreenHeader
            eyebrow="Центр безопасности"
            title="GuardAurora"
            subtitle={cfg.summary}
            right={<StatusBadge label={cfg.label} color={cfg.color} />}
          />

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <GlassCard style={styles.heroCard} accentColor={cfg.color}>
              <LinearGradient colors={['rgba(255,255,255,0.03)', 'rgba(255,255,255,0)']} style={styles.heroPad}>
                <View style={styles.heroTopRow}>
                  <View style={styles.heroBrand}>
                    <View style={styles.logoWrap}>
                      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.heroTitle}>Экстренная защита</Text>
                      <Text style={styles.heroSubtitle}>Один тап для SOS, три встряхивания для тихого сигнала.</Text>
                    </View>
                  </View>
                  <View style={[styles.livePill, { borderColor: `${cfg.color}55`, backgroundColor: `${cfg.color}14` }]}>
                    <View style={[styles.liveDot, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.liveText, { color: cfg.color }]}>АКТИВНО</Text>
                  </View>
                </View>

                <View style={styles.sosSection}>
                  <TouchableOpacity onPress={handleSOS} activeOpacity={0.9}>
                    <Animated.View style={{ transform: [{ scale: sosScale }] }}>
                      <PulseRing color={cfg.ring} size={220} active={isMonitoring || sosActive}>
                        {countdown !== null ? (
                          <Text style={styles.countdownNum}>{countdown}</Text>
                        ) : (
                          <View style={styles.shieldInner}>
                            <Ionicons name={sosActive ? 'stop-circle' : 'warning'} size={34} color={cfg.color} />
                            <Text style={styles.sosLabel}>{sosActive ? 'Остановить SOS' : 'Удерживайте для SOS'}</Text>
                            <Text style={styles.sosSubLabel}>
                              {sosActive ? 'Запись и уведомление активны' : 'Нажмите при реальной угрозе'}
                            </Text>
                          </View>
                        )}
                      </PulseRing>
                    </Animated.View>
                  </TouchableOpacity>

                  {countdown !== null ? (
                    <TouchableOpacity style={styles.cancelBtn} onPress={cancelCountdown}>
                      <Text style={styles.cancelText}>Отменить запуск</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View style={styles.metricRow}>
                  <MetricCard label="Контакты" value={String(trustedContacts.length)} hint="получат сигнал" icon="people-outline" />
                  <MetricCard label="Риск" value={`${threatScore}%`} hint="текущий индекс" icon="pulse-outline" />
                  <MetricCard label="События" value={String(threatHistory.length)} hint="в журнале" icon="time-outline" />
                </View>
              </LinearGradient>
            </GlassCard>

            <GradientButton
              label={isMonitoring ? 'Остановить мониторинг' : 'Запустить мониторинг'}
              onPress={handleToggleMonitor}
              colors={isMonitoring ? Colors.gradDark : Colors.gradPrimary}
              style={styles.primaryAction}
              size="lg"
            />

            <View style={styles.quickActionRow}>
              <QuickAction icon="mic-outline" label={isMonitoring ? 'Микрофон активен' : 'Микрофон выключен'} color={Colors.rose} />
              <QuickAction icon="navigate-outline" label="GPS готовность" color={Colors.cyan} />
              <QuickAction icon="flash-outline" label="Тихий SOS" color={Colors.gold} />
            </View>

            <GlassCard style={styles.card}>
              <View style={styles.cardPad}>
                <SectionTitle label="Анализ угрозы" />
                <ThreatMeter score={threatScore} />
                <View style={styles.audioBlock}>
                  <View>
                    <Text style={styles.cardTitle}>Акустическая обстановка</Text>
                    <Text style={styles.cardSub}>
                      {isMonitoring
                        ? 'ИИ отслеживает резкие крики, удары и стрессовые шумовые паттерны.'
                        : 'Включите мониторинг, чтобы анализ звука работал автоматически.'}
                    </Text>
                  </View>
                  <SoundWave level={soundLevel} color={threatScore >= 80 ? Colors.danger : Colors.lavender} />
                </View>
              </View>
            </GlassCard>

            <View style={styles.dualRow}>
              <GlassCard style={[styles.sideCard, styles.guidanceCard]}>
                <View style={styles.cardPad}>
                  <SectionTitle label="Протокол действий" />
                  {[
                    'Откройте карту и двигайтесь к людному месту.',
                    'При угрозе удерживайте SOS до окончания отсчёта.',
                    'Используйте встряхивание телефона для тихого сигнала.',
                  ].map((item) => (
                    <View key={item} style={styles.bulletRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </GlassCard>

              <GlassCard style={styles.sideCard}>
                <View style={styles.cardPad}>
                  <SectionTitle label="Готовность системы" />
                  <ReadinessRow label="Доверенные контакты" value={trustedContacts.length > 0 ? 'Настроено' : 'Не настроено'} good={trustedContacts.length > 0} />
                  <ReadinessRow label="Фоновый контроль" value={isMonitoring ? 'В сети' : 'Отключен'} good={isMonitoring} />
                  <ReadinessRow label="Экстренная запись" value={sosActive ? 'Идет запись' : 'Ожидание'} good />
                </View>
              </GlassCard>
            </View>

            <GlassCard style={styles.card}>
              <View style={styles.cardPad}>
                <SectionTitle label="Последняя активность" />
                {recentIncidents.length === 0 ? (
                  <Text style={styles.emptyText}>Пока событий нет. Это хороший знак: система в режиме готовности.</Text>
                ) : (
                  recentIncidents.map((event) => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={styles.eventIcon}>
                        <Ionicons
                          name={event.type === 'manual' ? 'warning' : event.type === 'shake' ? 'phone-portrait' : 'volume-high'}
                          size={16}
                          color={event.level === 'high' ? Colors.danger : event.level === 'medium' ? Colors.warning : Colors.mint}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>
                          {event.type === 'manual' ? 'Ручной SOS' : event.type === 'shake' ? 'Тихий SOS' : 'Аудио событие'}
                        </Text>
                        <Text style={styles.eventMeta}>
                          {new Date(event.timestamp).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      <Text style={[
                        styles.eventBadge,
                        { color: event.level === 'high' ? Colors.danger : event.level === 'medium' ? Colors.warning : Colors.mint },
                      ]}>
                        {event.level.toUpperCase()}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </GlassCard>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.metricCard}>
      <Ionicons name={icon} size={16} color={Colors.textSecondary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricHint}>{hint}</Text>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.quickAction}>
      <View style={[styles.quickIcon, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.quickText}>{label}</Text>
    </View>
  );
}

function ReadinessRow({ label, value, good }: { label: string; value: string; good: string | boolean }) {
  const ok = Boolean(good);
  return (
    <View style={styles.readinessRow}>
      <Text style={styles.readinessLabel}>{label}</Text>
      <Text style={[styles.readinessValue, { color: ok ? Colors.mint : Colors.warning }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 130 },
  heroCard: { marginBottom: Spacing.lg },
  heroPad: { padding: Spacing.lg },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  heroBrand: { flex: 1, flexDirection: 'row', gap: 12 },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: Colors.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logo: { width: 34, height: 34 },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.white },
  heroSubtitle: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18, marginTop: 4 },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  sosSection: { alignItems: 'center', marginBottom: Spacing.lg },
  shieldInner: { alignItems: 'center', gap: 6 },
  sosLabel: { fontSize: 16, fontWeight: '800', color: Colors.white },
  sosSubLabel: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', maxWidth: 110, lineHeight: 15 },
  countdownNum: { fontSize: 56, fontWeight: '900', color: Colors.danger, lineHeight: 62 },
  cancelBtn: {
    marginTop: Spacing.md,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.rose,
    backgroundColor: Colors.roseGlow,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  cancelText: { color: Colors.rose, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 3,
  },
  metricValue: { fontSize: 20, fontWeight: '800', color: Colors.white, marginTop: 8 },
  metricLabel: { fontSize: 12, fontWeight: '700', color: Colors.white },
  metricHint: { fontSize: 11, color: Colors.textMuted },
  primaryAction: { marginBottom: Spacing.lg },
  quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  quickAction: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 10,
  },
  quickIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, lineHeight: 17 },
  card: { marginBottom: Spacing.lg },
  cardPad: { padding: Spacing.lg },
  audioBlock: { marginTop: Spacing.md, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.white },
  cardSub: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginTop: 3 },
  dualRow: { flexDirection: 'column', gap: 10, marginBottom: Spacing.lg },
  sideCard: { flex: 1 },
  guidanceCard: { minHeight: 170 },
  bulletRow: { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mint,
    marginTop: 5,
  },
  bulletText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 18 },
  readinessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  readinessLabel: { fontSize: 13, color: Colors.textSecondary },
  readinessValue: { fontSize: 13, fontWeight: '700' },
  emptyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.bgGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  eventMeta: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  eventBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
});
