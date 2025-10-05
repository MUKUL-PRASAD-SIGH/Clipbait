import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, Platform, Text } from 'react-native';
import { ClipboardProvider } from './src/context/ClipboardContext';
import { AuthProvider } from './src/context/AuthContext';

// Screens
import ClipboardScreen from './src/screens/ClipboardScreen';
import SuggestionsScreen from './src/screens/SuggestionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import LoginScreen from './src/screens/LoginScreen';

// Icons - Web compatible
// import Icon from 'react-native-vector-icons/Ionicons';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ClipboardProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" backgroundColor="#007AFF" />
            <Tab.Navigator
              screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                  let iconText: string;

                  if (route.name === 'Clipboard') {
                    iconText = '📋';
                  } else if (route.name === 'Suggestions') {
                    iconText = '🤖';
                  } else if (route.name === 'Settings') {
                    iconText = '⚙️';
                  } else {
                    iconText = '❓';
                  }

                  return <Text style={{ fontSize: size, color }}>{iconText}</Text>;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerStyle: {
                  backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              })}
            >
              <Tab.Screen 
                name="Clipboard" 
                component={ClipboardScreen}
                options={{ title: '📋 Clipboard' }}
              />
              <Tab.Screen 
                name="Suggestions" 
                component={SuggestionsScreen}
                options={{ title: '🤖 AI Suggestions' }}
              />
              <Tab.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: '⚙️ Settings' }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </ClipboardProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}