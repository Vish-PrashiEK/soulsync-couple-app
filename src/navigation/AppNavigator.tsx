import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { PasscodeScreen } from '../screens/auth/PasscodeScreen';
import { TabNavigator } from './TabNavigator';
import { CallModal } from '../components/CallModal';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Passcode" component={PasscodeScreen} />
        ) : (
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        )}
      </Stack.Navigator>

      {/* Global incoming call alert dialog */}
      {isAuthenticated && <CallModal onAccept={() => {}} />}
    </NavigationContainer>
  );
};

