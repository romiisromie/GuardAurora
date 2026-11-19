import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform, AccessibilityInfo } from 'react-native';
import * as Brightness from 'expo-brightness';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../i18n';
import { playLoop, stopLoop, SIREN } from '../lib/sound';

/** Two colour changes a second stays under the three-flashes-per-second photosensitivity limit. */
const FLASH_MS = 500;

/** Full-screen alarm: loud siren, flashing screen at full brightness. Runs until turned off. */
export function Siren({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useLanguage();
  const [bright, setBright] = useState(true);

  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    let player: Awaited<ReturnType<typeof playLoop>> = null;
    let previousBrightness: number | null = null;

    void playLoop(SIREN).then(p => {
      if (cancelled) stopLoop(p);
      else player = p;
    });
    if (Platform.OS !== 'web') {
      void (async () => {
        try {
          previousBrightness = await Brightness.getBrightnessAsync();
          if (!cancelled) await Brightness.setBrightnessAsync(1);
        } catch {
          // Brightness is a nice-to-have; the siren works without it.
        }
      })();
    }
    AccessibilityInfo.announceForAccessibility(t('Сирена включена'));
    const flash = setInterval(() => setBright(b => !b), FLASH_MS);

    return () => {
      cancelled = true;
      clearInterval(flash);
      stopLoop(player);
      if (previousBrightness !== null) void Brightness.setBrightnessAsync(previousBrightness).catch(() => {});
    };
  }, [visible, t]);

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.screen, { backgroundColor: bright ? '#FFFFFF' : '#E0182F' }]}>
        <Ionicons name="megaphone" size={72} color={bright ? '#E0182F' : '#FFFFFF'} />
        <Text style={[styles.title, { color: bright ? '#E0182F' : '#FFFFFF' }]}>{t('Сирена')}</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.stop}
          accessibilityRole="button"
          accessibilityLabel={t('Выключить сирену')}
        >
          <Text style={styles.stopText}>{t('Выключить')}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  title: { fontSize: 40, fontWeight: '900', letterSpacing: 1 },
  stop: {
    position: 'absolute', bottom: 64, left: 32, right: 32, minHeight: 64, borderRadius: 32,
    backgroundColor: '#1D2721', alignItems: 'center', justifyContent: 'center',
  },
  stopText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
});
