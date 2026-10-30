import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Share, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useLocation } from '../hooks/useLocation';
import { GlassCard, GradientButton, ScreenHeader } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';
import { useLanguage } from '../i18n';
import { showAlert } from '../lib/dialog';
import { mapsLink } from '../lib/emergency';

export default function MapScreen() {
  const { t, locale } = useLanguage();
  const { location } = useApp();
  const { getCurrentLocation } = useLocation();
  const [loading, setLoading] = useState(false);

  const refreshLocation = async () => {
    setLoading(true);
    try {
      await getCurrentLocation();
    } finally {
      setLoading(false);
    }
  };

  const openMaps = async () => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    try {
      await Linking.openURL(url);
    } catch {
      showAlert(t('Карты недоступны'), t('Не удалось открыть приложение или сайт карт.'));
    }
  };

  const shareLocation = async () => {
    if (!location) return;
    const message = `${t('Я здесь:')} ${mapsLink(location)}`;
    try {
      await Share.share({ message });
    } catch {
      showAlert(t('Не удалось поделиться'), message);
    }
  };

  const findNearby = async (query: string) => {
    if (!location) return;
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${location.latitude},${location.longitude},15z`;
    try {
      await Linking.openURL(url);
    } catch {
      showAlert(t('Карты недоступны'), t('Не удалось открыть приложение или сайт карт.'));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader
          title={t('Карта')}
        />
        <ScrollView contentContainerStyle={styles.scroll}>
          <GlassCard style={styles.card} accentColor={Colors.cyan}>
            <View style={styles.cardPad}>
              <View style={styles.iconCircle}>
                <Ionicons name="navigate" size={26} color={Colors.cyan} />
              </View>
              <Text style={styles.title}>{location ? t('Последние координаты') : t('Местоположение не определено')}</Text>
              {location ? (
                <>
                  <Text selectable style={styles.coordinates}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.detail}>{t('Точность около')} {Math.round(location.accuracy)} {t('м')} · {new Date(location.timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</Text>
                  <GradientButton
                    label={t('Открыть координаты в картах')}
                    onPress={openMaps}
                    colors={Colors.gradMint}
                    size="md"
                    style={{ marginTop: Spacing.md, alignSelf: 'stretch' }}
                  />
                  <GradientButton
                    label={t('Поделиться, где я')}
                    onPress={shareLocation}
                    colors={Colors.gradPrimary}
                    size="md"
                    style={{ marginTop: Spacing.sm, alignSelf: 'stretch' }}
                  />
                </>
              ) : (
                <Text style={styles.detail}>{t('Геолокация запрашивается только после нажатия. Координаты остаются на устройстве, пока вы сами не откроете их в картах.')}</Text>
              )}
            </View>
          </GlassCard>

          {location ? (
            <GlassCard style={styles.card}>
              <View style={styles.nearbyPad}>
                <Text style={styles.nearbyTitle}>{t('Рядом с вами')}</Text>
                {[
                  { icon: 'shield-checkmark', label: t('Полиция'), query: t('полиция') },
                  { icon: 'medkit', label: t('Больницы'), query: t('больница') },
                  { icon: 'medical', label: t('Аптеки'), query: t('аптека') },
                ].map(item => (
                  <TouchableOpacity key={item.icon} style={styles.nearbyRow} onPress={() => { void findNearby(item.query); }} accessibilityRole="link">
                    <Ionicons name={item.icon as any} size={20} color={Colors.lavender} />
                    <Text style={styles.nearbyLabel}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          ) : null}

          <GradientButton
            label={loading ? t('Определяем местоположение…') : t('Обновить местоположение')}
            onPress={refreshLocation}
            loading={loading}
            disabled={loading}
            colors={Colors.gradPrimary}
            size="lg"
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 130, gap: Spacing.md },
  card: { marginBottom: Spacing.sm },
  cardPad: { padding: Spacing.lg, alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: `${Colors.cyan}18`, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  title: { color: Colors.white, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  coordinates: { color: Colors.cyan, fontSize: 17, fontWeight: '700', marginTop: Spacing.md, textAlign: 'center' },
  detail: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: Spacing.sm },
  nearbyPad: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  nearbyTitle: { fontSize: 15, fontWeight: '700', color: Colors.white, marginBottom: Spacing.xs },
  nearbyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  nearbyLabel: { flex: 1, fontSize: 15, color: Colors.white, fontWeight: '600' },
  note: { marginTop: Spacing.md },
  noteRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', padding: Spacing.md },
});
