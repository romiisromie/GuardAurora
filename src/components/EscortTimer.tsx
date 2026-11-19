import React, { useCallback, useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard, GradientButton } from './ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';
import { captureException } from '../lib/monitoring';

const ESCORT_KEY = 'ga.escort';
const DURATIONS = [15, 30, 45, 60];
const EXTEND_MIN = 10;

interface EscortState { endsAt: number; notificationId: string | null }

// While the app is open the card on the home screen says the same thing, so no banner then.
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
    }),
  });
}

function formatLeft(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h ? m.toString().padStart(2, '0') : m.toString();
  return `${h ? `${h}:` : ''}${mm}:${s.toString().padStart(2, '0')}`;
}

/**
 * "Walk me home" timer. Saved on the device, so it survives the app being closed; a local
 * notification fires when time is up. Nothing is sent to anyone unless the user chooses to.
 */
export function EscortTimer({ sheetOpen, onCloseSheet, onMessageContacts }: {
  sheetOpen: boolean;
  onCloseSheet: () => void;
  onMessageContacts: () => void;
}) {
  const { t } = useLanguage();
  const [escort, setEscort] = useState<EscortState | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    AsyncStorage.getItem(ESCORT_KEY)
      .then(raw => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as EscortState;
        if (Number.isFinite(parsed?.endsAt)) setEscort(parsed);
      })
      .catch(error => captureException(error, 'escort-load'));
  }, []);

  useEffect(() => {
    if (!escort) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [escort]);

  const save = useCallback((next: EscortState | null) => {
    setEscort(next);
    setNow(Date.now());
    (next ? AsyncStorage.setItem(ESCORT_KEY, JSON.stringify(next)) : AsyncStorage.removeItem(ESCORT_KEY))
      .catch(error => captureException(error, 'escort-save'));
  }, []);

  const schedule = useCallback(async (endsAt: number) => {
    if (Platform.OS === 'web') return null;
    try {
      const permission = await Notifications.requestPermissionsAsync();
      if (!permission.granted) return null;
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: t('Вы добрались?'),
          body: t('Время таймера вышло. Откройте GuardAurora, чтобы отметиться или написать близким.'),
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(endsAt) },
      });
    } catch (error) {
      captureException(error, 'escort-notify');
      return null;
    }
  }, [t]);

  const unschedule = (id: string | null) => {
    if (id) void Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
  };

  const start = async (minutes: number) => {
    onCloseSheet();
    const endsAt = Date.now() + minutes * 60 * 1000;
    save({ endsAt, notificationId: null });
    const notificationId = await schedule(endsAt);
    save({ endsAt, notificationId });
  };

  const extend = async () => {
    if (!escort) return;
    unschedule(escort.notificationId);
    const endsAt = Math.max(escort.endsAt, Date.now()) + EXTEND_MIN * 60 * 1000;
    save({ endsAt, notificationId: null });
    const notificationId = await schedule(endsAt);
    save({ endsAt, notificationId });
  };

  const finish = () => {
    if (escort) unschedule(escort.notificationId);
    save(null);
  };

  const left = escort ? escort.endsAt - now : 0;
  const expired = !!escort && left <= 0;

  return (
    <>
      {escort ? (
        <GlassCard style={[styles.card, expired && styles.cardExpired]}>
          <View style={styles.pad} accessibilityLiveRegion={expired ? 'assertive' : 'none'}>
            <View style={styles.row}>
              <Ionicons name={expired ? 'alert-circle' : 'walk'} size={22} color={expired ? Colors.danger : Colors.lavender} />
              <Text style={styles.title}>{expired ? t('Время вышло. Вы добрались?') : t('Проводи меня')}</Text>
            </View>
            {expired ? (
              <Text style={styles.text}>{t('Если всё хорошо — отметьтесь. Если нет — напишите близким, где вы.')}</Text>
            ) : (
              <Text style={styles.left} accessibilityLabel={`${t('Осталось')} ${formatLeft(left)}`}>{formatLeft(left)}</Text>
            )}
            <View style={styles.actions}>
              {expired ? (
                <>
                  <GradientButton label={t('Написать близким')} onPress={onMessageContacts} colors={Colors.gradDanger} style={styles.flex} />
                  <GradientButton label={t('Я на месте')} onPress={finish} colors={Colors.gradMint} style={styles.flex} />
                </>
              ) : (
                <>
                  <GradientButton label={`+${EXTEND_MIN} ${t('мин')}`} onPress={() => { void extend(); }} colors={Colors.gradDark} style={styles.flex} />
                  <GradientButton label={t('Я на месте')} onPress={finish} colors={Colors.gradMint} style={styles.flex} />
                </>
              )}
            </View>
          </View>
        </GlassCard>
      ) : null}

      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={onCloseSheet}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('Проводи меня')}</Text>
            <Text style={styles.sheetText}>
              {t('Выберите, сколько примерно займёт дорога. Если не отметитесь «Я на месте» вовремя, телефон напомнит и предложит написать близким, где вы.')}
            </Text>
            <View style={styles.chips}>
              {DURATIONS.map(minutes => (
                <TouchableOpacity
                  key={minutes}
                  onPress={() => { void start(minutes); }}
                  style={styles.chip}
                  accessibilityRole="button"
                  accessibilityLabel={`${t('Запустить таймер на')} ${minutes} ${t('мин')}`}
                >
                  <Text style={styles.chipText}>{minutes} {t('мин')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={onCloseSheet} style={styles.secondary} accessibilityRole="button">
              <Text style={styles.secondaryText}>{t('Отмена')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.lg },
  cardExpired: { borderColor: Colors.danger, backgroundColor: Colors.dangerGlow },
  pad: { padding: Spacing.lg, gap: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontSize: 16, fontWeight: '800', color: Colors.white },
  text: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary },
  left: { fontSize: 36, fontWeight: '800', color: Colors.white, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bgElevated, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  sheetText: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginVertical: Spacing.lg },
  chip: {
    minHeight: 52, minWidth: 72, paddingHorizontal: 18, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.lavenderGlow, borderWidth: 1, borderColor: Colors.lavender,
  },
  chipText: { fontSize: 16, fontWeight: '700', color: Colors.lavender },
  secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
});
