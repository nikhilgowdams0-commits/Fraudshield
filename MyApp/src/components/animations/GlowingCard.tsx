/**
 * GlowingCard — Glassmorphism card with optional neon border glow
 */

import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle } from 'react-native';
import Colors from '../../theme/colors';

interface GlowingCardProps {
  children: React.ReactNode;
  glowColor?: string;
  style?: ViewStyle;
  animated?: boolean;
  intensity?: 'low' | 'medium' | 'high';
}

const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  glowColor = Colors.primary,
  style,
  animated = false,
  intensity = 'low',
}) => {
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  const opacityValues = {
    low: [0.15, 0.3],
    medium: [0.25, 0.5],
    high: [0.35, 0.7],
  };

  useEffect(() => {
    if (animated) {
      const [min, max] = opacityValues[intensity];
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: max,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: min,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ).start();
    }
  }, [animated, intensity]);

  const borderColor = animated
    ? glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [`${glowColor}25`, `${glowColor}80`],
      })
    : `${glowColor}30`;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor,
          shadowColor: glowColor,
          shadowOpacity: animated ? glowAnim : opacityValues[intensity][0],
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 4,
  },
});

export default GlowingCard;
