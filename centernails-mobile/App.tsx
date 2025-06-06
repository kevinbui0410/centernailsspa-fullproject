import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StripeProvider } from '@stripe/stripe-react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingScreen from './src/screens/BookingScreen';
import PointsScreen from './src/screens/PointsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Import theme
import { COLORS } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <StripeProvider
        publishableKey="your_publishable_key_here"
        urlScheme="centernails"
      >
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
              headerStyle: {
                backgroundColor: COLORS.primary,
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{ title: 'Center Nails' }}
            />
            <Stack.Screen 
              name="Booking" 
              component={BookingScreen}
              options={{ title: 'Book Appointment' }}
            />
            <Stack.Screen 
              name="Points" 
              component={PointsScreen}
              options={{ title: 'Rewards Points' }}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
              options={{ title: 'My Profile' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </StripeProvider>
    </SafeAreaProvider>
  );
} 