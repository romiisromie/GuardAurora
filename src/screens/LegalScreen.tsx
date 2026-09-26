import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { GlassCard, ScreenHeader, SectionTitle, GradientButton } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { Config } from '../config';
import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_UPDATED } from '../legal/privacyPolicy';
import { useApp } from '../store/AppContext';

export default function LegalScreen() {
  const { clearLocalData, hydrated, sosActive } = useApp();

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert('Ссылка недоступна', 'Скопируйте адрес с сайта приложения или напишите в поддержку.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку.');
    }
  };

  const mailSupport = () => openUrl(`mailto:${Config.supportEmail}`);

  const handleClear = () => {
    if (sosActive) {
      Alert.alert('Сначала остановите SOS', 'Завершите активный режим SOS, чтобы не потерять событие до его завершения.');
      return;
    }
    Alert.alert(
      'Удалить локальные данные?',
      'Будут удалены доверенные контакты и журнал на этом устройстве. Облачного аккаунта нет.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearLocalData();
              Alert.alert('Готово', 'Доверенные контакты и журнал событий удалены с этого устройства.');
            } catch {
              Alert.alert('Не удалось удалить данные', 'Освободите место на устройстве и попробуйте ещё раз.');
            }
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#0d0118', '#160d24']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <ScreenHeader
            eyebrow="Legal"
            title="Правовая информация"
            subtitle={`Обновлено ${PRIVACY_POLICY_UPDATED}`}
          />
        </View>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <GlassCard style={styles.card} accentColor={Colors.lavender}>
            <View style={styles.pad}>
              <Text style={styles.lead}>
                В этой версии нет регистрации или облачной учётной записи. Контакты, журнал и ответы чата хранятся на устройстве. SOS не вызывает службы и не уведомляет контакты автоматически.
              </Text>
              {Config.privacyPolicyUrl ? (
                <GradientButton label="Открыть политику конфиденциальности" onPress={() => openUrl(Config.privacyPolicyUrl)} size="md" style={{ marginTop: Spacing.md }} />
              ) : (
                <Text style={styles.body}>Ссылка на публичную политику не настроена. Её необходимо добавить до отправки приложения в магазины.</Text>
              )}
              {Config.supportEmail ? (
                <TouchableOpacity style={styles.linkRow} onPress={mailSupport}>
                  <Ionicons name="mail-outline" size={18} color={Colors.lavender} />
                  <Text style={styles.linkText}>{Config.supportEmail}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.body}>Контакт поддержки будет добавлен владельцем перед публикацией.</Text>
              )}
              <Text style={styles.meta}>Версия {Constants.expoConfig?.version ?? '1.0.0'}{hydrated ? '' : ' · загружаем локальные данные'}</Text>
            </View>
          </GlassCard>

          <SectionTitle label="Политика конфиденциальности" />
          {PRIVACY_POLICY_SECTIONS.map((s) => (
            <GlassCard key={s.heading} style={styles.card}>
              <View style={styles.pad}>
                <Text style={styles.h}>{s.heading}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </View>
            </GlassCard>
          ))}

          <SectionTitle label="Данные на устройстве" />
          <GradientButton
            label={sosActive ? 'Остановите SOS, чтобы удалить данные' : 'Удалить локальные данные'}
            onPress={handleClear}
            disabled={sosActive}
            colors={Colors.gradDanger}
            size="md"
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
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
  h: { color: Colors.white, fontWeight: '700', fontSize: 15, marginBottom: 8 },
  body: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
});
