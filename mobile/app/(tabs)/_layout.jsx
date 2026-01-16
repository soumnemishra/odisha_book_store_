// app/(tabs)/_layout.jsx - Premium Tab Bar with Animations
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  SIZES,
} from '../../constants/theme';

/**
 * Animated Tab Icon with scale effect
 */
const AnimatedTabIcon = ({ name, color, size, focused, badge }) => {
  const scale = useSharedValue(1);

  // Use useEffect to animate when focused changes
  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.15, ANIMATIONS.springSnappy),
        withSpring(1, ANIMATIONS.spring)
      );
    } else {
      scale.value = withSpring(0.95, ANIMATIONS.spring);
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.iconContainer}>
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={focused ? name : `${name}-outline`}
          size={size}
          color={color}
        />
      </Animated.View>
      {badge > 0 && (
        <View style={styles.badge}>
          <Animated.Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Animated.Text>
        </View>
      )}
    </View>
  );
};


export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { getItemCount } = useCartStore();
  const { getCount: getWishlistCount } = useWishlistStore();
  const cartCount = getItemCount();
  const wishlistCount = getWishlistCount();

  const handleTabPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: SIZES.tabBarHeight + insets.bottom,
          paddingTop: SPACING.sm,
          paddingBottom: insets.bottom + SPACING.xs,
          backgroundColor: COLORS.surface,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          ...SHADOWS.medium,
        },
        tabBarLabelStyle: {
          ...TYPOGRAPHY.caption,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: SPACING.xs,
        },
      }}
      screenListeners={{
        tabPress: handleTabPress,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="compass"
              color={focused ? COLORS.primary : color}
              size={SIZES.tabBarIconSize}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="heart"
              color={focused ? COLORS.error : color}
              size={SIZES.tabBarIconSize}
              focused={focused}
              badge={wishlistCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="bag"
              color={focused ? COLORS.primary : color}
              size={SIZES.tabBarIconSize}
              focused={focused}
              badge={cartCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="receipt"
              color={focused ? COLORS.primary : color}
              size={SIZES.tabBarIconSize}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon
              name="person"
              color={focused ? COLORS.primary : color}
              size={SIZES.tabBarIconSize}
              focused={focused}
            />
          ),
        }}
      />

      {/* Hidden routes - not shown in tab bar */}
      <Tabs.Screen
        name="book-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="order-success"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textInverse,
    fontWeight: '700',
    fontSize: 10,
  },
});
