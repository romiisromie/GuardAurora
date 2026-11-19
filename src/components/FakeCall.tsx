import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Vibration, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from './ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';
import { playLoop, stopLoop, RINGTONE } from '../lib/sound';

const DELAYS = [5, 15, 30, 60];
const RING_PATTERN = [0, 900, 1100];

type Stage = 'idle' | 'waiting' | 'ringing' | 'talking';

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Pretend incoming call, to have a reason to step away. The setup sheet opens from `setupOpen`;
 * the countdown keeps running after it closes, with a small pill to cancel it.
 */
export function FakeCall({ setupOpen, onCloseSetup }: { setupOpen: boolean; onCloseSetup: () => void }) {
  const { t } = useLanguage();
  const [caller, setCaller] = useState('');
  const [delay, setDelay] = useState(15);
  const [stage, setStage] = useState<Stage>('idle');
  const [left, setLeft] = useState(0);
  const [talkSeconds, setTalkSeconds] = useState(0);
  const callerName = caller.trim() || t('Мама');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => clearTimer, []);

  const start = () => {
    onCloseSetup();
    setStage('waiting');
    setLeft(delay);
    clearTimer();
    const ringAt = Date.now() + delay * 1000;
    timer.current = setInterval(() => {
      const remaining = Math.ceil((ringAt - Date.now()) / 1000);
      if (remaining <= 0) {
        clearTimer();
        setStage('ringing');
      } else {
        setLeft(remaining);
      }
    }, 250);
  };

  const cancel = () => {
    clearTimer();
    setStage('idle');
  };

  // Ringtone and vibration only while ringing.
  useEffect(() => {
    if (stage !== 'ringing') return;
    let cancelled = false;
    let player: Awaited<ReturnType<typeof playLoop>> = null;
    void playLoop(RINGTONE).then(p => {
      if (cancelled) stopLoop(p);
      else player = p;
    });
    if (Platform.OS !== 'web') Vibration.vibrate(RING_PATTERN, true);
    return () => {
      cancelled = true;
      stopLoop(player);
      Vibration.cancel();
    };
  }, [stage]);

  // Call duration while "talking".
  useEffect(() => {
    if (stage !== 'talking') return;
    setTalkSeconds(0);
    const started = Date.now();
    const id = setInterval(() => setTalkSeconds(Math.floor((Date.now() - started) / 1000)), 500);
    return () => clearInterval(id);
  }, [stage]);

  const onCall = stage === 'ringing' || stage === 'talking';

  return (
    <>
      <Modal visible={setupOpen} transparent animationType="slide" onRequestClose={onCloseSetup}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{t('Ложный звонок')}</Text>
            <Text style={styles.sheetText}>
              {t('Телефон «зазвонит» через выбранное время — будет повод отойти или закончить разговор. Не сворачивайте приложение.')}
            </Text>

            <Text style={styles.label}>{t('Кто звонит')}</Text>
            <TextInput
              style={styles.input}
              value={caller}
              onChangeText={setCaller}
              placeholder={t('Мама')}
              placeholderTextColor={Colors.textMuted}
              maxLength={40}
              accessibilityLabel={t('Кто звонит')}
            />

            <Text style={styles.label}>{t('Через сколько')}</Text>
            <View style={styles.chips}>
              {DELAYS.map(seconds => (
                <TouchableOpacity
                  key={seconds}
                  onPress={() => setDelay(seconds)}
                  style={[styles.chip, delay === seconds && styles.chipActive]}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: delay === seconds }}
                >
                  <Text style={[styles.chipText, delay === seconds && styles.chipTextActive]}>
                    {seconds < 60 ? `${seconds} ${t('сек')}` : `1 ${t('мин')}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <GradientButton label={t('Запустить')} onPress={start} size="lg" style={{ alignSelf: 'stretch' }} />
            <TouchableOpacity onPress={onCloseSetup} style={styles.secondary} accessibilityRole="button">
              <Text style={styles.secondaryText}>{t('Отмена')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {stage === 'waiting' ? (
        <View style={styles.pill} accessibilityLiveRegion="polite">
          <Ionicons name="call" size={16} color="#FFFFFF" />
          <Text style={styles.pillText}>{t('Звонок через')} {left} {t('сек')}</Text>
          <TouchableOpacity onPress={cancel} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('Отменить ложный звонок')}>
            <Text style={styles.pillCancel}>{t('Отменить')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <Modal visible={onCall} animationType="slide" onRequestClose={cancel} statusBarTranslucent>
        <View style={styles.callScreen}>
          <View style={styles.callTop}>
            <View style={styles.callAvatar}>
              <Text style={styles.callInitial}>{callerName.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.callName} numberOfLines={1}>{callerName}</Text>
            <Text style={styles.callSub}>{stage === 'talking' ? formatClock(talkSeconds) : t('мобильный')}</Text>
          </View>

          {stage === 'ringing' ? (
            <View style={styles.callButtons}>
              <View style={styles.callAction}>
                <TouchableOpacity onPress={cancel} style={[styles.round, { backgroundColor: '#E5383B' }]} accessibilityRole="button" accessibilityLabel={t('Отклонить')}>
                  <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.roundLabel}>{t('Отклонить')}</Text>
              </View>
              <View style={styles.callAction}>
                <TouchableOpacity onPress={() => setStage('talking')} style={[styles.round, { backgroundColor: '#2DBE60' }]} accessibilityRole="button" accessibilityLabel={t('Ответить')}>
                  <Ionicons name="call" size={32} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.roundLabel}>{t('Ответить')}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.callButtons}>
              <View style={styles.callAction}>
                <TouchableOpacity onPress={cancel} style={[styles.round, { backgroundColor: '#E5383B' }]} accessibilityRole="button" accessibilityLabel={t('Завершить')}>
                  <Ionicons name="call" size={32} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
                <Text style={styles.roundLabel}>{t('Завершить')}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.bgElevated, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingBottom: Spacing.xl,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.white },
  sheetText: { fontSize: 14, lineHeight: 20, color: Colors.textSecondary, marginTop: Spacing.sm },
  label: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  input: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md, paddingVertical: 13, fontSize: 16, color: Colors.white,
  },
  chips: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  chip: {
    minHeight: 44, paddingHorizontal: 18, borderRadius: Radius.full, justifyContent: 'center',
    backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.lavenderGlow, borderColor: Colors.lavender },
  chipText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: Colors.lavender },
  secondary: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  secondaryText: { fontSize: 15, fontWeight: '600', color: Colors.textMuted },
  pill: {
    position: 'absolute', left: Spacing.lg, right: Spacing.lg, bottom: 96,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1D2721', borderRadius: Radius.full, paddingHorizontal: 18, paddingVertical: 12,
  },
  pillText: { flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  pillCancel: { color: '#9FF0C4', fontSize: 14, fontWeight: '700' },
  callScreen: { flex: 1, backgroundColor: '#15191C', justifyContent: 'space-between', paddingTop: 120, paddingBottom: 72 },
  callTop: { alignItems: 'center', gap: 10, paddingHorizontal: Spacing.lg },
  callAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#3A4148', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  callInitial: { fontSize: 40, fontWeight: '600', color: '#FFFFFF' },
  callName: { fontSize: 34, fontWeight: '500', color: '#FFFFFF' },
  callSub: { fontSize: 17, color: '#B9C0C6' },
  callButtons: { flexDirection: 'row', justifyContent: 'space-evenly' },
  callAction: { alignItems: 'center', gap: 10 },
  round: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  roundLabel: { color: '#FFFFFF', fontSize: 14 },
});
