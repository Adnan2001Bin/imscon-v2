import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import MobileHeader from '@/src/components/MobileHeader';
import EventsFeed from '@/src/components/ui/EventsFeed';
import { useScrollToTop } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function EventsScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);

  useScrollToTop(scrollViewRef);

  const handleRefresh = () => {
    setRefreshing(true);
    // Add any additional refresh logic here
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleScroll = (event: any) => {
    // Handle scroll events if needed
  };

  return (
    <View style={styles.container}>
      <MobileHeader />
      <View style={styles.content}>
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
  content: {
    flex: 1,
  },
});
