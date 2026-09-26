import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/store/AppContext';
import Navigation from './src/navigation';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { initMonitoring } from './src/lib/monitoring';

initMonitoring();

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppProvider>
            <StatusBar style="light" backgroundColor="transparent" translucent />
            <Navigation />
          </AppProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
