import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useApp } from '../store/AppContext';

export function useLocation() {
  const { isMonitoring, sosActive, updateLocation } = useApp();
  const [hasPermission, setHasPermission] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const ok = status === 'granted';
    setHasPermission(ok);
    return ok;
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
        })
      );
    } catch (e) {
      console.warn('Location tracking error:', e);
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
    } catch {
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
