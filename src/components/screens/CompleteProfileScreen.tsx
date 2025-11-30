import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowRight, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import queryKeys from '../constants/queryKeys';
import MobileHeader from '../MobileHeader';
import { completeProfileScreenStyles as styles } from '../styles/CompleteProfileScreen.styles';

// Types
type TExhibitorCompany = {
  id: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  booth_number: string;
  hall: string;
  address: string;
  city: string;
  country: string;
  about: string;
  industry: string;
  logo: string;
  established_year: number;
  employee_count: string;
  primary_rep: string;
  team_members?: any;
  products?: any;
  services?: any;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
};

// Types for form data
type EssentialProfileForm = {
  name: string;
  designation: string;
  phone: string;
  address?: string;
  city: string;
  country: string;
  linkedin?: string;
  company?: string;
  industry?: string;
}

type EssentialCompanyForm = {
  name: string;
  email: string;
  phone: string;
  website?: string;
  booth_number?: string;
  hall?: string;
  address?: string;
  city: string;
  country: string;
  about?: string;
}

// Type for Controller field props
type ControllerFieldProps = {
  onChange: (value: string) => void;
  value: string;
}

// Helper function for lenient URL validation
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return true
  // Allow URLs with or without protocol, and basic domain-like strings
  const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  return urlPattern.test(url) || /^(https?:\/\/)?([\da-z\.-]+)$/.test(url)
}

// Helper function for phone validation
const isValidPhone = (phone: string): boolean => {
  return /^\+\d+$/.test(phone)
}

interface CompleteProfileScreenProps {
  onProfileComplete?: () => void;
  onLogout?: () => void;
}

