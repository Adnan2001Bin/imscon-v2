import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  
  // Header Section
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 300,
    height: 90,
    marginBottom: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 16,
    color: '#1c1c1c',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form Card
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Inter_500Medium',
  },
  activeTabText: {
    color: '#11181C',
    fontFamily: 'Inter_600SemiBold',
  },

  // Form Content
  formContent: {
    width: '100%',
  },
  successContainer: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },

  // Input Styles
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
  },

  // Button Styles
  primaryButton: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: '##FFFFFF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
  },
  secondaryButtonTextBold: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: 'bold'
  },
  textButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  textButtonText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    marginHorizontal: 12,
    fontFamily: 'Inter_400Regular',
  },

  // OTP Section
  otpHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpTitle: {
    fontSize: 20,
    color: '#11181C',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
  emailHighlight: {
    color: '#11181C',
    fontFamily: 'Inter_600SemiBold',
  },

  // Footer
  footer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 32,
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  footerLink: {
    color: '#11181C',
    textDecorationLine: 'underline',
    fontFamily: 'Inter_500Medium',
  },
});