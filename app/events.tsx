import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import MobileHeader from '@/src/components/MobileHeader';
import EventsFeed from '@/src/components/ui/EventsFeed';
import { useScrollToTop } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

export default function EventsScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Header animation
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useScrollToTop(scrollViewRef);

  const handleRefresh = () => {
    setRefreshing(true);
    // Add any additional refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
      setIsHeaderVisible(false);
      Animated.timing(headerTranslateY, {
        toValue: -80, // Hide header (adjust based on header height)
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else if (diff < 0 && scrollDirection.current !== 'up') {
      // Scrolling up - show header
      scrollDirection.current = 'up';
      setIsHeaderVisible(true);
      Animated.timing(headerTranslateY, {
        toValue: 0, // Show header
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    lastScrollY.current = currentScrollY;
  };

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
        <MobileHeader />
      </Animated.View>
      <View style={[styles.content, { paddingTop: isHeaderVisible ? 75 : 0 }]}>
        <EventsFeed
          onRefresh={handleRefresh}
          refreshing={refreshing}
          onScroll={handleScroll}
        />
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
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
});
