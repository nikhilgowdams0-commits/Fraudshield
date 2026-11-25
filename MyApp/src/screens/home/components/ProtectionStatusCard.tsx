/**
 * ProtectionStatusCard — Animated cyber shield with live protection status
 * Uses AnimatedCyberShield component for visual effect
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../../theme/colors';
import Icon from '../../../components/Icon';
import { AnimatedCyberShield } from '../../../components/animations';
import { ServiceStatus } from '../../../utils/accessibilityService';

interface ProtectionStatusCardProps {
  status: ServiceStatus;
  floatingBotActive: boolean;
  onToggleFloatingBot: () => void;
}

const ProtectionStatusCard: React.FC<ProtectionStatusCardProps> = ({
  status,
  floatingBotActive,
  onToggleFloatingBot,
}) => {
  const isFullyActive =
    status.accessibilityEnabled &&
    status.overlayGranted &&
    status.notificationListenerEnabled;

  const activeCount = [
    status.accessibilityEnabled,
    status.overlayGranted,
    status.notificationListenerEnabled,
  ].filter(Boolean).length;

  return (
    <View style={styles.card}>
      {/* Subtle gradient top border */}
      <View style={styles.gradientBorder} />

      <View style={styles.content}>
        {/* Shield animation */}
        <AnimatedCyberShield
          isActive={isFullyActive}
          size={56}
        />

        {/* Status info */}
        <View style={styles.infoSection}>
          <Text style={styles.statusTitle}>
            {isFullyActive ? 'Live Protection Active' : 'Protection Partial'}
          </Text>
          <Text style={styles.statusSubtitle}>
            {isFullyActive
              ? 'All shield layers operational'
              : `${activeCount}/3 protection layers enabled`}
          </Text>

          {/* Service indicators */}
          <View style={styles.servicesRow}>
            <ServiceDot
              label="Accessibility"
              active={status.accessibilityEnabled}
            />
            <ServiceDot
              label="Overlay"
              active={status.overlayGranted}
            />
            <ServiceDot
              label="Notifications"
              active={status.notificationListenerEnabled}
            />
          </View>
        </View>
      </View>

      {/* Floating bot toggle */}
      <TouchableOpacity
        style={[
          styles.floatingBotToggle,
          floatingBotActive && styles.floatingBotToggleActive,
        ]}
        onPress={onToggleFloatingBot}
        activeOpacity={0.7}>
        <Icon
          name="Bot"
          size={14}
          color={floatingBotActive ? Colors.secondary : Colors.textTertiary}
          strokeWidth={2.2}
        />
        <Text
          style={[
            styles.floatingBotText,
            floatingBotActive && styles.floatingBotTextActive,
          ]}>
          {floatingBotActive ? 'Bot Active' : 'Floating Bot'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const ServiceDot: React.FC<{ label: string; active: boolean }> = ({
  label,
  active,
}) => (
  <View style={styles.serviceDotRow}>
    <View
      style={[
        styles.dot,
        { backgroundColor: active ? Colors.success : Colors.textTertiary },
      ]}
    />
    <Text
      style={[
        styles.dotLabel,
        { color: active ? Colors.textSecondary : Colors.textTertiary },
      ]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    overflow: 'hidden',
  },
  gradientBorder: {
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  infoSection: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  floatingBotToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: 'rgba(20, 20, 26, 0.5)',
  },
  floatingBotToggleActive: {
    backgroundColor: 'rgba(255, 45, 149, 0.06)',
    borderTopColor: 'rgba(255, 45, 149, 0.15)',
  },
  floatingBotText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  floatingBotTextActive: {
    color: Colors.secondary,
  },
});

export default ProtectionStatusCard;
