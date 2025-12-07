import type { PostWithUser } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { getPostsFeedOptions } from '../services/post';
import Post from './Post';
import PostSkeleton from './PostSkeleton';

interface PostsFeedProps {
  onRefresh?: () => void;
  refreshing?: boolean;
  onScroll?: (event: any) => void;
}

export default function PostsFeed({ onRefresh, refreshing, onScroll }: PostsFeedProps) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery(getPostsFeedOptions());

  const posts = data?.pages.flatMap(page => page.data) || [];

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRefresh = () => {
    refetch();
    onRefresh?.();
  };

  const renderItem = ({ item }: { item: PostWithUser }) => {
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

  const getItemKey = (item: PostWithUser, index: number) => {
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
        <View style={styles.loadingContainer}>
          {Array.from({ length: 5 }, (_, index) => (
            <PostSkeleton key={index} showSponsored={index === 0} />
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
      data={posts}
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
      contentContainerStyle={posts.length === 0 ? styles.contentContainer : styles.postsContainer}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  postsContainer: {
    paddingBottom: 100, // Extra bottom padding for mobile bottom navigation
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
