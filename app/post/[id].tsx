import { getPostsListOptions } from '@/src/components/services/post';
import PostDetail from '@/src/components/ui/PostDetail';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Get all posts and find the one with matching ID
  const { data: posts, isLoading, error } = useQuery(getPostsListOptions());

  const post = posts?.find(p => p.id === id);

  const handleBack = () => {
    router.back();
  };

  const handleLike = () => {
    // TODO: Implement like functionality
    console.log('Like post:', id);
  };

  const handleComment = () => {
    // TODO: Implement comment functionality
    console.log('Comment on post:', id);
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share post:', id);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 16 }}>Loading post...</Text>
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>
          {error ? 'Error loading post' : 'Post not found'}
        </Text>
      </View>
    );
  }

  return (
    <PostDetail
      post={post}
      onBack={handleBack}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
    />
  );
}
