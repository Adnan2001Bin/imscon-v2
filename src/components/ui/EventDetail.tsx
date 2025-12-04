import type { AgendaSession, EventWithUser } from '@/src/types/event';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { getEventAgendaSessionsOptions } from '../services/event';
import AgendaSessions from './AgendaSessions';

const { width } = Dimensions.get('window');

interface EventDetailProps {
  event: EventWithUser;
}

export default function EventDetail({ event }: EventDetailProps) {
  const [selectedSession, setSelectedSession] = useState<AgendaSession | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: agendaData,
    isLoading: isLoadingAgenda,
  } = useInfiniteQuery(getEventAgendaSessionsOptions(event.id));

  const agendaSessions = agendaData?.pages.flatMap(page => page.data) || [];

  const handleSessionPress = (session: AgendaSession) => {
    setSelectedSession(session);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedSession(null);
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

  const getStatusColor = (status: string) => {
    const colors = {
      draft: '#F59E0B',
      published: '#10B981',
      cancelled: '#EF4444',
      completed: '#6B7280',
    };
    return colors[status as keyof typeof colors] || colors.draft;
  };

  const renderCoverImage = () => {
    if (!event.cover_image_url) return null;

    return (
      <View style={styles.coverImageContainer}>
        <Image
          source={{ uri: event.cover_image_url }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  const renderAttachments = () => {
    if (!event.attachment_urls || event.attachment_urls.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attachments</Text>
        <View style={styles.attachmentsContainer}>
          {event.attachment_urls.map((url, index) => (
            <TouchableOpacity
              key={index}
              style={styles.attachmentItem}
              onPress={() => Linking.openURL(url)}
            >
              <Ionicons name="document" size={16} color="#666" />
              <Text style={styles.attachmentText} numberOfLines={1}>
                {url.split('/').pop() || `Attachment ${index + 1}`}
              </Text>
              {event.attachment_urls.length > 3 && index === 2 && (
                <Text style={styles.moreAttachmentsText}>
                  +{event.attachment_urls.length - 3} more
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderFloorMap = () => {
    if (!event.floor_map_url) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Floor Map</Text>
        <TouchableOpacity
          style={styles.floorMapContainer}
          onPress={() => Linking.openURL(event.floor_map_url!)}
        >
          <Ionicons name="map" size={20} color="#666" />
          <Text style={styles.floorMapText}>View Floor Map</Text>
          <Ionicons name="open-outline" size={16} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Cover Image */}
      {renderCoverImage()}

      {/* Header with Organizer */}
      <View style={styles.header}>
        <View style={styles.organizerContainer}>
          <Image
            source={event.user?.profile_picture ? { uri: event.user.profile_picture } : require('../../../assets/images/lub-karnataka.png')}
            style={styles.avatar}
          />
          <View style={styles.organizerInfo}>
            <Text style={styles.userName}>
              LUB
            </Text>
            <Text style={styles.timestamp}>
              {new Date(event.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Event Meta - Matching list card style */}
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

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Text>
          </View>
        </View>

        {/* Event Title */}
        <Text style={styles.eventTitle}>{event.title}</Text>
      </View>

      {/* Event Details - Matching list card style */}
      <View style={styles.eventDetails}>
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
              {event.is_online ? (
                event.online_link ? (
                  <TouchableOpacity onPress={() => Linking.openURL(event.online_link)}>
                    <Text style={styles.linkText}>
                      Join Online Event
                    </Text>
                  </TouchableOpacity>
                ) : 'Online Event'
              ) : event.location}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>About This Event</Text>
        <Text style={styles.description}>{event.description}</Text>
      </View>

      {/* Floor Map */}
      {renderFloorMap()}

      {/* Attachments */}
      {renderAttachments()}

      {/* Agenda Sessions */}
      <AgendaSessions
        sessions={agendaSessions}
        isLoading={isLoadingAgenda}
        onSessionPress={handleSessionPress}
      />

      {/* Agenda Session Detail Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Ionicons name="close" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Session Details</Text>
            <View style={styles.headerSpacer} />
          </View>

          {selectedSession && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Session Header */}
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{selectedSession.title}</Text>
                <View style={[styles.levelBadge, { backgroundColor: getCategoryColor('other') + '15' }]}>
                  <Ionicons
                    name={getCategoryIcon('other') as any}
                    size={12}
                    color={getCategoryColor('other')}
                  />
                  <Text style={[styles.levelText, { color: getCategoryColor('other') }]}>
                    {selectedSession.level.charAt(0).toUpperCase() + selectedSession.level.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Session Meta */}
              <View style={styles.sessionMeta}>
                <View style={styles.metaRow}>
                  <Ionicons name="calendar" size={18} color="#666" />
                  <Text style={styles.metaText}>
                    {formatEventDate(selectedSession.date, selectedSession.date)}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time" size={18} color="#666" />
                  <Text style={styles.metaText}>
                    {formatTime(selectedSession.start_time, selectedSession.end_time)}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location" size={18} color="#666" />
                  <Text style={styles.metaText}>{selectedSession.stage}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="people" size={18} color="#666" />
                  <Text style={styles.metaText}>
                    Capacity: {selectedSession.capacity}
                    {selectedSession.total_registered !== undefined &&
                      ` • ${selectedSession.total_registered} registered`
                    }
                  </Text>
                </View>
              </View>

              {/* Speakers */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Speakers</Text>
                <Text style={styles.speakersText}>
                  {selectedSession.speakers.join(', ')}
                </Text>
              </View>

              {/* Description */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{selectedSession.description}</Text>
              </View>

              {/* Speaker Bio */}
              {selectedSession.speaker_bio && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Speaker Bio</Text>
                  <Text style={styles.description}>{selectedSession.speaker_bio}</Text>
                </View>
              )}

              {/* Tags */}
              {selectedSession.tags && selectedSession.tags.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedSession.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  coverImageContainer: {
    marginBottom: 5,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  organizerContainer: {
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
  organizerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 26,
    letterSpacing: -0.5,
  },
  eventDetails: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
    padding: 16,
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
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  floorMapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  floorMapText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
    flex: 1,
    fontWeight: '500',
  },
  attachmentsContainer: {
    gap: 8,
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
    fontWeight: '500',
    marginLeft: 8,
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
    paddingTop: 20,
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
  headerSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sessionMeta: {
    paddingVertical: 12,
    marginBottom: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    fontWeight: '600',
  },
  speakersText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});