import { View, ImageBackground, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import ProfileComponent from '@/views/ui/ProfileComponent';

import { background_style } from '@/app/styles/background_style';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
};

export default function MapScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <ImageBackground
        source={require('@/assets/images/bg-city.png')}
        resizeMode="cover"
        style={background_style.backgroundImage}>
        <ProfileComponent />
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
