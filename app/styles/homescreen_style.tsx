import { StyleSheet } from 'react-native';
const home_styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: 'PressStart2P',
    color: '#00FFAA',
    fontSize: 30,
    textShadowColor: '#FF0044',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 4,
  },
  scoreText: {
    fontFamily: 'PressStart2P',
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  menuButton: {
    backgroundColor: '#FFA726',
    borderColor: '#C35C00',
    borderWidth: 3,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 6,
    marginBottom: 16,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  menuButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});

export { home_styles };
