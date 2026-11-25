/**
 * TypingIndicator — Three-dot bouncing animation for AI chat
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../theme/colors';

interface TypingIndicatorProps {
  color?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  color = Colors.secondary,
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -6,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(600 - delay),
        ]),
      );
    };

    createDotAnimation(dot1, 0).start();
    createDotAnimation(dot2, 150).start();
    createDotAnimation(dot3, 300).start();
  }, []);

  return (
    <View style={styles.container}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            { backgroundColor: color, transform: [{ translateY: dot }] },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default TypingIndicator;
