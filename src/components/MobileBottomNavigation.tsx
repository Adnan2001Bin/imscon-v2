import { useAuth } from '@/src/hooks/useAuth';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { usePathname, useRouter } from 'expo-router';
import { Building2, Crown } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

interface NavigationItem {
  id: string;
  label: string;
  iconName:
    | keyof typeof Feather.glyphMap
    | keyof typeof MaterialIcons.glyphMap
    | keyof typeof FontAwesome5.glyphMap
    | 'Building2';
  iconType: 'Feather' | 'MaterialIcons' | 'FontAwesome5' | 'Lucide';
}

interface MobileBottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
  drawerWidth?: number; // optional override
}

const primaryNavigationItems: NavigationItem[] = [
  { id: 'home', label: 'Home', iconName: 'home', iconType: 'Feather' },
  { id: 'exhibition', label: 'Exhibition', iconName: 'Building2', iconType: 'Lucide' },
  { id: 'agenda', label: 'Agenda', iconName: 'calendar', iconType: 'Feather' },
  { id: 'network', label: 'Network', iconName: 'users', iconType: 'Feather' },
];

const secondaryNavigationItems: NavigationItem[] = [
  { id: 'chat', label: 'Chat', iconName: 'message-circle', iconType: 'Feather' },
  { id: 'profile', label: 'Profile', iconName: 'user', iconType: 'Feather' },
  { id: 'notifications', label: 'Notifications', iconName: 'bell', iconType: 'Feather' },
  { id: 'search', label: 'Search', iconName: 'search', iconType: 'Feather' },
  { id: 'settings', label: 'Settings', iconName: 'settings', iconType: 'Feather' },
];

