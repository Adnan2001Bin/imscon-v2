import type { EventWithUser } from '@/src/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface EventProps {
  event: EventWithUser;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

export default function Event({ event, onLike, onComment, onShare }: EventProps) {
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      // Same day
      return start.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } else {
      // Different days
      const startStr = start.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const endStr = end.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: start.getFullYear() !== end.getFullYear() ? 'numeric' : undefined,
      });
      return `${startStr} - ${endStr}`;
    }
  };

  const formatTime = (startTime: string, endTime: string) => {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);

    const startStr = start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const endStr = end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `${startStr} - ${endStr}`;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      conference: '#3B82F6',
      workshop: '#10B981',
      seminar: '#F59E0B',
      networking: '#8B5CF6',
      exhibition: '#EF4444',
      webinar: '#06B6D4',
      other: '#6B7280',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      conference: 'people',
      workshop: 'hammer',
      seminar: 'school',
      networking: 'chatbubbles',
      exhibition: 'storefront',
      webinar: 'videocam',
      other: 'calendar',
    };
    return icons[category as keyof typeof icons] || icons.other;
  };

  const renderCoverImage = () => {
    if (!event.cover_image_url) return null;

    return (
      <TouchableOpacity style={styles.coverImageContainer} onPress={() => {
        router.push(`/events/${event.id}` as any);
      }}>
        <Image
          source={{ uri: event.cover_image_url }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const renderAttachments = () => {
    if (!event.attachment_urls || event.attachment_urls.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        {event.attachment_urls.slice(0, 3).map((url, index) => (
          <TouchableOpacity
            key={index}
            style={styles.attachmentItem}
            onPress={() => Linking.openURL(url)}
          >
            <Ionicons name="document" size={16} color="#666" />
            <Text style={styles.attachmentText} numberOfLines={1}>
              {url.split('/').pop() || 'Attachment'}
            </Text>
          </TouchableOpacity>
        ))}
        {event.attachment_urls.length > 3 && (
          <Text style={styles.moreAttachmentsText}>
            +{event.attachment_urls.length - 3} more
          </Text>
        )}
      </View>
    );
  };

  const renderEventDetails = () => {
    return (
      <View style={styles.eventDetails}>
        <View style={styles.eventMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) + '15' }]}>
            <Ionicons
              name={getCategoryIcon(event.category) as any}
              size={14}
              color={getCategoryColor(event.category)}
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>

          {event.is_online && (
            <View style={styles.onlineBadge}>
              <Ionicons name="globe" size={14} color="#06B6D4" />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          )}
        </View>

        <View style={styles.eventInfo}>
          <View style={styles.dateTimeContainer}>
            <Ionicons name="calendar" size={16} color="#666" />
            <Text style={styles.dateText}>
              {formatEventDate(event.start_date, event.end_date)}
            </Text>
          </View>

          <View style={styles.dateTimeContainer}>
            <Ionicons name="time" size={16} color="#666" />
            <Text style={styles.timeText}>
              {formatTime(event.start_time, event.end_time)}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name={event.is_online ? "link" : "location"} size={16} color="#666" />
            <Text style={styles.locationText} numberOfLines={1}>
              {event.is_online ? 'Online Event' : event.location}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={() => {
      router.push(`/events/${event.id}` as any);
    }}>
      {/* Cover Image */}
      {renderCoverImage()}

      {/* Header */}
      <View style={styles.header}>
        <Image
          source={event.user?.profile_picture ? { uri: event.user.profile_picture } : require('../../../assets/images/lub-karnataka.png')}
          style={styles.avatar}
        />
        <View style={styles.headerText}>
          <Text style={styles.userName}>
            {event.user?.name || 'Unknown User'}
          </Text>
          <Text style={styles.userDetails}>
            {event.user?.designation && event.user?.company
              ? `${event.user.designation} at ${event.user.company}`
              : event.user?.designation || event.user?.company || 'Event Organizer'
            }
          </Text>
          <Text style={styles.timestamp}>{formatDate(event.created_at)}</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Event Title */}
      <Text style={styles.eventTitle}>{event.title}</Text>

      {/* Event Description */}
      <Text style={styles.description} numberOfLines={3}>
        {event.description}
      </Text>

      {/* Event Details */}
      {renderEventDetails()}

      {/* Attachments */}
      {renderAttachments()}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons name="heart-outline" size={20} color="#666" />
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coverImageContainer: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
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
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    marginBottom: 16,
  },
  eventDetails: {
    marginBottom: 16,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#06B6D415',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineText: {
    fontSize: 12,
    color: '#06B6D4',
    fontWeight: '600',
    marginLeft: 4,
  },
  eventInfo: {
    gap: 8,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  moreAttachmentsText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});
