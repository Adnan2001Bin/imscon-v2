import type { EventWithUser } from '@/src/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface EventProps {
  event: EventWithUser;
}

export default function Event({ event }: EventProps) {
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
            LUB
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    width: '100%',
    marginVertical: 8,
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  coverImageContainer: {
    marginBottom: 20,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  coverImage: {
    width: '100%',
    height: 200,
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  userDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  moreButton: {
    padding: 6,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 20,
  },
  eventDetails: {
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  onlineText: {
    fontSize: 13,
    color: '#0369a1',
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  eventInfo: {
    gap: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  timeText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  attachmentsContainer: {
    marginBottom: 0,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  attachmentText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  moreAttachmentsText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
});
