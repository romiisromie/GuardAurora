import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppContext';
import Navigation from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initMonitoring } from './src/lib/monitoring';
import { LanguageProvider } from './src/i18n';
import { Colors, isDark } from './src/theme';

initMonitoring();

export default function App() {
  return (
    <LanguageProvider>
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <AppProvider>
              <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={Colors.bg} />
              <Navigation />
            </AppProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ErrorBoundary>
    </LanguageProvider>
  );
}
