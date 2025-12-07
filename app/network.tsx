import MobileBottomNavigation from '@/src/components/MobileBottomNavigation';
import MobileHeader from '@/src/components/MobileHeader';
import NetworkCardSkeleton from '@/src/components/ui/NetworkCardSkeleton';
import { supabase } from '@/src/lib/supabase';
import { User } from '@/src/types/user';
import { Feather } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    FlatList,
    Linking,
    ListRenderItem,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const roleFilters = [
  { label: 'All', value: 'all' },
  { label: 'Members', value: 'member' },
  { label: 'Visitors', value: 'visitor' },
] as const;

// Query function for fetching users with pagination
const fetchUsers = async ({ pageParam = 0, queryKey }: any) => {
  const [, , { searchQuery, selectedRole }] = queryKey;
  const PAGE_SIZE = 50; // Load 50 users per page

  let query = supabase
    .from('users')
    .select('*')
    .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1)
    .order('name', { ascending: true });

  // Add search filter if provided
  if (searchQuery?.trim()) {
    query = query.or(
      `name.ilike.%${searchQuery}%,firstName.ilike.%${searchQuery}%,lastName.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`
    );
  }

  // Add role filter if not 'all'
  if (selectedRole && selectedRole !== 'all') {
    if (selectedRole === 'member') {
      // Member includes both exhibitor and participant
      query = query.in('role', ['exhibitor', 'participant']);
    } else {
      query = query.eq('role', selectedRole);
    }
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    data: data || [],
    nextPage: data && data.length === PAGE_SIZE ? pageParam + 1 : null,
  };
};

