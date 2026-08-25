import { View, ImageBackground } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Text } from '@/views/ui/text';
import ChallengesComponent from '@/views/ui/ChallengesComponent';

import { background_style } from '@/app/styles/background_style';

const SCREEN_OPTIONS = {
  title: 'Menu',
  headerTransparent: true,
};

export default function ChallengeScreen() {
  return (
    <>
      <ImageBackground
        source={require('@/assets/images/bg-city.png')}
        resizeMode="cover"
        style={background_style.backgroundImage}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <ChallengesComponent />
      </ImageBackground>
    </>
  );
}
