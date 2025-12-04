import type { PostWithUser, Comment } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { getPostLikeStatus, togglePostLike, getPostComments } from '../services/post';
import CommentSection from './CommentSection';

const { width } = Dimensions.get('window');

interface PostDetailProps {
  post: PostWithUser;
  postId?: string; // If post is not passed directly, we can use postId to fetch it
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function PostDetail({ post, postId, onLike, onComment, onShare }: PostDetailProps) {
  const router = useRouter();
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0);
  const [isLiked, setIsLiked] = useState(post?.is_liked_by_user || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [postData, setPostData] = useState<PostWithUser | null>(post || null);

  // If only postId is provided, fetch the post
  useEffect(() => {
    if (postId && !post) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    // You'll need to create a getPostById service function
    // For now, using the existing post prop
    console.log('Fetch post with ID:', postId);
  };

  const loadLikeStatus = async () => {
    try {
      const { isLiked, likesCount } = await getPostLikeStatus(postData?.id || postId || '');
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } catch (error) {
      console.error('Failed to load like status:', error);
    }
  };

  const loadComments = async () => {
    if (!postData?.id && !postId) return;

    setIsLoadingComments(true);
    try {
      const commentsData = await getPostComments(postData?.id || postId || '');
      setComments(commentsData || []);
      setCommentsCount(commentsData?.length || 0);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (postData || postId) {
      loadLikeStatus();
      loadComments();
    }
  }, [postData, postId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadLikeStatus(), loadComments()]);
    setRefreshing(false);
  };

  const handleLike = async () => {
    if (isLikeLoading || !postData) return;

    setIsLikeLoading(true);
    try {
      const result = await togglePostLike(postData.id);
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : Math.max(0, prev - 1));
      onLike?.();
    } catch (error) {
      console.error('Failed to toggle like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleComment = () => {
    setIsCommentModalVisible(true);
    onComment?.();
  };

  const handleCommentsChange = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    setCommentsCount(updatedComments.length);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  // Render media, documents, content, etc. (same as Post.tsx)
  const renderMedia = () => {
    if (!postData?.media_urls || postData.media_urls.length === 0) return null;

    const { media_urls } = postData;
    const imageCount = media_urls.length;

    const getImageLayout = () => {
      if (imageCount === 1) {
        return { rows: [{ images: [0], style: styles.singleImage }] };
      } else if (imageCount === 2) {
        return { rows: [{ images: [0, 1], style: styles.twoImages }] };
      } else if (imageCount === 3) {
        return {
          rows: [
            { images: [0], style: styles.singleImage },
            { images: [1, 2], style: styles.twoImages }
          ]
        };
      } else {
        return {
          rows: [
            { images: [0], style: styles.singleImage },
            { images: [1, 2], style: styles.twoImages }
          ],
          hasOverlay: true,
          overlayCount: imageCount - 3
        };
      }
    };

    const layout = getImageLayout();

    return (
      <View style={styles.mediaContainer}>
        {layout.rows.map((row, rowIndex) => (
          <View key={rowIndex} style={row.style}>
            {row.images.map((imageIndex, colIndex) => {
              const isLastInRow = colIndex === row.images.length - 1;
              const hasOverlay = layout.hasOverlay && rowIndex === layout.rows.length - 1 && isLastInRow;

              return (
                <View key={imageIndex} style={styles.imageWrapper}>
                  <Image
                    source={{ uri: media_urls[imageIndex] }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                  {hasOverlay && (
                    <View style={styles.overlay}>
                      <Text style={styles.overlayText}>+{layout.overlayCount}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const renderDocuments = () => {
    if (!postData?.document_urls || postData.document_urls.length === 0) return null;

    return (
      <View style={styles.documentsContainer}>
        {postData.document_urls.map((url, index) => (
          <TouchableOpacity key={index} style={styles.documentItem} onPress={() => Linking.openURL(url)}>
            <Ionicons name="document" size={20} color="#666" />
            <Text style={styles.documentText} numberOfLines={1}>
              {url.split('/').pop() || 'Document'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (!postData?.content) return null;

    const parseText = (text: string) => {
      const hashtagRegex = /#(\w+)/g;
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = [];
      let lastIndex = 0;
      const matches = [];
      let match;

      while ((match = hashtagRegex.exec(text)) !== null) {
        matches.push({
          type: 'hashtag',
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          value: match[1]
        });
      }

      while ((match = urlRegex.exec(text)) !== null) {
        matches.push({
          type: 'link',
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          value: match[0]
        });
      }

      hashtagRegex.lastIndex = 0;
      urlRegex.lastIndex = 0;
      matches.sort((a, b) => a.start - b.start);

      matches.forEach((match) => {
        if (match.start > lastIndex) {
          parts.push({
            type: 'text',
            text: text.slice(lastIndex, match.start),
            value: text.slice(lastIndex, match.start)
          });
        }
        parts.push(match);
        lastIndex = match.end;
      });

      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          text: text.slice(lastIndex),
          value: text.slice(lastIndex)
        });
      }

      return parts;
    };

    const contentParts = parseText(postData.content);

    return (
      <Text style={styles.content}>
        {contentParts.map((part, index) => {
          if (part.type === 'hashtag') {
            return (
              <Text
                key={index}
                style={styles.hashtag}
                onPress={() => console.log('Hashtag pressed:', part.value)}
              >
                {part.text}
              </Text>
            );
          } else if (part.type === 'link') {
            return (
              <Text
                key={index}
                style={styles.link}
                onPress={() => Linking.openURL(part.value)}
              >
                {part.text}
              </Text>
            );
          } else {
            return <Text key={index}>{part.text}</Text>;
          }
        })}
      </Text>
    );
  };

  const renderYouTubeEmbed = () => {
    if (!postData?.youtube_url) return null;

    const videoId = postData.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];
    if (!videoId) return null;

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <TouchableOpacity style={styles.youtubeContainer} onPress={() => {
        if (postData.youtube_url) {
          Linking.openURL(postData.youtube_url);
        }
      }}>
        <Image source={{ uri: thumbnailUrl }} style={styles.youtubeThumbnail} resizeMode="cover" />
        <View style={styles.youtubeOverlay}>
          <View style={styles.youtubeControls}>
            <TouchableOpacity style={styles.youtubeControlButton} onPress={() => {
              if (postData.youtube_url) {
                Linking.openURL(postData.youtube_url);
              }
            }}>
              <Ionicons name="play-circle" size={48} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.youtubeText}>YouTube Video</Text>
      </TouchableOpacity>
    );
  };

  // Render recent comments preview
  const renderCommentsPreview = () => {
    const recentComments = comments.slice(0, 3); // Show only 3 most recent comments

    if (recentComments.length === 0) {
      return (
        <TouchableOpacity 
          style={styles.noCommentsPreview} 
          onPress={handleComment}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.noCommentsPreviewText}>Be the first to comment</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.commentsPreview}>
        <View style={styles.commentsPreviewHeader}>
          <Text style={styles.commentsPreviewTitle}>
            Recent Comments ({commentsCount})
          </Text>
          <TouchableOpacity onPress={handleComment}>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        
        {recentComments.map((comment) => (
          <View key={comment.id} style={styles.commentPreviewItem}>
            <Image
              source={
                comment.user?.profile_picture
                  ? { uri: comment.user.profile_picture }
                  : require('../../../assets/images/lub-karnataka.png')
              }
              style={styles.commentPreviewAvatar}
            />
            <View style={styles.commentPreviewContent}>
              <Text style={styles.commentPreviewUserName}>
                {comment.user?.name || 'Unknown User'}
              </Text>
              <Text style={styles.commentPreviewText} numberOfLines={2}>
                {comment.content}
              </Text>
              <Text style={styles.commentPreviewTimestamp}>
                {formatDate(comment.created_at)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (!postData && !postId) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading post...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#AF2225']}
        />
      }
    >
      {/* Sponsored Badge */}
      {postData?.sponsored && (
        <View style={styles.sponsoredBadge}>
          <Ionicons name="megaphone" size={14} color="#666" />
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/lub-karnataka.png')}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>
            {postData?.user?.name || 'LUB'}
          </Text>
          <Text style={styles.userDetails}>
            {'Official Updates'}
          </Text>
          <Text style={styles.timestamp}>
            {postData?.created_at ? formatDate(postData.created_at) : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* Media */}
      {renderMedia()}

      {/* YouTube */}
      {renderYouTubeEmbed()}

      {/* Documents */}
      {renderDocuments()}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="thumbs-up" size={16} color="#666" />
          <Text style={styles.statText}>{likesCount} likes</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="chatbubble" size={16} color="#666" />
          <Text style={styles.statText}>{commentsCount} comments</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
          disabled={isLikeLoading}
        >
          <Ionicons
            name={isLiked ? "thumbs-up" : "thumbs-up-outline"}
            size={20}
            color={isLiked ? "#AF2225" : "#666"}
          />
          <Text style={[styles.actionText, isLiked && styles.likedText]}>
            Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>
            Comment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comments Preview */}
      {renderCommentsPreview()}

      {/* Comment Section Modal */}
      <CommentSection
        postId={postData?.id || postId || ''}
        isVisible={isCommentModalVisible}
        onClose={() => setIsCommentModalVisible(false)}
        comments={comments}
        commentsCount={commentsCount}
        onCommentsCountChange={setCommentsCount}
        onCommentsChange={handleCommentsChange}
        onCommentAdd={() => {
          loadComments(); // Refresh comments after adding a new one
          onComment?.();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  sponsoredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sponsoredText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  moreButton: {
    padding: 4,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  hashtag: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  link: {
    color: '#059669',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  mediaContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  singleImage: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  twoImages: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  imageWrapper: {
    flex: 1,
    marginHorizontal: 2,
    position: 'relative',
  },
  gridImage: {
    width: '100%',
    height: 300, // Slightly larger for detail view
    borderRadius: 8,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlayText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  youtubeContainer: {
    marginBottom: 12,
    position: 'relative',
    paddingHorizontal: 16,
  },
  youtubeThumbnail: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  youtubeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
  },
  youtubeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeControlButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  youtubeText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  documentsContainer: {
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
    flex: 1,
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  likedText: {
    color: '#AF2225',
  },
  commentsPreview: {
    padding: 16,
  },
  commentsPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  commentsPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#AF2225',
    fontWeight: '500',
  },
  commentPreviewItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentPreviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  commentPreviewContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  commentPreviewUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  commentPreviewText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 18,
    marginBottom: 4,
  },
  commentPreviewTimestamp: {
    fontSize: 11,
    color: '#6b7280',
  },
  noCommentsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  noCommentsPreviewText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});