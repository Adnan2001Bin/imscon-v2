import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { ArrowRight, Save } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Image,
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
  const [selectedImage, setSelectedImage] = useState<string | null>(user?.profile_picture ?? null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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

  useEffect(() => {
    setSelectedImage(user?.profile_picture ?? null)
  }, [user?.profile_picture])

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

  const shouldShowCompanyFields = user?.role === 'attendee' || user?.role === 'participant' || user?.role === 'visitor'

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

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync()
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions required',
        'Camera and photo library permissions are required to upload a profile photo.',
        [{ text: 'OK' }],
      )
      return false
    }
    return true
  }

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri)
    }
  }

  const handleImageSelection = () => {
    Alert.alert(
      'Profile photo',
      'Choose a source',
      [
        { text: 'Camera', onPress: takePhotoWithCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
    )
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
  }

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true)

      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      })

      const arrayBuffer = new Uint8Array(
        atob(base64)
          .split('')
          .map(char => char.charCodeAt(0)),
      )

      const fileName = `profile-${user?.id}-${Date.now()}.jpg`

      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        })

      if (error) {
        console.error('Supabase storage error:', error)
        Alert.alert('Upload failed', error.message ?? 'Unable to upload image right now.')
        return null
      }

      const { data: publicUrl } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      return publicUrl.publicUrl
    } catch (error: any) {
      console.error('Image upload error:', error)
      Alert.alert('Upload failed', error.message ?? 'Unable to upload image.')
      return null
    } finally {
      setIsUploadingImage(false)
    }
  }

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
      let profilePictureUrl = user?.profile_picture ?? null
      let imageUploadSuccess = true

      if (selectedImage) {
        if (selectedImage.startsWith('http')) {
          profilePictureUrl = selectedImage
        } else {
          const uploadedUrl = await uploadImage(selectedImage)
            if (uploadedUrl) {
              profilePictureUrl = uploadedUrl
            } else {
              imageUploadSuccess = false
            }
        }
      } else if (!selectedImage && user?.profile_picture) {
        profilePictureUrl = null
      }

      if (!imageUploadSuccess) {
        return
      }

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
        profile_picture: profilePictureUrl,
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
            <View style={styles.headerRow}>
              <Text style={styles.headerTitle}>
                Complete Your Profile
              </Text>
              {onLogout && (
                <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
                  <MaterialIcons name="logout" size={16} color="#0f172a" />
                  <Text style={styles.logoutButtonText}>Log out</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.headerSubtitle}>
              Finish onboarding to unlock the community experience.
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
              <>
                <View style={styles.tabHeader}>
                  <Text style={styles.tabTitle}>
                    Complete Your Profile
                  </Text>
                  <Text style={styles.tabSubtitle}>
                    Both individual and company profiles are required to access the app
                  </Text>
                </View>

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

                {activeTab === 'individual' ? (
                  <IndividualProfileForm
                    form={individualForm}
                    onSubmit={handleSaveProfile}
                    isSubmitting={isSavingProfile}
                    user={user}
                    activeTab={activeTab}
                    selectedImage={selectedImage}
                    onSelectImage={handleImageSelection}
                    onRemoveImage={handleRemoveImage}
                    isUploadingImage={isUploadingImage}
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
                  showCompanyFields={shouldShowCompanyFields}
                  selectedImage={selectedImage}
                  onSelectImage={handleImageSelection}
                  onRemoveImage={handleRemoveImage}
                  isUploadingImage={isUploadingImage}
                />
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  activeTab,
  selectedImage,
  onSelectImage,
  onRemoveImage,
  isUploadingImage,
}: {
  form: any
  onSubmit: (data: EssentialProfileForm) => void
  isSubmitting: boolean
  user: any
  showCompanyFields?: boolean
  activeTab?: 'individual' | 'company'
  selectedImage: string | null
  onSelectImage: () => void
  onRemoveImage: () => void
  isUploadingImage: boolean
}) {
  const renderInput = (
    name: keyof EssentialProfileForm,
    label: string,
    placeholder: string,
    icon: string,
    multiline = false,
    numberOfLines = 1
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        form.formState.errors[name] && styles.inputWrapperError,
      ]}>
        <MaterialIcons name={icon as any} size={16} color="#6B7280" style={styles.inputIcon} />
        <Controller
          control={form.control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              placeholder={placeholder}
              placeholderTextColor="#9CA3AF"
              value={value}
              onChangeText={onChange}
              multiline={multiline}
              numberOfLines={numberOfLines}
              textAlignVertical={multiline ? 'top' : 'center'}
            />
          )}
        />
      </View>
      {form.formState.errors[name] && (
        <Text style={styles.errorText}>
          {form.formState.errors[name]?.message}
        </Text>
      )}
    </View>
  );
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
    <View style={styles.formContent}>
      <View style={styles.photoSection}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.photoImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <MaterialIcons name="person" size={40} color="#9CA3AF" />
          </View>
        )}
        <View style={styles.photoButtonsRow}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={onSelectImage}
            disabled={isUploadingImage || isSubmitting}
          >
            {isUploadingImage ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.photoButtonText}>Upload photo</Text>
            )}
          </TouchableOpacity>
          {selectedImage && (
            <TouchableOpacity
              style={styles.photoSecondaryButton}
              onPress={onRemoveImage}
              disabled={isUploadingImage || isSubmitting}
            >
              <Text style={styles.photoSecondaryButtonText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.photoHint}>Square images look best. Max size 2 MB.</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal details</Text>
        {renderInput('name', 'Full Name *', 'John Doe', 'person')}
        {renderInput('designation', 'Job Title *', 'Managing Director', 'work')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact preference</Text>
        {renderInput('phone', 'Phone Number *', '+91 9876543210', 'phone')}
        {renderInput('linkedin', 'LinkedIn Profile', 'linkedin.com/in/johndoe', 'link')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & organization</Text>
        {renderInput('address', 'Address', 'Plot No. 14, Peenya Industrial Area', 'location-on')}
        {renderInput('city', 'City *', 'Bengaluru', 'location-city')}
        {renderInput('country', 'Country *', 'India', 'flag')}

        {showCompanyFields && (
          <View style={styles.companySection}>
            <Text style={styles.companyTitle}>
              Company Information
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <View style={[
                styles.inputWrapper,
                form.formState.errors.company && styles.inputWrapperError,
              ]}>
                <MaterialIcons name="business" size={20} color="#6B7280" style={styles.inputIcon} />
                <Controller
                  control={form.control}
                  name="company"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Company Name"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                      editable={!user?.company}
                    />
                  )}
                />
              </View>
              {user?.company && (
                <Text style={styles.helperText}>
                  Auto-filled from your existing profile
                </Text>
              )}
              {form.formState.errors.company && (
                <Text style={styles.errorText}>
                  {form.formState.errors.company.message}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Industry *</Text>
              <View style={[
                styles.inputWrapper,
                form.formState.errors.industry && styles.inputWrapperError,
              ]}>
                <MaterialIcons name="business-center" size={20} color="#6B7280" style={styles.inputIcon} />
                <Controller
                  control={form.control}
                  name="industry"
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.input}
                      placeholder="Technology"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onChangeText={onChange}
                    />
                  )}
                />
              </View>
              {form.formState.errors.industry && (
                <Text style={styles.errorText}>
                  {form.formState.errors.industry.message}
                </Text>
              )}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account email</Text>
        <View style={styles.emailContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text style={styles.emailLabel}>Email Address *</Text>
          </View>
          <Text style={styles.emailText}>
            {user?.email}
          </Text>
          <Text style={styles.emailNote}>Email cannot be changed</Text>
        </View>
      </View>

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
            <buttonProps.icon size={16} color="#ffffff" />
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
  const renderInput = (
    name: keyof EssentialCompanyForm,
    label: string,
    placeholder: string,
    icon: string,
    multiline = false,
    numberOfLines = 1
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        form.formState.errors[name] && styles.inputWrapperError,
      ]}>
        <MaterialIcons name={icon as any} size={16} color="#6B7280" style={styles.inputIcon} />
          <Controller
            control={form.control}
          name={name}
          render={({ field: { onChange, value } }) => (
              <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
              multiline={multiline}
              numberOfLines={numberOfLines}
              textAlignVertical={multiline ? 'top' : 'center'}
              />
            )}
          />
        </View>
      {form.formState.errors[name] && (
            <Text style={styles.errorText}>
          {form.formState.errors[name]?.message}
            </Text>
          )}
        </View>
  );

  return (
    <View style={styles.formContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Company basics</Text>
        {renderInput('name', 'Company Name *', 'MedTech Innovations', 'business')}
        {renderInput('email', 'Contact Email *', 'info@medtech-innovations.com', 'email')}
        {renderInput('phone', 'Contact Phone *', '+91 9876543210', 'phone')}
        {renderInput('website', 'Website', 'medtech-innovations.com', 'link')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Presence at IMSCON</Text>
        {renderInput('booth_number', 'Booth Number', 'B-205', 'location-on')}
        {renderInput('hall', 'Hall', 'Hall B', 'location-city')}
        {renderInput('address', 'Address', '456 Innovation Blvd', 'location-on')}
        {renderInput('city', 'City *', 'Boston', 'location-city')}
        {renderInput('country', 'Country *', 'USA', 'flag')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Story</Text>
        {renderInput('about', 'About Company', 'About your company', 'description', true, 3)}
      </View>

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
            <Save size={16} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}
