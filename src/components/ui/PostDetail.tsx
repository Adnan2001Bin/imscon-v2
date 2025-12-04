import type { PostWithUser } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { addComment, getPostComments, getPostLikeStatus, togglePostLike } from '../services/post';

const { width, height } = Dimensions.get('window');

interface PostDetailProps {
  post: PostWithUser;
  onBack?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function PostDetail({ post, onBack, onLike, onComment, onShare }: PostDetailProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user || false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  // Load initial like status and counts
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const { isLiked, likesCount } = await getPostLikeStatus(post.id);
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      } catch (error) {
        console.error('Failed to load like status:', error);
      }
    };

    loadLikeStatus();
  }, [post.id]);

  // Load comments
  const { data: comments, isLoading: isLoadingComments } = useQuery({
    queryKey: ['post-comments', post.id],
    queryFn: () => getPostComments(post.id),
  });

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

  const handleLike = async () => {
    if (isLikeLoading) return;

    setIsLikeLoading(true);
    try {
      const result = await togglePostLike(post.id);
      setIsLiked(result.liked);
      setLikesCount(prev => result.liked ? prev + 1 : Math.max(0, prev - 1));

      // Call the parent onLike callback if provided
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

  const handleAddComment = async () => {
    if (!commentText.trim() || isCommentLoading) return;

    setIsCommentLoading(true);
    try {
      await addComment(post.id, commentText);
      setCommentsCount(prev => prev + 1);
      setCommentText('');
      setIsCommentModalVisible(false);
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsCommentLoading(false);
    }
  };

  const nextImage = () => {
    if (post.media_urls && currentImageIndex < post.media_urls.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const renderImageGallery = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    return (
      <View style={styles.imageGalleryContainer}>
        <Image
          source={{ uri: post.media_urls[currentImageIndex] }}
          style={styles.fullScreenImage}
          resizeMode="contain"
        />

        {/* Navigation arrows */}
        {post.media_urls.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity style={[styles.navButton, styles.leftButton]} onPress={prevImage}>
                <Ionicons name="chevron-back" size={30} color="white" />
              </TouchableOpacity>
            )}

            {currentImageIndex < post.media_urls.length - 1 && (
              <TouchableOpacity style={[styles.navButton, styles.rightButton]} onPress={nextImage}>
                <Ionicons name="chevron-forward" size={30} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Image counter */}
        {post.media_urls.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.counterText}>
              {currentImageIndex + 1} / {post.media_urls.length}
            </Text>
          </View>
        )}

        {/* Thumbnail strip */}
        {post.media_urls.length > 1 && (
          <ScrollView
            horizontal
            style={styles.thumbnailStrip}
            showsHorizontalScrollIndicator={false}
          >
            {post.media_urls.map((url, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentImageIndex(index)}
                style={styles.thumbnailWrapper}
              >
                <Image
                  source={{ uri: url }}
                  style={[
                    styles.thumbnail,
                    currentImageIndex === index && styles.activeThumbnail
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderDocuments = () => {
    if (!post.document_urls || post.document_urls.length === 0) return null;

    return (
      <View style={styles.documentsContainer}>
        <Text style={styles.sectionTitle}>Documents</Text>
        {post.document_urls.map((url, index) => (
          <TouchableOpacity key={index} style={styles.documentItem}>
            <Ionicons name="document" size={20} color="#666" />
            <Text style={styles.documentText} numberOfLines={1}>
              {url.split('/').pop() || 'Document'}
            </Text>
            <Ionicons name="download" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    // Function to parse text for hashtags and links
    const parseText = (text: string) => {
      const hashtagRegex = /#(\w+)/g;
      const urlRegex = /(https?:\/\/[^\s]+)/g;

      // Split text by hashtags and URLs, then reconstruct with styling
      const parts = [];
      let lastIndex = 0;

      // Find all hashtags and URLs
      const matches = [];
      let match;

      // Find hashtags
      while ((match = hashtagRegex.exec(text)) !== null) {
        matches.push({
          type: 'hashtag',
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          value: match[1]
        });
      }

      // Find URLs
      while ((match = urlRegex.exec(text)) !== null) {
        matches.push({
          type: 'link',
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          value: match[0]
        });
      }

      // Reset regex lastIndex
      hashtagRegex.lastIndex = 0;
      urlRegex.lastIndex = 0;

      // Sort matches by position
      matches.sort((a, b) => a.start - b.start);

      // Build parts array
      matches.forEach((match) => {
        // Add text before this match
        if (match.start > lastIndex) {
          parts.push({
            type: 'text',
            text: text.slice(lastIndex, match.start),
            value: text.slice(lastIndex, match.start)
          });
        }

        // Add the styled match
        parts.push(match);
        lastIndex = match.end;
      });

      // Add remaining text
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          text: text.slice(lastIndex),
          value: text.slice(lastIndex)
        });
      }

      return parts;
    };

    const contentParts = parseText(post.content);

    return (
      <Text style={styles.content}>
        {contentParts.map((part, index) => {
          if (part.type === 'hashtag') {
            return (
              <Text
                key={index}
                style={styles.hashtag}
                onPress={() => {
                  // TODO: Navigate to hashtag search
                  console.log('Hashtag pressed:', part.value);
                }}
              >
                {part.text}
              </Text>
            );
          } else if (part.type === 'link') {
            return (
              <Text
                key={index}
                style={styles.link}
                onPress={() => {
                  Linking.openURL(part.value);
                }}
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
    if (!post.youtube_url) return null;

    const videoId = post.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];

    if (!videoId) return null;

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <View style={styles.youtubeContainer}>
        <Text style={styles.sectionTitle}>Video</Text>
        <TouchableOpacity style={styles.youtubeEmbed} onPress={() => {
          if (post.youtube_url) {
            Linking.openURL(post.youtube_url);
          }
        }}>
          <Image source={{ uri: thumbnailUrl }} style={styles.youtubeThumbnail} resizeMode="cover" />
          <View style={styles.youtubeOverlay}>
            <View style={styles.youtubeControls}>
              <TouchableOpacity style={styles.youtubeControlButton} onPress={() => {
                if (post.youtube_url) {
                  Linking.openURL(post.youtube_url);
                }
              }}>
                <Ionicons name="play-circle" size={48} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.youtubeControlButton} onPress={() => {
                // TODO: Add share functionality
                if (post.youtube_url) {
                  console.log('Share YouTube video:', post.youtube_url);
                }
              }}>
                <Ionicons name="share-social" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.youtubeControlButton} onPress={() => {
                // TODO: Add options menu
                console.log('YouTube options');
              }}>
                <Ionicons name="ellipsis-horizontal" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.youtubeText}>YouTube Video</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require('../../../assets/images/lub-karnataka.png')}
            style={styles.headerAvatar}
          />
          <View>
            <Text style={styles.headerUserName}>LUB</Text>
            <Text style={styles.headerTimestamp}>{formatDate(post.created_at)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        {renderImageGallery()}

        {/* Post Content */}
        <View style={styles.contentContainer}>
          {post.sponsored && (
            <View style={styles.sponsoredBadge}>
              <Ionicons name="megaphone" size={14} color="#666" />
              <Text style={styles.sponsoredText}>Sponsored</Text>
            </View>
          )}

          {renderContent()}

          {/* YouTube Video */}
          {renderYouTubeEmbed()}

          {/* Documents */}
          {renderDocuments()}
        </View>
      </ScrollView>

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
            {likesCount > 0 ? `${likesCount} Like${likesCount !== 1 ? 's' : ''}` : 'Like'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>
            {commentsCount > 0 ? `${commentsCount} Comment${commentsCount !== 1 ? 's' : ''}` : 'Comment'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Comment Modal */}
      <Modal
        visible={isCommentModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCommentModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TouchableOpacity
              style={[styles.postButton, (!commentText.trim() || isCommentLoading) && styles.postButtonDisabled]}
              onPress={handleAddComment}
              disabled={!commentText.trim() || isCommentLoading}
            >
              <Text style={[styles.postButtonText, (!commentText.trim() || isCommentLoading) && styles.postButtonTextDisabled]}>
                {isCommentLoading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={500}
              autoFocus
            />
            <Text style={styles.charCount}>
              {commentText.length}/500
            </Text>
          </View>
        </View>
      </Modal>

      {/* Comments Section */}
      {comments && comments.length > 0 && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({comments.length})</Text>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image
                source={comment.user?.profile_picture ? { uri: comment.user.profile_picture } : require('../../../assets/images/lub-karnataka.png')}
                style={styles.commentAvatar}
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>
                    {comment.user?.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.commentTimestamp}>
                    {formatDate(comment.created_at)}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginTop: 23,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  headerTimestamp: {
    fontSize: 12,
    color: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  imageGalleryContainer: {
    position: 'relative',
  },
  fullScreenImage: {
    width: width,
    height: height * 0.6,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftButton: {
    left: 16,
  },
  rightButton: {
    right: 16,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailStrip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  thumbnailWrapper: {
    marginRight: 8,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 4,
    opacity: 0.6,
  },
  activeThumbnail: {
    opacity: 1,
    borderWidth: 2,
    borderColor: 'white',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    marginTop: -16,
    padding: 16,
    minHeight: height * 0.4,
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
  },
  sponsoredText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  youtubeContainer: {
    marginBottom: 16,
  },
  youtubeEmbed: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  youtubeThumbnail: {
    width: '100%',
    height: 200,
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
    marginBottom: 16,
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
  actions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#AF2225',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  postButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  postButtonTextDisabled: {
    color: '#9ca3af',
  },
  commentInputContainer: {
    flex: 1,
    padding: 20,
  },
  commentInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 8,
  },
  // Comments section styles
  commentsSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});
