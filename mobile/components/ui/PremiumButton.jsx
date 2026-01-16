// components/ui/PremiumButton.jsx - Premium Button Component (Simplified - No Gradients)
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/theme';

/**
 * Premium Button Component
 * Variants: primary, secondary, outline, ghost
 * Sizes: small, medium, large
 */
export default function PremiumButton({
    children,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    ...props
}) {
    const buttonStyles = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
    ];

    const getIconColor = () => {
        if (variant === 'primary') return COLORS.surface;
        if (variant === 'outline' || variant === 'ghost') return COLORS.primary;
        return COLORS.textPrimary;
    };

    const renderContent = () => (
        <>
            {loading ? (
                <ActivityIndicator color={variant === 'primary' ? COLORS.surface : COLORS.primary} />
            ) : (
                <View style={styles.content}>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                            color={getIconColor()}
                            style={styles.iconLeft}
                        />
                    )}
                    <Text style={textStyles}>{children}</Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={size === 'small' ? 16 : size === 'large' ? 24 : 20}
                            color={getIconColor()}
                            style={styles.iconRight}
                        />
                    )}
                </View>
            )}
        </>
    );

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={buttonStyles}
            {...props}
        >
            {renderContent()}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: BORDER_RADIUS.lg,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Variants
    primary: {
        backgroundColor: COLORS.primary,
        ...SHADOWS.medium,
    },
    secondary: {
        backgroundColor: COLORS.textSecondary,
        ...SHADOWS.small,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },

    // Sizes
    small: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 36,
    },
    medium: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        minHeight: 48,
    },
    large: {
        paddingHorizontal: SPACING.xxl,
        paddingVertical: SPACING.lg,
        minHeight: 56,
    },

    // States
    disabled: {
        opacity: 0.5,
    },
    fullWidth: {
        width: '100%',
    },

    // Text styles
    text: {
        ...TYPOGRAPHY.button,
    },
    primaryText: {
        color: COLORS.surface,
    },
    secondaryText: {
        color: COLORS.surface,
    },
    outlineText: {
        color: COLORS.primary,
    },
    ghostText: {
        color: COLORS.primary,
    },
    disabledText: {
        opacity: 0.7,
    },

    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },

    // Icons
    iconLeft: {
        marginRight: SPACING.sm,
    },
    iconRight: {
        marginLeft: SPACING.sm,
    },
});
