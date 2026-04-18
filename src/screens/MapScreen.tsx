import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { useLocation } from '../hooks/useLocation';
import { GlassCard, GradientButton, StatusBadge, ScreenHeader, SectionTitle } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

const { width } = Dimensions.get('window');

const SAFE_PLACES = [
  { id: '1', name: 'Полицейский участок', dist: '0.3 км', time: '4 мин', icon: '👮', color: Colors.lavender },
  { id: '2', name: 'Торговый центр', dist: '0.6 км', time: '8 мин', icon: '🏬', color: Colors.mint },
  { id: '3', name: 'Больница', dist: '1.1 км', time: '13 мин', icon: '🏥', color: Colors.rose },
  { id: '4', name: 'Аптека (24ч)', dist: '0.2 км', time: '3 мин', icon: '💊', color: Colors.gold },
];

export default function MapScreen() {
  const { location, isMonitoring } = useApp();
  const { getCurrentLocation, requestPermission, hasPermission } = useLocation();
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mapPulse = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    const a = Animated.loop(Animated.sequence([
      Animated.timing(mapPulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
      Animated.timing(mapPulse, { toValue: 0.95, duration: 2000, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);

  const handleGetLocation = async () => {
    setLoading(true);
    if (!hasPermission) await requestPermission();
    const loc = await getCurrentLocation();
    setLoading(false);
    if (loc) {
      Alert.alert('📍 Геолокация получена', `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}\nТочность: ${loc.accuracy.toFixed(0)}м`);
    }
  };

  const handleRoute = (id: string, name: string) => {
    setActiveRoute(id);
    Alert.alert('🗺 Маршрут построен', `Безопасный маршрут до "${name}" найден.\nМаршрут проходит через освещённые улицы.`);
  };

  return (
    <LinearGradient colors={['#0d0118', '#160d24']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          <ScreenHeader
            eyebrow="Safe Route"
            title="Карта безопасности"
            subtitle={
              location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'Местоположение не определено'
            }
            right={isMonitoring ? <StatusBadge label="GPS online" color={Colors.mint} /> : undefined}
          />

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <GlassCard style={styles.summaryCard} accentColor={Colors.cyan}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{SAFE_PLACES.length}</Text>
                  <Text style={styles.summaryLabel}>точек рядом</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{activeRoute ? '1' : '0'}</Text>
                  <Text style={styles.summaryLabel}>активный маршрут</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{isMonitoring ? 'Live' : 'Off'}</Text>
                  <Text style={styles.summaryLabel}>tracking</Text>
                </View>
              </View>
            </GlassCard>

            <Animated.View style={[styles.mapBox, { transform: [{ scale: mapPulse }] }]}>
              <LinearGradient
                colors={['#1a0533', '#2d0a5e', '#160d24']}
                style={styles.mapGrad}
              >
                {/* Grid lines */}
                {[...Array(6)].map((_, i) => (
                  <View key={`h${i}`} style={[styles.gridLine, styles.gridH, { top: `${i * 20}%` }]} />
                ))}
                {[...Array(6)].map((_, i) => (
                  <View key={`v${i}`} style={[styles.gridLine, styles.gridV, { left: `${i * 20}%` }]} />
                ))}

                {/* Safe zone dots */}
                {[
                  { t: '20%', l: '25%', c: Colors.lavender },
                  { t: '55%', l: '65%', c: Colors.mint },
                  { t: '35%', l: '75%', c: Colors.rose },
                  { t: '70%', l: '30%', c: Colors.gold },
                ].map((dot, i) => (
                  <View key={i} style={[styles.mapDot, { top: dot.t as any, left: dot.l as any, backgroundColor: dot.c }]} />
                ))}

                {/* You are here */}
                <View style={styles.youHere}>
                  <View style={styles.youDotOuter}>
                    <View style={styles.youDotInner} />
                  </View>
                  <Text style={styles.youLabel}>Вы здесь</Text>
                </View>

                {/* Route line if active */}
                {activeRoute && (
                  <View style={styles.routeLine} />
                )}

                {/* Overlay text */}
                <View style={styles.mapOverlay}>
                  <Ionicons name="map" size={13} color={Colors.textMuted} />
                  <Text style={styles.mapOverlayText}>
                    {location ? 'Геолокация активна' : 'Нажми «Определить» ниже'}
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>

            <GradientButton
              label={loading ? 'Определяем позицию...' : 'Определить моё местоположение'}
              onPress={handleGetLocation}
              colors={Colors.gradMint}
              loading={loading}
              size="md"
              style={{ marginBottom: Spacing.lg }}
            />

            <SectionTitle label="Ближайшие безопасные места" />
            {SAFE_PLACES.map(place => (
              <GlassCard
                key={place.id}
                style={[styles.placeCard, activeRoute === place.id && { borderColor: place.color }]}
                accentColor={place.color}
                onPress={() => handleRoute(place.id, place.name)}
              >
                <View style={styles.placeRow}>
                  <View style={[styles.placeIconCircle, { backgroundColor: `${place.color}20` }]}>
                    <Text style={styles.placeIcon}>{place.icon}</Text>
                  </View>
                  <View style={styles.placeInfo}>
                    <Text style={styles.placeName}>{place.name}</Text>
                    <View style={styles.placeMeta}>
                      <Text style={styles.placeMetaText}>📏 {place.dist}</Text>
                      <Text style={styles.placeMetaText}>🚶 {place.time}</Text>
                    </View>
                  </View>
                  <View style={[styles.routeBtn, activeRoute === place.id && { backgroundColor: `${place.color}25` }]}>
                    {activeRoute === place.id
                      ? <Ionicons name="checkmark-circle" size={22} color={place.color} />
                      : <Ionicons name="navigate-outline" size={20} color={Colors.textMuted} />
                    }
                  </View>
                </View>
              </GlassCard>
            ))}

            <GlassCard style={styles.tipCard} accentColor={Colors.gold}>
              <View style={styles.tipRow}>
                <Text style={{ fontSize: 24 }}>💡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.tipTitle}>Совет безопасности</Text>
                  <Text style={styles.tipText}>При опасности двигайся к людным, освещённым местам. Избегай подземных переходов и тёмных улиц.</Text>
                </View>
              </View>
            </GlassCard>

          </ScrollView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 110 },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md },
  summaryItem: { flex: 1, alignItems: 'center', gap: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: Colors.white },
  summaryLabel: { fontSize: 11, color: Colors.textMuted },
  summaryDivider: { width: 1, alignSelf: 'stretch', backgroundColor: Colors.border },
  mapBox: {
    height: 220, borderRadius: Radius.lg, overflow: 'hidden',
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border,
  },
  mapGrad: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', backgroundColor: 'rgba(192,132,252,0.07)' },
  gridH: { left: 0, right: 0, height: 1 },
  gridV: { top: 0, bottom: 0, width: 1 },
  mapDot: {
    position: 'absolute', width: 10, height: 10, borderRadius: 5,
    shadowColor: '#fff', shadowOpacity: 0.6, shadowRadius: 6, elevation: 4,
  },
  youHere: {
    position: 'absolute', top: '45%', left: '42%', alignItems: 'center',
  },
  youDotOuter: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(232,84,122,0.3)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.rose,
  },
  youDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.rose },
  youLabel: {
    fontSize: 9, color: Colors.rose, fontWeight: '700', marginTop: 3, letterSpacing: 0.5,
  },
  routeLine: {
    position: 'absolute', top: '50%', left: '45%', width: '22%', height: 2,
    backgroundColor: Colors.mint, borderRadius: 999, transform: [{ rotate: '-25deg' }],
  },
  mapOverlay: {
    position: 'absolute', bottom: 10, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(13,1,24,0.6)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  mapOverlayText: { fontSize: 10, color: Colors.textMuted },
  placeCard: { marginBottom: 10 },
  placeRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  placeIconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  placeIcon: { fontSize: 22 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 15, fontWeight: '700', color: Colors.white },
  placeMeta: { flexDirection: 'row', gap: 12, marginTop: 4 },
  placeMetaText: { fontSize: 12, color: Colors.textMuted },
  routeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tipCard: { marginTop: Spacing.sm },
  tipRow: { flexDirection: 'row', gap: 12, padding: Spacing.md, alignItems: 'flex-start' },
  tipTitle: { fontSize: 14, fontWeight: '700', color: Colors.white, marginBottom: 4 },
  tipText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
});
