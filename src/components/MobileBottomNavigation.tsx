import { useAuth } from '@/src/hooks/useAuth';
import { Feather } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface NavigationItem {
  id: string;
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  iconType: 'Feather';
}

interface MobileBottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

const primaryNavigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', iconName: 'home', iconType: 'Feather' },
  { id: 'network', label: 'My Network', iconName: 'users', iconType: 'Feather' },
  { id: 'events', label: 'Events', iconName: 'calendar', iconType: 'Feather' },
  { id: 'message', label: 'Message', iconName: 'message-circle', iconType: 'Feather' },
  { id: 'resource', label: 'Resource', iconName: 'file-text', iconType: 'Feather' },
];


export default function MobileBottomNavigation({
  activeTab: propActiveTab,
  onTabPress,
}: MobileBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;

  const isVisitorUnpaid = currentUser?.role === 'visitor' && !currentUser?.is_paid;


  // Premium modal state (keeps your old behaviour)
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');


  const getActiveTabFromPath = (path: string): string => {
    if (path === '/' || path === '/index') return 'home';
    if (path === '/network' || path.startsWith('/user/')) return 'network';
    if (path === '/events' || path.startsWith('/events/')) return 'events';
    if (path === '/chat' || path === '/message') return 'message';
    if (path === '/resource') return 'resource';
    return 'home';
  };

  const activeTab = propActiveTab || getActiveTabFromPath(pathname);

  const isPremiumRouteForItem = (itemId: string) =>
    (itemId === 'network' || itemId === 'message') && isVisitorUnpaid;

  const renderIcon = (item: NavigationItem, isActive: boolean) => {
    const iconColor = isActive ? '#AF2225' : '#666666';
    const iconSize = 26;

    const iconComponent = <Feather name={item.iconName} size={iconSize} color={iconColor} />;

    const isPremium = isPremiumRouteForItem(item.id);

    if (isPremium) {
      return (
        <View style={styles.iconContainer}>
          {iconComponent}
          <View style={styles.crownBadge}>
            <Crown size={10} color="#FFFFFF" />
          </View>
        </View>
      );
    }

    return iconComponent;
  };

  // Shared navigation & premium handling used by both primary and drawer items
  const handleItemPress = (item: NavigationItem) => {
    onTabPress?.(item.id);

    // premium check
    if (isPremiumRouteForItem(item.id)) {
      const featureName = item.id === 'network' ? 'My Network' : item.id === 'message' ? 'Message' : 'Feature';
      setPremiumFeatureName(featureName);
      setIsPremiumModalVisible(true);
      return;
    }

    switch (item.id) {
      case 'home':
        router.push('/');
        break;
      case 'network':
        router.push('/network' as any);
        break;
      case 'events':
        router.push('/events' as any);
        break;
      case 'message':
        router.push('/chat' as any);
        break;
      case 'resource':
        router.push('/resource' as any);
        break;
      default:
        router.push('/');
    }
  };


  return (
    <>
      {/* Main navigation container */}
      <View style={[styles.container, styles.shadow]}>
        <View style={styles.navigationContainer}>
          {primaryNavigationItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.tabButton}
              onPress={() => handleItemPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {renderIcon(item, activeTab === item.id)}
                <Text style={[styles.tabLabel, activeTab === item.id ? styles.activeTabLabel : styles.inactiveTabLabel]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Premium Feature Modal (keeps your previous approach - replace with your own screen if available) */}
      <Modal
        visible={isPremiumModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPremiumModalVisible(false)}
      >
        <View style={styles.premiumScreen}>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumSubtitle}>
            The feature <Text style={{ fontWeight: '700' }}>{premiumFeatureName}</Text> requires a premium account.
          </Text>

          <View style={styles.premiumButtons}>
            <TouchableOpacity style={styles.premiumButtonPrimary} onPress={() => {
              // route to your premium purchase or profile
              setIsPremiumModalVisible(false);
              router.push('/profile' as any); // example: navigate to profile/premium page
            }}>
              <Text style={styles.premiumButtonPrimaryText}>Upgrade</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.premiumButtonSecondary} onPress={() => setIsPremiumModalVisible(false)}>
              <Text style={styles.premiumButtonSecondaryText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  shadow: {
    shadowColor: '#5d5c5c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.13,
    shadowRadius: 24,
    elevation: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  activeTabLabel: {
    color: '#AF2225',
    fontWeight: 'bold',
  },
  inactiveTabLabel: {
    color: '#666666',
    fontWeight: 'normal',
  },

  // Premium crown badge
  iconContainer: {
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#eab308',
    borderRadius: 9999,
    padding: 1,
  },


  // Premium modal (simple)
  premiumScreen: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 10,
  },
  premiumSubtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 28,
  },
  premiumButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  premiumButtonPrimary: {
    backgroundColor: '#AF2225',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 12,
  },
  premiumButtonPrimaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  premiumButtonSecondary: {
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  premiumButtonSecondaryText: {
    color: '#333',
    fontWeight: '600',
  },
});
