import { useEffect, useRef, useCallback } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useApp } from '../store/AppContext';

/** Порог ускорения (g-эквивалент по величине вектора), выше — считаем пик встряхивания. */
const SHAKE_THRESHOLD = 2.35;
/** Минимальный интервал между пиками, чтобы один физический тряс не дал 10 событий. */
const MIN_PEAK_GAP_MS = 320;
/** Окно: три отдельных встряхивания должны уложиться в это время. */
const SEQUENCE_WINDOW_MS = 2200;
const SHAKES_REQUIRED = 3;

export function useShakeDetector() {
  const { isMonitoring, sosActive, activateSOS } = useApp();
  const subRef = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);
  const lastPeakRef = useRef(0);
  const sequenceStartRef = useRef(0);
  const shakeCountRef = useRef(0);

  const resetSequence = useCallback(() => {
    shakeCountRef.current = 0;
    sequenceStartRef.current = 0;
  }, []);

  const start = useCallback(() => {
    Accelerometer.setUpdateInterval(80);
    subRef.current = Accelerometer.addListener(({ x, y, z }) => {
      const mag = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (mag < SHAKE_THRESHOLD) return;
      if (now - lastPeakRef.current < MIN_PEAK_GAP_MS) return;
      lastPeakRef.current = now;

      if (shakeCountRef.current === 0) {
        sequenceStartRef.current = now;
        shakeCountRef.current = 1;
        return;
      }

      if (now - sequenceStartRef.current > SEQUENCE_WINDOW_MS) {
        sequenceStartRef.current = now;
        shakeCountRef.current = 1;
        return;
      }

      shakeCountRef.current += 1;

      if (shakeCountRef.current >= SHAKES_REQUIRED) {
        resetSequence();
        activateSOS({ source: 'shake' });
      }
    });
  }, [activateSOS, resetSequence]);

  const stop = useCallback(() => {
    subRef.current?.remove();
    subRef.current = null;
    resetSequence();
    lastPeakRef.current = 0;
  }, [resetSequence]);

  useEffect(() => {
    if (isMonitoring && !sosActive) {
      resetSequence();
      start();
    } else {
      stop();
    }
    return stop;
  }, [isMonitoring, sosActive, start, stop, resetSequence]);
}
