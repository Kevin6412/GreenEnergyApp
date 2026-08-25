import { useRouter } from 'expo-router';
import { Input } from '@/views/ui/input';
import { Text } from '@/views/ui/text';
import { form_style } from '@/app/styles/form_style';
import {
  Pressable,
  type TextInput,
  View,
  Alert,
  Modal,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useState, useRef } from 'react';
import { TOWNS } from '@/lib/town.ts';
import { register_form_style } from '@/app/styles/form_style';

import { useUser } from '@/app/context/UserProfileContext';

import { AuthController } from '@/app/controller/authentication_controller';

export default function SignUpForm() {
  const router = useRouter();

  const [nric, setNric] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  const [showTownDropdown, setShowTownDropdown] = useState(false);

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  function onNRICSubmitEditing() {
    usernameInputRef.current?.focus();
  }

  function onUsernameSubmitEditing() {
    setShowTownDropdown(true);
  }

  function onTownSelect() {
    passwordInputRef.current?.focus();
  }

  function selectTown(town: string) {
    setSelectedTown(town);
    setShowTownDropdown(false);
    onTownSelect();
  }

  async function onSubmit() {
    setLoading(true)
    const {success, error }  = await AuthController.signUp({nric, username, password, town: selectedTown});
    if (success) {
      // Navigate to login or home page after successful registration
      //
      Alert.alert('Successfully Registered!');
      router.replace('/');
    }else {

      Alert.alert('Error with sign-up: ', error);
    }
    setLoading(false)
  }

  const renderTownItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={register_form_style.townItem} onPress={() => selectTown(item)}>
      <Text style={register_form_style.townText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={form_style.container}>
      <View style={form_style.card}>
        <Text style={form_style.title}>Register an account for Green Quest</Text>

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
          <Text style={form_style.label}>Username</Text>
          <Input
            ref={usernameInputRef}
            placeholder="Choose a username"
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            value={username}
            onChangeText={setUsername}
            onSubmitEditing={onUsernameSubmitEditing}
            returnKeyType="next"
            editable={!loading}
            style={form_style.input}
          />
        </View>

        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>Town</Text>
          <TouchableOpacity
            style={[form_style.input, register_form_style.townSelector]}
            onPress={() => setShowTownDropdown(true)}
            disabled={loading}>
            <Text
              style={
                selectedTown
                  ? register_form_style.townSelectedText
                  : register_form_style.townPlaceholderText
              }>
              {selectedTown || 'Select your town'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={form_style.inputContainer}>
          <Text style={form_style.label}>Password</Text>
          <Input
            ref={passwordInputRef}
            secureTextEntry
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            editable={!loading}
            placeholder="Enter your password"
            style={form_style.input}
          />
        </View>

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={[
            form_style.continueButton,
            loading && register_form_style.continueButtonDisabled,
          ]}>
          <Text style={form_style.continueButtonText}>
            {loading ? 'Registering...' : 'Sign up'}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={showTownDropdown}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTownDropdown(false)}>
        <View style={register_form_style.modalOverlay}>
          <View style={register_form_style.modalContent}>
            <Text style={register_form_style.modalTitle}>Select Your Town</Text>
            <FlatList
              data={TOWNS}
              renderItem={renderTownItem}
              keyExtractor={(item) => item}
              style={register_form_style.townList}
              showsVerticalScrollIndicator={true}
            />
            <TouchableOpacity
              style={register_form_style.closeButton}
              onPress={() => setShowTownDropdown(false)}>
              <Text style={register_form_style.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Pressable onPress={() => router.back()} style={form_style.backButton}>
        <Text style={form_style.backButtonText}>BACK TO LOGIN</Text>
      </Pressable>
    </View>
  );
}
