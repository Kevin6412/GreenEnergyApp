
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 24,
    color: '#FFA726',
    textShadowColor: '#FF0044',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#B39DDB',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    borderWidth: 4,
    borderColor: '#7E57C2',
  },
  username: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  town: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 8,
  },
  townRank: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#4A148C',
    textAlign: 'center',
    marginBottom: 24,
  },
  greenScoreLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 8,
  },
  greenScoreValue: {
    fontFamily: 'PressStart2P',
    fontSize: 32,
    color: '#1A237E',
    textAlign: 'center',
    marginBottom: 24,
  },
  badgesContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
  },
  badgesTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#5E35B1',
    textAlign: 'center',
    marginBottom: 16,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 40,
  },
  backButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  backButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});

export { styles };
