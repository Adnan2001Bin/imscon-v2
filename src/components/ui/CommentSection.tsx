import type { Comment } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addComment, getPostComments } from '../services/post';

const { width } = Dimensions.get('window');

interface CommentSectionProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
  comments?: Comment[];
  commentsCount: number;
  onCommentsCountChange: (count: number) => void;
  onCommentsChange?: (comments: Comment[]) => void;
  onCommentAdd?: () => void;
}

export default function CommentSection({
  postId,
  isVisible,
  onClose,
  comments: externalComments,
  commentsCount,
  onCommentsCountChange,
  onCommentsChange,
  onCommentAdd,
}: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [internalComments, setInternalComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Use external comments if provided, otherwise use internal state
  const comments = externalComments || internalComments;

  // Load comments when modal opens (only if not using external comments)
  useEffect(() => {
    if (isVisible && !externalComments) {
      loadComments();
    }
  }, [isVisible, externalComments]);

  const loadComments = async () => {
    if (externalComments) return; // Don't load if using external comments

    setIsLoadingComments(true);
    try {
      const commentsData = await getPostComments(postId);
      setInternalComments(commentsData || []);
      // Update comments count to match the actual number of comments
      onCommentsCountChange(commentsData?.length || 0);
    } catch (error) {
      console.error('Failed to load comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || isCommentLoading) return;

    setIsCommentLoading(true);
    try {
      // Add the new comment
      const newComment = await addComment(postId, commentText);

      // Update comments count
      onCommentsCountChange(commentsCount + 1);

      // Clear the input
      setCommentText('');

      // Add the new comment to the list (prepend it to show at the top)
      const updatedComments = [newComment, ...comments];
      if (externalComments && onCommentsChange) {
        onCommentsChange(updatedComments);
      } else {
        setInternalComments(updatedComments);
      }

      onCommentAdd?.();
      Alert.alert('Success', 'Comment added successfully!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setIsCommentLoading(false);
    }
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

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#1f2937" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comments ({comments.length})</Text>
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

        {/* Comment Input */}
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

        {/* Comments List */}
        <View style={styles.commentsListContainer}>
          {isLoadingComments ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments.length > 0 ? (
            <>
              {/* Show newest comments first */}
              {comments.map((comment: Comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={
                      comment.user?.profile_picture
                        ? { uri: comment.user.profile_picture }
                        : require('../../../assets/images/lub-karnataka.png')
                    }
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
            </>
          ) : (
            <View style={styles.noCommentsContainer}>
              <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubText}>
                Be the first to share what you think!
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  postButton: {
    backgroundColor: '#AF2225',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#d1d5db',
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#ffffff',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  commentsListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  commentItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    color: '#1f2937',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#6b7280',
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  noCommentsSubText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
