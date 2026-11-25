/**
 * Cyber Badge Component — FraudShield Cyber Edition
 *
 * Micro-status indicator with high-contrast text and subtle glowing background.
 * Variants: safe | fraud | suspicious | info | cyan | neonRose | neutral
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography } from '../theme/theme';

export type BadgeVariant =
  | 'safe'
  | 'fraud'
  | 'suspicious'
  | 'info'
  | 'cyan'
  | 'neonRose'
  | 'neutral';

export interface BadgeProps {
  label?: string;
  text?: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md' | 'small';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  text,
  variant = 'info',
  style,
  textStyle,
  size = 'md',
}) => {
  const displayText = label ?? text ?? '';
  const isSmall = size === 'sm' || size === 'small';
  const variantConfig = {
    safe: {
      bg: 'rgba(32, 217, 138, 0.12)',
      border: 'rgba(32, 217, 138, 0.35)',
      text: Colors.success,
    },
    fraud: {
      bg: 'rgba(255, 69, 69, 0.12)',
      border: 'rgba(255, 69, 69, 0.35)',
      text: Colors.error,
    },
    suspicious: {
      bg: 'rgba(255, 179, 0, 0.12)',
      border: 'rgba(255, 179, 0, 0.35)',
      text: Colors.warning,
    },
    info: {
      bg: 'rgba(0, 123, 167, 0.15)',
      border: 'rgba(0, 123, 167, 0.4)',
      text: Colors.primaryLight,
    },
    cyan: {
      bg: 'rgba(0, 123, 167, 0.15)',
      border: 'rgba(0, 123, 167, 0.35)',
      text: Colors.primary,
    },
    neonRose: {
      bg: 'rgba(255, 45, 149, 0.15)',
      border: 'rgba(255, 45, 149, 0.4)',
      text: Colors.neonRose,
    },
    neutral: {
      bg: 'rgba(161, 161, 170, 0.12)',
      border: Colors.border,
      text: Colors.textSecondary,
    },
  }[variant] || {
    bg: 'rgba(0, 123, 167, 0.15)',
    border: Colors.border,
    text: Colors.textSecondary,
  };

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        {
          backgroundColor: variantConfig.bg,
          borderColor: variantConfig.border,
        },
        style,
      ]}>
      <Text
        style={[
          styles.text,
          isSmall && styles.textSm,
          { color: variantConfig.text },
          textStyle,
        ]}>
        {displayText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 14,
  },
  text: {
    ...Typography.styles.captionMedium,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

export default Badge;
