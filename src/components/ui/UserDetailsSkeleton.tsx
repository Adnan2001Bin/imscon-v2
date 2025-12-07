import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function UserDetailsSkeleton() {
  return (
    <View style={styles.container}>
      {/* User Summary Card Skeleton */}
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar} />
          <View style={styles.cardHeader}>
            <View style={styles.userNameSkeleton} />
            <View style={styles.userCompanySkeleton} />
            <View style={styles.badgeRow}>
              <View style={styles.roleBadge} />
            </View>
          </View>
        </View>
      </View>

      {/* Contact Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleSkeleton} />
        <View style={styles.contactRow}>
          <View style={styles.iconSkeleton} />
          <View style={styles.contactTextSkeleton} />
        </View>
        <View style={styles.contactRow}>
          <View style={styles.iconSkeleton} />
          <View style={styles.contactTextSkeleton} />
        </View>
        <View style={styles.contactRow}>
          <View style={styles.iconSkeleton} />
          <View style={styles.contactTextSkeleton} />
        </View>
        <View style={styles.contactRow}>
          <View style={styles.iconSkeleton} />
          <View style={styles.contactTextSkeleton} />
        </View>
      </View>

      {/* Company Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleSkeleton} />
        <View style={styles.infoRow}>
          <View style={styles.infoLabelSkeleton} />
          <View style={styles.infoValueSkeleton} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLabelSkeleton} />
          <View style={styles.infoValueSkeleton} />
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoLabelSkeleton} />
          <View style={styles.infoValueSkeleton} />
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.section}>
        <View style={styles.ctaRow}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  card: {
    borderRadius: 8,
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
  section: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  sectionTitleSkeleton: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconSkeleton: {
    width: 16,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginRight: 12,
  },
  contactTextSkeleton: {
    flex: 1,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabelSkeleton: {
    width: 80,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  infoValueSkeleton: {
    width: 100,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
