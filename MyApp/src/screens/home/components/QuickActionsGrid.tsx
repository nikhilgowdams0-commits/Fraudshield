/**
 * QuickActionsGrid — Premium Cybersecurity Action Matrix
 *
 * Balanced 2-column cyber grid:
 * - 6 core threat defense modules in 3 symmetrical rows of 2
 * - High-contrast neon icons, status badges, clear un-truncated titles
 * - Matches FraudShield Cyber Edition design tokens (Colors, Typography)
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../../theme/colors';
import Icon, { IconName } from '../../../components/Icon';

export interface QuickActionsGridProps {
  onCheckMessage: () => void;
  onScanScreenshot: () => void;
  onViewHistory: () => void;
  onOpenSettings: () => void;
  onOpenAssistant: () => void;
  onOpenNetworkAnalysis?: () => void;
}

interface ActionItem {
  icon: IconName;
  label: string;
  subtitle: string;
  badge?: string;
  color: string;
  bgColor: string;
  borderColor: string;
  onPress: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onCheckMessage,
  onScanScreenshot,
  onViewHistory,
  onOpenSettings,
  onOpenAssistant,
  onOpenNetworkAnalysis,
}) => {
  const actions: ActionItem[] = [
    {
      icon: 'Scan',
      label: 'SMS Scanner',
      subtitle: 'Check text & links',
      badge: 'AI SCAN',
      color: Colors.primary,
      bgColor: 'rgba(0, 123, 167, 0.12)',
      borderColor: 'rgba(0, 123, 167, 0.28)',
      onPress: onCheckMessage,
    },
    {
      icon: 'Image',
      label: 'OCR Scan',
      subtitle: 'Screenshot audit',
      badge: 'VISION',
      color: Colors.secondary,
      bgColor: 'rgba(255, 45, 149, 0.12)',
      borderColor: 'rgba(255, 45, 149, 0.28)',
      onPress: onScanScreenshot,
    },
    {
      icon: 'Bot',
      label: 'AI Assistant',
      subtitle: 'Security guidance',
      badge: 'COPILOT',
      color: Colors.secondary,
      bgColor: 'rgba(255, 45, 149, 0.12)',
      borderColor: 'rgba(255, 45, 149, 0.28)',
      onPress: onOpenAssistant,
    },
    {
      icon: 'Clock',
      label: 'Threat History',
      subtitle: 'Audit logs & records',
      badge: 'LOGS',
      color: Colors.primary,
      bgColor: 'rgba(0, 123, 167, 0.12)',
      borderColor: 'rgba(0, 123, 167, 0.28)',
      onPress: onViewHistory,
    },
  ];

  if (onOpenNetworkAnalysis) {
    actions.push({
      icon: 'Activity',
      label: 'Network Graph',
      subtitle: 'Mule ring analysis',
      badge: 'GCN',
      color: Colors.primary,
      bgColor: 'rgba(0, 123, 167, 0.12)',
      borderColor: 'rgba(0, 123, 167, 0.28)',
      onPress: onOpenNetworkAnalysis,
    });
  }

  actions.push({
    icon: 'Settings',
    label: 'App Settings',
    subtitle: 'Defense policies',
    badge: 'CONFIG',
    color: Colors.textSecondary,
    bgColor: 'rgba(161, 161, 170, 0.08)',
    borderColor: 'rgba(161, 161, 170, 0.22)',
    onPress: onOpenSettings,
  });

  const fadeAnims = useRef(
    actions.map(() => new Animated.Value(0)),
  ).current;
  const slideAnims = useRef(
    actions.map(() => new Animated.Value(14)),
  ).current;

  useEffect(() => {
    fadeAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: index * 40,
        useNativeDriver: true,
      }).start();
    });
    slideAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 350,
        delay: index * 40,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  }, [fadeAnims, slideAnims]);

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionLabel}>Quick Actions</Text>
        <Text style={styles.sectionBadge}>{actions.length} MODULES</Text>
      </View>

      <View style={styles.grid}>
        {actions.map((action, index) => (
          <Animated.View
            key={action.label}
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnims[index] || 1,
                transform: [{ translateY: slideAnims[index] || 0 }],
              },
            ]}>
            <TouchableOpacity
              style={styles.actionCard}
              onPress={action.onPress}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel={action.label}>
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.iconBox,
                    {
                      backgroundColor: action.bgColor,
                      borderColor: action.borderColor,
                    },
                  ]}>
                  <Icon
                    name={action.icon}
                    size={18}
                    color={action.color}
                    strokeWidth={2.2}
                  />
                </View>

                {action.badge ? (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: action.bgColor,
                        borderColor: action.borderColor,
                      },
                    ]}>
                    <Text style={[styles.badgeText, { color: action.color }]}>
                      {action.badge}
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.cardBottom}>
                <Text style={styles.actionLabel} numberOfLines={1}>
                  {action.label}
                </Text>
                <Text style={styles.actionSubtitle} numberOfLines={1}>
                  {action.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  cardWrapper: {
    width: '48.5%',
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 104,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  cardBottom: {
    marginTop: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
});

export default QuickActionsGrid;
