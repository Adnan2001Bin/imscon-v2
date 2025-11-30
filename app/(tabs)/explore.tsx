import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ExploreScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Explore LUB Connect</Text>
          <Text style={styles.subtitle}>Manufacturing Future Begins Here</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Authentication</Text>
              <Text style={styles.featureDescription}>
                Secure login with email OTP verification using Supabase
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>User Management</Text>
              <Text style={styles.featureDescription}>
                Complete user registration and profile management
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureTitle}>Cross Platform</Text>
              <Text style={styles.featureDescription}>
                Works on iOS, Android, and Web platforms
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef2f2',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#11181C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 15,
  },
  featureList: {
    gap: 15,
  },
  featureItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
    marginBottom: 6,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
