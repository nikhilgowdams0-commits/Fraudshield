/**
 * AnimatedAIScanner — FraudShield Signature Visual Element
 *
 * A futuristic rotating AI scanner with:
 * - Rotating outer ring with neon glow
 * - Pulsating core with Neon Rose highlights
 * - Radar sweep animation
 * - Floating particles
 * - Breathing energy pulse
 * - Cerulean Blue secondary lighting
 *
 * Uses only React Native built-in Animated API.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';

interface AnimatedAIScannerProps {
  size?: number;
  showParticles?: boolean;
}

const AnimatedAIScanner: React.FC<AnimatedAIScannerProps> = ({
  size = 220,
  showParticles = true,
}) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateReverseAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;
  const breatheAnim = useRef(new Animated.Value(0.85)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array.from({ length: 8 }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
    })),
  ).current;

  useEffect(() => {
    // Entrance animation
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 40,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Continuous rotation - outer ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Counter rotation - inner ring
    Animated.loop(
      Animated.timing(rotateReverseAnim, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Core pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Outer glow pulsation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.7,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Radar sweep
    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Breathing effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(breatheAnim, {
          toValue: 1.0,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(breatheAnim, {
          toValue: 0.85,
          duration: 2500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Floating particles
    if (showParticles) {
      particleAnims.forEach((particle, index) => {
        const delay = index * 400;
        const duration = 3000 + (index % 3) * 1000;
        const angle = (index / 8) * Math.PI * 2;
        const radius = size * 0.4 + (index % 3) * 10;

        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0.6,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(particle.x, {
                toValue: Math.cos(angle) * radius,
                duration: duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: Math.sin(angle) * radius,
                duration: duration,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(particle.opacity, {
                toValue: 0,
                duration: duration * 0.3,
                useNativeDriver: true,
              }),
              Animated.timing(particle.x, {
                toValue: 0,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
              Animated.timing(particle.y, {
                toValue: 0,
                duration: duration * 0.5,
                useNativeDriver: true,
              }),
            ]),
          ]),
        ).start();
      });
    }
  }, []);

  const outerRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerRotate = rotateReverseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  const radarRotate = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const half = size / 2;
  const ringThickness = 2;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          opacity: entranceAnim,
          transform: [
            {
              scale: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
        },
      ]}>
      {/* Outer glow halo */}
      <Animated.View
        style={[
          styles.outerGlow,
          {
            width: size + 40,
            height: size + 40,
            borderRadius: (size + 40) / 2,
            opacity: glowAnim,
            transform: [{ scale: breatheAnim }],
          },
        ]}
      />

      {/* Outer rotating ring */}
      <Animated.View
        style={[
          styles.outerRing,
          {
            width: size,
            height: size,
            borderRadius: half,
            borderWidth: ringThickness,
            transform: [{ rotate: outerRotate }],
          },
        ]}>
        {/* Ring accent markers */}
        <View style={[styles.ringMarker, styles.markerTop, { left: half - 4 }]} />
        <View style={[styles.ringMarker, styles.markerRight, { top: half - 4 }]} />
        <View style={[styles.ringMarker, styles.markerBottom, { left: half - 4 }]} />
        <View style={[styles.ringMarker, styles.markerLeft, { top: half - 4 }]} />
      </Animated.View>

      {/* Second rotating ring (counter-rotation) */}
      <Animated.View
        style={[
          styles.innerRing,
          {
            width: size * 0.72,
            height: size * 0.72,
            borderRadius: (size * 0.72) / 2,
            borderWidth: ringThickness,
            transform: [{ rotate: innerRotate }],
          },
        ]}>
        {/* Inner ring tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
          <View
            key={i}
            style={[
              styles.tickMark,
              {
                transform: [
                  { rotate: `${deg}deg` },
                  { translateY: -(size * 0.72) / 2 + 6 },
                ],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Radar sweep */}
      <Animated.View
        style={[
          styles.radarContainer,
          {
            width: size * 0.55,
            height: size * 0.55,
            borderRadius: (size * 0.55) / 2,
            transform: [{ rotate: radarRotate }],
          },
        ]}>
        <View style={styles.radarSweep} />
      </Animated.View>

      {/* Pulsating core */}
      <Animated.View
        style={[
          styles.core,
          {
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: (size * 0.35) / 2,
            transform: [{ scale: pulseAnim }],
          },
        ]}>
        <View style={styles.coreInner}>
          {/* Center dot */}
          <View style={styles.centerDot} />
          {/* Scanning lines */}
          <View style={styles.scanLineH} />
          <View style={styles.scanLineV} />
        </View>
      </Animated.View>

      {/* Concentric scanning rings */}
      <View
        style={[
          styles.scanRing,
          {
            width: size * 0.5,
            height: size * 0.5,
            borderRadius: (size * 0.5) / 2,
          },
        ]}
      />

      {/* Floating particles */}
      {showParticles &&
        particleAnims.map((particle, index) => (
          <Animated.View
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                opacity: particle.opacity,
                transform: [
                  { translateX: particle.x },
                  { translateY: particle.y },
                ],
                backgroundColor:
                  index % 2 === 0 ? Colors.secondary : Colors.primary,
              },
            ]}
          />
        ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.15)',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  outerRing: {
    position: 'absolute',
    borderColor: 'rgba(255, 45, 149, 0.4)',
    borderStyle: 'solid',
  },
  innerRing: {
    position: 'absolute',
    borderColor: 'rgba(0, 123, 167, 0.35)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMarker: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  markerTop: { top: -4 },
  markerRight: { right: -4 },
  markerBottom: { bottom: -4 },
  markerLeft: { left: -4 },
  tickMark: {
    position: 'absolute',
    width: 2,
    height: 8,
    backgroundColor: 'rgba(0, 123, 167, 0.5)',
    borderRadius: 1,
  },
  radarContainer: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarSweep: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: '50%',
    height: '50%',
    backgroundColor: 'rgba(255, 45, 149, 0.08)',
    borderBottomLeftRadius: 0,
    transformOrigin: 'bottom left',
  },
  core: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 45, 149, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255, 45, 149, 0.5)',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreInner: {
    width: '75%',
    height: '75%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 45, 149, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  scanLineH: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0, 123, 167, 0.3)',
  },
  scanLineV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(0, 123, 167, 0.3)',
  },
  scanRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.15)',
    borderStyle: 'dashed',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default AnimatedAIScanner;
