import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
import { User } from '../src/types/user';

export default function ProfileScreen() {
  const router = useRouter();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser as User;

  const handleGoBack = () => {
    router.back();
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };


  const handleLinkedInPress = (url: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open LinkedIn profile');
      });
    }
  };

  const renderProfilePicture = (size = 120) => {
    const imageStyle = [
      styles.profileImage,
      { width: size, height: size, borderRadius: size / 2 },
    ];
    const avatarStyle = [
      styles.avatar,
      { width: size, height: size, borderRadius: size / 2 },
    ];

    if (currentUser?.profile_picture) {
      return (
        <Image
          source={{ uri: currentUser.profile_picture }}
          style={imageStyle}
          resizeMode="cover"
        />
      );
    } else {
      const initials = currentUser?.name
        ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : currentUser?.firstName && currentUser?.lastName
        ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`.toUpperCase()
        : 'U';
      return (
        <View style={avatarStyle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      );
    }
  };

  const renderInfoSection = (title: string, items: Array<{ label: string; value: any; icon?: string; action?: () => void }>) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.infoItem}
          onPress={item.action}
          disabled={!item.action}
        >
          <View style={styles.infoContent}>
            {item.icon && (
              <MaterialIcons name={item.icon as any} size={20} color="#6B7280" style={styles.infoIcon} />
            )}
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoValue}>{item.value || 'Not provided'}</Text>
            </View>
          </View>
          {item.action && (
            <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
          <MaterialIcons name="edit" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {renderProfilePicture(120)}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`}</Text>
            <Text style={styles.designation}>{currentUser.designation || currentUser.position || 'Position not specified'}</Text>
            <Text style={styles.company}>{currentUser.company || 'Company not specified'}</Text>
          </View>
        </View>

        {/* About Section */}
        {currentUser.bio && renderInfoSection('About', [
          { label: 'Bio', value: currentUser.bio }
        ])}

        {/* Contact Information */}
        {renderInfoSection('Contact Information', [
          { label: 'Email', value: currentUser.email, icon: 'email' },
          { label: 'Phone', value: currentUser.phone, icon: 'phone' },
          { label: 'Address', value: currentUser.address, icon: 'location-on' },
          { label: 'City', value: currentUser.city, icon: 'location-city' },
          { label: 'Country', value: currentUser.country, icon: 'flag' },
          { label: 'ZIP Code', value: currentUser.zip_code, icon: 'local-post-office' },
        ])}

        {/* Professional Information */}
        {renderInfoSection('Professional Information', [
          { label: 'Role', value: currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1), icon: 'work' },
          { label: 'Industry', value: currentUser.industry, icon: 'business' },
          { label: 'Position', value: currentUser.position, icon: 'person' },
          { label: 'Company', value: currentUser.company, icon: 'business-center' },
          {
            label: 'LinkedIn',
            value: currentUser.linkedin ? 'View LinkedIn Profile' : 'Not provided',
            icon: 'link',
            action: currentUser.linkedin ? () => handleLinkedInPress(currentUser.linkedin!) : undefined
          },
        ])}

        {/* Account Information */}
        {renderInfoSection('Account Information', [
          { label: 'Member Since', value: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Not available', icon: 'calendar-today' },
          { label: 'Last Updated', value: currentUser.updatedAt ? new Date(currentUser.updatedAt).toLocaleDateString() : 'Not available', icon: 'update' },
          { label: 'Profile Completed', value: currentUser.profile_completed ? 'Yes' : 'No', icon: 'check-circle' },
          { label: 'Company Profile Completed', value: currentUser.company_profile_completed ? 'Yes' : 'No', icon: 'business' },
          { label: 'Status', value: currentUser.status || 'Active', icon: 'info' },
          { label: 'Paid Member', value: currentUser.is_paid ? 'Yes' : 'No', icon: 'payment' },
        ])}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  scrollView: {
    flex: 1,
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
  profileHeader: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  avatar: {
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E5E7EB',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  designation: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  company: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 24,
  },
});
