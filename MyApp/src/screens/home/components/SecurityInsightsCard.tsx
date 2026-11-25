/**
 * SecurityInsightsCard — Animated statistics counters
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../../theme/colors';
import Icon, { IconName } from '../../../components/Icon';
import { AnimatedCounter } from '../../../components/animations';

interface SecurityInsightsCardProps {
  isProtectionActive: boolean;
}

interface StatItem {
  icon: IconName;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const SecurityInsightsCard: React.FC<SecurityInsightsCardProps> = ({
  isProtectionActive,
}) => {
  const stats: StatItem[] = [
    {
      icon: 'Scan',
      label: 'Total Scanned',
      value: 1247,
      color: Colors.primary,
      bgColor: 'rgba(0, 123, 167, 0.12)',
      borderColor: 'rgba(0, 123, 167, 0.3)',
    },
    {
      icon: 'ShieldCheck',
      label: 'Threats Blocked',
      value: 42,
      color: Colors.error,
      bgColor: 'rgba(255, 69, 69, 0.12)',
      borderColor: 'rgba(255, 69, 69, 0.3)',
    },
    {
      icon: 'CheckCircle2',
      label: 'Safe & Clean',
      value: 1205,
      color: Colors.success,
      bgColor: 'rgba(32, 217, 138, 0.12)',
      borderColor: 'rgba(32, 217, 138, 0.3)',
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Security Overview</Text>
        <View style={[styles.statusDot, {
          backgroundColor: isProtectionActive ? Colors.success : Colors.textTertiary,
        }]} />
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View
              style={[
                styles.statIconBox,
                {
                  backgroundColor: stat.bgColor,
                  borderColor: stat.borderColor,
                },
              ]}>
              <Icon name={stat.icon} size={16} color={stat.color} strokeWidth={2.2} />
            </View>
            <AnimatedCounter
              value={stat.value}
              style={[styles.statValue, { color: stat.color }]}
              duration={1200}
            />
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: -0.2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});

export default SecurityInsightsCard;
