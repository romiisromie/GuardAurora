import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { GlassCard, ScreenHeader, SectionTitle, GradientButton } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { Config } from '../config';
import { PRIVACY_POLICY_SECTIONS, PRIVACY_POLICY_UPDATED } from '../legal/privacyPolicy';
import { useApp } from '../store/AppContext';

export default function LegalScreen() {
  const navigation = useNavigation();
  const { clearLocalData } = useApp();

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
    Alert.alert(
      'Удалить локальные данные?',
      'Будут удалены доверенные контакты и журнал на этом устройстве. Облачного аккаунта нет.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            await clearLocalData();
            Alert.alert('Готово', 'Локальные данные удалены.');
          },
        },
      ],
    );
  };

  return (
    <LinearGradient colors={['#0d0118', '#160d24']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={Colors.white} />
          </TouchableOpacity>
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
                Регистрации нет. Контакты, журнал и ответы чата обрабатываются на устройстве; чат не отправляет сообщения в сеть.
              </Text>
              {Config.privacyPolicyUrl ? (
                <GradientButton
                  label="Открыть политику в браузере"
                  onPress={() => openUrl(Config.privacyPolicyUrl)}
                  size="md"
                  style={{ marginTop: Spacing.md }}
                />
              ) : null}
              {Config.supportEmail ? (
                <TouchableOpacity style={styles.linkRow} onPress={mailSupport}>
                  <Ionicons name="mail-outline" size={18} color={Colors.lavender} />
                  <Text style={styles.linkText}>{Config.supportEmail}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.body}>Контакт поддержки будет добавлен владельцем перед публикацией.</Text>
              )}
              <Text style={styles.meta}>Версия {Constants.expoConfig?.version ?? '1.0.0'}</Text>
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
            label="Удалить контакты и журнал"
            onPress={handleClear}
            colors={Colors.gradDanger}
            size="md"
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'flex-start' },
  backBtn: {
    marginLeft: Spacing.md,
    marginTop: Spacing.md,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgGlass,
    borderWidth: 1,
    borderColor: Colors.border,
  },
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
