import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing } from '../theme';
import { captureException } from '../lib/monitoring';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    captureException(error, info.componentStack ?? 'ErrorBoundary');
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>Что-то пошло не так</Text>
        <Text style={styles.sub}>Приложение столкнулось с ошибкой. Можно продолжить с главного экрана.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => this.setState({ error: null })}>
          <Text style={styles.btnText}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 12,
  },
  title: { color: Colors.white, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  btn: {
    marginTop: 8,
    backgroundColor: Colors.lavender,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  btnText: { color: Colors.white, fontWeight: '700' },
});
