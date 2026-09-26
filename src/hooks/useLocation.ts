import { useState, useCallback } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useApp } from '../store/AppContext';
import { captureException } from '../lib/monitoring';
import { useLanguage } from '../i18n';

export function useLocation() {
  const { t } = useLanguage();
  const { updateLocation } = useApp();
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const ok = status === 'granted';
      setHasPermission(ok);
      if (!ok) {
        Alert.alert(t('Нет доступа к геолокации'), t('Координаты не будут определяться. Разрешите доступ в настройках, если хотите использовать эту функцию.'), [
          { text: t('Позже'), style: 'cancel' },
          ...(Platform.OS === 'web' ? [] : [{ text: t('Настройки'), onPress: () => { void Linking.openSettings().catch(() => {}); } }]),
        ]);
      }
      return ok;
    } catch (e) {
      captureException(e, 'location-permission');
      Alert.alert(t('Не удалось запросить геолокацию'), t('Проверьте системные настройки разрешений и попробуйте снова.'));
      return false;
    }
  }, [t]);

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
        t('Не удалось определить местоположение'),
        t('Проверьте, что GPS включён и есть сигнал. Повторите попытку на открытом месте.'),
      );
      return null;
    }
  }, [hasPermission, requestPermission, updateLocation]);

  return { hasPermission, requestPermission, getCurrentLocation };
}
