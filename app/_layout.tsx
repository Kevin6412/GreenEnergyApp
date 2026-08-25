import '@/global.css';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, Text } from 'react-native';

import { UserProvider } from '@/app/context/UserProfileContext';
import { ImageBackground, StyleSheet } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PressStart2P: require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </UserProvider>
  );
}
