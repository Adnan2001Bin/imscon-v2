import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function NetworkCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar} />
        <View style={styles.cardHeader}>
          <View style={styles.userNameSkeleton} />
          <View style={styles.userCompanySkeleton} />
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge} />
            <View style={styles.primaryBadge} />
          </View>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <View style={styles.iconSkeleton} />
          <View style={styles.infoValueSkeleton} />
        </View>
        <View style={styles.externalLinkIcon} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoLeft}>
          <View style={styles.iconSkeleton} />
          <View style={styles.infoValueSkeleton} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <View style={styles.secondaryButton}>
          <View style={styles.buttonIcon} />
          <View style={styles.buttonTextSkeleton} />
        </View>
        <View style={styles.secondaryButton}>
          <View style={styles.buttonIcon} />
          <View style={styles.buttonTextSkeleton} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 14,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
  },
  cardHeader: {
    flex: 1,
    gap: 4,
  },
  userNameSkeleton: {
    width: 140,
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  userCompanySkeleton: {
    width: 100,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleBadge: {
    width: 70,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
  primaryBadge: {
    width: 120,
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  infoValueSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  externalLinkIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f4f4f5',
  },
  buttonIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  buttonTextSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
});
