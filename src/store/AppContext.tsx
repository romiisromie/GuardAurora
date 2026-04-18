import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

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
  isRecording: boolean;
  location: LocationData | null;
  trustedContacts: TrustedContact[];
  threatHistory: ThreatEvent[];
  sosActive: boolean;
  soundLevel: number;
  threatScore: number;
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
  setSoundLevel: (n: number) => void;
  setThreatScore: (n: number) => void;
  setRecording: (b: boolean) => void;
}

const defaultContacts: TrustedContact[] = [
  { id: '1', name: 'Мама', phone: '+7 777 123 4567', relation: 'Семья', avatar: '👩' },
  { id: '2', name: 'Айгерим', phone: '+7 701 987 6543', relation: 'Подруга', avatar: '👩‍🦱' },
];

const Ctx = createContext<(AppState & AppActions) | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AppStatus>('safe');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>(defaultContacts);
  const [threatHistory, setThreatHistory] = useState<ThreatEvent[]>([]);
  const [sosActive, setSosActive] = useState(false);
  const [soundLevel, setSoundLevel] = useState(0);
  const [threatScore, setThreatScoreState] = useState(0);
  const sosActiveRef = useRef(false);

  useEffect(() => {
    sosActiveRef.current = sosActive;
  }, [sosActive]);

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
    setIsRecording(true);
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
    setIsRecording(false);
    setThreatScoreState(0);
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

  const setThreatScore = useCallback((score: number) => {
    setThreatScoreState(score);
    if (score >= 80) setStatus('alert');
    else if (score < 50) setStatus(p => p === 'alert' ? 'monitoring' : p);
  }, []);

  return (
    <Ctx.Provider value={{
      status, isMonitoring, isRecording, location, trustedContacts,
      threatHistory, sosActive, soundLevel, threatScore,
      setStatus, toggleMonitoring, activateSOS, deactivateSOS,
      addContact, removeContact, updateLocation, addThreatEvent,
      setSoundLevel, setThreatScore, setRecording: setIsRecording,
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
