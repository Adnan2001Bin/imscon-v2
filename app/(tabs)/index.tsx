import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import MobileHeader from '@/src/components/MobileHeader';
import CompleteProfileScreen from '@/src/components/screens/CompleteProfileScreen';
import LoginScreen from '@/src/components/screens/LoginScreen';
import PostsFeed from '@/src/components/ui/PostsFeed';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);

  // Header animation
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');

  // Use auth hook to automatically restore session on app restart
  const { data: authData, isLoading: isAuthLoading, error: authError } = useAuth();

  // Automatically restore session on app restart
  useEffect(() => {
    if (!isAuthLoading && authData) {
      // User is already logged in and has a valid session
      setIsLoggedIn(true);
      setIsCheckingProfile(true);

      // Check if profile is complete
      checkProfileCompletion(authData.currentUser.id).then((needsCompletion) => {
        setNeedsProfileCompletion(needsCompletion);
        setIsCheckingProfile(false);
      }).catch(() => {
        setNeedsProfileCompletion(true);
        setIsCheckingProfile(false);
      });
    } else if (!isAuthLoading && !authData) {
      // No valid session, show login screen
      setIsLoggedIn(false);
      setNeedsProfileCompletion(false);
      setIsCheckingProfile(false);
    }
  }, [authData, isAuthLoading]);

  // Check if user profile is complete
  const checkProfileCompletion = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('users')
        .select('profile_completed, company_profile_completed, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user data:', error);
        return true; // Assume incomplete if error
      }

      if (!userData) {
        return true; // Profile incomplete if no data
      }

      // For exhibitors, both individual and company profiles must be complete
      if (userData.role === 'exhibitor') {
        return !(userData.profile_completed && userData.company_profile_completed);
      }

      // For other roles, only individual profile needs to be complete
      return !userData.profile_completed;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return true; // Assume incomplete on error
    }
  };

  const handleLoginSuccess = async (isRegistration = false) => {
    setIsLoggedIn(true);
    setIsCheckingProfile(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setNeedsProfileCompletion(true);
        setIsCheckingProfile(false);
        return;
      }

      if (isRegistration) {
        // User just registered, always redirect to profile completion
        setNeedsProfileCompletion(true);
        setIsCheckingProfile(false);
        return;
      }

      // Check if user has completed their profile
      const profileIncomplete = await checkProfileCompletion(user.id);

      if (profileIncomplete) {
        setNeedsProfileCompletion(true);
      } else {
        setNeedsProfileCompletion(false);
        Alert.alert('Success', 'Login successful!');
      }
    } catch (error) {
      console.error('Error in handleLoginSuccess:', error);
      setNeedsProfileCompletion(true); // Default to profile completion on error
    }

    setIsCheckingProfile(false);
  };

  const handleProfileComplete = () => {
    setNeedsProfileCompletion(false);
    Alert.alert('Success', 'Profile completed successfully!');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Error', 'Failed to logout. Please try again.');
        return;
      }
      setIsLoggedIn(false);
      Alert.alert('Success', 'Logged out successfully!');
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred during logout.');
    }
  };

  // Header scroll animation
  const handleScroll = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Determine scroll direction
    if (Math.abs(diff) < 10) return; // Ignore small movements

    if (diff > 0 && scrollDirection.current !== 'down') {
      // Scrolling down - hide header
      scrollDirection.current = 'down';
      Animated.timing(headerTranslateY, {
        toValue: -80, // Hide header (adjust based on header height)
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < 0 && scrollDirection.current !== 'up') {
      // Scrolling up - show header
      scrollDirection.current = 'up';
      Animated.timing(headerTranslateY, {
        toValue: 0, // Show header
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

  // Show beautiful loading screen while checking authentication
  if (isAuthLoading) {
    return (
      <View style={styles.authLoadingContainer}>
        <View style={styles.authLoadingCard}>
          <ActivityIndicator size="large" color="#AF2225" />
          <Text style={styles.authLoadingText}>Checking authentication...</Text>
          <Text style={styles.authLoadingSubtext}>Please wait while we verify your session</Text>
        </View>
      </View>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  if (isCheckingProfile) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingText}>Checking profile...</Text>
        </View>
      </View>
    );
  }

  if (needsProfileCompletion) {
    return <CompleteProfileScreen onProfileComplete={handleProfileComplete} onLogout={handleLogout} />;
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <MobileHeader onLogout={handleLogout} />
      </Animated.View>

      <View style={styles.feedContainer}>
        <PostsFeed onScroll={handleScroll} />
      </View>

      <MobileBottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
  },
  feedContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: 75, // Space for the header (adjust based on header height)
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  authLoadingContainer: {
    flex: 1,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authLoadingCard: {
    backgroundColor: '#ffffff',
    padding: 32,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    minWidth: 280,
  },
  authLoadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    textAlign: 'center',
  },
  authLoadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
