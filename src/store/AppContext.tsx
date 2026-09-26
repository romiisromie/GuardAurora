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

function isStoredContact(value: unknown): value is TrustedContact {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.name === 'string' &&
    typeof item.phone === 'string' && typeof item.relation === 'string' &&
    typeof item.avatar === 'string';
}

function isStoredEvent(value: unknown): value is ThreatEvent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const locationIsValid = item.location === undefined || (
    !!item.location && typeof item.location === 'object' &&
    Number.isFinite((item.location as LocationData).latitude) &&
    Math.abs((item.location as LocationData).latitude) <= 90 &&
    Number.isFinite((item.location as LocationData).longitude) &&
    Math.abs((item.location as LocationData).longitude) <= 180 &&
    Number.isFinite((item.location as LocationData).accuracy) &&
    Number.isFinite((item.location as LocationData).timestamp)
  );
  return typeof item.id === 'string' && Number.isFinite(item.timestamp) &&
    ['sound', 'manual', 'shake'].includes(String(item.type)) &&
    ['low', 'medium', 'high'].includes(String(item.level)) && typeof item.resolved === 'boolean' && locationIsValid;
}

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
        const [contactsResult, historyResult] = await Promise.allSettled([
          AsyncStorage.getItem(CONTACTS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);
        const rawContacts = contactsResult.status === 'fulfilled' ? contactsResult.value : null;
        const rawHistory = historyResult.status === 'fulfilled' ? historyResult.value : null;
        if (contactsResult.status === 'rejected') captureException(contactsResult.reason, 'load-contacts');
        if (historyResult.status === 'rejected') captureException(historyResult.reason, 'load-history');
        if (rawContacts) {
          try {
            const parsed: unknown = JSON.parse(rawContacts);
            if (Array.isArray(parsed)) setTrustedContacts(parsed.filter(isStoredContact));
          } catch (error) {
            captureException(error, 'parse-contacts');
          }
        }
        if (rawHistory) {
          try {
            const parsed: unknown = JSON.parse(rawHistory);
            if (Array.isArray(parsed)) setThreatHistory(parsed.filter(isStoredEvent).slice(0, 50));
          } catch (error) {
            captureException(error, 'parse-history');
          }
        }
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
      setStatus(sosActiveRef.current ? 'sos' : next ? 'monitoring' : 'safe');
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
      location: location ?? undefined,
      resolved: false,
    }, ...p]);
  }, [location]);

  const deactivateSOS = useCallback(() => {
    sosActiveRef.current = false;
    setSosActive(false);
    setThreatHistory(events => {
      const latestSOS = events.findIndex(event => (event.type === 'manual' || event.type === 'shake') && !event.resolved);
      return latestSOS < 0 ? events : events.map((event, index) => index === latestSOS ? { ...event, resolved: true } : event);
    });
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
    try {
      await AsyncStorage.multiRemove([CONTACTS_KEY, HISTORY_KEY]);
      setTrustedContacts([]);
      setThreatHistory([]);
    } catch (e) {
      captureException(e, 'clear-data');
      throw e;
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
