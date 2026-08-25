import { ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '@/views/ui/input';
import { Text } from '@/views/ui/text';
import { form_style } from '@/app/styles/form_style';
import { Pressable, type TextInput, View, Alert } from 'react-native';
import { useState, useRef } from 'react';
import { AuthController } from '@/app/controller/authentication_controller';

import { useUser } from '@/app/context/UserProfileContext';

import { background_style } from '@/app/styles/background_style';
import withTimeout from '@/lib/timeout';

export default function SignInForm() {
  const router = useRouter();

  const [nric, setNric] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserData } = useUser();
  const passwordInputRef = useRef<TextInput>(null);

  function onNRICSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    try {
      await withTimeout(
        signInWithNric(),
        5000 //5 second timeout
      );
    } catch (error) {
      console.error('Error with  signing in :', error);
    } finally {
      setLoading(false); // GUARANTEED to allow another user to login again
    }
  }

  async function signInWithNric() {
    if (!nric || !password) {
      Alert.alert('Error', 'Please enter both NRIC and password');
      return;
    }

    const nricRegex = /^[STFGstfg]\d{7}[A-Za-z]$/;
    if (!nricRegex.test(nric)) {
      Alert.alert('Error', 'Please enter a valid NRIC format (e.g., S1234567A)');
      return;
    }

    setLoading(true);

    try {
      // Use the signIn function from our controller to talk to our model
      const { success,error, user }  = await AuthController.signIn({nric, password});
      if (success) {
        Alert.alert('Success', 'Signed in successfully!');
        setUserData(user) // This sets the context data 
        router.replace('/menu');
      } else {
        Alert.alert('Sign In Failed', 'Invalid NRIC or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    router.push('/auth/register');
  }

  async function handleForgotPassword() {
    Alert.alert('Password Reset', 'Please contact administrator to reset your password');
  }

  return (
    <View style={form_style.container}>
      <View style={form_style.card}>
        <Text style={form_style.title}>Sign in to Green Quest</Text>
        <Text style={form_style.subtitle}>Welcome back! Please sign in to continue</Text>

        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>NRIC</Text>
          <Input
            placeholder="S1234567A"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            value={nric}
            onChangeText={setNric}
            onSubmitEditing={onNRICSubmitEditing}
            returnKeyType="next"
            editable={!loading}
            style={form_style.input}
          />
        </View>

        <View style={form_style.inputContainer}>
          <View style={form_style.passwordHeader}>
            <Text style={form_style.label}>Password</Text>
            <Pressable onPress={handleForgotPassword} disabled={loading}>
              <Text style={form_style.forgotPassword}>Forgot your password?</Text>
            </Pressable>
          </View>
          <Input
            ref={passwordInputRef}
            secureTextEntry
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            returnKeyType="send"
            onSubmitEditing={onSubmit}
            editable={!loading}
            placeholder="Enter your password"
            style={form_style.input}
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[form_style.continueButton, loading && form_style.continueButtonDisabled]}>
          <Text style={form_style.continueButtonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </Pressable>

        <Text style={form_style.signupPrompt}>Don't have an account?</Text>
        <Pressable onPress={handleSignUp} disabled={loading}>
          <Text style={form_style.signupLink}>Sign up</Text>
        </Pressable>
      </View>
    </View>
  );
}
