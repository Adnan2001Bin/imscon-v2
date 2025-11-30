import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Alert, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';

import { useAuth } from '../hooks/useAuth';
import queryKeys from './constants/queryKeys';
let Updates: any
try {

  Updates = require('expo-updates')
} catch (e) {
  Updates = null
}

interface MobileHeaderProps {
  hasBackground?: boolean
  hasBottomBorder?: boolean
  /** Background color (e.g. '#fef2f2') */
  backgroundColor?: string

  showCompactMode?: boolean
  onLogout?: () => void
}

export default function MobileHeader({
  hasBackground = true,
  hasBottomBorder = false,
  backgroundColor = '#fef2f2',
  showCompactMode = false,
  onLogout
}: MobileHeaderProps) {
  const queryClient = useQueryClient();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;

  // Notification functionality removed
  const hasNotifications = false;

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

  return (
    <View
      style={[
        styles.container,
        hasBackground ? { backgroundColor } : styles.transparent,
        hasBottomBorder && styles.bottomBorder
      ]}
    >
      <Image
        source={require('../../assets/images/lub-karnataka.png')}
        style={styles.logo}
        resizeMode='contain'
      />

      {
        showCompactMode ? <View style={styles.compactModeContainer}>
          <TouchableOpacity onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="black" />
          </TouchableOpacity>
        </View> :
          <View style={styles.fullModeContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert('Notifications', 'Notifications feature coming soon!')}
            >
              <Feather name="bell" size={18} color="#fff" />
              {hasNotifications && (
                <View style={styles.notificationDot}></View>
              )}
            </TouchableOpacity>


            {/* Users icon */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => Alert.alert('Profile', 'Profile view coming soon!')}
            >
              <Feather name="users" size={18} color="#fff" />
            </TouchableOpacity>

          </View>
      }






    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 15,
    paddingVertical: 8, // py-2
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // px-4
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb', // border-gray-200
  },
  logo: {
    width: 100,
    height: 70,
  },
  compactModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
  },
  fullModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-[12px]
    position: 'relative',
  },
  iconButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc2626', // bg-primary (red-600)
    height: 40,
    width: 40,
    borderRadius: 20, // rounded-full
  },
  notificationDot: {
    width: 14,
    height: 14,
    backgroundColor: '#ffba0b', // bg-[#FFBA0B]
    borderRadius: 7, // rounded-full
    position: 'absolute',
    top: 0,
    right: 0,
  },
});
