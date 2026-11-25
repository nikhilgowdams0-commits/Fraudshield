/**
 * Modern Loading / Splash Screen Component — FraudShield Cyber Edition
 *
 * Polished centered branding with glowing Lucide Shield icon, spinner, and clean typography.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated } from 'react-native';
import { Colors, Typography, Spacing, Shadows } from '../theme/theme';
import Icon from './Icon';

const LoadingScreen: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Animated.View
          style={[
            styles.iconCircle,
            Shadows.glowBlue,
            { transform: [{ scale: pulseAnim }] },
          ]}>
          <Icon name="ShieldCheck" size={42} color={Colors.secondary} strokeWidth={2.4} />
        </Animated.View>
        <Text style={styles.appName}>FraudShield</Text>
        <Text style={styles.appTagline}>AI Smart Cyberfraud Defense System</Text>
      </View>
      <ActivityIndicator
        size="small"
        color={Colors.secondary}
        style={styles.spinner}
      />
      <Text style={styles.loadingText}>Securing cryptographic session...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 123, 167, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  appName: {
    ...Typography.styles.heading1,
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  appTagline: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  spinner: {
    marginBottom: Spacing.md,
  },
  loadingText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});

export default LoadingScreen;
