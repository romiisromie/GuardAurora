import { useState, useEffect, useCallback } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../store/AppContext';
import { captureException } from '../lib/monitoring';

async function stopAndDeleteRecording(recording: Audio.Recording) {
  const uri = recording.getURI();
  try {
    await recording.stopAndUnloadAsync();
  } catch {
    // The OS may already have stopped the recording during an app-state change.
  }
  if (uri) {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (error) {
      captureException(error, 'delete-audio-cache');
    }
  }
}

export function useAudioMonitor() {
  const { isMonitoring, sosActive, setSoundLevel } = useApp();
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert('Нет доступа к микрофону', 'Уровень звука измеряться не будет. Тихий SOS работает независимо от микрофона, пока приложение открыто.', [
          { text: 'Продолжить без микрофона', style: 'cancel' },
          ...(Platform.OS === 'web' ? [] : [{ text: 'Настройки', onPress: () => { void Linking.openSettings().catch(() => {}); } }]),
        ]);
      }
      return granted;
    } catch (error) {
      captureException(error, 'audio-permission');
      setHasPermission(false);
      Alert.alert('Не удалось запросить микрофон', 'Проверьте системные настройки разрешений и попробуйте снова.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isMonitoring || sosActive) {
      setSoundLevel(0);
      return;
    }

    let cancelled = false;
    let starting = false;
    let recording: Audio.Recording | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let reading = false;

    const stopRecording = async () => {
      if (interval) clearInterval(interval);
      interval = null;
      const current = recording;
      recording = null;
      if (current) await stopAndDeleteRecording(current);
      setSoundLevel(0);
    };

    const startRecording = async () => {
      if (cancelled || starting || recording || AppState.currentState !== 'active') return;
      starting = true;
      try {
        const permission = await Audio.getPermissionsAsync();
        if (!permission.granted) {
          setHasPermission(false);
          return;
        }
        setHasPermission(true);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const result = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
        });
        if (cancelled || AppState.currentState !== 'active') {
          await stopAndDeleteRecording(result.recording);
          return;
        }
        recording = result.recording;
        interval = setInterval(async () => {
          if (!recording || reading) return;
          reading = true;
          try {
            const status = await recording.getStatusAsync();
            if (status.isRecording && status.metering != null) {
              setSoundLevel(Math.max(0, Math.min(100, Math.round((status.metering + 60) * 1.6))));
            }
          } catch (error) {
            captureException(error, 'audio-meter');
          } finally {
            reading = false;
          }
        }, 400);
      } catch (error) {
        captureException(error, 'audio-monitor');
        setSoundLevel(0);
        Alert.alert('Мониторинг звука недоступен', 'Не удалось запустить измерение уровня звука. Проверьте разрешение на микрофон и попробуйте снова.');
      } finally {
        starting = false;
      }
    };

    void startRecording();
    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void startRecording();
      else void stopRecording();
    });

    return () => {
      cancelled = true;
      appStateSubscription.remove();
      void stopRecording();
    };
  }, [isMonitoring, sosActive, setSoundLevel]);

  return { hasPermission, requestPermission };
}
