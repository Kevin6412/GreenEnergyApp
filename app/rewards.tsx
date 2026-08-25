import { View, ImageBackground } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/views/ui/text';
import RewardsComponent from '@/views/ui/RewardsComponent';
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
        <RewardsComponent />
      </ImageBackground>
    </>
  );
}