export default function MobileBottomNavigation({
  activeTab: propActiveTab,
  onTabPress,
  drawerWidth,
}: MobileBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;

  const isVisitorUnpaid = currentUser?.role === 'visitor' && !currentUser?.is_paid;

  // Drawer state + animation
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const screenW = Dimensions.get('window').width;
  const computedDrawerWidth = drawerWidth ?? Math.min(360, Math.floor(screenW * 0.78));
  const translateX = useRef(new Animated.Value(computedDrawerWidth)).current; // start off-screen right

  // Premium modal state (keeps your old behaviour)
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');

  useEffect(() => {
    // animate drawer open/close
    Animated.timing(translateX, {
      toValue: isDrawerVisible ? 0 : computedDrawerWidth,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isDrawerVisible, computedDrawerWidth, translateX]);

  const getActiveTabFromPath = (path: string): string => {
    if (path === '/' || path === '/index') return 'home';
    if (path === '/agenda') return 'agenda';
    if (path === '/exhibition' || path.startsWith('/exhibition')) return 'exhibition';
    if (path === '/network' || path.startsWith('/user/')) return 'network';
    if (path === '/chat') return 'chat';
    if (path === '/profile') return 'profile';
    if (path === '/notifications') return 'notifications';
    if (path === '/search') return 'search';
    if (path === '/settings') return 'settings';
    return 'home';
  };

  const activeTab = propActiveTab || getActiveTabFromPath(pathname);

  const isPremiumRouteForItem = (itemId: string) =>
    (itemId === 'network' || itemId === 'chat' || itemId === 'notifications') && isVisitorUnpaid;

  const renderIcon = (item: NavigationItem, isActive: boolean) => {
    const iconColor = isActive ? '#AF2225' : '#666666';
    const iconSize = item.iconType === 'FontAwesome5' ? 24 : 26;

    let iconComponent;
    if (item.iconType === 'Feather') {
      iconComponent = <Feather name={item.iconName as keyof typeof Feather.glyphMap} size={iconSize} color={iconColor} />;
    } else if (item.iconType === 'MaterialIcons') {
      iconComponent = <MaterialIcons name={item.iconName as keyof typeof MaterialIcons.glyphMap} size={iconSize} color={iconColor} />;
    } else if (item.iconType === 'FontAwesome5') {
      iconComponent = <FontAwesome5 name={item.iconName as keyof typeof FontAwesome5.glyphMap} size={iconSize} color={iconColor} />;
    } else {
      // Lucide
      iconComponent = <Building2 size={iconSize} color={iconColor} />;
    }

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
    // close drawer if open
    setIsDrawerVisible(false);

    onTabPress?.(item.id);

    // premium check
    if (isPremiumRouteForItem(item.id)) {
      const featureName = item.id === 'network' ? 'Network' : item.id === 'chat' ? 'Chat' : 'Notifications';
      setPremiumFeatureName(featureName);
      setIsPremiumModalVisible(true);
      return;
    }

    switch (item.id) {
      case 'home':
        router.push('/');
        break;
      case 'agenda':
        router.push('/agenda' as any);
        break;
      case 'exhibition':
        router.push('/exhibition' as any);
        break;
      case 'network':
        router.push('/network' as any);
        break;
      case 'chat':
        router.push('/chat' as any);
        break;
      case 'profile':
        router.push('/profile' as any);
        break;
      case 'notifications':
        router.push('/notifications' as any);
        break;
      case 'search':
        router.push('/search' as any);
        break;
      case 'settings':
        router.push('/settings' as any);
        break;
      default:
        router.push('/');
    }
  };

  const renderNavigationItem = (item: NavigationItem, isExpandedItem = false) => {
    const isActive = activeTab === item.id;
    return (
      <TouchableOpacity
        key={item.id}
        style={isExpandedItem ? styles.drawerItem : styles.tabButton}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={isExpandedItem ? styles.drawerItemContent : styles.tabContent}>
          {renderIcon(item, isActive)}
          <Text style={[styles.tabLabel, isActive ? styles.activeTabLabel : styles.inactiveTabLabel]}>
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      {/* Drawer Modal with overlay */}
      <Modal visible={isDrawerVisible} animationType="none" transparent onRequestClose={() => setIsDrawerVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsDrawerVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.drawer,
            {
              width: computedDrawerWidth,
              transform: [{ translateX }],
            },
          ]}
        >
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>More</Text>
            <TouchableOpacity onPress={() => setIsDrawerVisible(false)} style={styles.closeButton}>
              <Feather name="x" size={22} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.drawerBody}>
            {/* Option grouping / optional header */}
            <Text style={styles.sectionLabel}>Actions</Text>

            {secondaryNavigationItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.drawerListItem}
                onPress={() => handleItemPress(item)}
                activeOpacity={0.75}
              >
                <View style={styles.drawerListLeft}>{renderIcon(item, activeTab === item.id)}</View>
                <View style={styles.drawerListCenter}>
                  <Text style={styles.drawerListLabel}>{item.label}</Text>
                </View>
                {/* optional chevron */}
                <Feather name="chevron-right" size={20} color="#888" />
              </TouchableOpacity>
            ))}

            {/* small spacer */}
            <View style={{ height: 18 }} />

            {/* Secondary quick links or settings footnote */}
            <Text style={styles.footerText}>You can access your account settings & preferences here.</Text>
          </View>
        </Animated.View>
      </Modal>

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

          {/* More button toggles drawer */}
          <TouchableOpacity
            style={styles.tabButton}
            onPress={() => setIsDrawerVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.tabContent}>
              <Feather name="more-horizontal" size={26} color="#666666" />
              <Text style={[styles.tabLabel, styles.inactiveTabLabel]}>More</Text>
            </View>
          </TouchableOpacity>
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

  // Drawer
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    elevation: 30,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
  },
  drawerHeader: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  closeButton: {
    padding: 8,
  },
  drawerBody: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginLeft: 6,
  },

  drawerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  drawerListLeft: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerListCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  drawerListLabel: {
    fontSize: 16,
    color: '#222',
  },

  drawerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  drawerItemContent: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  footerText: {
    color: '#777',
    fontSize: 12,
    marginTop: 8,
    marginLeft: 6,
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
