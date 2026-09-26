import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useApp } from '../store/AppContext';
import { captureException } from '../lib/monitoring';

export function useAudioMonitor() {
  const { isMonitoring, setSoundLevel } = useApp();
  const [hasPermission, setHasPermission] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const stopAndDeleteRecording = async (recording: Audio.Recording) => {
    const uri = recording.getURI();
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // The recording may already have stopped during unmount.
    }
    if (uri) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        captureException(e, 'delete-audio-cache');
      }
    }
  };

  const requestPermission = useCallback(async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setHasPermission(granted);
      if (!granted) {
        Alert.alert(
          'Нет доступа к микрофону',
          'Мониторинг звука недоступен. Разрешите микрофон в настройках, если хотите использовать эту функцию. Тихий SOS по встряхиванию работает без микрофона.',
        );
      }
      return granted;
    } catch (e) {
      captureException(e, 'audio-permission');
      setHasPermission(false);
      Alert.alert('Не удалось запросить микрофон', 'Проверьте системные настройки разрешений и попробуйте снова.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isMonitoring) {
      setSoundLevel(0);
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    (async () => {
      try {
        const perm = await Audio.getPermissionsAsync();
        if (!perm.granted) {
          setHasPermission(false);
          return;
        }
        setHasPermission(true);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync({
          ...Audio.RecordingOptionsPresets.LOW_QUALITY,
          isMeteringEnabled: true,
        });
        if (cancelled) {
          await stopAndDeleteRecording(recording);
          return;
        }
        recordingRef.current = recording;
        interval = setInterval(async () => {
          try {
            const status = await recording.getStatusAsync();
            if (!status.isRecording || status.metering == null) return;
            const level = Math.max(0, Math.min(100, Math.round((status.metering + 60) * 1.6)));
            setSoundLevel(level);
          } catch {
            /* tick */
          }
        }, 400);
      } catch (e) {
        captureException(e, 'audio-monitor');
        setSoundLevel(0);
        Alert.alert('Мониторинг звука недоступен', 'Не удалось запустить измерение уровня звука. Проверьте разрешение на микрофон и попробуйте снова.');
      }
    })();

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      const rec = recordingRef.current;
      recordingRef.current = null;
      if (rec) void stopAndDeleteRecording(rec);
      setSoundLevel(0);
    };
  }, [isMonitoring, setSoundLevel]);

  return { hasPermission, requestPermission };
}
