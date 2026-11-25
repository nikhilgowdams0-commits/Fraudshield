/**
 * FraudShield Cyber Settings Screen
 *
 * Commercial cybersecurity settings console:
 * - Account settings (Profile & Password updates)
 * - Security & Threat Defense (Real-time interception & Local Hash Cache)
 * - Notification preferences (Critical threat alerts & digest)
 * - Appearance & theme info (Cyber Dark OLED)
 * - Machine Learning engine details (Bi-LSTM + DistilBERT + GCN)
 * - Safe session sign-out confirmation
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigation/AppNavigator';
import {useAuth} from '../../context/AuthContext';
import Config from '../../config';
import Icon, {IconName} from '../../components/Icon';
import Badge from '../../components/Badge';
import {Colors, Typography, Spacing} from '../../theme/theme';
import {messageFraudCache} from '../../fraudDetection';

interface SettingsItem {
  id: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  label: string;
  description?: string;
  onPress: () => void;
  danger?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  badgeText?: string;
  badgeVariant?: 'safe' | 'fraud' | 'suspicious' | 'info' | 'cyan' | 'neutral';
}

interface SettingsSection {
  title: string;
  iconName?: IconName;
  items: SettingsItem[];
}

const SettingsScreen: React.FC = () => {
  const {user, logout} = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // Cache & Threat settings state
  const [cacheEnabled, setCacheEnabled] = useState<boolean>(true);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [realtimeScanning, setRealtimeScanning] = useState<boolean>(true);

  // Notification preferences
  const [threatAlerts, setThreatAlerts] = useState<boolean>(true);
  const [weeklyDigest, setWeeklyDigest] = useState<boolean>(false);

  useEffect(() => {
    setCacheEnabled(messageFraudCache.isEnabled());
    setCachedCount(messageFraudCache.size());
  }, []);

  const handleToggleCache = async (val: boolean) => {
    setCacheEnabled(val);
    await messageFraudCache.setEnabled(val);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Flush Threat Cache',
      'Are you sure you want to clear all cached message fingerprints and detection records?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Flush Cache',
          style: 'destructive',
          onPress: () => {
            messageFraudCache.clear();
            setCachedCount(0);
            Alert.alert(
              'Cache Flushed',
              'All cached message hashes and fraud results have been purged.',
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out of FraudShield',
      'Are you sure you want to sign out? Background protection may be temporarily suspended until you re-authenticate.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const sections: SettingsSection[] = [
    {
      title: 'Account & Identity',
      iconName: 'User',
      items: [
        {
          id: 'profile',
          icon: 'User',
          iconBg: 'rgba(0, 123, 167, 0.15)',
          iconColor: Colors.primary,
          label: 'Edit Profile',
          description: user?.name ? `${user.name} • ${user.phone || 'No phone set'}` : 'Update your personal details',
          onPress: () => navigation.navigate('EditProfile'),
        },
        {
          id: 'password',
          icon: 'KeyRound',
          iconBg: 'rgba(0, 123, 167, 0.15)',
          iconColor: Colors.primaryLight,
          label: 'Change Password',
          description: 'Rotate your security access credentials',
          onPress: () => navigation.navigate('ChangePassword'),
        },
      ],
    },
    {
title: 'Security & Web Protection',
      items: [
        {
          id: 'permission_security',
          icon: 'Shield',
          iconBg: '#ECFDF5',
          iconColor: '#059669',
          label: 'Website Permissions',
          description: 'Camera, mic & location protection for Chrome',
          onPress: () => navigation.navigate('PermissionSecurity'),
        },
      ],
    },
    {
      title: 'Security & Threat Defense',
      items: [
        {
          id: 'realtime_defense',
          icon: 'ShieldCheck',
          iconBg: 'rgba(32, 217, 138, 0.15)',
          iconColor: Colors.success,
          label: 'Real-Time Interception',
          description: realtimeScanning
            ? 'Active background protection against scams'
            : 'Suspended (Manual scans only)',
          onPress: () => setRealtimeScanning(!realtimeScanning),
          isSwitch: true,
          switchValue: realtimeScanning,
          onSwitchChange: setRealtimeScanning,
        },
        {
          id: 'fraud_cache_toggle',
          icon: 'Clock',
          iconBg: 'rgba(0, 123, 167, 0.15)',
          iconColor: Colors.primary,
          label: 'Message Hash Suppression',
          description: cacheEnabled
            ? 'Active (15m local threat caching)'
            : 'Disabled (Forces ML cloud analysis on duplicate messages)',
          onPress: () => handleToggleCache(!cacheEnabled),
          isSwitch: true,
          switchValue: cacheEnabled,
          onSwitchChange: handleToggleCache,
        },
        {
          id: 'clear_cache',
          icon: 'Trash2',
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: Colors.warning,
          label: 'Purge Local Threat Cache',
          description:
            cachedCount > 0
              ? `${cachedCount} active cached threat hashes stored`
              : 'Threat cache is currently empty',
          onPress: handleClearCache,
        },
      ],
    },
    {
      title: 'Notification Preferences',
      iconName: 'Activity',
      items: [
        {
          id: 'threat_notifications',
          icon: 'AlertTriangle',
          iconBg: 'rgba(255, 69, 69, 0.15)',
          iconColor: Colors.error,
          label: 'High-Risk Scam Alerts',
          description: 'Instant notification on critical fraud detection',
          onPress: () => setThreatAlerts(!threatAlerts),
          isSwitch: true,
          switchValue: threatAlerts,
          onSwitchChange: setThreatAlerts,
        },
        {
          id: 'weekly_digest',
          icon: 'FileText',
          iconBg: 'rgba(0, 123, 167, 0.15)',
          iconColor: Colors.primaryLight,
          label: 'Weekly Cyber Intelligence',
          description: 'Digest of trending phishing campaigns & vectors',
          onPress: () => setWeeklyDigest(!weeklyDigest),
          isSwitch: true,
          switchValue: weeklyDigest,
          onSwitchChange: setWeeklyDigest,
        },
      ],
    },
    {
      title: 'Appearance & System',
      iconName: 'Sparkles',
      items: [
        {
          id: 'theme',
          icon: 'Sparkles',
          iconBg: 'rgba(168, 85, 247, 0.15)',
          iconColor: '#C084FC',
          label: 'Visual Theme',
          description: 'Jet Black Cyber Matrix (OLED optimized)',
          badgeText: 'Active',
          badgeVariant: 'cyan',
          onPress: () => {},
        },
        {
          id: 'encryption_standard',
          icon: 'Lock',
          iconBg: 'rgba(32, 217, 138, 0.15)',
          iconColor: Colors.success,
          label: 'Data Encryption',
          description: 'AES-256 GCM on-device credential storage',
          badgeText: 'Enforced',
          badgeVariant: 'safe',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'AI Engine & About',
      iconName: 'Info',
      items: [
        {
          id: 'ai_engine',
          icon: 'Bot',
          iconBg: 'rgba(0, 123, 167, 0.15)',
          iconColor: Colors.primaryLight,
          label: 'Neural Engine',
          description: 'Bi-LSTM + DistilBERT + GCN Mule Network',
          onPress: () => {},
        },
        {
          id: 'version',
          icon: 'Info',
          iconBg: 'rgba(148, 163, 184, 0.15)',
          iconColor: Colors.textSecondary,
          label: 'FraudShield Client',
          description: `v${Config.APP_VERSION || '1.0.0'} (Commercial Release)`,
          badgeText: 'Build 240',
          badgeVariant: 'neutral',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Session Management',
      iconName: 'LogOut',
      items: [
        {
          id: 'logout',
          icon: 'LogOut',
          iconBg: 'rgba(255, 69, 69, 0.18)',
          iconColor: Colors.error,
          label: 'Sign Out Account',
          description: user?.email ? `Connected as ${user.email}` : 'End current authenticated session',
          onPress: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header ────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Back">
              <Icon name="ChevronLeft" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.screenTitle}>Settings & Security</Text>
            <Text style={styles.screenSubtitle}>System preferences and defense policies</Text>
          </View>
        </View>
        <Badge text="SECURE" variant="cyan" />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ─── Categorized Sections ──────────────────────────────── */}
        {sections.map(section => (
          <View key={section.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              {section.iconName && (
                <Icon
                  name={section.iconName}
                  size={14}
                  color={Colors.primary}
                  style={styles.sectionHeaderIcon}
                />
              )}
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            <View style={styles.card}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingsItem,
                    index < section.items.length - 1 && styles.settingsItemBorder,
                    item.danger && styles.settingsItemDanger,
                  ]}
                  onPress={item.onPress}
                  activeOpacity={item.isSwitch ? 1 : 0.7}
                  accessibilityRole={item.isSwitch ? 'switch' : 'button'}
                  accessibilityLabel={item.label}>
                  <View
                    style={[
                      styles.itemIconBox,
                      {backgroundColor: item.iconBg},
                    ]}>
                    <Icon
                      name={item.icon}
                      size={19}
                      color={item.iconColor}
                      strokeWidth={2.2}
                    />
                  </View>

                  <View style={styles.itemContent}>
                    <Text
                      style={[
                        styles.itemLabel,
                        item.danger && styles.itemLabelDanger,
                      ]}>
                      {item.label}
                    </Text>
                    {item.description ? (
                      <Text
                        style={[
                          styles.itemDescription,
                          item.danger && styles.itemDescriptionDanger,
                        ]}
                        numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}
                  </View>

                  {item.isSwitch ? (
                    <Switch
                      value={item.switchValue}
                      onValueChange={item.onSwitchChange}
                      trackColor={{
                        false: '#1B1B24',
                        true: Colors.primary,
                      }}
                      thumbColor={item.switchValue ? Colors.primaryLight : Colors.textTertiary}
                    />
                  ) : item.badgeText ? (
                    <Badge
                      text={item.badgeText}
                      variant={item.badgeVariant || 'neutral'}
                      size="small"
                    />
                  ) : (
                    <Icon
                      name="ChevronRight"
                      size={18}
                      color={item.danger ? Colors.error : Colors.textTertiary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ─── Bottom Footer Security Notice ─────────────────────── */}
        <View style={styles.footerNotice}>
          <View style={styles.footerShieldRow}>
            <Icon name="ShieldCheck" size={14} color={Colors.primary} />
            <Text style={styles.footerShieldText}>
              FraudShield AI Core • Protected by Quantum-Resistant Protocol
            </Text>
          </View>
          <Text style={styles.footerCopy}>
            © 2026 FraudShield Technologies Inc. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  screenTitle: {
    ...Typography.styles.heading3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  screenSubtitle: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl * 1.5,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.xs,
  },
  sectionHeaderIcon: {
    marginRight: 6,
  },
  sectionTitle: {
    ...Typography.styles.captionMedium,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '700',
    fontSize: 11,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.cardPadding,
  },
  settingsItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  settingsItemDanger: {
    backgroundColor: 'rgba(255, 69, 69, 0.04)',
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  itemContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemLabel: {
    ...Typography.styles.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  itemLabelDanger: {
    color: Colors.error,
  },
  itemDescription: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  itemDescriptionDanger: {
    color: 'rgba(255, 69, 69, 0.8)',
  },
  footerNotice: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerShieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerShieldText: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginLeft: 6,
    fontSize: 11,
  },
  footerCopy: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 10,
  },
});

export default SettingsScreen;