export default function CompleteProfileScreen({ onProfileComplete, onLogout }: CompleteProfileScreenProps = {}) {
  const { data: authData } = useAuth();
  const { currentUser: user, session } = authData || { currentUser: null, session: null };
  // If the user is an admin or super_admin, skip this screen and allow access to main app
  React.useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      // Invalidate queries so the root layout re-evaluates and navigates to the main app
      // Query invalidation triggers the AuthenticatedApp check in app/_layout.tsx
      const invalidate = async () => {
        try {
          const qc = useQueryClient()
          await qc.invalidateQueries({ queryKey: ['user', 'auth', 'currentUser'] })
        } catch (e) {
          // ignore
        }
      }
      invalidate()
    }
  }, [user])
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'individual' | 'company'>('individual');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Get existing company data if it exists (only for exhibitors with company_id)
  const shouldFetchCompany = !!(user?.company_id && user?.role === 'exhibitor')
  const { data: companyData, error: companyError } = useQuery<TExhibitorCompany | null>({
    queryKey: ['company', user?.company_id],
    queryFn: async () => {
      if (!user?.company_id) return null
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user?.company_id)
        .single<TExhibitorCompany>()

      if (error) {
        console.error('Company data fetch error:', error)
        throw new Error(`Failed to fetch company data: ${error.message || 'Unknown error'}`)
      }
      return data
    },
    enabled: shouldFetchCompany,
  })

  // Show error if company data fetch fails
  useEffect(() => {
    if (companyError && shouldFetchCompany) {
      console.error('Company data fetch error:', companyError)
      Alert.alert(
        'Error',
        'Failed to load company data. Please check your connection and try again.',
        [{ text: 'OK' }]
      )
    }
  }, [companyError, shouldFetchCompany])

  // Determine initial tab based on profile completion status
  useEffect(() => {
    if (user?.role === 'exhibitor') {
      // For exhibitors, check if individual profile is complete but company profile is not
      if (user.profile_completed && !user.company_profile_completed) {
        setActiveTab('company')
      }
    }
  }, [user])

  // Check if profile is complete for non-exhibitor users
  const isProfileComplete = user?.role === 'exhibitor'
    ? user?.profile_completed && user?.company_profile_completed
    : user?.profile_completed

  // If profile(s) already complete, this component shouldn't be rendered
  // The layout handles the redirection automatically

  const individualForm = useForm<EssentialProfileForm>({
    mode: 'onSubmit',
    defaultValues: {
      name: user?.name ?? '',
      designation: user?.designation ?? '',
      phone: user?.phone ?? '',
      address: user?.address ?? '',
      city: user?.city ?? '',
      country: user?.country ?? '',
      linkedin: user?.linkedin ?? '',
      company: user?.company ?? '',
      industry: (user as any)?.industry ?? '',
    },
  })

  const companyForm = useForm<EssentialCompanyForm>({
    mode: 'onSubmit',
    defaultValues: {
      name: companyData?.name ?? '',
      email: companyData?.email ?? '',
      phone: companyData?.phone ?? '',
      website: companyData?.website ?? '',
      booth_number: companyData?.booth_number ?? '',
      hall: companyData?.hall ?? '',
      address: companyData?.address ?? '',
      city: companyData?.city ?? '',
      country: companyData?.country ?? '',
      about: companyData?.about ?? '',
    },
  })

  // Update form values when company data loads (for existing companies)
  useEffect(() => {
    if (companyData && user?.role === 'exhibitor') {
      companyForm.reset({
        name: companyData.name ?? '',
        email: companyData.email ?? '',
        phone: companyData.phone ?? '',
        website: companyData.website ?? '',
        booth_number: companyData.booth_number ?? '',
        hall: companyData.hall ?? '',
        address: companyData.address ?? '',
        city: companyData.city ?? '',
        country: companyData.country ?? '',
        about: companyData.about ?? '',
      })
    }
  }, [companyData, companyForm, user?.role])

  const handleSaveProfile = async (formData: EssentialProfileForm) => {
    if (!user?.id) return

    // Manual validation
    const errors: any = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = { message: 'Full name is required' }
    }

    if (!formData.designation || formData.designation.trim() === '') {
      errors.designation = { message: 'Designation is required' }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = { message: 'Phone number is required' }
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = { message: 'Phone number must include country code (e.g., +91 for India)' }
    }

    if (!formData.city || formData.city.trim() === '') {
      errors.city = { message: 'City is required' }
    }

    if (!formData.country || formData.country.trim() === '') {
      errors.country = { message: 'Country is required' }
    }

    if (formData.linkedin && !isValidUrl(formData.linkedin)) {
      errors.linkedin = { message: 'Please enter a valid LinkedIn URL' }
    }

    // For participants and visitors, company and industry are required
    if ((user?.role === 'participant' || user?.role === 'visitor') || formData.company) {
      if (!formData.company || formData.company.trim() === '') {
        errors.company = { message: `Company name is required for ${user?.role}s` }
      }
      if (!formData.industry || formData.industry.trim() === '') {
        errors.industry = { message: `Industry is required for ${user?.role}s` }
      }
    }

    // Set all errors at once
    Object.keys(errors).forEach(key => {
      individualForm.setError(key as keyof EssentialProfileForm, errors[key])
    })

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSavingProfile(true)

    try {
      // Convert form data to match the expected API format
      const updateData = {
        id: user.id,
        profile_completed: true,
        name: formData.name,
        designation: formData.designation,
        phone: formData.phone,
        address: formData.address && formData.address.trim() !== '' ? formData.address : null,
        city: formData.city,
        country: formData.country,
        linkedin: formData.linkedin && formData.linkedin.trim() !== '' ? formData.linkedin : null,
        // Add default values for other required fields that aren't in the form
        company: formData.company && formData.company.trim() !== '' ? formData.company : null,
        industry: formData.industry && formData.industry.trim() !== '' ? formData.industry : null,
        about: null,
        profile_picture: null,
        zip_code: null, // Add this field that's in the schema but not in the form
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error

      queryClient.invalidateQueries({ queryKey: queryKeys.user.currentUser() })

      // For exhibitors, switch to company profile tab after successful individual profile save
      if (user?.role === 'exhibitor') {
        setActiveTab('company')
      } else {
        Alert.alert('Success', 'Profile completed successfully!', [{ text: 'OK' }])
        // Call the completion callback to notify parent component
        onProfileComplete?.()
      }
    } catch (error: any) {
      console.error('Profile save error:', error)
      Alert.alert(
        'Error',
        'Failed to save profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleSaveCompanyProfile = async (formData: EssentialCompanyForm) => {
    if (!user?.id) return

    // Manual validation for company form
    const errors: any = {}

    if (!formData.name || formData.name.trim() === '') {
      errors.name = { message: 'Company name is required' }
    }

    if (!formData.email || formData.email.trim() === '') {
      errors.email = { message: 'Contact email is required' }
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = { message: 'Please enter a valid email address' }
    }

    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = { message: 'Contact phone is required' }
    } else if (!isValidPhone(formData.phone)) {
      errors.phone = { message: 'Phone number must include country code (e.g., +91 for India)' }
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = { message: 'Please enter a valid website URL' }
    }

    if (!formData.city || formData.city.trim() === '') {
      errors.city = { message: 'City is required' }
    }

    if (!formData.country || formData.country.trim() === '') {
      errors.country = { message: 'Country is required' }
    }

    // Set all errors at once
    Object.keys(errors).forEach(key => {
      companyForm.setError(key as keyof EssentialCompanyForm, errors[key])
    })

    // If there are validation errors, don't submit
    if (Object.keys(errors).length > 0) {
      return
    }

    setIsSavingCompany(true)

    try {
      const isEditMode = !!(companyData?.id && user?.role === 'exhibitor' && shouldFetchCompany)

      if (isEditMode) {
        // Update existing company
        const { error } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            website: formData.website || 'https://example.com',
            booth_number: formData.booth_number || '',
            hall: formData.hall || '',
            address: formData.address || '',
            city: formData.city,
            country: formData.country,
            about: formData.about || '',
            industry: companyData?.industry || 'Technology',
            logo: companyData?.logo || '',
            established_year: companyData?.established_year || new Date().getFullYear(),
            employee_count: companyData?.employee_count || '1-10',
          })
          .eq('id', companyData?.id)

        if (error) throw error

        // Ensure the user record references this company and marks company profile complete
        try {
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({
              company_id: companyData?.id ?? null,
              company_profile_completed: true,
            })
            .eq('id', user.id)

          if (userUpdateError) {
            console.error('Failed to update user company info after company update:', userUpdateError)
          }
        } catch (e) {
          console.error('Unexpected error updating user after company update:', e)
        }
      } else if (user?.role === 'exhibitor') {
        // Create new company (only for exhibitor users)
        const { data: insertedCompany, error: insertError } = await supabase
          .from('companies')
          .insert({
            primary_rep: user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            website: formData.website || 'https://example.com',
            booth_number: formData.booth_number || '',
            hall: formData.hall || '',
            address: formData.address || '',
            city: formData.city,
            country: formData.country,
            about: formData.about || '',
            industry: 'Technology',
            logo: '',
            established_year: new Date().getFullYear(),
            employee_count: '1-10',
          })
          .select()
          .single()

        if (insertError) throw insertError

        // If insert returned the new company, associate it with the user and mark company profile complete
        const newCompanyId = (insertedCompany as any)?.id
        if (newCompanyId) {
          try {
            const { error: userUpdateError } = await supabase
              .from('users')
              .update({
                company_id: newCompanyId,
                company_profile_completed: true,
              })
              .eq('id', user.id)

            if (userUpdateError) {
              console.error('Failed to update user with new company_id:', userUpdateError)
            }
          } catch (e) {
            console.error('Unexpected error updating user after company create:', e)
          }
        }
      } else {
        Alert.alert('Error', 'Company profile creation is only available for exhibitor users')
        return
      }

      queryClient.invalidateQueries({ queryKey: ['company'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.user.currentUser() })

      // For exhibitors who just completed their company profile, both profiles are now complete
      // The layout will automatically redirect to the main app
      if (!isEditMode && user?.role === 'exhibitor') {
        // Both profiles are now complete, call the completion callback
        onProfileComplete?.()
        return
      }

      Alert.alert('Success', isEditMode ? 'Company profile updated successfully!' : 'Company profile created successfully!', [{ text: 'OK' }])
      // Call the completion callback for other roles
      onProfileComplete?.()
    } catch (error: any) {
      console.error('Company profile save error:', error)
      Alert.alert(
        'Error',
        'Failed to save company profile. Please check your connection and try again.',
        [{ text: 'OK' }]
      )
    } finally {
      setIsSavingCompany(false)
    }
  }

  // Progress indicator
  const getProgress = () => {
    const individualComplete = user?.profile_completed ? 1 : 0
    const companyComplete = user?.role === 'exhibitor' && user?.company_profile_completed ? 1 : 0
    const total = user?.role === 'exhibitor' ? 2 : 1
    const completed = individualComplete + companyComplete
    return { completed, total, percentage: (completed / total) * 100 }
  }

  const progress = getProgress()

  return (
    <View style={styles.container}>
      <MobileHeader
        showCompactMode={true}
        onLogout={onLogout}
      />
      <LinearGradient colors={["#fef2f2", "#fee2e2"]} style={styles.gradient}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 24}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                Complete Your Profile
              </Text>
              <Text style={styles.headerSubtitle}>
                Complete your profile information to access the app and connect with other attendees
              </Text>
            </View>

            {/* Progress */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressCount}>
                  {progress.completed}/{progress.total} completed
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
              </View>
            </View>

            {/* Profile Form */}
            <View style={styles.formCard}>
              {user?.role === 'exhibitor' ? (
                /* Tabs for Exhibitor Users */
                <>
                  {/* Tab Header */}
                  <View style={styles.tabHeader}>
                    <Text style={styles.tabTitle}>
                      Complete Your Profile
                    </Text>
                    <Text style={styles.tabSubtitle}>
                      Both individual and company profiles are required to access the app
                    </Text>
                  </View>

                  {/* Tab Status */}
                  <View style={styles.tabStatusContainer}>
                    <View style={styles.tabStatusItem}>
                      <Text style={[
                        styles.tabStatusLabel,
                        { color: user?.profile_completed ? '#059669' : '#DC2626' }
                      ]}>
                        Individual Profile
                      </Text>
                      <View style={[
                        styles.tabStatusBadge,
                        { backgroundColor: user?.profile_completed ? '#ECFDF5' : '#FEF2F2' }
                      ]}>
                        <Text style={[
                          styles.tabStatusText,
                          { color: user?.profile_completed ? '#059669' : '#DC2626' }
                        ]}>
                          {user?.profile_completed ? 'Complete' : 'Incomplete'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tabStatusItem}>
                      <Text style={[
                        styles.tabStatusLabel,
                        { color: user?.company_profile_completed ? '#059669' : '#DC2626' }
                      ]}>
                        Company Profile
                      </Text>
                      <View style={[
                        styles.tabStatusBadge,
                        { backgroundColor: user?.company_profile_completed ? '#ECFDF5' : '#FEF2F2' }
                      ]}>
                        <Text style={[
                          styles.tabStatusText,
                          { color: user?.company_profile_completed ? '#059669' : '#DC2626' }
                        ]}>
                          {user?.company_profile_completed ? 'Complete' : 'Incomplete'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Tab Buttons */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === 'individual' && styles.activeTab
                      ]}
                      onPress={() => setActiveTab('individual')}
                    >
                      <Text style={[
                        styles.tabText,
                        activeTab === 'individual' ? styles.activeTabText : styles.inactiveTabText
                      ]}>
                        Individual Profile
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.tab,
                        activeTab === 'company' && styles.activeTab
                      ]}
                      onPress={() => setActiveTab('company')}
                    >
                      <Text style={[
                        styles.tabText,
                        activeTab === 'company' ? styles.activeTabText : styles.inactiveTabText
                      ]}>
                        Company Profile
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Tab Content */}
                  {activeTab === 'individual' ? (
                    <IndividualProfileForm
                      form={individualForm}
                      onSubmit={handleSaveProfile}
                      isSubmitting={isSavingProfile}
                      user={user}
                      activeTab={activeTab}
                    />
                  ) : (
                    <CompanyProfileForm
                      form={companyForm}
                      onSubmit={handleSaveCompanyProfile}
                      isSubmitting={isSavingCompany}
                      user={user}
                      activeTab={activeTab}
                    />
                  )}
                </>
              ) : (
                /* Single Form for Non-Exhibitor Users */
                <>
                  <View style={styles.tabHeader}>
                    <Text style={styles.tabTitle}>
                      Profile Setup
                    </Text>
                    <Text style={styles.tabSubtitle}>
                      Individual profile is required to access the app
                    </Text>
                  </View>

                  <IndividualProfileForm
                    form={individualForm}
                    onSubmit={handleSaveProfile}
                    isSubmitting={isSavingProfile}
                    user={user}
                    activeTab={activeTab}
                    showCompanyFields={user?.role === 'attendee' || user?.role === 'participant' || user?.role === 'visitor'}
                  />
                </>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  )
}

