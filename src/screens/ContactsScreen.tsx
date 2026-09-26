import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking,
  TextInput, Alert, Animated, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp, TrustedContact } from '../store/AppContext';
import { GlassCard, GradientButton, ScreenHeader, SectionTitle } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

const RELATIONS = ['Семья', 'Подруга', 'Друг', 'Партнёр', 'Коллега', 'Сосед'];
const AVATARS = ['👩', '👨', '👩‍👧', '👴', '👵', '🧑', '👩‍🦱', '👨‍🦳', '👧', '🧒'];
const REL_COLORS: Record<string, string> = {
  Семья: Colors.rose, Подруга: Colors.lavender, Друг: Colors.mint,
  Партнёр: Colors.gold, Коллега: Colors.lavender, Сосед: Colors.mint,
};

export default function ContactsScreen() {
  const { trustedContacts, addContact, removeContact, threatHistory, sosActive } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Семья');
  const [avatar, setAvatar] = useState('👩');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const openModal = () => {
    setName(''); setPhone(''); setRelation('Семья'); setAvatar('👩');
    setModalOpen(true);
  };

  const handleAdd = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Ошибка', 'Заполни имя и номер телефона');
      return;
    }
    const normalizedPhone = phone.trim();
    const digits = normalizedPhone.replace(/\D/g, '');
    if (!/^\+?[\d\s().-]+$/.test(normalizedPhone) || digits.length < 7 || digits.length > 15 || name.trim().length > 80) {
      Alert.alert('Проверьте данные', 'Укажите имя до 80 символов и номер телефона, содержащий от 7 до 15 цифр.');
      return;
    }
    addContact({ id: Date.now().toString(), name: name.trim(), phone: normalizedPhone, relation, avatar });
    setModalOpen(false);
  };

  const textContact = async (contact: TrustedContact) => {
    const lastSOS = threatHistory.find(event => event.type === 'manual' || event.type === 'shake');
    const coordinates = sosActive ? lastSOS?.location : undefined;
    const locationAge = coordinates ? Date.now() - coordinates.timestamp : Number.POSITIVE_INFINITY;
    const freshCoordinates = coordinates && locationAge >= 0 && locationAge <= 5 * 60 * 1000
      ? coordinates
      : undefined;
    const message = sosActive
      ? `SOS GuardAurora: мне нужна помощь.${freshCoordinates ? ` Последнее местоположение (${Math.round(freshCoordinates.accuracy)} м): https://maps.google.com/?q=${freshCoordinates.latitude},${freshCoordinates.longitude}` : ''}`
      : 'Мне нужна помощь. Пожалуйста, свяжись со мной.';
    const body = encodeURIComponent(message);
    const separator = Platform.OS === 'ios' ? '&' : '?';
    try {
      await Linking.openURL(`sms:${contact.phone}${separator}body=${body}`);
    } catch {
      Alert.alert('Сообщения недоступны', 'Не удалось открыть приложение для SMS.');
    }
  };

  const handleRemove = (c: TrustedContact) => {
    Alert.alert('Удалить?', `${c.name} будет удалён из доверенных лиц.`, [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => removeContact(c.id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

          <ScreenHeader
            eyebrow="Trusted Circle"
            title="Доверенные лица"
            subtitle="Сохранены только на этом устройстве. Свяжитесь с ними вручную."
            right={
              <TouchableOpacity style={styles.addBtn} onPress={openModal}>
                <Ionicons name="add" size={22} color={Colors.white} />
              </TouchableOpacity>
            }
          />

          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.topStats}>
              <GlassCard style={styles.topStatCard} accentColor={Colors.lavender}>
                <View style={styles.topStatInner}>
                  <Text style={styles.topStatNum}>{trustedContacts.length}</Text>
                  <Text style={styles.topStatLabel}>активных контактов</Text>
                </View>
              </GlassCard>
              <GlassCard style={styles.topStatCard} accentColor={Colors.rose}>
                <View style={styles.topStatInner}>
                  <Text style={styles.topStatNum}>Локально</Text>
                  <Text style={styles.topStatLabel}>без автосообщений</Text>
                </View>
              </GlassCard>
            </View>

            <GlassCard style={styles.banner} accentColor={Colors.rose}>
              <View style={styles.bannerRow}>
                <Text style={{ fontSize: 28 }}>📱</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle}>При активации SOS</Text>
                  <Text style={styles.bannerDesc}>SOS не отправляет уведомления. Позвоните контакту вручную из его карточки.</Text>
                </View>
              </View>
            </GlassCard>

            <SectionTitle label="Список контактов" />

            {trustedContacts.length === 0 ? (
              <View style={styles.empty}>
                <Text style={{ fontSize: 60 }}>👥</Text>
                <Text style={styles.emptyTitle}>Нет контактов</Text>
                <Text style={styles.emptyDesc}>Добавьте людей, которым сможете позвонить вручную. Автоматические SOS-сообщения не отправляются.</Text>
              </View>
            ) : (
              trustedContacts.map(c => {
                const color = REL_COLORS[c.relation] ?? Colors.lavender;
                return (
                  <GlassCard key={c.id} style={styles.contactCard} accentColor={color}>
                    <View style={styles.contactRow}>
                      <View style={[styles.ava, { backgroundColor: `${color}18`, borderColor: `${color}50` }]}>
                        <Text style={{ fontSize: 24 }}>{c.avatar}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.contactName}>{c.name}</Text>
                        <Text style={styles.contactPhone}>{c.phone}</Text>
                        <View style={[styles.relTag, { backgroundColor: `${color}18` }]}>
                          <Text style={[styles.relText, { color }]}>{c.relation}</Text>
                        </View>
                      </View>
                      <View style={{ gap: 8 }}>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: Colors.mintGlow }]}
                          accessibilityLabel={`Позвонить ${c.name}`}
                          onPress={() => Linking.openURL(`tel:${c.phone}`).catch(() => Alert.alert('Ошибка', 'Не удалось открыть приложение телефона.'))}
                        >
                          <Ionicons name="call" size={17} color={Colors.mint} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, { backgroundColor: Colors.lavenderGlow }]}
                          accessibilityLabel={`Написать ${c.name}`}
                          onPress={() => textContact(c)}
                        >
                          <Ionicons name="chatbubble-ellipses" size={17} color={Colors.lavender} />
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityLabel={`Удалить ${c.name}`} style={[styles.actionBtn, { backgroundColor: Colors.roseGlow }]} onPress={() => handleRemove(c)}>
                          <Ionicons name="trash-outline" size={17} color={Colors.rose} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </GlassCard>
                );
              })
            )}

            <GradientButton
              label="+ Добавить контакт"
              onPress={openModal}
              colors={Colors.gradPrimary}
              size="md"
              style={{ marginTop: Spacing.md }}
            />
          </ScrollView>
        </Animated.View>
      </SafeAreaView>

      {/* Add Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrap}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Новый контакт</Text>

            {/* Avatar row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
              {AVATARS.map(a => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAvatar(a)}
                  style={[styles.avaOpt, avatar === a && styles.avaOptSelected]}
                >
                  <Text style={{ fontSize: 26 }}>{a}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput style={styles.input} placeholder="Имя" placeholderTextColor={Colors.textMuted} value={name} onChangeText={setName} maxLength={80} returnKeyType="next" />
            <TextInput style={styles.input} placeholder="Номер телефона" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={24} returnKeyType="done" />

            <Text style={styles.inputLabel}>Тип контакта</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.lg }}>
              {RELATIONS.map(r => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRelation(r)}
                  style={[styles.relOpt, relation === r && styles.relOptSelected]}
                >
                  <Text style={[styles.relOptText, relation === r && { color: Colors.white }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={{ color: Colors.textSecondary, fontWeight: '600', fontSize: 16 }}>Отмена</Text>
              </TouchableOpacity>
              <GradientButton label="Сохранить" onPress={handleAdd} colors={Colors.gradPrimary} style={{ flex: 1 }} size="md" />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: Colors.lavenderGlow, borderRadius: Radius.full,
    width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.lavender,
  },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 110 },
  topStats: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  topStatCard: { flex: 1 },
  topStatInner: { padding: Spacing.md, alignItems: 'center', gap: 4 },
  topStatNum: { fontSize: 20, fontWeight: '800', color: Colors.white },
  topStatLabel: { fontSize: 11, color: Colors.textMuted },
  banner: { marginBottom: Spacing.lg },
  bannerRow: { flexDirection: 'row', padding: Spacing.md, gap: 12, alignItems: 'center' },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.white },
  bannerDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 3, lineHeight: 18 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.white },
  emptyDesc: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  contactCard: { marginBottom: 12 },
  contactRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: 12 },
  ava: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  contactName: { fontSize: 16, fontWeight: '700', color: Colors.white },
  contactPhone: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  relTag: { alignSelf: 'flex-start', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, marginTop: 5 },
  relText: { fontSize: 11, fontWeight: '600' },
  actionBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(20,24,30,0.35)' },
  sheet: {
    backgroundColor: Colors.bgElevated, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    padding: Spacing.lg, paddingBottom: 40, borderTopWidth: 1, borderColor: Colors.border,
  },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 999, alignSelf: 'center', marginBottom: Spacing.lg },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: Spacing.lg },
  avaOpt: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.bgGlass,
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  avaOptSelected: { borderColor: Colors.lavender, backgroundColor: Colors.lavenderGlow },
  input: {
    backgroundColor: Colors.bgGlass, borderRadius: Radius.md, borderWidth: 1,
    borderColor: Colors.border, paddingHorizontal: Spacing.md, paddingVertical: 13,
    fontSize: 16, color: Colors.white, marginBottom: Spacing.md,
  },
  inputLabel: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm, fontWeight: '600' },
  relOpt: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full,
    backgroundColor: Colors.bgGlass, borderWidth: 1, borderColor: Colors.border, marginRight: 10,
  },
  relOptSelected: { backgroundColor: Colors.lavenderGlow, borderColor: Colors.lavender },
  relOptText: { fontSize: 14, color: Colors.textMuted, fontWeight: '500' },
  cancelBtn: {
    flex: 1, height: 54, borderRadius: Radius.full, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
});
