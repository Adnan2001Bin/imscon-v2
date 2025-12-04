import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function AgendaSessionSkeleton() {
  return (
    <View style={styles.sessionCard}>
      {/* Session Content */}
      <View style={styles.sessionContent}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <View style={styles.titleSkeleton} />
          <View style={styles.levelBadge} />
        </View>

        {/* Description */}
        <View style={styles.descriptionSkeleton} />
        <View style={styles.descriptionSkeleton} />

        {/* Session Meta */}
        <View style={styles.sessionMeta}>
          <View style={styles.metaRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.metaTextSkeleton} />
          </View>
          <View style={styles.metaRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.metaTextSkeleton} />
          </View>
        </View>

        {/* Session Footer */}
        <View style={styles.sessionFooter}>
          <View style={styles.footerRow}>
            <View style={styles.iconSkeleton} />
            <View style={styles.footerTextSkeleton} />
          </View>
          <View style={styles.footerTextSkeleton} />
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          <View style={styles.tag} />
          <View style={styles.tag} />
          <View style={styles.tag} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sessionCard: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    width: '100%',
  },
  timeContainer: {
    width: 80,
    alignItems: 'center',
    marginRight: 16,
  },
  timeSkeleton: {
    width: 50,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  timeLine: {
    width: 2,
    height: '100%',
    backgroundColor: '#e5e7eb',
    position: 'absolute',
    left: 39,
    top: 24,
  },
  sessionContent: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleSkeleton: {
    flex: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginRight: 12,
  },
  levelBadge: {
    width: 70,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  descriptionSkeleton: {
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  sessionMeta: {
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 8,
  },
  metaTextSkeleton: {
    flex: 1,
    height: 15,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  sessionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerTextSkeleton: {
    width: 70,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    width: 50,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
});
