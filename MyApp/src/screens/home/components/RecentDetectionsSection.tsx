/**
 * Recent Activity & Detections Section — FraudShield Cyber Edition
 *
 * Section D: Displays genuine recent detections with status badges (SAFE, FRAUD, SUSPICIOUS),
 * timestamp, source indicator, and navigation to full history.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from '../../../components/Icon';
import Badge from '../../../components/Badge';
import { Colors, Shadows, Spacing } from '../../../theme/theme';
import {
  DetectionRecord,
  getDetectionRecords,
  subscribeToDetectionHistory,
} from '../../../storage/detectionHistoryStorage';

interface RecentDetectionsSectionProps {
  onViewAll: () => void;
}

export const RecentDetectionsSection: React.FC<RecentDetectionsSectionProps> = ({
  onViewAll,
}) => {
  const [records, setRecords] = useState<DetectionRecord[]>([]);

  useEffect(() => {
    getDetectionRecords().then((data) => setRecords(data));

    const unsubscribe = subscribeToDetectionHistory((updated) => {
      setRecords(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const recentList = records.slice(0, 3);

  const formatTimestamp = (ts: number): string => {
    if (!ts) return 'Recent';
    const diffMs = Date.now() - ts;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(ts).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceLabel = (src: string): string => {
    const s = (src || '').toUpperCase();
    if (s.includes('WHATSAPP')) return 'WhatsApp';
    if (s.includes('SMS')) return 'SMS';
    if (s.includes('OCR')) return 'Screenshot OCR';
    if (s.includes('MANUAL_SCAN')) return 'Screen Assistant';
    return 'Manual Check';
  };

  return (
    <View style={styles.container}>
      {/* ─── Section Header Row ────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionHeading}>Recent Threat Activity</Text>
        <TouchableOpacity
          onPress={onViewAll}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="View all detections">
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Detections Preview or Empty State ─────────────────────── */}
      {recentList.length === 0 ? (
        <View style={[styles.emptyCard, Shadows.card]}>
          <View style={styles.emptyIconCircle}>
            <Icon name="ShieldCheck" size={24} color={Colors.secondary} strokeWidth={2.4} />
          </View>
          <View style={styles.emptyTextCol}>
            <Text style={styles.emptyTitle}>Zero Threats Flagged</Text>
            <Text style={styles.emptySubtitle}>
              Incoming WhatsApp and SMS messages are continuously monitored by AI in real-time.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.listCol}>
          {recentList.map((item) => {
            const isThreat = item.isFraud || item.riskScore >= 0.70;
            const isSuspicious = !isThreat && item.riskScore >= 0.40;
            const scorePct = Math.round(item.riskScore * 100);

            return (
              <View
                key={item.id}
                style={[
                  styles.recordCard,
                  isThreat && styles.recordCardThreat,
                  Shadows.card,
                ]}>
                <View style={styles.cardTopRow}>
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceText}>{getSourceLabel(item.source)}</Text>
                  </View>
                  <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
                </View>

                <Text style={styles.previewText} numberOfLines={2}>
                  "{item.preview}"
                </Text>

                <View style={styles.cardBottomRow}>
                  <View style={styles.statusGroup}>
                    <Icon
                      name={
                        isThreat
                          ? 'AlertTriangle'
                          : isSuspicious
                          ? 'AlertCircle'
                          : 'CheckCircle2'
                      }
                      size={14}
                      color={
                        isThreat
                          ? Colors.error
                          : isSuspicious
                          ? Colors.warning
                          : Colors.success
                      }
                      strokeWidth={2.4}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[
                        styles.statusLabel,
                        isThreat
                          ? styles.textThreat
                          : isSuspicious
                          ? styles.textSuspicious
                          : styles.textClean,
                      ]}>
                      {isThreat
                        ? 'Potential Fraud'
                        : isSuspicious
                        ? 'Suspicious Payload'
                        : 'Verified Safe'}
                    </Text>
                  </View>

                  <Badge
                    label={`${scorePct}% RISK`}
                    variant={isThreat ? 'fraud' : isSuspicious ? 'suspicious' : 'safe'}
                    size="sm"
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
  },

  // Empty State Card
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 123, 167, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.3)',
  },
  emptyTextCol: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },

  // List of Record Cards
  listCol: {
    gap: 8,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordCardThreat: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  previewText: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  textThreat: {
    color: Colors.error,
  },
  textSuspicious: {
    color: Colors.warning,
  },
  textClean: {
    color: Colors.success,
  },
});

export default RecentDetectionsSection;
