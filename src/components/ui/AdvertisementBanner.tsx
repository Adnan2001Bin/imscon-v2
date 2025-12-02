import type { Advertisement } from '@/src/types/advertisement';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface AdvertisementBannerProps {
  advertisement: Advertisement;
  onClose?: () => void;
}

export default function AdvertisementBanner({ advertisement, onClose }: AdvertisementBannerProps) {
  const handlePress = async () => {
    if (advertisement.link_url) {
      try {
        const supported = await Linking.canOpenURL(advertisement.link_url);
        if (supported) {
          await Linking.openURL(advertisement.link_url);
        } else {
          Alert.alert('Error', 'Cannot open this link');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open link');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.bannerTouchable}>
        <Image
          source={{ uri: advertisement.image_url }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {advertisement.title}
            </Text>
            {advertisement.link_url && (
              <View style={styles.linkIndicator}>
                <Ionicons name="open-outline" size={14} color="#ffffff" />
                <Text style={styles.linkText}>Tap to learn more</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerTouchable: {
    position: 'relative',
    borderRadius: 8,
  },
  bannerImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 15,
    borderRadius: 8,
  },
  titleContainer: {
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    lineHeight: 20,
  },
  linkIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  linkText: {
    fontSize: 12,
    color: '#ffffff',
    marginLeft: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
});


