import React from 'react';
import { StyleSheet, View } from 'react-native';

interface PostSkeletonProps {
  showSponsored?: boolean;
}

export default function PostSkeleton({ showSponsored = false }: PostSkeletonProps) {
  return (
    <View style={styles.container}>
      {/* Sponsored Badge - conditionally rendered */}
      {showSponsored && (
        <View style={styles.sponsoredBadge}>
          <View style={styles.sponsoredSkeleton} />
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

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentLine1} />
        <View style={styles.contentLine2} />
        <View style={styles.contentLine3} />
      </View>

      {/* Media - random height to simulate different image sizes */}
      <View style={[styles.mediaSkeleton, { height: Math.random() * 100 + 150 }]} />

      {/* Documents - occasionally show */}
      {Math.random() > 0.7 && (
        <View style={styles.documentsContainer}>
          <View style={styles.documentItem}>
            <View style={styles.documentIcon} />
            <View style={styles.documentTextSkeleton} />
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.actionButton}>
          <View style={styles.actionIcon} />
          <View style={styles.actionTextSkeleton} />
        </View>

        <View style={styles.actionButton}>
          <View style={styles.actionIcon} />
          <View style={styles.actionTextSkeleton} />
        </View>

        <View style={styles.actionButton}>
          <View style={styles.actionIcon} />
          <View style={styles.actionTextSkeleton} />
        </View>
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
  sponsoredSkeleton: {
    width: 60,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
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
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  userNameSkeleton: {
    width: 80,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  userDetailsSkeleton: {
    width: 120,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  timestampSkeleton: {
    width: 60,
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  moreButton: {
    width: 20,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
  content: {
    marginBottom: 12,
  },
  contentLine1: {
    width: '100%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  contentLine2: {
    width: '85%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  contentLine3: {
    width: '60%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  mediaSkeleton: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
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
  documentIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 8,
  },
  documentTextSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
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
  actionIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    marginRight: 6,
  },
  actionTextSkeleton: {
    width: 40,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});
