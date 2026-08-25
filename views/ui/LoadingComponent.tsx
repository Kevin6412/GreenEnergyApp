import { View } from 'react-native';

import { ImageBackground, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native';
import { Text } from '@/views/ui/text';

export default function Loading() {
  return (
    <ImageBackground
      source={require('@/assets/images/bg-city.png')}
      resizeMode="cover"
      style={loadingStyle.backgroundImage}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00FFAA" />
        <Text style={{ marginTop: 16, color: 'white', fontFamily: 'PressStart2P', fontSize: 8 }}>
          Loading...
        </Text>
      </View>
    </ImageBackground>
  );
}

const loadingStyle = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
