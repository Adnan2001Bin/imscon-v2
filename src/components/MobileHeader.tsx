import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';

import { useAuth } from '../hooks/useAuth';
import queryKeys from './constants/queryKeys';
let Updates: any
try {
  Updates = require('expo-updates')
} catch (e) {
  Updates = null
}

const DRAWER_WIDTH = 280;

interface MobileHeaderProps {
  hasBackground?: boolean
  hasBottomBorder?: boolean
  /** Background color (e.g. '#fef2f2') */
  backgroundColor?: string
  onLogout?: () => void
}

export default function MobileHeader({
  hasBackground = true,
  hasBottomBorder = false,
  backgroundColor = '#ffffff',
  onLogout
}: MobileHeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;
  const [isDrawerVisible, setDrawerVisible] = React.useState(false);
  const drawerAnimation = React.useRef(new Animated.Value(0)).current;

  // Notification functionality removed
  const hasNotifications = false;

  const openProfileDrawer = () => {
    drawerAnimation.setValue(0);
    setDrawerVisible(true);
    Animated.timing(drawerAnimation, {
      toValue: 1,
      duration: 550, // Increased duration for smoother animation
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const closeProfileDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 350, // Slightly faster on close
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(() => setDrawerVisible(false));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                Alert.alert('Error', 'Failed to logout. Please try again.');
                return;
              }

              // Invalidate the user query to force a refetch
              // This ensures the useAuth hook detects the logout
              await queryClient.invalidateQueries({ queryKey: queryKeys.user.currentUser() });

              // Also clear all queries to ensure clean state
              queryClient.clear();

              // Call the parent logout handler if provided
              if (onLogout) {
                onLogout();
              } else {
                // Fallback: reload the app to ensure a clean state after logout
                try {
                  if (Updates.reloadAsync) {
                    await Updates.reloadAsync()
                  }
                } catch (reloadError) {
                  // If reload fails (e.g. running in dev with no Updates), ignore
                }
              }

            } catch (error) {
              Alert.alert('Error', 'An unexpected error occurred during logout.');
            }
          },
        },
      ]
    );
  };

  const renderProfilePicture = (size = 40, textStyle = styles.avatarTextHeader) => {
    const imageStyle = [
      styles.profilePicture,
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
      // Show avatar with initials or default
      const initials = currentUser?.name
        ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';
      return (
        <View style={avatarStyle}>
          <Text style={textStyle}>{initials}</Text>
        </View>
      );
    }
  };

  const drawerTranslateX = drawerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const drawerBackdropOpacity = drawerAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1], // Smooth backdrop fade
  });

  const handleProfileOptionPress = () => {
    router.push('/profile');
  };

  const handleLogoutFromDrawer = () => {
    closeProfileDrawer();
    handleLogout();
  };

  return (
    <>
      <View
        style={[
          styles.container,
          hasBackground ? { backgroundColor } : styles.transparent,
          hasBottomBorder && styles.bottomBorder
        ]}
      >
        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={openProfileDrawer}
        >
          {renderProfilePicture(32)}
        </TouchableOpacity>

        {/* Right section: Notification icon */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert('Notifications', 'Notifications feature coming soon!')}
          >
            <Feather name="bell" size={16} color="#000000" />
            {hasNotifications && (
              <View style={styles.notificationDot}></View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isDrawerVisible && (
        <Modal
          transparent
          visible={isDrawerVisible}
          animationType="none"
          onRequestClose={closeProfileDrawer}
        >
          <View style={styles.drawerOverlay}>
            <TouchableWithoutFeedback onPress={closeProfileDrawer}>
              <Animated.View
                style={[
                  styles.drawerBackdrop,
                  { opacity: drawerBackdropOpacity },
                ]}
              />
            </TouchableWithoutFeedback>

            <Animated.View
              style={[
                styles.drawerContainer,
                { 
                  transform: [{ translateX: drawerTranslateX }],
                  opacity: drawerAnimation, // Added fade effect with slide
                },
              ]}
            >
              <View style={styles.drawerContent}>
                <View style={styles.drawerHeader}>
                  {renderProfilePicture(72, styles.avatarTextDrawer)}
                  <View style={styles.nameContainer}>
                    <Text style={styles.drawerName}>
                      {currentUser?.name || 'Guest User'}
                    </Text>
                    {/* Verified badge */}
                    <View style={styles.verifiedBadge}>
                      <MaterialIcons name="verified-user" size={24} color="black" />
                    </View>
                  </View>
                  {currentUser?.email && (
                    <Text style={styles.drawerEmail}>{currentUser.email}</Text>
                  )}
                </View>

                <View style={styles.drawerOptions}>
                  <TouchableOpacity
                    style={styles.drawerOptionItem}
                    onPress={handleProfileOptionPress}
                  >
                    <MaterialIcons name="person-outline" size={20} color="#111827" />
                    <Text style={styles.drawerOptionText}>Profile</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerOptionItem}
                    onPress={() => Alert.alert('Settings', 'Settings screen coming soon!')}
                  >
                    <MaterialIcons name="settings" size={20} color="#111827" />
                    <Text style={styles.drawerOptionText}>Settings</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerOptionItem}
                    onPress={() => Alert.alert('Help', 'Help screen coming soon!')}
                  >
                    <MaterialIcons name="help-outline" size={20} color="#111827" />
                    <Text style={styles.drawerOptionText}>Help & Support</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.drawerOptionItem}
                    onPress={() => Alert.alert('About', 'About screen coming soon!')}
                  >
                    <MaterialIcons name="info-outline" size={20} color="#111827" />
                    <Text style={styles.drawerOptionText}>About</Text>
                  </TouchableOpacity>
                </View>

                {/* Logout button at bottom */}
                <View style={styles.bottomSection}>
                  <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogoutFromDrawer}
                  >
                    <MaterialIcons name="logout" size={20} color="#dc2626" />
                    <Text style={styles.logoutText}>Logout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileSubtext: {
    fontSize: 12,
    color: '#6b7280',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextHeader: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  avatarTextDrawer: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    height: 40,
    width: 40,
    borderRadius: 20,
  },
  notificationDot: {
    width: 14,
    height: 14,
    backgroundColor: '#ffba0b',
    borderRadius: 7,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  drawerOverlay: {
    flex: 1,
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 2, height: 0 },
    elevation: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  drawerContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  drawerHeader: {
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',

  },
  drawerName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  drawerEmail: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'left',
  },
  drawerOptions: {
    flex: 1,
    gap: 4,
  },
  drawerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  drawerOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#dc2626',
    fontWeight: '500',
  },
});