// Individual Profile Form Component
function IndividualProfileForm({
  form,
  onSubmit,
  isSubmitting,
  user,
  showCompanyFields = false,
  activeTab
}: {
  form: any
  onSubmit: (data: EssentialProfileForm) => void
  isSubmitting: boolean
  user: any
  showCompanyFields?: boolean
  activeTab?: 'individual' | 'company'
}) {
  // Determine button text and icon based on user role and current tab
  const getButtonProps = () => {
    // If exhibitor on the individual tab, prompt to continue to company profile
    if (user?.role === 'exhibitor' && activeTab === 'individual') {
      return {
        text: 'Continue',
        icon: ArrowRight,
      }
    }

    return {
      text: 'Save Profile',
      icon: Save,
    }
  }

  const buttonProps = getButtonProps()

  return (
    <View>
      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Full Name *</Text>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.name && styles.inputError
                ]}
                placeholder="John Doe"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.name && (
            <Text style={styles.errorText}>
              {form.formState.errors.name.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Designation/Role *</Text>
          <Controller
            control={form.control}
            name="designation"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.designation && styles.inputError
                ]}
                placeholder="Managing Director"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.designation && (
            <Text style={styles.errorText}>
              {form.formState.errors.designation.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Phone Number *</Text>
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.phone && styles.inputError
                ]}
                placeholder="+91 9876543210"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
              />
            )}
          />
          {form.formState.errors.phone && (
            <Text style={styles.errorText}>
              {form.formState.errors.phone.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>LinkedIn Profile</Text>
          <Controller
            control={form.control}
            name="linkedin"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.linkedin && styles.inputError
                ]}
                placeholder="linkedin.com/in/johndoe"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />
          {form.formState.errors.linkedin && (
            <Text style={styles.errorText}>
              {form.formState.errors.linkedin.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <Controller
          control={form.control}
          name="address"
          render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
            <TextInput
              style={[
                styles.input,
                form.formState.errors.address && styles.inputError
              ]}
              placeholder="Plot No. 14, Peenya Industrial Area"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {form.formState.errors.address && (
          <Text style={styles.errorText}>
            {form.formState.errors.address.message}
          </Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>City *</Text>
          <Controller
            control={form.control}
            name="city"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.city && styles.inputError
                ]}
                placeholder="Bengaluru"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.city && (
            <Text style={styles.errorText}>
              {form.formState.errors.city.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Country *</Text>
          <Controller
            control={form.control}
            name="country"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.country && styles.inputError
                ]}
                placeholder="India"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.country && (
            <Text style={styles.errorText}>
              {form.formState.errors.country.message}
            </Text>
          )}
        </View>
      </View>

      {showCompanyFields && (
        <View style={styles.companySection}>
          <Text style={styles.companyTitle}>
            Company Information
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Company Name *</Text>
            <Controller
              control={form.control}
              name="company"
              render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
                <TextInput
                  style={[
                    styles.input,
                    form.formState.errors.company && styles.inputError,
                    { backgroundColor: user?.company ? '#F9FAFB' : 'white' }
                  ]}
                  placeholder="Company Name"
                  value={value}
                  onChangeText={onChange}
                  editable={!user?.company}
                />
              )}
            />
            {user?.company && (
              <Text style={styles.helperText}>
                Auto-filled from profile
              </Text>
            )}
            {form.formState.errors.company && (
              <Text style={styles.errorText}>
                {form.formState.errors.company.message}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Industry *</Text>
            <Controller
              control={form.control}
              name="industry"
              render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
                <TextInput
                  style={[
                    styles.input,
                    form.formState.errors.industry && styles.inputError
                  ]}
                  placeholder="Technology"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {form.formState.errors.industry && (
              <Text style={styles.errorText}>
                {form.formState.errors.industry.message}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Email Display (read-only) */}
      <View style={styles.emailContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={styles.emailLabel}>Email Address *</Text>
        </View>
        <Text style={styles.emailText}>
          {user?.email}
        </Text>
        <Text style={styles.emailNote}>Email cannot be changed</Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          isSubmitting && styles.buttonDisabled
        ]}
        onPress={form.handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.primaryButtonText}>
              {buttonProps.text}
            </Text>
            <buttonProps.icon size={20} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

// Company Profile Form Component
function CompanyProfileForm({
  form,
  onSubmit,
  isSubmitting,
  user,
  activeTab
}: {
  form: any
  onSubmit: (data: EssentialCompanyForm) => void
  isSubmitting: boolean
  user: any
  activeTab?: 'individual' | 'company'
}) {
  return (
    <View>
      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Company Name *</Text>
          <Controller
            control={form.control}
            name="name"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.name && styles.inputError
                ]}
                placeholder="MedTech Innovations"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.name && (
            <Text style={styles.errorText}>
              {form.formState.errors.name.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Contact Email *</Text>
          <Controller
            control={form.control}
            name="email"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.email && styles.inputError
                ]}
                placeholder="info@medtech-innovations.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            )}
          />
          {form.formState.errors.email && (
            <Text style={styles.errorText}>
              {form.formState.errors.email.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Contact Phone *</Text>
          <Controller
            control={form.control}
            name="phone"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.phone && styles.inputError
                ]}
                placeholder="+91 9876543210"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
              />
            )}
          />
          {form.formState.errors.phone && (
            <Text style={styles.errorText}>
              {form.formState.errors.phone.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Website</Text>
          <Controller
            control={form.control}
            name="website"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.website && styles.inputError
                ]}
                placeholder="medtech-innovations.com"
                value={value}
                onChangeText={onChange}
                autoCapitalize="none"
              />
            )}
          />
          {form.formState.errors.website && (
            <Text style={styles.errorText}>
              {form.formState.errors.website.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Booth Number</Text>
          <Controller
            control={form.control}
            name="booth_number"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.booth_number && styles.inputError
                ]}
                placeholder="B-205"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.booth_number && (
            <Text style={styles.errorText}>
              {form.formState.errors.booth_number.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Hall</Text>
          <Controller
            control={form.control}
            name="hall"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.hall && styles.inputError
                ]}
                placeholder="Hall B"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.hall && (
            <Text style={styles.errorText}>
              {form.formState.errors.hall.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Address</Text>
        <Controller
          control={form.control}
          name="address"
          render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
            <TextInput
              style={[
                styles.input,
                form.formState.errors.address && styles.inputError
              ]}
              placeholder="456 Innovation Blvd"
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        {form.formState.errors.address && (
          <Text style={styles.errorText}>
            {form.formState.errors.address.message}
          </Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>City *</Text>
          <Controller
            control={form.control}
            name="city"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.city && styles.inputError
                ]}
                placeholder="Boston"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.city && (
            <Text style={styles.errorText}>
              {form.formState.errors.city.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputFullWidth}>
          <Text style={styles.label}>Country *</Text>
          <Controller
            control={form.control}
            name="country"
            render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
              <TextInput
                style={[
                  styles.input,
                  form.formState.errors.country && styles.inputError
                ]}
                placeholder="USA"
                value={value}
                onChangeText={onChange}
              />
            )}
          />
          {form.formState.errors.country && (
            <Text style={styles.errorText}>
              {form.formState.errors.country.message}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>About Company</Text>
        <Controller
          control={form.control}
          name="about"
          render={({ field: { onChange, value } }: { field: ControllerFieldProps }) => (
            <TextInput
              style={[
                styles.input,
                form.formState.errors.about && styles.inputError,
                { height: 80, textAlignVertical: 'top' }
              ]}
              placeholder="About your company"
              value={value}
              onChangeText={onChange}
              multiline
              numberOfLines={3}
            />
          )}
        />
        {form.formState.errors.about && (
          <Text style={styles.errorText}>
            {form.formState.errors.about.message}
          </Text>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={[
          styles.primaryButton,
          isSubmitting && styles.buttonDisabled
        ]}
        onPress={form.handleSubmit(onSubmit)}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <View style={styles.buttonContent}>
            <Text style={styles.primaryButtonText}>
              Save Profile
            </Text>
            <Save size={20} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}