/**
 * Detection History Screen — FraudShield Cyber Edition
 *
 * Displays genuine past message fraud detections from WhatsApp, SMS, Manual Scan, and OCR:
 * - Search bar with instant payload filtering
 * - 4 Filter chips: All | Safe | Fraud | Suspicious
 * - Cyber history cards with status badges, timestamp, and detection type
 * - Expandable modal / details view
 * - Clear history action with confirmation
 * - Beautiful empty state
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../components/Icon';
import Badge from '../../components/Badge';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import {
  DetectionRecord,
  getDetectionRecords,
  clearDetectionHistory,
  subscribeToDetectionHistory,
} from '../../storage/detectionHistoryStorage';

export const DetectionHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<DetectionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<'ALL' | 'SAFE' | 'FRAUD' | 'SUSPICIOUS'>('ALL');
  const [selectedRecord, setSelectedRecord] = useState<DetectionRecord | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const data = await getDetectionRecords();
    setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
    const unsubscribe = subscribeToDetectionHistory((updated) => {
      setRecords(updated);
    });
    return () => {
      unsubscribe();
    };
  }, [loadRecords]);

  const handleClearHistory = () => {
    if (records.length === 0) return;

    Alert.alert(
      'Clear Detection Telemetry',
      'Are you sure you want to delete all saved detection logs? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearDetectionHistory();
            setRecords([]);
          },
        },
      ],
    );
  };

  const filteredRecords = records.filter((r) => {
    // 1. Text Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inPreview = (r.preview || '').toLowerCase().includes(q);
      const inSource = (r.source || '').toLowerCase().includes(q);
      const inReasons = (r.reasons || []).some((reason) =>
        reason.toLowerCase().includes(q),
      );
      if (!inPreview && !inSource && !inReasons) return false;
    }

    // 2. Status Filter
    const isThreat = r.isFraud || r.riskScore >= 0.70;
    const isSuspicious = !isThreat && r.riskScore >= 0.40;
    const isSafe = !isThreat && !isSuspicious;

    if (filter === 'FRAUD') return isThreat;
    if (filter === 'SUSPICIOUS') return isSuspicious;
    if (filter === 'SAFE') return isSafe;

    return true;
  });

  const formatTimestamp = (ts: number): string => {
    if (!ts) return 'Recent';
    const diffMs = Date.now() - ts;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSourceConfig = (src: string) => {
    const s = (src || '').toUpperCase();
    if (s.includes('WHATSAPP')) {
      return { label: 'WhatsApp', icon: 'Mail' as const, color: '#25D366' };
    }
    if (s.includes('SMS')) {
      return { label: 'SMS Payload', icon: 'FileText' as const, color: Colors.primaryLight };
    }
    if (s.includes('OCR')) {
      return { label: 'Screenshot OCR', icon: 'Image' as const, color: '#A78BFA' };
    }
    if (s.includes('MANUAL_SCAN')) {
      return { label: 'Screen Defense', icon: 'Bot' as const, color: Colors.primary };
    }
    return { label: 'Manual Check', icon: 'Shield' as const, color: Colors.primaryLight };
  };

  const handleExplainRecord = (record: DetectionRecord) => {
    setSelectedRecord(null);
    const isThreat = record.isFraud || record.riskScore >= 0.70;
    const isSuspicious = !isThreat && record.riskScore >= 0.40;

    navigation.navigate('AssistantChat', {
      mode: 'detection_explanation',
      detectionContext: {
        detectionId: record.id,
        source: record.source,
        classification: record.classification || (isThreat ? 'FRAUD' : isSuspicious ? 'SUSPICIOUS' : 'LEGITIMATE'),
        riskScore: record.riskScore,
        reasons: record.reasons || [],
        safePreview: record.preview,
      },
      initialPrompt: isThreat
        ? 'Why was this message flagged as a threat and what signs indicate fraud?'
        : 'Can you explain the safety assessment of this message?',
    });
  };

  const renderItem = ({ item }: { item: DetectionRecord }) => {
    const isThreat = item.isFraud || item.riskScore >= 0.70;
    const isSuspicious = !isThreat && item.riskScore >= 0.40;
    const scorePct = Math.round(item.riskScore * 100);
    const sourceCfg = getSourceConfig(item.source);

    return (
      <TouchableOpacity
        style={[
          styles.recordCard,
          isThreat && styles.recordCardThreat,
          Shadows.card,
        ]}
        activeOpacity={0.85}
        onPress={() => setSelectedRecord(item)}>
        {/* Top Meta Row */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.sourceBadge}>
            <Icon
              name={sourceCfg.icon}
              size={12}
              color={sourceCfg.color}
              strokeWidth={2.4}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.sourceText}>{sourceCfg.label}</Text>
          </View>

          <Text style={styles.timeText}>{formatTimestamp(item.timestamp)}</Text>
        </View>

        {/* Message Preview */}
        <Text style={styles.previewText} numberOfLines={2}>
          "{item.preview}"
        </Text>

        {/* Bottom Assessment Row */}
        <View style={styles.cardFooterRow}>
          <View style={styles.statusIndicatorGroup}>
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="light-content" />

      {/* ─── Screen Header ─────────────────────────────────────────── */}
      <View style={styles.screenHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.screenTitle}>Detection History</Text>
          <Text style={styles.screenSubtitle}>
            {records.length} logged inspection payloads
          </Text>
        </View>

        {records.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearHistory}
            accessibilityRole="button"
            accessibilityLabel="Clear history">
            <Icon name="Trash2" size={15} color={Colors.error} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Search Bar ─────────────────────────────────────────────── */}
      <View style={styles.searchContainer}>
        <Icon name="Search" size={16} color={Colors.textTertiary} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by keywords, source, or reasons..."
          placeholderTextColor={Colors.placeholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="X" size={16} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* ─── Filter Chips (All, Safe, Fraud, Suspicious) ────────────── */}
      <View style={styles.filtersRow}>
        {(['ALL', 'SAFE', 'FRAUD', 'SUSPICIOUS'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.filterChip, filter === tab && styles.filterChipActive]}
            onPress={() => setFilter(tab)}>
            <Text
              style={[
                styles.filterChipText,
                filter === tab && styles.filterChipTextActive,
              ]}>
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ─── Main Content ──────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Reading local telemetry...</Text>
        </View>
      ) : filteredRecords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Icon name="Shield" size={34} color={Colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.emptyTitle}>
            {searchQuery || filter !== 'ALL'
              ? 'No matching detections'
              : 'Telemetry Log is Clean'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery || filter !== 'ALL'
              ? 'Try modifying your search keywords or switching filters.'
              : 'Messages inspected through SMS, WhatsApp, or OCR will be securely recorded here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* ─── Inspection Detail Modal ───────────────────────────────── */}
      {selectedRecord && (
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedRecord(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleRow}>
                  <Icon
                    name={
                      selectedRecord.isFraud || selectedRecord.riskScore >= 0.70
                        ? 'AlertTriangle'
                        : selectedRecord.riskScore >= 0.40
                        ? 'AlertCircle'
                        : 'CheckCircle2'
                    }
                    size={20}
                    color={
                      selectedRecord.isFraud || selectedRecord.riskScore >= 0.70
                        ? Colors.error
                        : selectedRecord.riskScore >= 0.40
                        ? Colors.warning
                        : Colors.success
                    }
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.modalTitle}>Inspection Telemetry</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setSelectedRecord(null)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="X" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>SOURCE CHANNEL</Text>
                  <Text style={styles.modalSectionVal}>
                    {selectedRecord.source} • {formatTimestamp(selectedRecord.timestamp)}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>MESSAGE CONTENT</Text>
                  <View style={styles.modalMessageBox}>
                    <Text style={styles.modalMessageText}>
                      "{selectedRecord.preview}"
                    </Text>
                  </View>
                </View>

                {selectedRecord.reasons && selectedRecord.reasons.length > 0 && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionLabel}>AI REASONING INDICATORS</Text>
                    {selectedRecord.reasons.map((r, i) => (
                      <View key={i} style={styles.modalReasonRow}>
                        <Icon name="AlertCircle" size={12} color={Colors.error} style={{ marginRight: 6, marginTop: 2 }} />
                        <Text style={styles.modalReasonText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionLabel}>THREAT CONFIDENCE</Text>
                  <Text
                    style={[
                      styles.modalScoreVal,
                      {
                        color:
                          selectedRecord.riskScore >= 0.70
                            ? Colors.error
                            : selectedRecord.riskScore >= 0.40
                            ? Colors.warning
                            : Colors.success,
                      },
                    ]}>
                    {Math.round(selectedRecord.riskScore * 100)}% Risk Assessment
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalExplainBtn, ]}
                  onPress={() => handleExplainRecord(selectedRecord)}>
                  <Icon name="Bot" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalExplainBtnText}>Ask AI Assistant to Explain</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  headerLeft: {},
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 69, 69, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 69, 0.3)',
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.error,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#030712',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  // Filters Row
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flex: 1,
    backgroundColor: '#0B132B',
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: '#0066FF',
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: Spacing.xxxl,
    gap: 10,
  },
  recordCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recordCardThreat: {
    borderColor: 'rgba(255, 69, 69, 0.35)',
    backgroundColor: 'rgba(255, 69, 69, 0.05)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B132B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
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
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicatorGroup: {
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

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.35)',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 10,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalScroll: {
    marginBottom: 14,
  },
  modalSection: {
    marginBottom: 12,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  modalSectionVal: {
    fontSize: 12,
    color: Colors.textPrimary,
  },
  modalMessageBox: {
    backgroundColor: '#0B132B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalMessageText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },
  modalReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  modalReasonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  modalScoreVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalActions: {
    borderTopWidth: 1,
    borderTopColor: '#E4E4E7',
    paddingTop: 12,
  },
  modalExplainBtn: {
    backgroundColor: '#0066FF',
    borderRadius: 12,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  modalExplainBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default DetectionHistoryScreen;
