import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const completeProfileScreenStyles = StyleSheet.create({
  // Container & Layout
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },

  // Header Section
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#1c1c1c',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: '#1c1c1c',
    textAlign: 'left',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    gap: 6,
  },
  logoutButtonText: {
    fontFamily: 'Inter_500Medium',
    color: '#0f172a',
    fontSize: 13,
  },

  // Progress
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#374151',
  },
  progressCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 4,
  },


  // Main Form Card
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },

  // Tab Styles (for Exhibitors)
  tabHeader: {
    marginBottom: 16,
  },
  tabTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 20,
    color: '#111827',
    marginBottom: 4,
  },
  tabSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 4,
    margin: 2,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111827',
  },
  inactiveTabText: {
    color: '#6B7280',
  },

  // Form Content
  formContent: {
    width: '100%',
    gap: 20,
  },
  photoSection: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  photoButtonText: {
    color: '#ffffff',
    fontFamily: 'Inter_500Medium',
  },
  photoSecondaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  photoSecondaryButtonText: {
    color: '#111827',
    fontFamily: 'Inter_500Medium',
  },
  photoHint: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Input Styles
  inputGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 16,
  },
  inputFullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  inputWrapperError: {
    borderColor: '#f97316',
    backgroundColor: '#fff7ed',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Inter_400Regular',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#fef2f2',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
  },

  // Read-only Email Display
  emailContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  emailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  emailNote: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Company Information Section
  companySection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginBottom: 16,
  },
  companyTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 12,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#0f172a',
  },

  // Button Styles
  primaryButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    backgroundColor: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: 'white',
    marginRight: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});