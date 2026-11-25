/**
 * FraudResultAnimation — Visual animations for detection results
 * Safe (green), Suspicious (amber), Fraud (red)
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';
import Icon, { IconName } from '../Icon';

type ResultType = 'safe' | 'suspicious' | 'fraud';

interface FraudResultAnimationProps {
  result: ResultType;
  size?: number;
}

const RESULT_CONFIG: Record<ResultType, { color: string; icon: IconName; glowColor: string }> = {
  safe: { color: Colors.success, icon: 'ShieldCheck', glowColor: 'rgba(32, 217, 138, 0.3)' },
  suspicious: { color: Colors.warning, icon: 'AlertTriangle', glowColor: 'rgba(245, 166, 35, 0.3)' },
  fraud: { color: Colors.error, icon: 'AlertCircle', glowColor: 'rgba(255, 69, 69, 0.3)' },
};

const FraudResultAnimation: React.FC<FraudResultAnimationProps> = ({
  result,
  size = 80,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(1)).current;

  const config = RESULT_CONFIG[result];

  useEffect(() => {
    // Entrance bounce
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 6,
      useNativeDriver: true,
    }).start();

    // Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: result === 'fraud' ? 800 : 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: result === 'fraud' ? 800 : 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    // Expanding ring
    Animated.loop(
      Animated.parallel([
        Animated.timing(ringAnim, {
          toValue: 1.5,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [result]);

  return (
    <View style={[styles.container, { width: size + 30, height: size + 30 }]}>
      {/* Expanding ring */}
      <Animated.View
        style={[
          styles.expandRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: config.color,
            opacity: ringOpacity,
            transform: [{ scale: ringAnim }],
          },
        ]}
      />

      {/* Main circle */}
      <Animated.View
        style={[
          styles.mainCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: config.glowColor,
            borderColor: config.color,
            shadowColor: config.color,
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}>
        <Icon
          name={config.icon}
          size={size * 0.4}
          color={config.color}
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
    alignSelf: 'center',
  },
  expandRing: {
    position: 'absolute',
    borderWidth: 2,
  },
  mainCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
});

export default FraudResultAnimation;
