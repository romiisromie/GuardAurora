import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, Animated, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store/AppContext';
import { SectionTitle } from '../components/ui';
import { Colors, Spacing, Radius } from '../theme';

const LOGO = require('../../assets/logo.png');

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

const QUICK = [
  'Я чувствую угрозу',
  'Как использовать SOS?',
  'Нужен безопасный маршрут',
  'Как успокоиться?',
  'Меня преследуют — что делать?',
];

const SYSTEM = `Ты — GuardAurora AI, заботливый помощник безопасности в мобильном приложении для защиты детей и девушек.

Функции GuardAurora:
- SOS кнопка: нажать в центре экрана (отсчёт 3 сек до активации)
- Тихий SOS: встряхнуть телефон 3 раза быстро
- Мониторинг: кнопка «Включить мониторинг» — ИИ слушает окружение
- Карта: вкладка «Карта» — найти безопасный маршрут и ближайшую помощь

Отвечай только по-русски. Будь краток, тёпл, поддерживающим. В экстренных ситуациях — сразу конкретные шаги.`;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { status, isMonitoring, trustedContacts } = useApp();
  const [messages, setMessages] = useState<Msg[]>([{
    id: '0', role: 'assistant', ts: Date.now(),
    text: 'Привет! Я GuardAurora AI — твой помощник по безопасности 🛡️\n\nЯ помогу тебе разобраться с приложением, поддержу в трудной ситуации и дам инструкции при угрозе.\n\nО чём хочешь спросить?',
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const user: Msg = { id: Date.now().toString(), role: 'user', text: text.trim(), ts: Date.now() };
    setMessages(p => [...p, user]);
    setInput('');
    setLoading(true);

    try {
      const ctx = `Статус: ${status}, мониторинг: ${isMonitoring}, контактов: ${trustedContacts.length}`;
      const apiMessages = [
        ...messages
          .filter(m => !(m.role === 'assistant' && m.id === '0'))
          .map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: text.trim() },
      ];
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM + '\n\nКонтекст: ' + ctx,
          messages: apiMessages,
        }),
      });
      const data = await res.json();
      const reply = data?.content?.[0]?.text ?? 'Не удалось получить ответ. Если ты в опасности — используй кнопку SOS.';
      setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply, ts: Date.now() }]);
    } catch {
      setMessages(p => [...p, {
        id: (Date.now() + 1).toString(), role: 'assistant', ts: Date.now(),
        text: 'Нет интернета. При угрозе — нажми SOS или встряхни телефон 3 раза.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={['#0c0517', '#1a1030']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.aiAvatarWrap}>
                <Image source={LOGO} style={styles.aiAvatar} resizeMode="contain" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerEyebrow}>ИИ-помощник</Text>
                <Text style={styles.headerTitle}>GuardAurora AI</Text>
                <View style={styles.onlineRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.onlineText}>Всегда готов помочь</Text>
                </View>
              </View>
            </View>

            {/* Messages */}
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={[styles.msgs, { paddingBottom: 22 }]}
              showsVerticalScrollIndicator={false}
            >
              {messages.map(m => (
                <View key={m.id} style={[styles.msgRow, m.role === 'user' ? styles.rowUser : styles.rowAI]}>
                  {m.role === 'assistant' && (
                    <View style={styles.aiBubbleAvatar}>
                      <Image source={LOGO} style={{ width: 18, height: 18 }} resizeMode="contain" />
                    </View>
                  )}
                  <View style={[styles.bubble, m.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                    <Text style={[styles.bubbleText, m.role === 'user' ? styles.textUser : styles.textAI]}>
                      {m.text}
                    </Text>
                    <Text style={styles.bubbleTime}>{fmt(m.ts)}</Text>
                  </View>
                </View>
              ))}
              {loading && (
                <View style={[styles.msgRow, styles.rowAI]}>
                  <View style={styles.aiBubbleAvatar}>
                    <Image source={LOGO} style={{ width: 18, height: 18 }} resizeMode="contain" />
                  </View>
                  <View style={[styles.bubble, styles.bubbleAI]}>
                    <Dots />
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Quick prompts */}
            {messages.length < 3 && (
              <View style={styles.quickWrap}>
                <View style={{ paddingHorizontal: Spacing.lg }}>
                  <SectionTitle label="Быстрые запросы" />
                </View>
                <ScrollView
                  horizontal showsHorizontalScrollIndicator={false}
                  style={styles.quickScroll}
                  contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8 }}
                >
                  {QUICK.map(q => (
                    <TouchableOpacity key={q} style={styles.chip} onPress={() => send(q)}>
                      <Text style={styles.chipText}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Input */}
            <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 8) + 74 }]}>
              <TextInput
                style={styles.input}
                placeholder="Напиши сообщение..."
                placeholderTextColor={Colors.textMuted}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                onPress={() => send(input)}
                disabled={!input.trim() || loading}
                style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.35 }]}
              >
                <LinearGradient colors={Colors.gradPrimary} style={styles.sendGrad}>
                  <Ionicons name="send" size={17} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function Dots() {
  const anims = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    anims.forEach((a, i) => {
      const loop = Animated.loop(Animated.sequence([
        Animated.delay(i * 200),
        Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(400),
      ]));
      loop.start();
      return () => loop.stop();
    });
  }, []);
  return (
    <View style={{ flexDirection: 'row', gap: 5, padding: 4 }}>
      {anims.map((a, i) => (
        <Animated.View key={i} style={{
          width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.lavender,
          opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
        }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderColor: Colors.border,
  },
  aiAvatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.lavenderGlow, borderWidth: 1.5, borderColor: Colors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  aiAvatar: { width: 28, height: 28 },
  headerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.lavender,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.white },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.mint },
  onlineText: { fontSize: 12, color: Colors.mint },
  msgs: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.xl, gap: 14 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowUser: { justifyContent: 'flex-end' },
  rowAI: { justifyContent: 'flex-start' },
  aiBubbleAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: Colors.lavenderGlow, borderWidth: 1, borderColor: Colors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: Spacing.md },
  bubbleUser: { backgroundColor: '#6d3fe3', borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: Colors.bgCardLight, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: Colors.border },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  textUser: { color: Colors.white },
  textAI: { color: Colors.white },
  bubbleTime: { fontSize: 10, color: Colors.textMuted, marginTop: 5, alignSelf: 'flex-end' },
  quickWrap: { marginBottom: 8 },
  quickScroll: { marginBottom: 8 },
  chip: {
    backgroundColor: Colors.lavenderGlow, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: `${Colors.lavender}45`,
  },
  chipText: { fontSize: 13, color: Colors.lavender, fontWeight: '500' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderTopWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bgElevated,
  },
  input: {
    flex: 1, backgroundColor: Colors.bgCard,
    borderRadius: 18, borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: Colors.white, maxHeight: 120,
  },
  sendBtn: { width: 46, height: 46 },
  sendGrad: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});
