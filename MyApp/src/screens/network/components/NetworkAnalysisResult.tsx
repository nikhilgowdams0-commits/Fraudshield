/**
 * Network Analysis Result Component — FraudShield Cyber Edition
 *
 * Displays the comprehensive Graph Convolutional Network (GCN) analysis results:
 * - Prominent Fraud Risk Score (0-100 gauge)
 * - Calibrated Risk Level Badge (Low, Medium, High)
 * - Total transactions & entities processed
 * - High-Risk Suspicious Entities list (Mule hubs, Ring originators)
 * - Suspicious Transactions list with amounts and risk indicators
 * - Direct AI Assistant explanation link
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../components/Icon';
import Badge from '../../../components/Badge';
import { Colors, Shadows, Spacing } from '../../../theme/theme';

export interface SuspiciousEntity {
  id: string;
  role: string;
  riskScore: number;
  transactionsInvolved: number;
  totalVolume: string;
  reason: string;
}

export interface SuspiciousTx {
  txId: string;
  source: string;
  target: string;
  amount: string;
  timestamp: string;
  anomalyType: string;
}

export interface NetworkAnalysisResultData {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  totalTransactions: number;
  totalEntities: number;
  flaggedEntitiesCount: number;
  flaggedTransactionsCount: number;
  suspiciousEntities: SuspiciousEntity[];
  suspiciousTransactions: SuspiciousTx[];
  modelType: string;
}

interface NetworkAnalysisResultProps {
  result: NetworkAnalysisResultData;
  onReset: () => void;
  isLiveResult?: boolean;
  inferenceTimeMs?: number;
}

export const NetworkAnalysisResult: React.FC<NetworkAnalysisResultProps> = ({
  result,
  onReset,
  isLiveResult = false,
  inferenceTimeMs,
}) => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'entities' | 'transactions'>('entities');

  const getRiskColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'High':
        return Colors.error;
      case 'Medium':
        return Colors.warning;
      case 'Low':
      default:
        return Colors.success;
    }
  };

  const riskColor = getRiskColor(result.riskLevel);

  const handleExplainWithAI = () => {
    navigation.navigate('AssistantChat', {
      mode: 'detection_explanation',
      detectionContext: {
        detectionId: `gcn_${Date.now()}`,
        source: 'GCN_NETWORK_ANALYSIS',
        classification: result.riskLevel === 'High' ? 'FRAUD' : result.riskLevel === 'Medium' ? 'SUSPICIOUS' : 'LEGITIMATE',
        riskScore: result.riskScore / 100,
        reasons: result.suspiciousEntities.map((e) => `${e.id} (${e.role}): ${e.reason}`),
        safePreview: `Network ledger: ${result.flaggedEntitiesCount} flagged entities, ${result.flaggedTransactionsCount} anomalous transactions.`,
      },
      initialPrompt:
        result.riskLevel === 'High'
          ? 'Can you explain the mule ring and structuring anomalies detected by the Graph Convolutional Network in this ledger?'
          : 'Can you summarize the safety and topological flow of this transaction network?',
    });
  };

  return (
    <View style={styles.container}>
      {/* ─── Model State Banner ────────────────────────────────────────── */}
      {isLiveResult ? (
        <View style={styles.liveNoticeBanner}>
          <Icon name="CheckCircle2" size={16} color={Colors.success} strokeWidth={2.4} />
          <Text style={styles.liveNoticeText}>
            Analyzed via live FraudShield GCN backend
            {inferenceTimeMs ? ` in ${inferenceTimeMs}ms` : ''}
          </Text>
        </View>
      ) : null}

      {/* ─── Primary Score Card ───────────────────────────────────────── */}
      <View style={[styles.scoreCard, Shadows.card]}>
        <View style={styles.scoreRow}>
          {/* Gauge Circle */}
          <View style={[styles.gaugeCircle, { borderColor: riskColor }]}>
            <Text style={[styles.scoreValue, { color: riskColor }]}>
              {result.riskScore}
            </Text>
            <Text style={styles.scoreScale}>/ 100</Text>
          </View>

          {/* Score Details */}
          <View style={styles.scoreTextCol}>
            <View style={styles.riskBadgeRow}>
              <Badge
                label={`${result.riskLevel.toUpperCase()} THREAT LEVEL`}
                variant={result.riskLevel === 'High' ? 'fraud' : result.riskLevel === 'Medium' ? 'suspicious' : 'safe'}
                size="sm"
              />
            </View>

            <Text style={styles.scoreHeading}>
              {result.riskLevel === 'High'
                ? 'Coordinated Mule Ring Detected'
                : result.riskLevel === 'Medium'
                ? 'Elevated Velocity Anomaly'
                : 'Clean Transaction Graph'}
            </Text>
            <Text style={styles.scoreDescription}>
              {result.riskLevel === 'High'
                ? `${result.flaggedEntitiesCount} entities exhibit pass-through structuring & multi-hop dispersion.`
                : 'All transactions conform to normal retail behavior patterns.'}
            </Text>
          </View>
        </View>

        {/* 4 Metrics Pill Row */}
        <View style={styles.metricsPillRow}>
          <View style={styles.metricPill}>
            <Text style={styles.metricPillVal}>{result.totalTransactions}</Text>
            <Text style={styles.metricPillLbl}>Transactions</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.metricPill}>
            <Text style={styles.metricPillVal}>{result.totalEntities}</Text>
            <Text style={styles.metricPillLbl}>Entities</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.metricPill}>
            <Text style={[styles.metricPillVal, { color: Colors.error }]}>
              {result.flaggedEntitiesCount}
            </Text>
            <Text style={styles.metricPillLbl}>Flagged Mule</Text>
          </View>
          <View style={styles.pillDivider} />
          <View style={styles.metricPill}>
            <Text style={[styles.metricPillVal, { color: Colors.warning }]}>
              {result.flaggedTransactionsCount}
            </Text>
            <Text style={styles.metricPillLbl}>Anomalous Tx</Text>
          </View>
        </View>
      </View>

      {/* ─── Breakdown Tabs ───────────────────────────────────────────── */}
      <View style={styles.tabsHeader}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'entities' && styles.tabButtonActive]}
          onPress={() => setActiveTab('entities')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'entities' && styles.tabButtonTextActive,
            ]}>
            Flagged Entities ({result.suspiciousEntities.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'transactions' && styles.tabButtonActive]}
          onPress={() => setActiveTab('transactions')}>
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'transactions' && styles.tabButtonTextActive,
            ]}>
            Suspicious Tx ({result.suspiciousTransactions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content: Entities */}
      {activeTab === 'entities' && (
        <View style={styles.tabContentCard}>
          {result.suspiciousEntities.length === 0 ? (
            <View style={styles.emptyContent}>
              <Icon name="CheckCircle2" size={24} color={Colors.success} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyContentText}>No high-risk entities flagged in this graph.</Text>
            </View>
          ) : (
            result.suspiciousEntities.map((entity) => (
              <View key={entity.id} style={styles.entityItemCard}>
                <View style={styles.entityTopRow}>
                  <View style={styles.entityIdGroup}>
                    <View style={styles.entityIconBox}>
                      <Icon name="User" size={14} color={Colors.error} />
                    </View>
                    <View>
                      <Text style={styles.entityIdText}>{entity.id}</Text>
                      <Text style={styles.entityRoleText}>{entity.role}</Text>
                    </View>
                  </View>

                  <Badge label={`${entity.riskScore}% RISK`} variant="fraud" size="sm" />
                </View>

                <View style={styles.entityMetricsRow}>
                  <Text style={styles.entityMetricItem}>
                    Volume: <Text style={styles.entityMetricBold}>{entity.totalVolume}</Text>
                  </Text>
                  <Text style={styles.entityMetricItem}>
                    Involved Tx: <Text style={styles.entityMetricBold}>{entity.transactionsInvolved}</Text>
                  </Text>
                </View>

                <Text style={styles.entityReasonText}>{entity.reason}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Tab Content: Transactions */}
      {activeTab === 'transactions' && (
        <View style={styles.tabContentCard}>
          {result.suspiciousTransactions.length === 0 ? (
            <View style={styles.emptyContent}>
              <Icon name="CheckCircle2" size={24} color={Colors.success} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyContentText}>No anomalous transactions identified.</Text>
            </View>
          ) : (
            result.suspiciousTransactions.map((tx) => (
              <View key={tx.txId} style={styles.txItemCard}>
                <View style={styles.txTopRow}>
                  <View style={styles.txIdRow}>
                    <Icon name="Activity" size={13} color={Colors.error} style={{ marginRight: 6 }} />
                    <Text style={styles.txIdText}>{tx.txId}</Text>
                    <Text style={styles.txTimeText}>{tx.timestamp}</Text>
                  </View>
                  <Text style={styles.txAmountText}>{tx.amount}</Text>
                </View>

                <View style={styles.txRouteRow}>
                  <Text style={styles.txEntity}>{tx.source}</Text>
                  <Icon name="ArrowRight" size={12} color={Colors.textTertiary} style={{ marginHorizontal: 6 }} />
                  <Text style={styles.txEntity}>{tx.target}</Text>
                </View>

                <View style={styles.txAnomalyTag}>
                  <Icon name="AlertTriangle" size={11} color={Colors.warning} style={{ marginRight: 4 }} />
                  <Text style={styles.txAnomalyText}>{tx.anomalyType}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* AI Assistant Explanation Action (Neon Rose) */}
      <TouchableOpacity
        style={styles.aiExplainButton}
        onPress={handleExplainWithAI}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Explain GCN Analysis with AI Assistant">
        <Icon name="Bot" size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 8 }} />
        <Text style={styles.aiExplainButtonText}>EXPLAIN NETWORK RISK WITH AI</Text>
      </TouchableOpacity>

      {/* Reset & Analyze Another Action */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={onReset}
        activeOpacity={0.82}
        accessibilityRole="button"
        accessibilityLabel="Analyze Another Dataset">
        <Icon name="RefreshCw" size={15} color={Colors.textSecondary} style={{ marginRight: 6 }} />
        <Text style={styles.resetButtonText}>Analyze Another Ledger</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  liveNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 217, 138, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(32, 217, 138, 0.25)',
    marginBottom: 12,
    gap: 8,
  },
  liveNoticeText: {
    fontSize: 12,
    color: '#16A34A',
    fontWeight: '600',
  },
  scoreCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 14,
  },
  gaugeCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B132B',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  scoreScale: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  scoreTextCol: {
    flex: 1,
  },
  riskBadgeRow: {
    marginBottom: 4,
  },
  scoreHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  scoreDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
  metricsPillRow: {
    flexDirection: 'row',
    backgroundColor: '#0B132B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  metricPill: {
    alignItems: 'center',
    flex: 1,
  },
  metricPillVal: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  metricPillLbl: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: Colors.border,
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#0B132B',
    borderRadius: 12,
    padding: 3,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9,
  },
  tabButtonActive: {
    backgroundColor: Colors.cardElevated,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.4)',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  tabButtonTextActive: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
  tabContentCard: {
    gap: 8,
    marginBottom: 12,
  },
  emptyContent: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyContentText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  entityItemCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 69, 0.35)',
    padding: 14,
  },
  entityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entityIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entityIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 69, 69, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entityIdText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  entityRoleText: {
    fontSize: 11,
    color: '#F87171',
    fontWeight: '600',
  },
  entityMetricsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 6,
  },
  entityMetricItem: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  entityMetricBold: {
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  entityReasonText: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },
  txItemCard: {
    backgroundColor: Colors.cardElevated,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  txIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    marginRight: 6,
  },
  txTimeText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  txAmountText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
  txRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  txEntity: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  txAnomalyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  txAnomalyText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.warning,
  },
  aiExplainButton: {
    backgroundColor: '#0066FF',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    marginBottom: 10,
  },
  aiExplainButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resetButton: {
    backgroundColor: '#0B132B',
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

export default NetworkAnalysisResult;
