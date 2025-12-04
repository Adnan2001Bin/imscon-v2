import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EventSkeletonProps {
  showCoverImage?: boolean;
  showAttachments?: boolean;
}

export default function EventSkeleton({
  showCoverImage = Math.random() > 0.3,
  showAttachments = Math.random() > 0.6
}: EventSkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Cover Image - conditionally rendered */}
      {showCoverImage && (
        <View style={styles.coverImageContainer}>
          <View style={styles.coverImage} />
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.headerText}>
          <View style={styles.userNameSkeleton} />
          <View style={styles.userDetailsSkeleton} />
          <View style={styles.timestampSkeleton} />
        </View>
        <View style={styles.moreButton} />
      </View>

      {/* Event Title */}
      <View style={styles.eventTitleSkeleton} />

      {/* Event Description */}
      <View style={styles.description}>
        <View style={styles.descriptionLine} />
        <View style={styles.descriptionLine} />
        <View style={[styles.descriptionLine, { width: '60%' }]} />
      </View>

      {/* Event Details */}
      <View style={styles.eventDetails}>
        <View style={styles.eventMeta}>
          <View style={styles.categoryBadge} />
          {Math.random() > 0.5 && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.infoTextSkeleton} />
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.infoTextSkeleton} />
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.infoTextSkeleton} />
          </View>
        </View>
      </View>

      {/* Attachments - conditionally rendered */}
      {showAttachments && (
        <View style={styles.attachmentsContainer}>
          <View style={styles.attachmentItem}>
            <View style={styles.attachmentIcon} />
            <View style={styles.attachmentTextSkeleton} />
          </View>
          <View style={styles.attachmentItem}>
            <View style={styles.attachmentIcon} />
            <View style={styles.attachmentTextSkeleton} />
          </View>
        </View>
      )}
    </View>
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
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  headerText: {
    flex: 1,
  },
  userNameSkeleton: {
    width: 100,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  userDetailsSkeleton: {
    width: 140,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  timestampSkeleton: {
    width: 80,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  moreButton: {
    width: 20,
    height: 20,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  eventTitleSkeleton: {
    width: '90%',
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  description: {
    marginBottom: 16,
  },
  descriptionLine: {
    width: '100%',
    height: 15,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 6,
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
    width: 80,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  onlineBadge: {
    width: 60,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  eventInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 8,
  },
  infoTextSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
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
  attachmentIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 10,
  },
  attachmentTextSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});
