/**
 * Cyber Button Component — FraudShield
 *
 * Supports primary (electric blue), cyan (cyber accent), secondary (dark card),
 * outline, danger, ghost variants.
 * Features left/right Lucide icon support, size scaling, loading spinner,
 * and tactile press feedback.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme/theme';
import Icon, { IconName } from './Icon';

export type ButtonVariant =
  | 'primary'
  | 'cyan'
  | 'secondary'
  | 'neonRose'
  | 'outline'
  | 'danger'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  accessibilityLabel?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  fullWidth = true,
  accessibilityLabel,
}) => {
  const isDisabled = disabled || loading;

  const buttonStyles = [
    styles.base,
    sizeStyles[size].button,
    variantStyles[variant]?.button,
    variant === 'primary' && Shadows.glowBlue,
    variant === 'cyan' && Shadows.glowCyan,
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    isDisabled && variant === 'primary' && styles.disabledPrimary,
    style,
  ];

  const textStyles = [
    styles.text,
    sizeStyles[size].text,
    variantStyles[variant]?.text,
    isDisabled && styles.disabledText,
    textStyle,
  ];

  const getIconColor = () => {
    if (isDisabled) return Colors.textTertiary;
    switch (variant) {
      case 'primary':
      case 'danger':
      case 'neonRose':
        return '#FFFFFF';
      case 'cyan':
        return '#0A0A0A';
      case 'secondary':
        return Colors.textPrimary;
      case 'ghost':
        return Colors.primaryLight;
      case 'outline':
        return Colors.textPrimary;
      default:
        return Colors.textPrimary;
    }
  };

  const spinnerColor =
    variant === 'cyan'
      ? '#0A0A0A'
      : variant === 'outline' || variant === 'ghost'
      ? Colors.primaryLight
      : '#FFFFFF';

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}
          <Text style={textStyles}>{title}</Text>
          {rightIcon && (
            <Icon
              name={rightIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: Spacing.sm,
  },
  rightIcon: {
    marginLeft: Spacing.sm,
  },
  text: {
    ...Typography.styles.button,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledPrimary: {
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderColor: 'rgba(0, 123, 167, 0.25)',
  },
  disabledText: {
    color: Colors.textTertiary,
  },
});

const sizeStyles: Record<
  ButtonSize,
  { button: ViewStyle; text: TextStyle }
> = {
  sm: {
    button: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      minHeight: 38,
      borderRadius: 10,
    },
    text: {
      fontSize: 13,
      fontWeight: '600',
    },
  },
  md: {
    button: {
      paddingVertical: 13,
      paddingHorizontal: 20,
      minHeight: 48,
      borderRadius: 12,
    },
    text: {
      fontSize: 15,
      fontWeight: '700',
    },
  },
  lg: {
    button: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      minHeight: 54,
      borderRadius: 14,
    },
    text: {
      fontSize: 16,
      fontWeight: '700',
    },
  },
};

const variantStyles: Record<
  ButtonVariant,
  { button: ViewStyle; text: TextStyle }
> = {
  primary: {
    button: {
      backgroundColor: Colors.primary,
      borderWidth: 1,
      borderColor: 'rgba(0, 123, 167, 0.6)',
    },
    text: {
      color: '#FFFFFF',
    },
  },
  cyan: {
    button: {
      backgroundColor: Colors.secondary,
      borderWidth: 1,
      borderColor: 'rgba(0, 123, 167, 0.4)',
    },
    text: {
      color: '#0A0A0A',
    },
  },
  neonRose: {
    button: {
      backgroundColor: '#FF2D95',
      borderWidth: 1,
      borderColor: 'rgba(255, 45, 149, 0.6)',
    },
    text: {
      color: '#FFFFFF',
    },
  },
  secondary: {
    button: {
      backgroundColor: Colors.cardElevated,
      borderWidth: 1,
      borderColor: Colors.border,
    },
    text: {
      color: Colors.textPrimary,
    },
  },
  outline: {
    button: {
      backgroundColor: 'transparent',
      borderWidth: 1.2,
      borderColor: Colors.border,
    },
    text: {
      color: Colors.textPrimary,
    },
  },
  danger: {
    button: {
      backgroundColor: Colors.error,
      borderWidth: 1,
      borderColor: '#F87171',
    },
    text: {
      color: '#FFFFFF',
    },
  },
  ghost: {
    button: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    text: {
      color: Colors.primaryLight,
    },
  },
};

export default Button;
