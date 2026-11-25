/**
 * Cyber Card Component — FraudShield
 *
 * Consistent container across all screens:
 * - #151F30 card background
 * - #263449 subtle border
 * - 16px border radius
 * - Optional subtle neon glow / accent border
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Colors, Shadows } from '../theme/theme';

export type CardGlow = 'none' | 'blue' | 'cyan' | 'success' | 'danger';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  glow?: CardGlow;
  onPress?: () => void;
  activeOpacity?: number;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  glow = 'none',
  onPress,
  activeOpacity = 0.85,
  elevated = false,
}) => {
  const glowStyle =
    glow === 'blue'
      ? styles.glowBlue
      : glow === 'cyan'
      ? styles.glowCyan
      : glow === 'success'
      ? styles.glowSuccess
      : glow === 'danger'
      ? styles.glowDanger
      : null;

  const cardStyle = [
    styles.card,
    elevated && styles.elevated,
    glowStyle,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...Shadows.card,
  },
  elevated: {
    backgroundColor: Colors.cardElevated,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Shadows.md,
  },
  glowBlue: {
    borderColor: 'rgba(0, 123, 167, 0.45)',
    ...Shadows.glowBlue,
  },
  glowCyan: {
    borderColor: 'rgba(0, 123, 167, 0.35)',
    ...Shadows.glowCyan,
  },
  glowSuccess: {
    borderColor: 'rgba(34, 197, 94, 0.45)',
  },
  glowDanger: {
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
});

export default Card;
