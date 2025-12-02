import type { PostWithUser } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getAdvertisementsOptions } from '../services/advertisement';
import { getPostsFeedOptions } from '../services/post';
import AdvertisementBanner from './AdvertisementBanner';
import Post from './Post';
import ShowAdsButton from './ShowAdsButton';

interface PostsFeedProps {
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function PostsFeed({ onRefresh, refreshing }: PostsFeedProps) {
  const [showBanner, setShowBanner] = useState(true);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery(getPostsFeedOptions());

  const { data: advertisements } = useQuery(getAdvertisementsOptions());

  const posts = data?.pages.flatMap(page => page.data) || [];

  // Rotate advertisements every 20 seconds
  useEffect(() => {
    if (!advertisements || advertisements.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, [advertisements]);

  const currentAdvertisement = advertisements?.[currentAdIndex] || advertisements?.[0];

  // Create combined data array with advertisement at the top if banner should be shown
  const feedData = React.useMemo(() => {
    const data = [...posts];
    if (showBanner && currentAdvertisement) {
      data.unshift({ type: 'advertisement', data: currentAdvertisement });
    } else if (!showBanner && advertisements && advertisements.length > 0) {
      data.unshift({ type: 'showAdsButton' });
    }
    return data;
  }, [posts, showBanner, currentAdvertisement, advertisements]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.type === 'advertisement') {
      return (
        <AdvertisementBanner
          advertisement={item.data}
          onClose={() => setShowBanner(false)}
        />
      );
    }

    if (item.type === 'showAdsButton') {
      return <ShowAdsButton onShowAds={() => setShowBanner(true)} />;
    }

    // Regular post item
    return (
      <Post
        post={item}
        onLike={() => {
          // TODO: Implement like functionality
          console.log('Like post:', item.id);
        }}
        onComment={() => {
          // TODO: Implement comment functionality
          console.log('Comment on post:', item.id);
        }}
        onShare={() => {
          // TODO: Implement share functionality
          console.log('Share post:', item.id);
        }}
      />
    );
  };

  const getItemKey = (item: any, index: number) => {
    if (item.type === 'advertisement') {
      return `advertisement-${currentAdvertisement?.id || 'current'}`;
    }
    if (item.type === 'showAdsButton') {
      return 'show-ads-button';
    }
    return item.id;
  };

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#AF2225" />
          <Text style={styles.footerText}>Loading more posts...</Text>
        </View>
      );
    }

    if (!hasNextPage && posts.length > 0) {
      return (
        <View style={styles.footer}>
          <Text style={styles.footerText}>You've seen all posts!</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#AF2225" />
          <Text style={styles.emptyText}>Loading posts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color="#dc2626" />
          <Text style={styles.emptyTitle}>Oops! Something went wrong</Text>
          <Text style={styles.emptyText}>
            {error instanceof Error ? error.message : 'Failed to load posts'}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="newspaper" size={48} color="#9ca3af" />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptyText}>
          Be the first to share something with the community!
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={feedData}
      renderItem={renderItem}
      keyExtractor={getItemKey}
      stickyHeaderIndices={showBanner && currentAdvertisement ? [0] : []}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
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
      contentContainerStyle={posts.length === 0 ? styles.contentContainer : undefined}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
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
