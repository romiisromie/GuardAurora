import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from './ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';

const ONBOARDED_KEY = 'ga.onboarded';

const STEPS = [
  {
    icon: 'warning',
    color: Colors.danger,
    title: 'Кнопка SOS',
    body: 'Нажмите SOS — пойдёт отсчёт 3 секунды, его можно отменить. Потом появятся кнопки: звонок 112 и сообщение близким с вашим местом на карте.',
  },
  {
    icon: 'people',
    color: Colors.lavender,
    title: 'Свои люди',
    body: 'Добавьте одного-двух человек, которым доверяете. Им можно будет позвонить или написать в одно касание.',
  },
  {
    icon: 'phone-portrait',
    color: Colors.cyan,
    title: 'Если трогать экран нельзя',
    body: 'Включите мониторинг. Пока приложение открыто, три резких встряхивания телефона запустят SOS без звука.',
  },
] as const;

/** First-launch walkthrough. Shown once; skipping counts as seen. */
export function Onboarding({ onAddContact }: { onAddContact: () => void }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY)
      .then(value => { if (!value) setVisible(true); })
      .catch(() => undefined);
  }, []);

  const close = () => {
    setVisible(false);
    AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => undefined);
  };

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <TouchableOpacity onPress={close} style={styles.skip} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.skipText}>{t('Пропустить')}</Text>
          </TouchableOpacity>

          <View style={[styles.iconCircle, { backgroundColor: `${current.color}18` }]}>
            <Ionicons name={current.icon} size={30} color={current.color} />
          </View>
          <Text style={styles.title}>{t(current.title)}</Text>
          <Text style={styles.body}>{t(current.body)}</Text>

          <View style={styles.dots}>
            {STEPS.map((_, index) => (
              <View key={index} style={[styles.dot, index === step && styles.dotActive]} />
            ))}
          </View>

          {step === 1 ? (
            <TouchableOpacity
              onPress={() => { close(); onAddContact(); }}
              style={styles.secondary}
              accessibilityRole="button"
            >
              <Text style={styles.secondaryText}>{t('Добавить сейчас')}</Text>
            </TouchableOpacity>
          ) : null}

          <GradientButton
            label={last ? t('Понятно') : t('Дальше')}
            onPress={last ? close : () => setStep(step + 1)}
            size="lg"
            style={{ alignSelf: 'stretch' }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: 'rgba(16,24,19,0.45)',
    justifyContent: 'flex-end', alignItems: 'center',
  },
  sheet: {
    width: '100%', maxWidth: 480, backgroundColor: Colors.bgElevated,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl, alignItems: 'center',
  },
  skip: { position: 'absolute', top: Spacing.md, right: Spacing.lg },
  skipText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md,
  },
  title: { fontSize: 20, fontWeight: '800', color: Colors.white, textAlign: 'center' },
  body: {
    fontSize: 15, lineHeight: 22, color: Colors.textSecondary,
    textAlign: 'center', marginTop: Spacing.sm, minHeight: 88,
  },
  dots: { flexDirection: 'row', gap: 6, marginVertical: Spacing.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.borderStrong },
  dotActive: { width: 20, backgroundColor: Colors.lavender },
  secondary: { paddingVertical: 10, marginBottom: Spacing.sm },
  secondaryText: { fontSize: 15, fontWeight: '700', color: Colors.lavender },
});
