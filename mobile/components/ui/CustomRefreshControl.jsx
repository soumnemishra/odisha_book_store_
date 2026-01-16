// components/ui/CustomRefreshControl.jsx - Branded Pull-to-Refresh Animation
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    SPACING,
    ANIMATIONS,
} from '../../constants/theme';

const { width } = Dimensions.get('window');

/**
 * Animated Book Icon - Bouncing book with page flip effect
 */
const AnimatedBookIcon = ({ isRefreshing }) => {
    const rotation = useSharedValue(0);
    const bounce = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (isRefreshing) {
            // Bounce animation
            bounce.value = withRepeat(
                withSequence(
                    withTiming(-10, { duration: 300 }),
                    withSpring(0, ANIMATIONS.springBouncy)
                ),
                -1,
                true
            );

            // Rotation animation (page flip effect)
            rotation.value = withRepeat(
                withSequence(
                    withTiming(15, { duration: 200 }),
                    withTiming(-15, { duration: 200 }),
                    withTiming(0, { duration: 200 })
                ),
                -1,
                false
            );

            // Subtle scale pulse
            scale.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 400 }),
                    withTiming(1, { duration: 400 })
                ),
                -1,
                true
            );
        } else {
            bounce.value = withSpring(0);
            rotation.value = withSpring(0);
            scale.value = withSpring(1);
        }
    }, [isRefreshing]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: bounce.value },
            { rotate: `${rotation.value}deg` },
            { scale: scale.value },
        ],
    }));

    return (
        <Animated.View style={[styles.bookIconContainer, animatedStyle]}>
            <Ionicons name="book" size={32} color={COLORS.primary} />
        </Animated.View>
    );
};

/**
 * Animated Dots - Loading indicator
 */
const AnimatedDots = ({ isRefreshing }) => {
    const dot1 = useSharedValue(0);
    const dot2 = useSharedValue(0);
    const dot3 = useSharedValue(0);

    useEffect(() => {
        if (isRefreshing) {
            dot1.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 300 }),
                    withTiming(0, { duration: 300 })
                ),
                -1,
                true
            );
            setTimeout(() => {
                dot2.value = withRepeat(
                    withSequence(
                        withTiming(1, { duration: 300 }),
                        withTiming(0, { duration: 300 })
                    ),
                    -1,
                    true
                );
            }, 150);
            setTimeout(() => {
                dot3.value = withRepeat(
                    withSequence(
                        withTiming(1, { duration: 300 }),
                        withTiming(0, { duration: 300 })
                    ),
                    -1,
                    true
                );
            }, 300);
        } else {
            dot1.value = withTiming(0);
            dot2.value = withTiming(0);
            dot3.value = withTiming(0);
        }
    }, [isRefreshing]);

    const dotStyle1 = useAnimatedStyle(() => ({
        opacity: interpolate(dot1.value, [0, 1], [0.3, 1]),
        transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2]) }],
    }));

    const dotStyle2 = useAnimatedStyle(() => ({
        opacity: interpolate(dot2.value, [0, 1], [0.3, 1]),
        transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2]) }],
    }));

    const dotStyle3 = useAnimatedStyle(() => ({
        opacity: interpolate(dot3.value, [0, 1], [0.3, 1]),
        transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2]) }],
    }));

    return (
        <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, dotStyle1]} />
            <Animated.View style={[styles.dot, dotStyle2]} />
            <Animated.View style={[styles.dot, dotStyle3]} />
        </View>
    );
};

/**
 * Custom Refresh Control Component
 * Use this with refreshing prop to show branded loading animation
 */
export default function CustomRefreshControl({ refreshing, pullProgress = 0 }) {
    const containerOpacity = useSharedValue(0);
    const containerScale = useSharedValue(0.5);

    useEffect(() => {
        if (refreshing) {
            containerOpacity.value = withTiming(1, { duration: 200 });
            containerScale.value = withSpring(1, ANIMATIONS.springBouncy);
        } else {
            containerOpacity.value = withTiming(0, { duration: 150 });
            containerScale.value = withSpring(0.5);
        }
    }, [refreshing]);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
        transform: [{ scale: containerScale.value }],
    }));

    if (!refreshing) return null;

    return (
        <Animated.View style={[styles.container, containerStyle]}>
            <View style={styles.content}>
                <AnimatedBookIcon isRefreshing={refreshing} />
                <AnimatedDots isRefreshing={refreshing} />
            </View>
        </Animated.View>
    );
}

/**
 * Custom RefreshControl props generator for FlatList/ScrollView
 * Usage: <FlatList {...getRefreshControlProps(refreshing, onRefresh)} />
 */
export const getRefreshControlProps = (refreshing, onRefresh) => ({
    refreshing,
    onRefresh,
    progressViewOffset: 20,
    colors: [COLORS.primary],
    tintColor: COLORS.primary,
    progressBackgroundColor: COLORS.surface,
});

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 50,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    bookIconContainer: {
        marginRight: SPACING.md,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
});
