import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import ContactsScreen from '../screens/ContactsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { useApp } from '../store/AppContext';
import { Colors, Radius } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', icon: 'shield', label: 'Защита' },
  { name: 'Map', icon: 'map', label: 'Карта' },
  { name: 'Chat', icon: 'chatbubble-ellipses', label: 'ИИ Чат' },
  { name: 'Contacts', icon: 'people', label: 'Контакты' },
  { name: 'History', icon: 'time', label: 'Журнал' },
];

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.bg,
    card: Colors.bg,
    text: Colors.white,
    border: Colors.border,
    primary: Colors.lavender,
  },
};

function CustomTabBar({ state, navigation }: any) {
  const { sosActive, isMonitoring } = useApp();

  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = TABS[index];
          const isHome = route.name === 'Home';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isHome) {
            const ringColor = sosActive
              ? Colors.danger
              : isMonitoring
                ? Colors.lavender
                : Colors.rose;
            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
                <View style={[styles.homeBtnOuter, { shadowColor: ringColor }]}>
                  <View style={[styles.homeBtn, { borderColor: ringColor, backgroundColor: `${ringColor}18` }]}>
                  <Ionicons
                    name={isFocused ? 'shield' : 'shield-outline'}
                    size={22}
                    color={ringColor}
                  />
                  </View>
                </View>
                <Text style={[styles.tabLabel, { color: isFocused ? ringColor : Colors.textMuted }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7}>
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconActive]}>
                <Ionicons
                  name={(isFocused ? tab.icon : `${tab.icon}-outline`) as any}
                  size={21}
                  color={isFocused ? Colors.lavender : Colors.textMuted}
                />
              </View>
              <Text style={[styles.tabLabel, { color: isFocused ? Colors.lavender : Colors.textMuted }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Contacts" component={ContactsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backdrop,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 8,
    borderRadius: 26,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  tabIconWrap: {
    width: 42,
    height: 34,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.lavenderGlow,
  },
  homeBtnOuter: {
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  homeBtn: {
    width: 52,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
