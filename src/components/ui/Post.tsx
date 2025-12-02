import type { PostWithUser } from '@/src/types/post';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface PostProps {
  post: PostWithUser;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function Post({ post, onLike, onComment, onShare }: PostProps) {
  const router = useRouter();

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

  const renderMedia = () => {
    if (!post.media_urls || post.media_urls.length === 0) return null;

    const { media_urls } = post;
    const imageCount = media_urls.length;

    // Facebook-like image grid layout
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
        // 4+ images: show first 3, with overlay on last
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
      <TouchableOpacity style={styles.mediaContainer} onPress={() => {
        router.push(`/post/${post.id}`);
      }}>
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
      </TouchableOpacity>
    );
  };

  const renderDocuments = () => {
    if (!post.document_urls || post.document_urls.length === 0) return null;

    return (
      <View style={styles.documentsContainer}>
        {post.document_urls.map((url, index) => (
          <TouchableOpacity key={index} style={styles.documentItem}>
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

    // Extract video ID from YouTube URL
    const videoId = post.youtube_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1];

    if (!videoId) return null;

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
      <TouchableOpacity style={styles.youtubeContainer} onPress={() => {
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
    );
  };

  return (
    <View style={styles.container}>
      {/* Sponsored Badge */}
      {post.sponsored && (
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
            LUB
          </Text>
          <Text style={styles.userDetails}>
            Official Updates
          </Text>
          <Text style={styles.timestamp}>{formatDate(post.created_at)}</Text>
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

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons name="thumbs-up-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons name="share-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  },
  // Facebook-like image grid styles
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
    height: 200,
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
  // Legacy style (can be removed after testing)
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  youtubeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  youtubeThumbnail: {
    width: '100%',
    height: 200,
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
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
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
});
