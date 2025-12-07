import type { EventWithUser } from '@/src/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getEventsFeedOptions } from '../services/event';
import Event from './Event';
import EventSkeleton from './EventSkeleton';

interface EventsFeedProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (event: any) => void;
}

export default function EventsFeed({ onRefresh, refreshing, onScroll }: EventsFeedProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery(getEventsFeedOptions());

  const events = data?.pages.flatMap(page => page.data) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const renderItem = ({ item }: { item: EventWithUser }) => {
    return <Event event={item} />;
  };

  const getItemKey = (item: EventWithUser) => {
    return item.id;
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#AF2225" />
          <Text style={styles.footerText}>Loading more events...</Text>
        </View>
      );
    }

    if (!hasNextPage && events.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>You've seen all events!</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          {Array.from({ length: 4 }, (_, index) => (
            <EventSkeleton
              key={index}
              showCoverImage={index !== 2}
              showAttachments={index === 0}
            />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.emptyTitle}>Oops! Something went wrong</Text>
          <Text style={styles.emptyText}>
            {error instanceof Error ? error.message : 'Failed to load events'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No events yet</Text>
        <Text style={styles.emptyText}>
          Check back later for upcoming events and conferences!
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={getItemKey}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      onScroll={onScroll}
      scrollEventThrottle={16}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || false}
          onRefresh={handleRefresh}
          colors={['#AF2225']}
          tintColor="#AF2225"
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={events.length === 0 ? styles.contentContainer : styles.eventsContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  eventsContainer: {
    paddingBottom: 80, // Extra bottom padding for mobile bottom navigation
  },
  loadingContainer: {
    paddingVertical: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#AF2225',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
