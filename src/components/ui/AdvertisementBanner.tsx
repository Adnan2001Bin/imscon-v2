import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { Advertisement } from '../../types/advertisement';
import { getActiveAdvertisementsOptions } from '../services/advertisement';

const { width: screenWidth } = Dimensions.get('window');

interface AdvertisementBannerProps {
  height?: number;
}

export default function AdvertisementBanner({ height = 120 }: AdvertisementBannerProps) {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Fetch active advertisements
  const { data: advertisements = [], isLoading } = useQuery(getActiveAdvertisementsOptions());

  // Auto-rotate advertisements every 5-6 seconds
  useEffect(() => {
    if (advertisements.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false); // Fade out current ad

      setTimeout(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
        setIsVisible(true); // Fade in next ad
      }, 300); // Half of transition duration
    }, 5500); // 5.5 seconds total (5 seconds display + 0.5 second transition)

    return () => clearInterval(interval);
  }, [advertisements.length]);

  // Handle advertisement click
  const handleAdPress = async (ad: Advertisement) => {
    if (ad.link_url) {
      try {
        await Linking.openURL(ad.link_url);
      } catch (error) {
        console.warn('Failed to open advertisement URL:', error);
      }
    }
  };

  // Don't render if no advertisements or still loading
  if (isLoading || advertisements.length === 0) {
    return null;
  }

  const currentAd = advertisements[currentAdIndex];

  return (
    <View style={[styles.container, { height }]}>
      <TouchableOpacity
        style={styles.bannerTouchable}
        onPress={() => handleAdPress(currentAd)}
        activeOpacity={0.9}
      >
        <Image
          source={{ uri: currentAd.image_url }}
          style={styles.adImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  bannerTouchable: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: '100%',
  },
});
