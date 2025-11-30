import { useAuth } from '@/src/hooks/useAuth';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { usePathname, useRouter } from 'expo-router';
import { Building2, Crown } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import PremiumFeatureScreen from './screens/PremiumFeatureScreen';


interface NavigationItem {
  id: string;
  label: string;
  iconName: keyof typeof Feather.glyphMap | keyof typeof MaterialIcons.glyphMap | keyof typeof FontAwesome5.glyphMap | 'Building2';
  iconType: 'Feather' | 'MaterialIcons' | 'FontAwesome5' | 'Lucide';
}

interface MobileBottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    iconName: 'home',
    iconType: 'Feather',
  },
  {
    id: 'exhibition',
    label: 'Exhibition',
    iconName: 'Building2',
    iconType: 'Lucide',
  },
  {
    id: 'agenda',
    label: 'Agenda',
    iconName: 'calendar',
    iconType: 'Feather',
  },
  {
    id: 'network',
    label: 'Network',
    iconName: 'users',
    iconType: 'Feather',
  },
  {
    id: 'chat',
    label: 'Chat',
    iconName: 'message-circle',
    iconType: 'Feather',
  },
];

export default function MobileBottomNavigation({
  activeTab: propActiveTab,
  onTabPress,
}: MobileBottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: authData } = useAuth();
  const currentUser = authData?.currentUser;

  // Check if user is a visitor who hasn't paid (premium routes)
  const isVisitorUnpaid = currentUser?.role === 'visitor' && !currentUser?.is_paid;

  // State for premium feature modal
  const [isPremiumModalVisible, setIsPremiumModalVisible] = useState(false);
  const [premiumFeatureName, setPremiumFeatureName] = useState('');

  // Determine active tab from current route
  const getActiveTabFromPath = (path: string): string => {
    if (path === '/' || path === '/index') return 'home';
    if (path === '/agenda') return 'agenda';
    if (path === '/exhibition' || path.startsWith('/exhibition')) return 'exhibition';
    if (path === '/network' || path.startsWith('/user/')) return 'network';
    if (path === '/chat') return 'chat';
    return 'home';
  };

  const activeTab = propActiveTab || getActiveTabFromPath(pathname);
  const renderIcon = (item: NavigationItem, isActive: boolean) => {
    const iconColor = isActive ? '#AF2225' : '#666666';
    const iconSize = item.iconType === 'FontAwesome5' ? 24 : 26;

    // Base icon component
    let iconComponent;
    if (item.iconType === 'Feather') {
      iconComponent = <Feather name={item.iconName as keyof typeof Feather.glyphMap} size={iconSize} color={iconColor} />;
    } else if (item.iconType === 'MaterialIcons') {
      iconComponent = <MaterialIcons name={item.iconName as keyof typeof MaterialIcons.glyphMap} size={iconSize} color={iconColor} />;
    } else if (item.iconType === 'FontAwesome5') {
      iconComponent = <FontAwesome5 name={item.iconName as keyof typeof FontAwesome5.glyphMap} size={iconSize} color={iconColor} />;
    } else if (item.iconType === 'Lucide') {
      iconComponent = <Building2 size={iconSize} color={iconColor} />;
    } else {
      iconComponent = <FontAwesome5 name={item.iconName as keyof typeof FontAwesome5.glyphMap} size={iconSize} color={iconColor} />;
    }

    // Check if this is a premium route (network or chat) and user needs premium access
    const isPremiumRoute = (item.id === 'network' || item.id === 'chat') && isVisitorUnpaid;

    if (isPremiumRoute) {
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

  return (
    <View
      style={[styles.container, styles.shadow]}
    >
      <View style={styles.navigationContainer}>
        {navigationItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.tabButton}
              onPress={() => {
                // Call the provided onTabPress handler if available
                onTabPress?.(item.id);

                // Handle navigation with premium access check
                const handleNavigation = () => {
                  // Check if this is a premium route and user needs premium access
                  const isPremiumRoute = (item.id === 'network' || item.id === 'chat') && isVisitorUnpaid;

                  if (isPremiumRoute) {
                    // Show premium feature modal instead of navigating
                    const featureName = item.id === 'network' ? 'Network' : 'Chat';
                    setPremiumFeatureName(featureName);
                    setIsPremiumModalVisible(true);
                    return;
                  }

                  // Navigate to the corresponding route for non-premium routes or paid users
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
                    default:
                      router.push('/');
                  }
                };

                handleNavigation();
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {renderIcon(item, isActive)}
                <Text
                  style={[
                    styles.tabLabel,
                    isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Premium Feature Modal - Commented out for now */}
      {/* <Modal
        visible={isPremiumModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPremiumModalVisible(false)}
      >
        <PremiumFeatureScreen
          featureName={premiumFeatureName}
          onGoBack={() => setIsPremiumModalVisible(false)}
        />
      </Modal> */}
    </View>
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
    paddingVertical: 15,
  },
  shadow: {
    shadowColor: '#5d5c5c',
    shadowOffset: {
      width: 0,
      height: 0,
    },
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
  iconContainer: {
    position: 'relative',
  },
  crownBadge: {
    position: 'absolute',
    top: -1,
    right: -1,
    backgroundColor: '#eab308', // yellow-500
    borderRadius: 9999, // rounded-full
    padding: 1,
  },
});
