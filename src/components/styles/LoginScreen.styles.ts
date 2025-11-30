import { StyleSheet } from 'react-native';

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
    width: '100%',
    overflow: 'visible',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 220,
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'contain',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    color: '#11181C',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#1c1c1c',
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formHeader: {
    paddingBottom: 0,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 20,
    color: '#111827',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  formContent: {
    marginTop: 7,
  },
  successText: {
    fontSize: 16,
    color: '#16A34A',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    width: '100%',
    color: '#11181C',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 4,
  },
  button: {
    width: '100%',
    marginTop: 16,
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  switchModeButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 16,
    color: '#374151',
  },
  switchModeLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  emailHighlight: {
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#DC2626', // Red color for register button
  },
  // Dialog styles
  dialogOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialogContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 32,
    width: '80%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 12,
    textAlign: 'center',
  },
  dialogMessage: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  dialogButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dialogCancelButton: {
    backgroundColor: '#F3F4F6',
  },
  dialogSignUpButton: {
    backgroundColor: '#18181B',
  },
  dialogCancelText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  dialogSignUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});
