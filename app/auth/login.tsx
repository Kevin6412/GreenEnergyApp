import { Stack } from 'expo-router';
import { ImageBackground, StyleSheet } from 'react-native';
import SignInForm from '@/views/sign-in-form';

const SCREEN_OPTIONS = {
  title: '',
  headerShown: false,
};

export default function LoginScreen() {
  return (
    <>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SignInForm />
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
