import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import UserDetailsSkeleton from '@/src/components/ui/UserDetailsSkeleton';
import { supabase } from '@/src/lib/supabase';
import { User } from '@/src/types/user';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const UserDetailsScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const resolvedId = Array.isArray(id) ? id[0] : id;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      setUser(data as User);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user', err);
      setError('Unable to load this profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (resolvedId) {
      fetchUser(resolvedId);
    } else {
      setError('No member id provided.');
      setLoading(false);
    }
  }, [resolvedId, fetchUser]);

  const displayName = useMemo(() => {
    if (!user) return 'Unnamed attendee';
    const fallbackName = [user.firstName, user.lastName].filter(Boolean).join(' ');
    return user.name || fallbackName || 'Unnamed attendee';
  }, [user]);

  const displayAddress = useMemo(() => {
    if (!user) {
      return 'Address not available';
    }

    const combined = [
      user.address,
      [user.city, user.country].filter(Boolean).join(', '),
      user.zip_code,
    ]
      .filter(Boolean)
      .join('\n');

    return combined || 'Address not available';
  }, [user]);

  const initials = useMemo(() => {
    return displayName
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U';
  }, [displayName]);

  const handleMessagePress = useCallback(() => {
    Alert.alert('Message', `Messaging for ${displayName} is coming soon.`);
  }, [displayName]);

  const handleDownloadContactPress = useCallback(() => {
    Alert.alert('Download Contact', `Contact download for ${displayName} is coming soon.`);
  }, [displayName]);

  const handleOpenLinkedIn = useCallback(() => {
    if (!user?.linkedin) return;
    const hasProtocol = user.linkedin.startsWith('http://') || user.linkedin.startsWith('https://');
    const url = hasProtocol ? user.linkedin : `https://${user.linkedin}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('LinkedIn', 'Unable to open this link.');
    });
  }, [user?.linkedin]);

  const handleEmailPress = useCallback((email?: string | null) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Email', 'Unable to open your mail app.');
    });
  }, []);

  const handlePhonePress = useCallback((phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert('Phone', 'Unable to open your dialer.');
    });
  }, []);

  const renderInfoRow = (label: string, value?: string | null, opts?: { onPress?: () => void }) => {
    const isPressable = Boolean(opts?.onPress && value);
    return (
      <TouchableOpacity
        style={[styles.infoRow, isPressable && styles.infoRowPressable]}
        activeOpacity={isPressable ? 0.7 : 1}
        onPress={opts?.onPress}
        disabled={!isPressable}
      >
        <Text style={styles.infoLabel}>{label}</Text>
        <Text
          style={[
            styles.infoValue,
            isPressable && styles.linkText,
          ]}
          numberOfLines={isPressable ? 1 : undefined}
        >
          {value || 'Not provided'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderContactRow = (
    icon: keyof typeof Feather.glyphMap,
    label: string,
    value?: string | null,
    opts?: { onPress?: () => void },
  ) => {
    const isPressable = Boolean(opts?.onPress && value);
    return (
      <TouchableOpacity
        style={[styles.contactRow, isPressable && styles.contactRowPressable]}
        activeOpacity={isPressable ? 0.7 : 1}
        onPress={opts?.onPress}
        disabled={!isPressable}
      >
        <Feather name={icon} size={18} color="#111827" />
        <View style={styles.contactTextGroup}>
          <Text style={styles.contactLabel}>{label}</Text>
          <Text style={[styles.contactValue, isPressable && styles.contactLink]}>
            {value || 'Not provided'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBooleanRow = (label: string, value?: boolean | null) => {
    const labelColor = value ? '#14532d' : '#9f1239';
    const backgroundColor = value ? '#dcfce7' : '#fee2e2';

    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={[styles.statusPill, { backgroundColor }]}>
          <Text style={[styles.statusPillText, { color: labelColor }]}>{value ? 'Yes' : 'No'}</Text>
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <UserDetailsSkeleton />;
    }

    if (error) {
      return (
        <View style={styles.errorWrapper}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryPrimaryButton}
            onPress={() => resolvedId && fetchUser(resolvedId)}
          >
            <Text style={styles.retryPrimaryButtonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!user) {
      return null;
    }

    return (
      <>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.cardHeader}>
              <Text style={styles.userName}>{displayName}</Text>
              {user.company && <Text style={styles.userCompany}>{user.company}</Text>}
              <View style={styles.badgeRow}>
                {user.role && (
                  <View style={styles.roleBadge}>
                    <Text style={styles.roleBadgeText}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Text>
                  </View>
                )}
                {user.is_primary && (
                  <View style={[styles.roleBadge, styles.primaryBadge]}>
                    <Text style={[styles.roleBadgeText, styles.primaryBadgeText]}>
                      Primary Representative
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional summary</Text>
          {renderInfoRow('Company', user.company)}
          {renderInfoRow('Designation', user.designation)}
          {renderInfoRow('Industry', user.industry)}
          {user.about && (
            <View style={styles.aboutContainer}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.aboutText}>{user.about}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact information</Text>
          {renderContactRow('mail', 'Email', user.email, { onPress: () => handleEmailPress(user.email) })}
          {renderContactRow('phone', 'Phone', user.phone, { onPress: () => handlePhonePress(user.phone) })}
          {renderContactRow('map-pin', 'Location', [user.city, user.country].filter(Boolean).join(', ') || user.address)}
          {renderContactRow('map', 'Full Address', displayAddress)}
          {renderContactRow('linkedin', 'LinkedIn', user.linkedin, { onPress: handleOpenLinkedIn })}
        </View>

        <View style={styles.section}>
          <View style={styles.ctaRow}>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={handleMessagePress}
            >
              <Feather name="message-circle" size={16} color="#111827" />
              <Text style={styles.secondaryButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.85}
              onPress={handleDownloadContactPress}
            >
              <Feather name="download" size={16} color="#111827" />
              <Text style={styles.secondaryButtonText}>Download Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Fixed Back Button */}
      <View style={styles.fixedBackButtonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>

      <MobileBottomNavigation activeTab="network" />
    </View>
  );
};

export default UserDetailsScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fixedBackButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 30, // Account for status bar
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  scrollContainer: {
    flex: 1,
    paddingTop: 70, // Space for fixed header
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 160,
    gap: 16,
  },
  loaderWrapper: {
    paddingVertical: 80,
    alignItems: 'center',
    gap: 10,
  },
  loaderText: {
    fontSize: 14,
    color: '#475467',
  },
  errorWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
    padding: 20,
    gap: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9f1239',
  },
  errorMessage: {
    fontSize: 14,
    color: '#9f1239',
  },
  retryPrimaryButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#AF2225',
  },
  retryPrimaryButtonText: {
    color: '#fff',
    fontWeight: '600',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  cardHeader: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  userCompany: {
    fontSize: 14,
    color: '#475467',
    marginBottom: 4,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  summaryText: {
    flex: 1,
    gap: 4,
  },
  summaryName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  summaryRole: {
    fontSize: 14,
    color: '#475467',
  },
  summaryCompany: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  primaryBadge: {
    borderColor: '#fde68a',
    backgroundColor: '#fef3c7',
  },
  primaryBadgeText: {
    color: '#92400e',
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
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    padding: 18,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 6,
  },
  infoRowPressable: {
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    flex: 0.45,
  },
  infoValue: {
    flex: 0.55,
    fontSize: 14,
    color: '#111827',
    textAlign: 'right',
  },
  linkText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  aboutContainer: {
    gap: 4,
  },
  aboutText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  contactRowPressable: {
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  contactTextGroup: {
    flex: 1,
    gap: 4,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 15,
    color: '#111827',
  },
  contactLink: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