// Query options for fetching users with pagination
const getUsersOptions = (searchQuery: string, selectedRole: string) => ({
  queryKey: ['users', 'network', { searchQuery, selectedRole }],
  queryFn: fetchUsers,
  initialPageParam: 0,
  getNextPageParam: (lastPage: any) => lastPage.nextPage,
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

const NetworkScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<(typeof roleFilters)[number]['value']>('all');

  // Header animation
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const contentPaddingTop = useRef(new Animated.Value(75)).current; // Start with header visible
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  // Infinite query for paginated users
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useInfiniteQuery(getUsersOptions(searchQuery, selectedRole));

  // Flatten all pages of data
  const allUsers = useMemo(() => {
    return data?.pages.flatMap((page: any) => page.data) || [];
  }, [data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleViewDetails = useCallback(
    (userId: string) => {
      router.push({
        pathname: '/user/[id]',
        params: { id: userId },
      });
    },
    [router],
  );

  const handleMessagePress = useCallback((user: User) => {
    const userLabel = user.name || user.company || 'this member';
    Alert.alert('Message', `Messaging for ${userLabel} is coming soon.`);
  }, []);

  const handleEmailPress = useCallback((email?: string | null) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Email', 'Unable to open your mail app.');
    });
  }, []);

  // Header scroll animation
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Determine scroll direction
    if (Math.abs(diff) < 10) return; // Ignore small movements

    if (diff > 0 && scrollDirection.current !== 'down') {
      // Scrolling down - hide header
      scrollDirection.current = 'down';
      setIsHeaderVisible(false);
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: -80, // Hide header (adjust based on header height)
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentPaddingTop, {
          toValue: 0, // Remove padding when header is hidden
          duration: 200,
          useNativeDriver: false, // Cannot use native driver for padding
        }),
      ]).start();
    } else if (diff < 0 && scrollDirection.current !== 'up') {
      // Scrolling up - show header
      scrollDirection.current = 'up';
      setIsHeaderVisible(true);
      Animated.parallel([
        Animated.timing(headerTranslateY, {
          toValue: 0, // Show header
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(contentPaddingTop, {
          toValue: 75, // Add padding when header is shown
          duration: 200,
          useNativeDriver: false, // Cannot use native driver for padding
        }),
      ]).start();
    }

    lastScrollY.current = currentScrollY;
  }, [headerTranslateY, contentPaddingTop]);

  // Refetch when search or role filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      refetch();
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedRole, refetch]);

  const renderUserCard: ListRenderItem<User> = ({ item }) => {
    const displayLocation =
      [item.city, item.country].filter(Boolean).join(', ') || item.address || 'Location unavailable';
    const initials =
      (item.name ||
        [item.firstName, item.lastName].filter(Boolean).join(' ') ||
        'U')
        .split(' ')
        .map((part) => part[0]?.toUpperCase())
        .join('')
        .slice(0, 2) || 'U';

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.cardHeader}>
            <Text style={styles.userName}>{item.name || 'Unnamed attendee'}</Text>
            {item.company && <Text style={styles.userCompany}>{item.company}</Text>}
            <View style={styles.badgeRow}>
              {item.role && (
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>
                    {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
                  </Text>
                </View>
              )}
              {item.is_primary && (
                <View style={[styles.roleBadge, styles.primaryBadge]}>
                  <Text style={[styles.roleBadgeText, styles.primaryBadgeText]}>
                    Primary Representative
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Feather name="mail" size={16} color="#111827" />
            <TouchableOpacity onPress={() => handleEmailPress(item.email)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent:'space-between'}}>
              <Text style={styles.infoValueEmail}>{item.email || 'Not provided'}</Text>
              {item.email && <Feather name="external-link" size={14} color="#1d4ed8" />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLeft}>
            <Feather name="map-pin" size={16} color="#111827" />
            <Text style={styles.infoValue}>{displayLocation}</Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => handleViewDetails(item.id)}
          >
            <Feather name="eye" size={16} color="#111827" />
            <Text style={styles.secondaryButtonText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={() => handleMessagePress(item)}
          >
            <Feather name="message-circle" size={16} color="#111827" />
            <Text style={styles.secondaryButtonText}>Message</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const listHeader = (
    <View style={styles.listHeader}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Networking Hub — Build Your Manufacturing Connections</Text>
        <Text style={styles.pageSubtitle}>
        Meet delegates, exhibitors, and innovators driving India's industrial growth.
        </Text>
      </View>


      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#6b7280" />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by name, company, or city"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.filterRow}>
        {roleFilters.map((filter) => {
          const isActive = selectedRole === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedRole(filter.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const listEmptyComponent = (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No members yet</Text>
      <Text style={styles.emptySubtitle}>New attendees will appear here as they join.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <MobileHeader hasBottomBorder backgroundColor="#ffffff" />
      </Animated.View>

      <Animated.View style={[styles.content, { paddingTop: contentPaddingTop }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            {Array.from({ length: 5 }, (_, index) => (
              <NetworkCardSkeleton key={index} />
            ))}
          </View>
        ) : isError ? (
          <View style={styles.networkErrorContainer}>
            <Text style={styles.networkErrorText}>
              {error?.message || 'Failed to load network'}
            </Text>
            <TouchableOpacity style={styles.networkRetryButton} onPress={() => refetch()}>
              <Text style={styles.networkRetryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={allUsers}
            renderItem={renderUserCard}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={listEmptyComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View style={styles.loadingMoreContainer}>
                  <NetworkCardSkeleton />
                </View>
              ) : allUsers.length > 0 ? (
                <Text style={styles.resultMeta}>
                  Showing {allUsers.length} members
                  {hasNextPage && ' • Scroll for more'}
                </Text>
              ) : null
            }
            refreshControl={
              <RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#AF2225" />
            }
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </Animated.View>

      <MobileBottomNavigation activeTab="network" />
    </View>
  );
};

export default NetworkScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f5',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  loadingContainer: {
    gap: 16,
  },
  networkErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  networkErrorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  networkRetryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#dc2626',
    borderRadius: 8,
  },
  networkRetryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  pageIntro: {
    gap: 6,
  },
  pageTitle: {
    marginTop:15,
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  pageSubtitle: {
    marginTop:6,
    fontSize: 14,
    color: '#475467',
    lineHeight: 20,
  },
  loaderWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#475467',
  },
  listContent: {
    paddingBottom: 160,
    gap: 16,
  },
  listHeader: {
    gap: 12,
  },
  errorBanner: {
    borderWidth: 1,
    borderColor: '#fca5a5',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 14,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#991b1b',
  },
  retryButtonText: {
    color: '#991b1b',
    fontWeight: '600',
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical:3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
  },
  filterChipActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
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
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  },
  primaryBadge: {
    borderColor: '#fde68a',
    backgroundColor: '#fef3c7',
  },
  primaryBadgeText: {
    color: '#92400e',
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
  infoValue: {
    fontSize: 14,
    color: '#111827',
    flexShrink: 1,
  },
  infoValueEmail: {
    width:"85%",
    fontSize: 14,
    color: '#1d4ed8',
    fontWeight: '600',
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
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  resultMeta: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 16,
  },
});

