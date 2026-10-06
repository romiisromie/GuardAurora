import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { GlassCard, ScreenHeader, SectionTitle, GradientButton } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { Config } from '../config';
import { PRIVACY_POLICY_SECTIONS } from '../legal/privacyPolicy';
import { useApp } from '../store/AppContext';
import { LANGUAGE_OPTIONS, useLanguage } from '../i18n';
import { showAlert } from '../lib/dialog';

export default function LegalScreen() {
  const { clearLocalData, hydrated, sosActive } = useApp();
  const { language, setLanguage, t } = useLanguage();

  const openUrl = async (url: string) => {
    // canOpenURL is unreliable for mailto: on iOS (scheme allow-list), so open directly and handle failure.
    try {
      await Linking.openURL(url);
    } catch {
      showAlert(t('Ссылка недоступна'), url.startsWith('mailto:')
        ? `${t('Напишите нам на адрес')} ${url.slice('mailto:'.length)}`
        : t('Скопируйте адрес с сайта приложения или напишите в поддержку.'));
    }
  };

  const mailSupport = () => openUrl(`mailto:${Config.supportEmail}`);

  const handleClear = () => {
    if (sosActive) {
      showAlert(t('Сначала остановите SOS'), t('Завершите активный режим SOS, чтобы не потерять событие до его завершения.'));
      return;
    }
    showAlert(
      t('Удалить локальные данные?'),
      t('Будут удалены доверенные контакты и журнал на этом устройстве. Облачного аккаунта нет.'),
      [
        { text: t('Отмена'), style: 'cancel' },
        {
          text: t('Удалить'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLocalData();
              showAlert(t('Готово'), t('Доверенные контакты и журнал событий удалены с этого устройства.'));
            } catch {
              showAlert(t('Не удалось удалить данные'), t('Освободите место на устройстве и попробуйте ещё раз.'));
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <ScreenHeader
            eyebrow={t('Конфиденциальность')}
            title={t('Правовая информация')}
            subtitle={`${t('Обновлено')} ${new Date(2026, 9, 6).toLocaleDateString(language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU', { year: 'numeric', month: 'long' })}`}
          />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card} accentColor={Colors.lavender}>
            <View style={styles.pad}>
              <Text style={styles.h}>{t('Язык приложения')}</Text>
              <View style={styles.languageRow}>
                {LANGUAGE_OPTIONS.map((option) => {
                  const selected = option.code === language;
                  return <TouchableOpacity key={option.code} onPress={() => setLanguage(option.code)} accessibilityRole="button" accessibilityState={{ selected }} style={[styles.languageButton, selected && styles.languageButtonSelected]}>
                    <Text style={[styles.languageText, selected && styles.languageTextSelected]}>{option.label}</Text>
                  </TouchableOpacity>;
                })}
              </View>
              <Text style={styles.lead}>
                {t('В этой версии нет регистрации или облачной учётной записи. Контакты, журнал и ответы чата хранятся на устройстве. SOS не вызывает службы и не уведомляет контакты автоматически.')}
              </Text>
              {Config.privacyPolicyUrl ? (
                <GradientButton label={t('Открыть политику конфиденциальности')} onPress={() => openUrl(Config.privacyPolicyUrl)} size="md" style={{ marginTop: Spacing.md }} />
              ) : (
                <Text style={styles.body}>{t('Ссылка на публичную политику не настроена. Её необходимо добавить до отправки приложения в магазины.')}</Text>
              )}
              {Config.supportEmail ? (
                <TouchableOpacity style={styles.linkRow} onPress={mailSupport}>
                  <Ionicons name="mail-outline" size={18} color={Colors.lavender} />
                  <Text style={styles.linkText}>{Config.supportEmail}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.body}>{t('Контакт поддержки будет добавлен владельцем перед публикацией.')}</Text>
              )}
              <Text style={styles.meta}>{t('Версия')} {Constants.expoConfig?.version ?? '1.0.0'}{hydrated ? '' : ` · ${t('загружаем локальные данные')}`}</Text>
            </View>
          </GlassCard>

          <SectionTitle label={t('Политика конфиденциальности')} />
          {PRIVACY_POLICY_SECTIONS.map((s) => (
            <GlassCard key={s.heading} style={styles.card}>
              <View style={styles.pad}>
                <Text style={styles.h}>{t(s.heading)}</Text>
                <Text style={styles.body}>{t(s.body)}</Text>
              </View>
            </GlassCard>
          ))}

          <SectionTitle label={t('Данные на устройстве')} />
          <GradientButton
            label={t(sosActive ? 'Остановите SOS, чтобы удалить данные' : 'Удалить локальные данные')}
            onPress={handleClear}
            disabled={sosActive}
            colors={Colors.gradDanger}
            size="md"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  card: { marginBottom: Spacing.md },
  pad: { padding: Spacing.md },
  lead: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md },
  linkText: { color: Colors.lavender, fontWeight: '600' },
  meta: { color: Colors.textMuted, fontSize: 12, marginTop: 8 },
  languageRow: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: Spacing.md },
  languageButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: Radius.full, backgroundColor: Colors.bgCardLight, borderWidth: 1, borderColor: Colors.border },
  languageButtonSelected: { backgroundColor: Colors.lavender, borderColor: Colors.lavender },
  languageText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  languageTextSelected: { color: '#FFFFFF' },
  h: { color: Colors.white, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  body: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
