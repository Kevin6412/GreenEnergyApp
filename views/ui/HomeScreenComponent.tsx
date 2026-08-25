import { View, Text, ImageBackground, Pressable, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { supabase } from '../../lib/supabase';
import type { Href } from 'expo-router';

import { useState, useEffect } from 'react';

import { useUser } from '@/app/context/UserProfileContext';

import { home_styles } from '@/app/styles/homescreen_style';

export default function HomeScreen() {
  //There is no need to spilt to model,since there are no logic used
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const [loading, setLoading] = useState(false);

  const { profile } = useUser();

  const greenScore = profile?.green_score ?? 0; // We use ? here, initially i used let , which adds unnecessary complexity
  const residency = profile?.town ?? 'Unknown'; // So can be null
  const userName = profile?.username ?? 'User'; // We use ? here, initially i used let , which adds unnecessary complexity
  const townRanking = profile?.town_ranking ?? -1; // We use ? here, initially i used let , which adds unnecessary complexity

  const routes: { label: string; path: Href }[] = [
    { label: 'MAP', path: '/map' },
    { label: 'PROFILE', path: '/profile' },
    { label: 'SCOREBOARD', path: '/scoreboard' },
    { label: 'REWARDS', path: '/rewards' },
    { label: 'CHALLENGES', path: '/challenges' },
  ];

  return (
    <ImageBackground
      source={require('@/assets/images/bg-city.png')}
      resizeMode="cover"
      style={styles.backgroundImage}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={home_styles.container}>
        <Text style={home_styles.title}>GREEN{'\n'}QUEST</Text>

        <Text style={home_styles.welcomeText}>
          Welcome {userName}!,{'\n'} {residency} Resident
        </Text>

        <Text style={home_styles.scoreText}>Your Green Score: {greenScore}</Text>

        {routes.map(({ label, path }) => (
          <Pressable key={label} onPress={() => router.push(path)} style={home_styles.menuButton}>
            <Text style={home_styles.menuButtonText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
