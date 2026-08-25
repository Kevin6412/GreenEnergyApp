import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: width,
    height: height,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 35, 126, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCardWrapper: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: 'transparent',
  },
  modalCard: {
    backgroundColor: 'rgba(179, 157, 219, 0.95)',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#7E57C2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1A237E',
  },
  cardTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: '#1A237E',
    textAlign: 'center',
    flex: 1,
  },
  closeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4081',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  closeIconText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 16,
  },
  cardContent: {
    padding: 20,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(26, 35, 126, 0.3)',
  },
  greenScoreRow: {
    borderBottomWidth: 0,
    marginTop: 4,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: 'rgba(26, 35, 126, 0.3)',
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 16,
    marginRight: 12,
    width: 24,
  },
  label: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: '#1A237E',
    textTransform: 'uppercase',
  },
  greenScoreLabel: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#1A237E',
    textTransform: 'uppercase',
  },
  value: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#1A237E',
    fontWeight: 'bold',
  },
  greenScoreValue: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FFA726',
    borderColor: '#FF4081',
    borderWidth: 4,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  closeButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: '#3B0A00',
    textAlign: 'center',
  },
});

export { styles };
