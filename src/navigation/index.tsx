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
import LegalScreen from '../screens/LegalScreen';
import { useApp } from '../store/AppContext';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', icon: 'shield', label: 'Защита' },
  { name: 'Map', icon: 'map', label: 'Карта' },
  { name: 'Chat', icon: 'chatbubble-ellipses', label: 'Помощь' },
  { name: 'Contacts', icon: 'people', label: 'Контакты' },
  { name: 'History', icon: 'time', label: 'Журнал' },
  { name: 'Legal', icon: 'information-circle', label: 'Право' },
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

const linking = {
  prefixes: [],
  config: {
    screens: {
      Home: '',
      Map: 'map',
      Chat: 'chat',
      Contacts: 'contacts',
      History: 'history',
      Legal: 'privacy',
    },
  },
};

function CustomTabBar({ state, navigation }: any) {
  const { sosActive } = useApp();

  return (
    <View style={styles.tabBarWrap}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const tab = TABS[index];

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

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.7} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} accessibilityLabel={tab.label}>
              <View style={styles.tabIconWrap}>
                <Ionicons
                  name={(isFocused ? tab.icon : `${tab.icon}-outline`) as any}
                  size={20}
                  color={isFocused ? (sosActive && route.name === 'Home' ? Colors.danger : Colors.lavender) : Colors.textMuted}
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
    <NavigationContainer theme={navTheme} linking={linking}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Chat" component={ChatScreen} />
        <Tab.Screen name="Contacts" component={ContactsScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Legal" component={LegalScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bgElevated,
    borderTopWidth: 1,
    borderColor: Colors.border,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  tabIconWrap: {
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
