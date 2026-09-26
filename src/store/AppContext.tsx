import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureException } from '../lib/monitoring';

const CONTACTS_KEY = 'ga.contacts';
const HISTORY_KEY = 'ga.history';

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatar: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface ThreatEvent {
  id: string;
  timestamp: number;
  type: 'sound' | 'manual' | 'shake';
  level: 'low' | 'medium' | 'high';
  location?: LocationData;
  resolved: boolean;
}

export type AppStatus = 'safe' | 'monitoring' | 'alert' | 'sos';

interface AppState {
  status: AppStatus;
  isMonitoring: boolean;
  location: LocationData | null;
  trustedContacts: TrustedContact[];
  threatHistory: ThreatEvent[];
  sosActive: boolean;
  soundLevel: number;
  hydrated: boolean;
}

interface AppActions {
  setStatus: (s: AppStatus) => void;
  toggleMonitoring: () => void;
  activateSOS: (opts?: { source?: 'manual' | 'shake' }) => void;
  deactivateSOS: () => void;
  addContact: (c: TrustedContact) => void;
  removeContact: (id: string) => void;
  updateLocation: (l: LocationData) => void;
  addThreatEvent: (e: ThreatEvent) => void;
  clearLocalData: () => Promise<void>;
  setSoundLevel: (n: number) => void;
}

const Ctx = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AppStatus>('safe');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [threatHistory, setThreatHistory] = useState<ThreatEvent[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const sosActiveRef = useRef(false);

  useEffect(() => {
    sosActiveRef.current = sosActive;
  }, [sosActive]);

  useEffect(() => {
    (async () => {
      try {
        const [rawContacts, rawHistory] = await Promise.all([
          AsyncStorage.getItem(CONTACTS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        if (rawContacts) setTrustedContacts(JSON.parse(rawContacts));
        if (rawHistory) setThreatHistory(JSON.parse(rawHistory));
      } catch (e) {
        captureException(e, 'hydrate');
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(trustedContacts)).catch((e) =>
      captureException(e, 'save-contacts'),
    );
  }, [trustedContacts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(threatHistory.slice(0, 50))).catch((e) =>
      captureException(e, 'save-history'),
    );
  }, [threatHistory, hydrated]);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(p => {
      const next = !p;
      setStatus(next ? 'monitoring' : 'safe');
      return next;
    });
  }, []);

  const activateSOS = useCallback((opts?: { source?: 'manual' | 'shake' }) => {
    if (sosActiveRef.current) return;
    const source = opts?.source ?? 'manual';
    sosActiveRef.current = true;
    setSosActive(true);
    setStatus('sos');
    setThreatHistory(p => [{
      id: Date.now().toString(),
      timestamp: Date.now(),
      type: source,
      level: 'high',
      resolved: false,
    }, ...p]);
  }, []);

  const deactivateSOS = useCallback(() => {
    sosActiveRef.current = false;
    setSosActive(false);
    setIsMonitoring(p => { setStatus(p ? 'monitoring' : 'safe'); return p; });
  }, []);

  const addContact = useCallback((c: TrustedContact) => {
    setTrustedContacts(p => [...p, c]);
  }, []);

  const removeContact = useCallback((id: string) => {
    setTrustedContacts(p => p.filter(c => c.id !== id));
  }, []);

  const updateLocation = useCallback((l: LocationData) => setLocation(l), []);

  const addThreatEvent = useCallback((e: ThreatEvent) => {
    setThreatHistory(p => [e, ...p.slice(0, 49)]);
  }, []);

  const clearLocalData = useCallback(async () => {
    setTrustedContacts([]);
    setThreatHistory([]);
    try {
      await AsyncStorage.multiRemove([CONTACTS_KEY, HISTORY_KEY]);
    } catch (e) {
      captureException(e, 'clear-data');
    }
  }, []);

  return (
    <Ctx.Provider value={{
      status, isMonitoring, location, trustedContacts,
      threatHistory, sosActive, soundLevel, hydrated,
      setStatus, toggleMonitoring, activateSOS, deactivateSOS,
      addContact, removeContact, updateLocation, addThreatEvent, clearLocalData,
      setSoundLevel,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
