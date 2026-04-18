import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { useApp } from '../store/AppContext';

export function useAudioMonitor() {
  const { isMonitoring, setSoundLevel, setThreatScore, addThreatEvent } = useApp();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const bufferRef = useRef<number[]>([]);

  const requestPermission = useCallback(async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    setHasPermission(granted);
    return granted;
  }, []);

  const startMonitoring = useCallback(async () => {
    try {
      let ok = hasPermission;
      if (!ok) {
        ok = await requestPermission();
      }
      if (!ok) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        undefined,
        300
      );
      recordingRef.current = recording;

      intervalRef.current = setInterval(async () => {
        if (!recordingRef.current) return;
        try {
          const st = await recordingRef.current.getStatusAsync();
          if (st.isRecording && typeof st.metering === 'number') {
            const db = st.metering;
            const normalized = Math.max(0, Math.min(100, ((db + 60) / 60) * 100));
            setSoundLevel(normalized);

            bufferRef.current.push(db);
            if (bufferRef.current.length > 10) bufferRef.current.shift();
            const avg = bufferRef.current.reduce((a, b) => a + b, 0) / bufferRef.current.length;

            let score = 5;
            if (avg > -10) score = 90;
            else if (avg > -20) score = 60;
            else if (avg > -30) score = 30;
            setThreatScore(score);

            if (score >= 90 && bufferRef.current.length >= 8) {
              addThreatEvent({
                id: Date.now().toString(),
                timestamp: Date.now(),
                type: 'sound',
                level: 'high',
                resolved: false,
              });
            }
          }
        } catch (_) {}
      }, 300);
    } catch (err) {
      console.warn('Audio monitor error:', err);
    }
  }, [hasPermission, requestPermission, setSoundLevel, setThreatScore, addThreatEvent]);

  const stopMonitoring = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (_) {}
      recordingRef.current = null;
    }
    setSoundLevel(0);
    setThreatScore(0);
    bufferRef.current = [];
  }, [setSoundLevel, setThreatScore]);

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
    return () => { stopMonitoring(); };
  }, [isMonitoring]);

  return { hasPermission, requestPermission };
}
