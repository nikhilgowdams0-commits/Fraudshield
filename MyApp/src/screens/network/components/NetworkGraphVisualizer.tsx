/**
 * Network Graph Visualizer — FraudShield Cyber Edition
 *
 * Interactive pure React Native visualization of the transaction network graph:
 * - Nodes representing transaction entities (Accounts, Cards, Mule Hubs, Merchants)
 * - Directed connection lines and flows representing transactions
 * - Color-coded risk indicators (Red: Mule Ring / High Risk, Amber: Suspicious Hub, Cyan/Blue: Normal)
 * - Tap node to inspect entity details, degree centrality, connected transactions, and GCN risk attributes
 * - Responsive layout with zoom/pan coordinate mapping
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from '../../../components/Icon';
import Badge from '../../../components/Badge';
import { Colors, Shadows, Spacing } from '../../../theme/theme';

export interface GraphNode {
  id: string;
  label: string;
  type: 'mule_hub' | 'fraud_ring' | 'normal' | 'cash_out';
  riskScore: number;
  degree: number;
  inflow: string;
  outflow: string;
  x: number;
  y: number;
  flagReason?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  amount: string;
  isHighRisk?: boolean;
}

const DEFAULT_NODES: GraphNode[] = [
  {
    id: 'ACC-8821',
    label: 'ACC-8821',
    type: 'fraud_ring',
    riskScore: 94,
    degree: 7,
    inflow: '₹2,40,000',
    outflow: '₹2,38,500',
    x: 20,
    y: 28,
    flagReason: 'Originator Node — High velocity dispersion across 4 mule accounts within 3 minutes',
  },
  {
    id: 'ACC-1049',
    label: 'ACC-1049',
    type: 'mule_hub',
    riskScore: 88,
    degree: 5,
    inflow: '₹84,500',
    outflow: '₹80,000',
    x: 65,
    y: 20,
    flagReason: 'Mule Intermediary — Instant passthrough of 94% funds to downstream hub',
  },
  {
    id: 'ACC-3312',
    label: 'ACC-3312',
    type: 'mule_hub',
    riskScore: 86,
    degree: 4,
    inflow: '₹95,000',
    outflow: '₹92,000',
    x: 35,
    y: 65,
    flagReason: 'Mule Layering — Rapid multi-hop forwarding to avoid single-transaction threshold',
  },
  {
    id: 'ACC-5520',
    label: 'ACC-5520',
    type: 'cash_out',
    riskScore: 92,
    degree: 6,
    inflow: '₹1,72,000',
    outflow: '₹1,70,000',
    x: 80,
    y: 68,
    flagReason: 'Terminal Siphon Node — Immediate cash-out aggregation from 2 upstream mules',
  },
  {
    id: 'ACC-4401',
    label: 'ACC-4401',
    type: 'normal',
    riskScore: 12,
    degree: 2,
    inflow: '₹5,000',
    outflow: '₹1,200',
    x: 15,
    y: 75,
    flagReason: 'Normal Retail Account — Verified consumer transaction history',
  },
];

const DEFAULT_EDGES: GraphEdge[] = [
  { id: 'E1', source: 'ACC-8821', target: 'ACC-1049', amount: '₹84,500', isHighRisk: true },
  { id: 'E2', source: 'ACC-8821', target: 'ACC-3312', amount: '₹95,000', isHighRisk: true },
  { id: 'E3', source: 'ACC-1049', target: 'ACC-5520', amount: '₹80,000', isHighRisk: true },
  { id: 'E4', source: 'ACC-3312', target: 'ACC-5520', amount: '₹90,000', isHighRisk: true },
  { id: 'E5', source: 'ACC-4401', target: 'ACC-8821', amount: '₹5,000', isHighRisk: false },
];

interface NetworkGraphVisualizerProps {
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  highlightMuleRings?: boolean;
  onSelectNode?: (node: GraphNode) => void;
}

export const NetworkGraphVisualizer: React.FC<NetworkGraphVisualizerProps> = ({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  highlightMuleRings = true,
  onSelectNode,
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0] || null);

  const handleNodePress = (node: GraphNode) => {
    setSelectedNode(node);
    if (onSelectNode) {
      onSelectNode(node);
    }
  };

  const getNodeColorConfig = (type: GraphNode['type'], isSelected: boolean) => {
    switch (type) {
      case 'fraud_ring':
        return {
          bg: isSelected ? Colors.error : 'rgba(255, 69, 69, 0.25)',
          border: Colors.error,
          text: isSelected ? '#FFFFFF' : '#FCA5A5',
          dot: Colors.error,
          label: 'Fraud Ring',
        };
      case 'mule_hub':
        return {
          bg: isSelected ? '#F59E0B' : 'rgba(245, 158, 11, 0.25)',
          border: '#F59E0B',
          text: isSelected ? '#0A0A0A' : '#FCD34D',
          dot: '#F59E0B',
          label: 'Mule Hub',
        };
      case 'cash_out':
        return {
          bg: isSelected ? '#DC2626' : '#FEF2F2',
          border: '#DC2626',
          text: isSelected ? '#FFFFFF' : '#DC2626',
          dot: '#DC2626',
          label: 'Terminal Drain',
        };
      case 'normal':
      default:
        return {
          bg: isSelected ? Colors.primary : 'rgba(0, 123, 167, 0.2)',
          border: Colors.primary,
          text: isSelected ? '#FFFFFF' : Colors.primaryLight,
          dot: Colors.primary,
          label: 'Normal Node',
        };
    }
  };

  return (
    <View style={[styles.container, Shadows.card]}>
      {/* Title & Stats Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.iconBox}>
            <Icon name="Activity" size={18} color={Colors.primary} strokeWidth={2.4} />
          </View>
          <View>
            <Text style={styles.sectionTitle}>Network Topology Graph</Text>
            <Text style={styles.sectionSubtitle}>
              GCN spectral convolution representation
            </Text>
          </View>
        </View>

        <View style={styles.nodeCountBadge}>
          <Text style={styles.nodeCountText}>{nodes.length} Nodes • {edges.length} Edges</Text>
        </View>
      </View>

      {/* Cyber Blueprint Canvas Container */}
      <View style={styles.canvasContainer}>
        {/* Neon Grid Overlay */}
        <View style={styles.gridOverlay}>
          <View style={[styles.gridLineH, { top: '25%' }]} />
          <View style={[styles.gridLineH, { top: '50%' }]} />
          <View style={[styles.gridLineH, { top: '75%' }]} />
          <View style={[styles.gridLineV, { left: '25%' }]} />
          <View style={[styles.gridLineV, { left: '50%' }]} />
          <View style={[styles.gridLineV, { left: '75%' }]} />
        </View>

        {/* Transaction Edge Badges */}
        {edges.map((edge: GraphEdge) => {
          const srcNode = nodes.find((n) => n.id === edge.source);
          const tgtNode = nodes.find((n) => n.id === edge.target);
          if (!srcNode || !tgtNode) return null;

          const midX = (srcNode.x + tgtNode.x) / 2;
          const midY = (srcNode.y + tgtNode.y) / 2;

          return (
            <View
              key={edge.id}
              style={[
                styles.edgeTag,
                { left: `${midX}%`, top: `${midY}%` },
                edge.isHighRisk ? styles.edgeTagHighRisk : styles.edgeTagNormal,
              ]}>
              <Text
                style={[
                  styles.edgeAmountText,
                  edge.isHighRisk ? styles.edgeAmountHighRisk : styles.edgeAmountNormal,
                ]}>
                {edge.amount}
              </Text>
            </View>
          );
        })}

        {/* Interactive Entity Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const colorCfg = getNodeColorConfig(node.type, isSelected);

          return (
            <TouchableOpacity
              key={node.id}
              style={[
                styles.nodeCircle,
                {
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  backgroundColor: colorCfg.bg,
                  borderColor: colorCfg.border,
                },
                isSelected && styles.nodeCircleSelected,
              ]}
              activeOpacity={0.85}
              onPress={() => handleNodePress(node)}>
              <View style={[styles.nodeInnerDot, { backgroundColor: colorCfg.dot }]} />
              <Text
                style={[styles.nodeLabelText, { color: colorCfg.text }]}
                numberOfLines={1}>
                {node.label}
              </Text>

              {node.riskScore >= 75 && (
                <View style={styles.riskBadgeDot}>
                  <Text style={styles.riskBadgeDotText}>{node.riskScore}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Node Type Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.error }]} />
          <Text style={styles.legendText}>Fraud Ring</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Mule Hub</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#0066FF' }]} />
          <Text style={styles.legendText}>Cash-Out</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.legendText}>Legitimate</Text>
        </View>
      </View>

      {/* Entity Node Inspector Panel */}
      {selectedNode && (
        <View style={styles.inspectorCard}>
          <View style={styles.inspectorHeader}>
            <View style={styles.inspectorTitleRow}>
              <Text style={styles.inspectorNodeId}>{selectedNode.id}</Text>
              <Badge
                label={getNodeColorConfig(selectedNode.type, false).label}
                variant={
                  selectedNode.type === 'normal'
                    ? 'safe'
                    : selectedNode.type === 'fraud_ring'
                    ? 'fraud'
                    : 'suspicious'
                }
                size="sm"
              />
            </View>

            <View style={styles.inspectorScoreRow}>
              <Text style={styles.inspectorScoreVal}>{selectedNode.riskScore}%</Text>
              <Text style={styles.inspectorScoreLbl}>GCN Risk</Text>
            </View>
          </View>

          {/* Inflow & Outflow Metrics */}
          <View style={styles.inflowOutflowRow}>
            <View style={styles.flowBox}>
              <Text style={styles.flowLabel}>INFLOW</Text>
              <Text style={styles.flowValIn}>{selectedNode.inflow}</Text>
            </View>
            <View style={styles.flowDivider} />
            <View style={styles.flowBox}>
              <Text style={styles.flowLabel}>OUTFLOW</Text>
              <Text style={styles.flowValOut}>{selectedNode.outflow}</Text>
            </View>
            <View style={styles.flowDivider} />
            <View style={styles.flowBox}>
              <Text style={styles.flowLabel}>DEGREE</Text>
              <Text style={styles.flowValDegree}>{selectedNode.degree} hops</Text>
            </View>
          </View>

          {/* Anomaly Flag Reason */}
          {selectedNode.flagReason && (
            <View style={styles.flagReasonBox}>
              <Icon name="AlertCircle" size={12} color={Colors.primary} style={{ marginRight: 6, marginTop: 1 }} />
              <Text style={styles.flagReasonText}>{selectedNode.flagReason}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  nodeCountBadge: {
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  nodeCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  canvasContainer: {
    height: 230,
    backgroundColor: '#0B132B',
    borderRadius: 14,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E4E4E7',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#E4E4E7',
  },
  edgeTag: {
    position: 'absolute',
    transform: [{ translateX: -20 }, { translateY: -10 }],
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 4,
    zIndex: 1,
  },
  edgeTagHighRisk: {
    backgroundColor: 'rgba(255, 69, 69, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(255, 69, 69, 0.5)',
  },
  edgeTagNormal: {
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.35)',
  },
  edgeAmountText: {
    fontSize: 9,
    fontWeight: '700',
  },
  edgeAmountHighRisk: {
    color: '#FCA5A5',
  },
  edgeAmountNormal: {
    color: Colors.primaryLight,
  },
  nodeCircle: {
    position: 'absolute',
    transform: [{ translateX: -32 }, { translateY: -20 }],
    width: 66,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    zIndex: 2,
  },
  nodeCircleSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ translateX: -32 }, { translateY: -20 }, { scale: 1.08 }],
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },
  nodeInnerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginBottom: 2,
  },
  nodeLabelText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  riskBadgeDot: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.error,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#0A0A0A',
  },
  riskBadgeDotText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  inspectorCard: {
    backgroundColor: '#030712',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  inspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inspectorNodeId: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    fontFamily: 'monospace',
  },
  inspectorScoreRow: {
    alignItems: 'flex-end',
  },
  inspectorScoreVal: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.error,
  },
  inspectorScoreLbl: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  inflowOutflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1B1B24',
    borderRadius: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  flowBox: {
    alignItems: 'center',
    flex: 1,
  },
  flowLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  flowValIn: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryLight,
  },
  flowValOut: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  flowValDegree: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  flowDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  flagReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 123, 167, 0.1)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.25)',
  },
  flagReasonText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },
});

export default NetworkGraphVisualizer;
