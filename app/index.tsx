import { ImageBackground, StyleSheet } from 'react-native';
import { Button } from '@/views/ui/button';
import { Icon } from '@/views/ui/icon';
import { Text } from '@/views/ui/text';
import { Link, Stack } from 'expo-router';
import { MoonStarIcon, StarIcon, SunIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { background_style } from '@/app/styles/background_style';

import MenuComponent from '@/views/ui/MenuComponent';

import SignInForm from '@/views/sign-in-form';

const SCREEN_OPTIONS = {
  title: '',
  headerTransparent: true,
};

export default function Screen() {
  const { colorScheme } = useColorScheme();

  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />

      <ImageBackground
        source={require('@/assets/images/bg-city.png')}
        resizeMode="cover"
        style={background_style.backgroundImage}>
        <SignInForm />
      </ImageBackground>
    </>
  );
}
