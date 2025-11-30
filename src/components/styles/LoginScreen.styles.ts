import { Dimensions, StyleSheet } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallDevice = height < 700;

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
    paddingVertical: isSmallDevice ? 16 : 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // Header Section
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: isSmallDevice ? 24 : 32,
  },
  logoContainer: {
    width: isSmallDevice ? 250 : 300,
    height: isSmallDevice ? 70 : 90,
    marginBottom: isSmallDevice ? 16 : 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
  },
  title: {
    fontSize: isSmallDevice ? 24 : 28,
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#1c1c1c',
    textAlign: 'center',
    lineHeight: isSmallDevice ? 18 : 22,
  },

  // Form Card
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Increased for mobile friendliness
    padding: isSmallDevice ? 16 : 20,
    borderWidth: 1,
    borderColor: '#fef2f2',
  },

  // Mode Toggle
  modeToggleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: isSmallDevice ? 20 : 24,
    color: '#11181C',
    marginBottom: 4,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  modeToggleButton: {
    paddingVertical: 8,
  },
  modeToggleText: {
    fontSize: isSmallDevice ? 14 : 15,
    color: '#6B7280',
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  modeToggleHighlight: {
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
    borderRadius: 8, // Consistent with input field border radius
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    fontSize: 14,
    color: '#166534',
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },

  // Input Styles - Enhanced for mobile
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16, // Slightly larger for better touch targets
    color: '#374151',
    marginBottom: 10, // Increased spacing
    fontFamily: 'Inter_500Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8, // Reduced for more compact design
    paddingHorizontal: 18, // Increased padding
    paddingVertical: 12, // Reduced padding for smaller height
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter_400Regular',
    minHeight: 48, // Reduced minimum touch target size
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 14, // Slightly larger for readability
    color: '#DC2626',
    marginTop: 8, // Increased spacing
    fontFamily: 'Inter_400Regular',
  },

  // Button Styles - Enhanced for mobile
  primaryButton: {
    width: '100%',
    backgroundColor: '#000000',
    paddingVertical: 12, // Reduced height
    borderRadius: 8, // Consistent with input field border radius
    alignItems: 'center',
    justifyContent: 'center',
    
    minHeight: 44, // Reduced height
  },
  registerButton: {
    backgroundColor: '#000000',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 10, // Reduced height
    borderRadius: 8, // Consistent with input field border radius
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    minHeight: 40, // Reduced height
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  secondaryButtonTextBold: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: 'bold'
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: isSmallDevice ? 18 : 20,
    color: '#11181C',
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  emailHighlight: {
    color: '#11181C',
    fontFamily: 'Inter_600SemiBold',
  },

  // Footer
  footer: {
    width: '100%',
    maxWidth: 400,
    marginTop: isSmallDevice ? 24 : 32,
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