/**
 * AnimatedCounter — Animated statistics counter with smooth number transition
 */

import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, StyleProp, Animated, Easing } from 'react-native';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1500,
  style,
  prefix = '',
  suffix = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    const listener = animValue.addListener(({ value: v }) => {
      setDisplayValue(Math.round(v));
    });

    Animated.timing(animValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animValue.removeListener(listener);
    };
  }, [value, duration]);

  return (
    <Text style={style}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </Text>
  );
};

export default AnimatedCounter;
