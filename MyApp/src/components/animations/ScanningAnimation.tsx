/**
 * ScanningAnimation — Horizontal line + radar sweep for scanning screens
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';

interface ScanningAnimationProps {
  isScanning: boolean;
  variant?: 'line' | 'radar' | 'pulse';
  color?: string;
  height?: number;
}

const ScanningAnimation: React.FC<ScanningAnimationProps> = ({
  isScanning,
  variant = 'line',
  color = Colors.secondary,
  height = 120,
}) => {
  const lineAnim = useRef(new Animated.Value(0)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isScanning) {
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      if (variant === 'line') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(lineAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(lineAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }

      if (variant === 'radar') {
        Animated.loop(
          Animated.timing(radarAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ).start();
      }

      if (variant === 'pulse') {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 0.5,
              duration: 1000,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ).start();
      }
    } else {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isScanning, variant]);

  const lineTranslateY = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height - 4],
  });

  const radarRotate = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[styles.container, { height, opacity: opacityAnim }]}>
      {variant === 'line' && (
        <>
          <Animated.View
            style={[
              styles.scanLine,
              {
                backgroundColor: color,
                transform: [{ translateY: lineTranslateY }],
                shadowColor: color,
              },
            ]}
          />
          {/* Scan line glow */}
          <Animated.View
            style={[
              styles.scanLineGlow,
              {
                backgroundColor: color,
                transform: [{ translateY: lineTranslateY }],
              },
            ]}
          />
        </>
      )}

      {variant === 'radar' && (
        <View style={styles.radarCenter}>
          <Animated.View
            style={[
              styles.radarArm,
              {
                backgroundColor: color,
                transform: [{ rotate: radarRotate }],
              },
            ]}
          />
          {/* Concentric rings */}
          {[0.3, 0.55, 0.8].map((scale, i) => (
            <View
              key={i}
              style={[
                styles.radarRing,
                {
                  width: height * scale,
                  height: height * scale,
                  borderRadius: (height * scale) / 2,
                  borderColor: `${color}30`,
                },
              ]}
            />
          ))}
        </View>
      )}

      {variant === 'pulse' && (
        <View style={styles.pulseCenter}>
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                borderColor: color,
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [0.8, 0.2],
                }),
              },
            ]}
          />
          <View style={[styles.pulseDot, { backgroundColor: color }]} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 12,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  scanLineGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 20,
    opacity: 0.1,
    borderRadius: 10,
  },
  radarCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarArm: {
    position: 'absolute',
    width: 2,
    height: '50%',
    bottom: '50%',
    borderRadius: 1,
    transformOrigin: 'bottom center',
  },
  radarRing: {
    position: 'absolute',
    borderWidth: 1,
  },
  pulseCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  pulseDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

export default ScanningAnimation;
