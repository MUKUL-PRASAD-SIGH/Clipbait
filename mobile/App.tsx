import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

import { useAuthStore } from './src/store/authStore';
import { useClipboardStore } from './src/store/clipboardStore';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import ClipboardHistoryScreen from './src/screens/ClipboardHistoryScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'History') {
            iconName = focused ? 'clipboard' : 'clipboard-outline';
          } else if (route.name === 'Suggestions') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="History" component={ClipboardHistoryScreen} />
      <Tab.Screen name="Suggestions" component={SuggestionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function App(): JSX.Element {
  const { isAuthenticated, initialize: initAuth } = useAuthStore();
  const { initialize: initClipboard } = useClipboardStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      initClipboard();
    }
  }, [isAuthenticated, initClipboard]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainTabs} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
    </SafeAreaProvider>
  );
}

export default App;