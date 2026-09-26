import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useLocation } from '../hooks/useLocation';
import { GlassCard, GradientButton, ScreenHeader } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

export default function MapScreen() {
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
      Alert.alert('Карты недоступны', 'Не удалось открыть приложение или сайт карт.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScreenHeader
          eyebrow="Местоположение"
          title="Карта"
          subtitle="Получите координаты телефона и откройте их в установленном приложении карт."
        />
        <ScrollView contentContainerStyle={styles.scroll}>
          <GlassCard style={styles.card} accentColor={Colors.cyan}>
            <View style={styles.cardPad}>
              <View style={styles.iconCircle}>
                <Ionicons name="navigate" size={26} color={Colors.cyan} />
              </View>
              <Text style={styles.title}>{location ? 'Последние координаты' : 'Местоположение не определено'}</Text>
              {location ? (
                <>
                  <Text selectable style={styles.coordinates}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  <Text style={styles.detail}>Точность около {Math.round(location.accuracy)} м · {new Date(location.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</Text>
                  <GradientButton
                    label="Открыть координаты в картах"
                    onPress={openMaps}
                    colors={Colors.gradMint}
                    size="md"
                    style={{ marginTop: Spacing.md }}
                  />
                </>
              ) : (
                <Text style={styles.detail}>Геолокация запрашивается только после нажатия. Координаты остаются на устройстве, пока вы сами не откроете их в картах.</Text>
              )}
            </View>
          </GlassCard>

          <GradientButton
            label={loading ? 'Определяем местоположение…' : 'Обновить местоположение'}
            onPress={refreshLocation}
            loading={loading}
            disabled={loading}
            colors={Colors.gradPrimary}
            size="lg"
          />
          <GlassCard style={styles.note} accentColor={Colors.gold}>
            <View style={styles.noteRow}>
              <Ionicons name="information-circle-outline" size={22} color={Colors.gold} />
              <Text style={styles.detail}>
                Приложение не содержит базы безопасных мест и не оценивает маршруты. В экстренной ситуации свяжитесь с местной службой помощи.
              </Text>
            </View>
          </GlassCard>
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
  note: { marginTop: Spacing.md },
  noteRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'flex-start', padding: Spacing.md },
});
