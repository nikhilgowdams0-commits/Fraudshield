/**
 * Cyber User Avatar Component — FraudShield
 *
 * Initials-based avatar with deterministic vibrant styling, cyber accent ring,
 * and high-contrast typography.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Shadows } from '../theme/theme';

interface UserAvatarProps {
  name: string;
  size?: number;
  style?: ViewStyle;
  showRing?: boolean;
}

const getAvatarColor = (name: string): string => {
  const colors = Colors.avatarColors;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (name.slice(0, 2) || 'FS').toUpperCase();
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  size = 56,
  style,
  showRing = false,
}) => {
  const initials = getInitials(name || 'User');
  const backgroundColor = getAvatarColor(name || 'User');
  const fontSize = Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        showRing && styles.ring,
        Shadows.sm,
        style,
      ]}>
      <Text style={[styles.initials, { fontSize, lineHeight: fontSize + 4 }]}>
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ring: {
    borderColor: Colors.secondary,
    borderWidth: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default UserAvatar;
