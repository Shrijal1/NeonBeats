import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { PlaylistDetailScreen } from '../screens/PlaylistDetailScreen';
import { MiniPlayer } from '../components/MiniPlayer';
import { COLORS, SIZES } from '../utils/constants';
import { RootStackParamList, BottomTabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function TabBarIcon({
  name,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={name}
      size={24}
      color={focused ? COLORS.neonYellow : COLORS.textMuted}
    />
  );
}

function BottomTabs() {
  return (
    <View style={styles.tabContainer}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.neonYellow,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarBackground: () => <View style={styles.tabBackground} />,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Search"
          component={SearchScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon name={focused ? 'search' : 'search-outline'} focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Library"
          component={LibraryScreen}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                name={focused ? 'library' : 'library-outline'}
                focused={focused}
              />
            ),
          }}
        />
      </Tab.Navigator>
      <MiniPlayer />
    </View>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.neonYellow,
          background: COLORS.background,
          card: COLORS.surface,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.neonBlue,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={BottomTabs} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="PlaylistDetail"
          component={PlaylistDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    height: SIZES.tabBarHeight,
    borderTopWidth: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  tabBackground: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
});
