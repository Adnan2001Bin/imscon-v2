import { MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import queryKeys from '../constants/queryKeys';


interface EditProfileForm {
  name: string;
  designation: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  linkedin: string;
  company: string;
  industry: string;
  about: string;
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const form = useForm<EditProfileForm>({
    defaultValues: {
      name: currentUser?.name || '',
      designation: currentUser?.designation || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
      city: currentUser?.city || '',
      country: currentUser?.country || '',
      linkedin: currentUser?.linkedin || '',
      company: currentUser?.company || '',
      industry: currentUser?.industry || '',
      about: (currentUser as any)?.about || '',
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name || '',
        designation: currentUser.designation || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
        linkedin: currentUser.linkedin || '',
        company: currentUser.company || '',
        industry: currentUser.industry || '',
        about: (currentUser as any).about || '',
      });
    }
  }, [currentUser, form]);

  const handleGoBack = () => {
    router.back();
  };

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to select images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhotoWithCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      setIsUploadingImage(true);
      // Supabase Storage bucket APIs require service keys, so instead of checking for the
      // bucket up front we rely on the upload call to tell us if storage is misconfigured.

      // Read file as base64 using expo-file-system
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64',
      });

      // Convert base64 to Uint8Array
      const arrayBuffer = new Uint8Array(
        atob(base64)
          .split('')
          .map(char => char.charCodeAt(0))
      );

      // Create unique filename
      const fileName = `profile-${currentUser?.id}-${Date.now()}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) {
        console.error('Supabase storage error:', error);

        // Handle specific error cases
        if (error.message?.includes('not found') || error.message?.includes('bucket')) {
          Alert.alert(
            'Storage Setup Required',
            'Profile picture storage is not configured. Please contact administrator to set up the storage bucket.',
            [{ text: 'OK' }]
          );
        } else if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
          Alert.alert('Network Error', 'Please check your internet connection and try again.');
        } else if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
          Alert.alert('Permission Error', 'You do not have permission to upload images. Please check your account status.');
        } else {
          Alert.alert('Upload Failed', `Failed to upload image: ${error.message}`);
        }
        return null;
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      return publicUrl.publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);

      // Handle different types of errors
      if (error.message?.includes('Network request failed') || error.message?.includes('fetch')) {
        Alert.alert('Network Error', 'Please check your internet connection and try again.');
      } else if (error.message?.includes('File not found') || error.message?.includes('ENOENT')) {
        Alert.alert('File Error', 'The selected image file could not be found. Please try selecting the image again.');
      } else if (error.message?.includes('unauthorized') || error.message?.includes('permission')) {
        Alert.alert('Permission Error', 'You do not have permission to upload images. Please check your account status.');
      } else {
        Alert.alert('Error', `Failed to upload image: ${error.message || 'Unknown error'}`);
      }
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: takePhotoWithCamera },
        { text: 'Gallery', onPress: pickImageFromGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async (data: EditProfileForm) => {
    if (!currentUser?.id) return;

    // Basic validation
    if (!data.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!data.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    // Phone validation
    const phoneRegex = /^\+\d+$/;
    if (!phoneRegex.test(data.phone)) {
      Alert.alert('Error', 'Phone number must include country code (e.g., +91 for India)');
      return;
    }

    // LinkedIn URL validation if provided
    if (data.linkedin && !isValidUrl(data.linkedin)) {
      Alert.alert('Error', 'Please enter a valid LinkedIn URL');
      return;
    }

    setIsSubmitting(true);

    try {
      let profilePictureUrl = currentUser.profile_picture;

      // Upload image if selected
      let imageUploadSuccess = true;
      if (selectedImage) {
        const uploadedUrl = await uploadImage(selectedImage);
        if (uploadedUrl) {
          profilePictureUrl = uploadedUrl;
        } else {
          imageUploadSuccess = false;
        }
      }

      const updateData = {
        name: data.name.trim(),
        designation: data.designation.trim() || null,
        phone: data.phone.trim(),
        address: data.address.trim() || null,
        city: data.city.trim() || null,
        country: data.country.trim() || null,
        linkedin: data.linkedin.trim() || null,
        company: data.company.trim() || null,
        industry: data.industry.trim() || null,
        about: data.about.trim() || null,
        profile_picture: profilePictureUrl,
      };

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

      if (error) throw error;

      // Refresh user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.currentUser() });

      // Show appropriate success message
      const successMessage = selectedImage && !imageUploadSuccess
        ? 'Profile updated successfully! Image upload failed - please try again.'
        : 'Profile updated successfully!';

      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Profile update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true;
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlPattern.test(url) || /^(https?:\/\/)?([\da-z\.-]+)$/.test(url);
  };

  const renderInput = (
    name: keyof EditProfileForm,
    label: string,
    placeholder: string,
    icon: string,
    multiline = false,
    numberOfLines = 1
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name={icon as any} size={20} color="#6B7280" style={styles.inputIcon} />
        <Controller
          control={form.control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[styles.input, multiline && styles.multilineInput]}
              placeholder={placeholder}
              value={value}
              onChangeText={onChange}
              multiline={multiline}
              numberOfLines={numberOfLines}
              textAlignVertical={multiline ? 'top' : 'center'}
            />
          )}
        />
      </View>
    </View>
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Profile Picture Section */}
            <View style={styles.profilePictureSection}>
              <View style={styles.profilePictureContainer}>
                {selectedImage ? (
                  <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                ) : currentUser?.profile_picture ? (
                  <Image source={{ uri: currentUser.profile_picture }} style={styles.selectedImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {currentUser?.name
                        ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        : currentUser?.email?.[0].toUpperCase() || 'U'
                      }
                    </Text>
                  </View>
                )}
                {isUploadingImage && (
                  <View style={styles.uploadingOverlay}>
                    <MaterialIcons name="cloud-upload" size={24} color="#FFFFFF" />
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleImageSelection}
                disabled={isUploadingImage}
              >
                <MaterialIcons name="camera-alt" size={20} color="#6B7280" />
                <Text style={styles.changePhotoText}>
                  {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {renderInput('name', 'Full Name', 'Enter your full name', 'person')}
              {renderInput('designation', 'Job Title', 'Enter your job title', 'work')}
              {renderInput('phone', 'Phone Number', '+91 9876543210', 'phone')}
              {renderInput('company', 'Company', 'Enter your company name', 'business')}
              {renderInput('industry', 'Industry', 'Enter your industry', 'business-center')}
              {renderInput('address', 'Address', 'Enter your address', 'location-on')}
              {renderInput('city', 'City', 'Enter your city', 'location-city')}
              {renderInput('country', 'Country', 'Enter your country', 'flag')}
              {renderInput('linkedin', 'LinkedIn Profile', 'linkedin.com/in/yourprofile', 'link')}
              {renderInput('about', 'About', 'Tell us about yourself...', 'description', true, 4)}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={form.handleSubmit(handleSave)}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Text>
            {!isSubmitting && <MaterialIcons name="save" size={20} color="#FFFFFF" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  changePhotoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal:20,
    backgroundColor: '#FFFFFF',

  },
  saveButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#666666',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});
