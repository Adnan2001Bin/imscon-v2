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
              <Ionicons name="document" size={20} color="#666" />
              <Text style={styles.attachmentText} numberOfLines={1}>
                {url.split('/').pop() || `Attachment ${index + 1}`}
              </Text>
              <Ionicons name="open-outline" size={16} color="#AF2225" />
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
          <Ionicons name="map" size={24} color="#AF2225" />
          <Text style={styles.floorMapText}>View Floor Map</Text>
          <Ionicons name="open-outline" size={16} color="#AF2225" />
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryStatusContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) + '15' }]}>
            <Ionicons
              name={getCategoryIcon(event.category) as any}
              size={16}
              color={getCategoryColor(event.category)}
            />
            <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(event.status) }]}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{event.title}</Text>

        <View style={styles.organizerContainer}>
          <Image
            source={event.user?.profile_picture ? { uri: event.user.profile_picture } : require('../../../assets/images/lub-karnataka.png')}
            style={styles.organizerAvatar}
          />
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerName}>
              {event.user?.name || 'Unknown Organizer'}
            </Text>
            <Text style={styles.organizerDetails}>
              {event.user?.designation && event.user?.company
                ? `${event.user.designation} at ${event.user.company}`
                : 'Event Organizer'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Event Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#AF2225" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>
              {formatEventDate(event.start_date, event.end_date)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name="time" size={20} color="#AF2225" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {formatTime(event.start_time, event.end_time)}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Ionicons name={event.is_online ? "globe" : "location"} size={20} color="#AF2225" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>{event.is_online ? 'Online Event' : 'Location'}</Text>
            <Text style={styles.detailValue}>
              {event.is_online ? (
                <TouchableOpacity onPress={() => event.online_link && Linking.openURL(event.online_link)}>
                  <Text style={styles.linkText}>
                    {event.online_link || 'Online Link'}
                  </Text>
                </TouchableOpacity>
              ) : (
                event.location
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
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
    paddingBottom: 120, // Extra bottom padding for mobile bottom navigation
  },
  coverImageContainer: {
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 8,
  },
  categoryStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    lineHeight: 32,
  },
  organizerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  organizerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  organizerDetails: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  linkText: {
    color: '#AF2225',
    textDecorationLine: 'underline',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  floorMapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
  },
  floorMapText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  attachmentsContainer: {
    gap: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  attachmentText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
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
    paddingTop: 50,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    flex: 1,
    marginRight: 12,
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
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 10,
    fontWeight: '500',
  },
  speakersText: {
    fontSize: 16,
    color: '#374151',
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
