import type { AgendaSession } from '@/src/types/event';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AgendaSessionSkeleton from './AgendaSessionSkeleton';

interface AgendaSessionsProps {
  sessions: AgendaSession[];
  isLoading?: boolean;
  onSessionPress?: (session: AgendaSession) => void;
}

export default function AgendaSessions({ sessions, isLoading, onSessionPress }: AgendaSessionsProps) {
  const formatTime = (timeString: string) => {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444',
    };
    return colors[level as keyof typeof colors] || '#6B7280';
  };

  const getLevelIcon = (level: string) => {
    const icons = {
      beginner: 'leaf',
      intermediate: 'flame',
      advanced: 'flash',
    };
    return icons[level as keyof typeof icons] || 'school';
  };

  const groupSessionsByDate = (sessions: AgendaSession[]) => {
    const grouped: { [date: string]: AgendaSession[] } = {};

    sessions.forEach(session => {
      if (!grouped[session.date]) {
        grouped[session.date] = [];
      }
      grouped[session.date].push(session);
    });

    // Sort sessions within each date by start time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Agenda</Text>
        <View style={styles.loadingContainer}>
          {Array.from({ length: 3 }, (_, index) => (
            <AgendaSessionSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="time" size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>No agenda sessions available</Text>
      </View>
    );
  }

  const groupedSessions = groupSessionsByDate(sessions);
  const sortedDates = Object.keys(groupedSessions).sort();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda</Text>

      {sortedDates.map(date => (
        <View key={date} style={styles.dateGroup}>
          <View style={styles.dateHeader}>
            <Ionicons name="calendar" size={18} color="#AF2225" />
            <Text style={styles.dateText}>{formatDate(date)}</Text>
          </View>

          <View style={styles.sessionsList}>
            {groupedSessions[date].map(session => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => onSessionPress?.(session)}
                activeOpacity={0.7}
              >
                {/* Content */}
                <View style={styles.sessionContent}>
                  <View style={styles.sessionHeader}>
                    <Text style={styles.sessionTitle}>{session.title}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: getLevelColor(session.level) + '15' }]}>
                      <Ionicons
                        name={getLevelIcon(session.level) as any}
                        size={12}
                        color={getLevelColor(session.level)}
                      />
                      <Text style={[styles.levelText, { color: getLevelColor(session.level) }]}>
                        {session.level.charAt(0).toUpperCase() + session.level.slice(1)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sessionDescription} numberOfLines={2}>
                    {session.description}
                  </Text>

                  <View style={styles.sessionMeta}>
                    <View style={styles.speakersContainer}>
                      <Ionicons name="person" size={14} color="#666" />
                      <Text style={styles.speakersText} numberOfLines={1}>
                        {session.speakers.join(', ')}
                      </Text>
                    </View>

                    <View style={styles.stageContainer}>
                      <Ionicons name="location" size={14} color="#666" />
                      <Text style={styles.stageText}>{session.stage}</Text>
                    </View>

                    <View style={styles.timeContainer}>
                      <Ionicons name="time" size={14} color="#666" />
                      <Text style={styles.timeText}>
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.sessionFooter}>
                    <View style={styles.capacityContainer}>
                      <Ionicons name="people" size={14} color="#666" />
                      <Text style={styles.capacityText}>
                        Capacity: {session.capacity}
                      </Text>
                    </View>

                    {session.total_registered !== undefined && (
                      <Text style={styles.registeredText}>
                        {session.total_registered} registered
                      </Text>
                    )}
                  </View>

                  {session.speaker_bio && (
                    <Text style={styles.speakerBio} numberOfLines={2}>
                      {session.speaker_bio}
                    </Text>
                  )}

                  {session.tags && session.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                      {session.tags.slice(0, 3).map((tag, index) => (
                        <View key={index} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                      {session.tags.length > 3 && (
                        <Text style={styles.moreTagsText}>+{session.tags.length - 3} more</Text>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100, // Extra bottom padding for mobile bottom navigation
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 8,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
 

  sessionCard: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 10,
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 18,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  sessionDescription: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  sessionMeta: {
    marginBottom: 12,
  },
  speakersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  speakersText: {
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    flex: 1,
    fontWeight: '600',
  },
  stageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageText: {
    fontSize: 15,
    color: '#111827',
    marginLeft: 10,
    fontWeight: '600',
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  capacityText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  registeredText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  speakerBio: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
