import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Vibration, Image, Platform, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { useShakeDetector } from '../hooks/useShakeDetector';
import {
  GlassCard,
  PulseRing,
  ThreatMeter,
  GradientButton,
  SectionTitle,
} from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';
import { showAlert } from '../lib/dialog';

const LOGO = require('../../assets/guardaurora-symbol.png');

/** Header background per app state: green = ready, teal = monitoring, red = SOS. */
const HEADER_COLOR = { safe: Colors.lavender, monitoring: '#0F6E7A', alert: Colors.warning, sos: Colors.danger } as const;

export default function HomeScreen() {
  const { t, locale } = useLanguage();
  const {
    status, isMonitoring, sosActive, soundLevel,
    trustedContacts, threatHistory, toggleMonitoring, activateSOS, deactivateSOS,
  } = useApp();

  const { hasPermission: microphoneGranted, requestPermission } = useAudioMonitor();
  useShakeDetector();

  const navigation = useNavigation<any>();
  const [countdown, setCountdown] = useState<number | null>(null);
  const measuringSound = isMonitoring && !sosActive;
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => () => {
    if (countRef.current) clearInterval(countRef.current);
  }, []);

  const cancelCountdown = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
      countRef.current = null;
    }
    setCountdown(null);
  };

  const handleSOS = () => {
    if (sosActive) {
      showAlert(t('Остановить SOS?'), t('Локальный режим SOS будет выключен.'), [
        { text: t('Отмена'), style: 'cancel' },
        { text: t('Остановить'), style: 'destructive', onPress: deactivateSOS },
      ]);
      return;
    }

    if (countRef.current) return;

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
      // Shake SOS remains available even when optional microphone access is declined.
      await requestPermission();
    }
    toggleMonitoring();
  };

  const callTrustedContact = async () => {
    const contact = trustedContacts[0];
    if (!contact) return;
    try {
      await Linking.openURL(`tel:${contact.phone}`);
    } catch {
      showAlert(t('Звонок недоступен'), t('Не удалось открыть приложение телефона.'));
    }
  };

  const statusCfg = {
    safe: {
      label: t('Готовность'),
      color: Colors.mint,
      ring: Colors.mint,
      summary: t('Можно включить локальный мониторинг, отметить SOS и позвонить контакту вручную.'),
    },
    monitoring: {
      label: t('Мониторинг включён'),
      color: Colors.lavender,
      ring: Colors.lavender,
      summary: microphoneGranted
        ? t('Пока приложение открыто, локально измеряется общий уровень звука. Геолокация — только по запросу.')
        : t('Мониторинг включён без доступа к микрофону. Тихий SOS работает при открытом приложении; координаты — по запросу.'),
    },
    alert: {
      label: t('Обнаружен риск'),
      color: Colors.warning,
      ring: Colors.warning,
      summary: t('Высокий уровень звука обнаружен локальным измерителем. Это не определение угрозы.'),
    },
    sos: {
      label: t('Экстренный режим'),
      color: Colors.danger,
      ring: Colors.danger,
      summary: t('SOS-событие записано в журнале на устройстве. Контакты и службы не уведомляются.'),
    },
  } as const;

  const cfg = statusCfg[status];
  const recentIncidents = threatHistory.slice(0, 3);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={[styles.brandHeader, { backgroundColor: HEADER_COLOR[status] }]}>
              <View style={[styles.glow, styles.glowTop]} />
              <View style={[styles.glow, styles.glowBottom]} />
              <View style={styles.brandRow}>
                <View style={styles.brandLogoWrap}>
                  <Image source={LOGO} style={styles.brandLogo} resizeMode="contain" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.brandTitle} numberOfLines={1}>GuardAurora</Text>
                  <View style={styles.brandStatus} accessibilityLabel={cfg.label}>
                    <View style={[styles.brandStatusDot, { backgroundColor: sosActive ? '#FFB3BC' : '#9FF0C4' }]} />
                    <Text style={styles.brandStatusText}>{cfg.label}</Text>
                  </View>
                </View>
              </View>
            </View>

            <GlassCard style={styles.heroCard}>
              <View style={styles.sosSection}>
                <TouchableOpacity
                  onPress={handleSOS}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={sosActive ? t('Остановить локальный режим SOS') : t('Запустить локальный SOS')}
                  accessibilityHint={sosActive ? t('Попросит подтвердить остановку') : t('Запускает трёхсекундный отсчёт')}
                >
                  <PulseRing color={Colors.danger} size={150} active={sosActive || countdown !== null}>
                    {countdown !== null ? (
                      <Text style={styles.countdownNum}>{countdown}</Text>
                    ) : (
                      <View style={styles.shieldInner}>
                        <Ionicons name={sosActive ? 'stop-circle' : 'warning'} size={34} color="#FFFFFF" />
                        <Text style={styles.sosLabel}>{sosActive ? t('Остановить SOS') : 'SOS'}</Text>
                      </View>
                    )}
                  </PulseRing>
                </TouchableOpacity>
                <Text style={styles.sosNote}>
                  {sosActive ? t('SOS отмечен в журнале на устройстве') : t('SOS не вызывает службы и не отправляет сообщения')}
                </Text>

                {countdown !== null ? (
                  <TouchableOpacity style={styles.cancelBtn} onPress={cancelCountdown}>
                    <Text style={styles.cancelText}>{t('Отменить запуск')}</Text>
                  </TouchableOpacity>
                ) : null}
                {sosActive && trustedContacts[0] ? (
                  <GradientButton
                    label={`${t('Позвонить:')} ${trustedContacts[0].name}`}
                    onPress={callTrustedContact}
                    colors={Colors.gradMint}
                    size="md"
                    style={{ marginTop: Spacing.md, alignSelf: 'stretch' }}
                  />
                ) : null}
              </View>
            </GlassCard>

            <View style={styles.quickRow}>
              {trustedContacts.slice(0, 4).map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.quickItem}
                  onPress={() => { void Linking.openURL(`tel:${contact.phone}`).catch(() => showAlert(t('Звонок недоступен'), t('Не удалось открыть приложение телефона.'))); }}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('Позвонить')} ${contact.name}`}
                >
                  <View style={styles.quickAvatar}>
                    <Text style={styles.quickInitial}>{contact.name.trim().charAt(0).toUpperCase()}</Text>
                    <View style={styles.quickBadge}><Ionicons name="call" size={11} color="#FFFFFF" /></View>
                  </View>
                  <Text style={styles.quickName} numberOfLines={1}>{contact.name.trim().split(/\s+/)[0]}</Text>
                </TouchableOpacity>
              ))}
              {trustedContacts.length < 4 ? (
                <TouchableOpacity style={styles.quickItem} onPress={() => navigation.navigate('Contacts')} accessibilityRole="button" accessibilityLabel={t('+ Добавить контакт')}>
                  <View style={[styles.quickAvatar, styles.quickAdd]}>
                    <Ionicons name="add" size={24} color={Colors.lavender} />
                  </View>
                  <Text style={styles.quickName} numberOfLines={1}>{t('Добавить')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <GradientButton
              label={isMonitoring ? t('Остановить мониторинг') : t('Запустить мониторинг')}
              onPress={handleToggleMonitor}
              colors={isMonitoring ? Colors.gradDark : Colors.gradPrimary}
              style={styles.primaryAction}
              size="lg"
            />

            {measuringSound ? (
              <GlassCard style={styles.card}>
                <View style={styles.cardPad}>
                  <SectionTitle label={t('Уровень окружающего звука')} />
                  {microphoneGranted ? <ThreatMeter score={soundLevel} /> : <Text style={styles.cardSub}>{t('Нет доступа к микрофону')}</Text>}
                  <Text style={[styles.cardSub, { marginTop: Spacing.md }]}>{t('Тихий SOS: готов')}</Text>
                </View>
              </GlassCard>
            ) : null}

            <GlassCard style={styles.card}>
              <View style={styles.cardPad}>
                <SectionTitle label={t('Последняя активность')} />
                {recentIncidents.length === 0 ? (
                  <Text style={styles.emptyText}>{t('Пока событий нет.')}</Text>
                ) : (
                  recentIncidents.map((event) => (
                    <View key={event.id} style={styles.eventRow}>
                      <View style={styles.eventIcon}>
                        <Ionicons
                          name={event.type === 'manual' ? 'warning' : event.type === 'shake' ? 'phone-portrait' : 'volume-high'}
                          size={16}
                          color={Colors.danger}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.eventTitle}>
                          {t(event.type === 'manual' ? 'Ручной SOS' : event.type === 'shake' ? 'Тихий SOS' : 'Измерение звука')}
                        </Text>
                        <Text style={styles.eventMeta}>
                          {new Date(event.timestamp).toLocaleString(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                      {event.resolved ? <Ionicons name="checkmark-circle" size={16} color={Colors.mint} /> : null}
                    </View>
                  ))
                )}
              </View>
            </GlassCard>
          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 130 },
  brandHeader: {
    backgroundColor: Colors.lavender, borderRadius: Radius.xl, overflow: 'hidden',
    padding: Spacing.lg, marginBottom: Spacing.lg,
  },
  glow: { position: 'absolute', borderRadius: 999 },
  glowTop: { width: 220, height: 220, top: -120, right: -60, backgroundColor: 'rgba(159,240,196,0.22)' },
  glowBottom: { width: 180, height: 180, bottom: -110, left: -50, backgroundColor: 'rgba(0,0,0,0.14)' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandLogoWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandLogo: { width: 34, height: 34 },
  brandEyebrow: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.78)', letterSpacing: 0.3 },
  brandTitle: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.4, marginTop: 1 },
  brandStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', marginTop: 6,
    backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 6,
  },
  brandStatusDot: { width: 7, height: 7, borderRadius: 4 },
  brandStatusText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  brandSummary: { fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.9)', marginTop: Spacing.md },
  heroCard: { marginBottom: Spacing.lg },
  sosNote: { fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.md },
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
  sosSection: { alignItems: 'center', padding: Spacing.lg },
  shieldInner: { alignItems: 'center', gap: 6 },
  sosLabel: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5 },
  sosSubLabel: { fontSize: 10, color: 'rgba(255,255,255,0.9)', textAlign: 'center', maxWidth: 116, lineHeight: 14 },
  countdownNum: { fontSize: 56, fontWeight: '800', color: '#FFFFFF', lineHeight: 62 },
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
    backgroundColor: Colors.bgCardLight,
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
  quickRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.lg },
  quickItem: { width: 68, alignItems: 'center', gap: 6 },
  quickAvatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.lavenderGlow,
    borderWidth: 1, borderColor: `${Colors.lavender}40`, alignItems: 'center', justifyContent: 'center',
  },
  quickAdd: { backgroundColor: Colors.bgCard, borderStyle: 'dashed', borderColor: Colors.borderStrong },
  quickInitial: { fontSize: 20, fontWeight: '700', color: Colors.lavender },
  quickBadge: {
    position: 'absolute', right: -2, bottom: -2, width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.mint, borderWidth: 2, borderColor: Colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  quickName: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, maxWidth: 68 },
  quickActionRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  quickAction: {
    flex: 1,
    backgroundColor: Colors.bgCardLight,
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
