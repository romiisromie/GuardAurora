import { Linking, Platform } from 'react-native';
import type { LocationData } from '../store/AppContext';

/** Works across Kazakhstan, Russia and the EU; most phones also route it to the local number elsewhere. */
export const EMERGENCY_NUMBER = '112';

export function mapsLink(location: LocationData) {
  return `https://maps.google.com/?q=${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
}

export function sosMessage(t: (ru: string) => string, location: LocationData | null) {
  const base = t('Мне нужна помощь. Позвони мне, пожалуйста.');
  return location ? `${base}\n${t('Я здесь:')} ${mapsLink(location)}` : base;
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
