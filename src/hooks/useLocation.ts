import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../store/AppContext';
import { captureException } from '../lib/monitoring';

export function useLocation() {
  const { isMonitoring, sosActive, updateLocation } = useApp();
  const [hasPermission, setHasPermission] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const ok = status === 'granted';
      setHasPermission(ok);
      if (!ok) {
        Alert.alert(
          'Нет доступа к геолокации',
          'Координаты не будут определяться. Разрешите геолокацию в настройках, если хотите видеть местоположение на карте.',
        );
      }
      return ok;
    } catch (e) {
      captureException(e, 'location-permission');
      Alert.alert('Не удалось запросить геолокацию', 'Проверьте системные настройки разрешений и попробуйте снова.');
      return false;
    }
  }, []);

  const startTracking = useCallback(async () => {
    let ok = hasPermission;
    if (!ok) ok = await requestPermission();
    if (!ok) return;

    try {
      if (watchRef.current) watchRef.current.remove();
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
        loc => updateLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          accuracy: loc.coords.accuracy ?? 0,
          timestamp: loc.timestamp,
        }),
      );
    } catch (e) {
      captureException(e, 'location-tracking');
      Alert.alert('Геолокация недоступна', 'Не удалось начать обновление координат. Проверьте разрешение и настройки геолокации.');
    }
  }, [hasPermission, requestPermission, updateLocation]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    let ok = hasPermission;
    if (!ok) ok = await requestPermission();
    if (!ok) return null;
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const data = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? 0,
        timestamp: loc.timestamp,
      };
      updateLocation(data);
      return data;
    } catch (e) {
      captureException(e, 'location-current');
      Alert.alert(
        'Не удалось определить местоположение',
        'Проверьте, что GPS включён и есть сигнал. Повторите попытку на открытом месте.',
      );
      return null;
    }
  }, [hasPermission, requestPermission, updateLocation]);

  useEffect(() => {
    if (isMonitoring || sosActive) startTracking();
    else stopTracking();
    return () => stopTracking();
  }, [isMonitoring, sosActive]);

  return { hasPermission, requestPermission, getCurrentLocation };
}
