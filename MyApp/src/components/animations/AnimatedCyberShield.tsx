/**
 * AnimatedCyberShield — Live Protection Shield
 *
 * Animated cyber shield for the Live Protection section:
 * - Glowing shield with subtle 3D appearance
 * - Pulsating neon outline
 * - Animated protection rings
 * - Green glow when active, red alert when threat detected
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';
import Icon from '../Icon';

interface AnimatedCyberShieldProps {
  isActive: boolean;
  hasThreat?: boolean;
  size?: number;
}

const AnimatedCyberShield: React.FC<AnimatedCyberShieldProps> = ({
  isActive,
  hasThreat = false,
  size = 64,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0.6)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const activeColor = hasThreat ? Colors.error : Colors.success;
  const activeGlow = hasThreat ? Colors.glowDanger : Colors.glowSuccess;

  useEffect(() => {
    if (isActive) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Ring expansion
      Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0.6,
            duration: 2000,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Glow
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Slow rotation for outer ring
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [isActive, hasThreat]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size + 20, height: size + 20 }]}>
      {/* Outer glow ring */}
      {isActive && (
        <Animated.View
          style={[
            styles.outerRing,
            {
              width: size + 16,
              height: size + 16,
              borderRadius: (size + 16) / 2,
              borderColor: hasThreat
                ? 'rgba(255, 69, 69, 0.3)'
                : 'rgba(32, 217, 138, 0.3)',
              opacity: ringAnim,
              transform: [{ scale: ringAnim }],
            },
          ]}
        />
      )}

      {/* Rotating protection ring */}
      {isActive && (
        <Animated.View
          style={[
            styles.protectionRing,
            {
              width: size + 8,
              height: size + 8,
              borderRadius: (size + 8) / 2,
              borderColor: hasThreat
                ? 'rgba(255, 69, 69, 0.2)'
                : 'rgba(32, 217, 138, 0.2)',
              transform: [{ rotate }],
            },
          ]}>
          <View
            style={[
              styles.ringDot,
              {
                backgroundColor: activeColor,
                top: -3,
                left: (size + 8) / 2 - 3,
              },
            ]}
          />
        </Animated.View>
      )}

      {/* Shield body */}
      <Animated.View
        style={[
          styles.shieldBody,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: hasThreat
              ? 'rgba(255, 69, 69, 0.12)'
              : isActive
                ? 'rgba(32, 217, 138, 0.12)'
                : 'rgba(99, 99, 112, 0.12)',
            borderColor: hasThreat
              ? 'rgba(255, 69, 69, 0.4)'
              : isActive
                ? 'rgba(32, 217, 138, 0.4)'
                : 'rgba(99, 99, 112, 0.3)',
            transform: [{ scale: isActive ? pulseAnim : 1 }],
            shadowColor: activeColor,
            shadowOpacity: isActive ? 0.4 : 0,
            shadowRadius: 12,
          },
        ]}>
        <Icon
          name="ShieldCheck"
          size={size * 0.45}
          color={
            hasThreat
              ? Colors.error
              : isActive
                ? Colors.success
                : Colors.textTertiary
          }
          strokeWidth={2.2}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  protectionRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  shieldBody: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});

export default AnimatedCyberShield;
