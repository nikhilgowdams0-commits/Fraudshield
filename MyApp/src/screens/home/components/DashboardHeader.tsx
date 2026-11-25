/**
 * DashboardHeader — Premium FraudShield branding header
 * Jet Black background, Cerulean Blue + Neon Rose accents
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../../theme/colors';
import Icon from '../../../components/Icon';

interface DashboardHeaderProps {
  userName: string;
  onPressProfile: () => void;
  onPressNotification: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  onPressProfile,
  onPressNotification,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;
  const dotPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // Live dot pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(dotPulse, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const firstName = userName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}>
      <View style={styles.leftSection}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Icon name="Shield" size={16} color={Colors.secondary} strokeWidth={2.5} />
          </View>
          <Text style={styles.brandText}>FraudShield</Text>
          <View style={styles.aiBadge}>
            <Animated.View style={[styles.liveDot, { opacity: dotPulse }]} />
            <Text style={styles.aiBadgeText}>AI ACTIVE</Text>
          </View>
        </View>
        <Text style={styles.greeting}>{greeting}, {firstName}</Text>
        <Text style={styles.subtitle}>Your AI cybersecurity is monitoring</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onPressNotification}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Notifications">
          <Icon name="Activity" size={18} color={Colors.textSecondary} strokeWidth={2} />
          <View style={styles.notifDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onPressProfile}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Open profile">
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingTop: 4,
  },
  leftSection: {
    flex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 45, 149, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: -0.5,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(32, 217, 138, 0.12)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(32, 217, 138, 0.3)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.success,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.secondary,
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 123, 167, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});

export default DashboardHeader;
