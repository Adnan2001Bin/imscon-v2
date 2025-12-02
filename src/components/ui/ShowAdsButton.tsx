import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ShowAdsButtonProps {
  onShowAds: () => void;
}

export default function ShowAdsButton({ onShowAds }: ShowAdsButtonProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onShowAds} activeOpacity={0.8}>
        <View style={styles.content}>
          <Ionicons name="megaphone-outline" size={20} color="#AF2225" />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Sponsored Content</Text>
            <Text style={styles.subtitle}>Show Ads</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#AF2225" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#AF2225',
    fontWeight: '500',
  },
});




