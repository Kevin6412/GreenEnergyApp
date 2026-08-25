import { StyleSheet } from 'react-native';

const form_style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: '#00FFAA',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 14, // Reduced from 16
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
    flexWrap: 'wrap',
    flexShrink: 1, // Added to allow shrinking
    width: '100%', // Ensure it takes full width
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 12, // Reduced from 25
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%', // Ensure full width
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    marginBottom: 8,
    flexWrap: 'wrap',

    width: '100%', // Ensure it takes full width
    flexShrink: 1,
  },
  input: {
    borderColor: '#00FFAA',
    borderWidth: 2,
    color: 'black',
    borderRadius: 8,
    fontFamily: 'PressStart2P',
    fontSize: 10,
    padding: 12,
    minHeight: 44, // Ensure minimum touch target
    width: '100%', // Full width
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,

    flexWrap: 'wrap',
    flexShrink: 1, // Added to allow shrinking
    width: '100%', // Ensure it takes full width
  },
  forgotPassword: {
    fontFamily: 'PressStart2P',
    fontSize: 7,
    color: '#00FFAA',
    flexWrap: 'wrap',
    width: '100%', // Ensure it takes full width
  },
  continueButton: {
    backgroundColor: '#FFA726',
    borderColor: '#C35C00',
    borderWidth: 3,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    width: '100%', // Full width
    minHeight: 50, // Ensure minimum touch target
  },
  continueButtonDisabled: {
    backgroundColor: '#CC8855',
    opacity: 0.6,
  },
  continueButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#3B0A00',
    textAlign: 'center',
    flexWrap: 'wrap',
    lineHeight: 15,
    flexShrink: 1,
    width: '100%',
  },
  signupPrompt: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    flexShrink: 1,
    width: '100%',
  },
  signupLink: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#00FFAA',
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 32,
    minHeight: 50, // Ensure minimum touch target
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
});

const register_form_style = StyleSheet.create({
  continueButtonDisabled: {
    opacity: 0.6,
  },
  townSelector: {
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  townSelectedText: {
    fontFamily: 'PressStart2P',
    color: '#fff',
    fontSize: 16,
  },
  townPlaceholderText: {
    fontFamily: 'PressStart2P',
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  townList: {
    maxHeight: 400,
  },
  townItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  townText: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export { form_style, register_form_style };
