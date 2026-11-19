import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import type { LocationData } from '../store/AppContext';

/** Works across Kazakhstan, Russia and the EU; most phones also route it to the local number elsewhere. */
export const EMERGENCY_NUMBER = '112';

/** Coordinates older than this are left out of messages so contacts never get a stale position. */
const FRESH_LOCATION_MS = 15 * 60 * 1000;

export function mapsLink(location: LocationData) {
  return `https://maps.google.com/?q=${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
}

export function sosMessage(t: (ru: string) => string, location: LocationData | null, text?: string) {
  const base = text ?? t('Мне нужна помощь. Позвони мне, пожалуйста.');
  return location ? `${base}\n${t('Я здесь:')} ${mapsLink(location)}` : base;
}

export function isFresh(location: LocationData | null): location is LocationData {
  return !!location && Date.now() - location.timestamp <= FRESH_LOCATION_MS;
}

/**
 * A current position for a message, without ever showing a permission prompt: a new fix if
 * location access was already granted, otherwise the last known one if it is still fresh.
 */
export async function locationForMessage(last: LocationData | null): Promise<LocationData | null> {
  try {
    const permission = await Location.getForegroundPermissionsAsync();
    if (permission.granted) {
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy ?? 0,
        timestamp: position.timestamp,
      };
    }
  } catch {
    // No fix available right now; fall back to the last known position below.
  }
  return isFresh(last) ? last : null;
}

/** Opens the SMS app with the text filled in; the user still has to press send. */
export function openSms(phones: string[], body: string) {
  const to = phones.map(phone => phone.replace(/[^\d+]/g, '')).filter(Boolean).join(',');
  const text = encodeURIComponent(body);
  const url = Platform.OS === 'ios'
    ? `sms:/open?addresses=${to}&body=${text}`
    : `sms:${to}?body=${text}`;
  return Linking.openURL(url);
}

export function callNumber(phone: string) {
  return Linking.openURL(`tel:${phone.replace(/[^\d+]/g, '')}`);
}
