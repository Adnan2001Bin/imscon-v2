import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import MobileHeader from '@/src/components/MobileHeader';
import EventDetail from '@/src/components/ui/EventDetail';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getEventOptions } from '../../src/components/services/event';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: event,
    error,
    isLoading,
  } = useQuery(getEventOptions(id!));

  if (isLoading) {
    return (
      <View style={styles.container}>
        <MobileHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#AF2225" />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
        <MobileBottomNavigation />
      </View>
    );
  }

  if (error || !event) {
    return (
      <View style={styles.container}>
        <MobileHeader />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.errorTitle}>Event Not Found</Text>
          <Text style={styles.errorText}>
            {error instanceof Error ? error.message : 'The event you\'re looking for doesn\'t exist or has been removed.'}
          </Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
        <MobileBottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader />
      <View style={styles.content}>
        <EventDetail event={event} />
      </View>
      <MobileBottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
