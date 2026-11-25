/**
 * Premium Profile Screen — FraudShield Cyber Edition
 *
 * Requirements fulfilled:
 * - Premium cybersecurity profile header
 * - User avatar with glowing cyber ring
 * - Name, email & verification badge
 * - Security statistics summary
 * - Account details card
 * - Edit profile option
 * - Settings shortcut
 * - Change password shortcut
 * - Sign out button with confirmation
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import UserAvatar from '../../components/UserAvatar';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import Badge from '../../components/Badge';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import { User } from '../../types/auth';
import { extractApiError } from '../../utils/errorHandler';
import { getSecurityStats, SecurityStats } from '../../storage/detectionHistoryStorage';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateStoredUser } = useAuth();
  const navigation = useNavigation<any>();

  const [profile, setProfile] = useState<User | null>(user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [securityStats, setSecurityStats] = useState<SecurityStats>({
    totalAnalyzed: 0,
    threatsFlagged: 0,
    cleanMessages: 0,
  });

  const fetchProfile = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError('');

    try {
      const response = await authApi.getProfile();
      setProfile(response.data);
      await updateStoredUser(response.data);
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [updateStoredUser]);

  useEffect(() => {
    fetchProfile();
    getSecurityStats().then(setSecurityStats);
  }, [fetchProfile]);

  const handleLogout = () => {
    Alert.alert(
      'Terminate Security Session',
      'Are you sure you want to sign out of FraudShield?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true },
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const displayProfile = profile || user;

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Retrieving security identity...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProfile(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        {/* ─── Screen Header ─────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.screenTitle}>Security Identity</Text>
            <Text style={styles.screenSubtitle}>Verified Operator Profile</Text>
          </View>

          <TouchableOpacity
            style={styles.settingsHeaderBtn}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Settings">
            <Icon name="Settings" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ─── Error Notification ────────────────────────────────── */}
        {error ? (
          <ErrorMessage
            message={error}
            onRetry={() => fetchProfile()}
            onDismiss={() => setError('')}
          />
        ) : null}

        {/* ─── Hero Avatar Card ──────────────────────────────────── */}
        <View style={[styles.avatarCard, Shadows.card]}>
          <UserAvatar
            name={displayProfile?.name || 'User'}
            size={88}
            showRing
          />
          <Text style={styles.profileName}>
            {displayProfile?.name || 'User'}
          </Text>
          <Text style={styles.profileEmail}>
            {displayProfile?.email || '—'}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {displayProfile?.role?.toUpperCase() || 'OPERATOR'}
              </Text>
            </View>
            <Badge
              label={displayProfile?.isVerified ? 'VERIFIED IDENTITY' : 'PENDING ENROLLMENT'}
              variant={displayProfile?.isVerified ? 'safe' : 'suspicious'}
              size="sm"
            />
          </View>
        </View>

        {/* ─── Security Statistics Card ──────────────────────────── */}
        <View style={[styles.statsCard, Shadows.card]}>
          <Text style={styles.cardSectionTitle}>SECURITY TELEMETRY OVERVIEW</Text>
          <View style={styles.statsMetricsRow}>
            <View style={styles.statMetricCol}>
              <View style={styles.statIconBox}>
                <Icon name="ShieldCheck" size={16} color={Colors.success} />
              </View>
              <Text style={styles.statMetricVal}>Active</Text>
              <Text style={styles.statMetricLbl}>AI Shield</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statMetricCol}>
              <View style={styles.statIconBox}>
                <Icon name="Scan" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.statMetricVal}>{securityStats.totalAnalyzed}</Text>
              <Text style={styles.statMetricLbl}>Scans Run</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statMetricCol}>
              <View style={styles.statIconBox}>
                <Icon name="AlertTriangle" size={16} color={Colors.error} />
              </View>
              <Text style={[styles.statMetricVal, { color: Colors.error }]}>
                {securityStats.threatsFlagged}
              </Text>
              <Text style={styles.statMetricLbl}>Threats Blocked</Text>
            </View>
          </View>
        </View>

        {/* ─── Account Information Card ──────────────────────────── */}
        <View style={[styles.card, Shadows.card]}>
          <Text style={styles.cardSectionTitle}>ACCOUNT ATTRIBUTES</Text>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="User" size={16} color={Colors.textTertiary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Full Name</Text>
            </View>
            <Text style={styles.infoValue}>
              {displayProfile?.name || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="Mail" size={16} color={Colors.textTertiary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Email Address</Text>
            </View>
            <Text style={styles.infoValue} numberOfLines={1}>
              {displayProfile?.email || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="Phone" size={16} color={Colors.textTertiary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Mobile Number</Text>
            </View>
            <Text style={styles.infoValue}>
              {displayProfile?.phone || '—'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoLabelContainer}>
              <Icon name="Calendar" size={16} color={Colors.textTertiary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Enrolled Since</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatDate(displayProfile?.createdAt)}
            </Text>
          </View>

          <View style={[styles.infoRow, styles.infoRowLast]}>
            <View style={styles.infoLabelContainer}>
              <Icon name="Clock" size={16} color={Colors.textTertiary} style={styles.infoIcon} />
              <Text style={styles.infoLabel}>Last Key Rotation</Text>
            </View>
            <Text style={styles.infoValue}>
              {formatDate(displayProfile?.updatedAt)}
            </Text>
          </View>
        </View>

        {/* ─── Quick Navigation & Security Actions ───────────────── */}
        <View style={styles.actionsList}>
          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.82}>
            <View style={styles.actionItemLeft}>
              <View style={styles.actionIconBoxBlue}>
                <Icon name="Edit3" size={16} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Edit Profile Information</Text>
                <Text style={styles.actionSubtitle}>Update display name & verified mobile</Text>
              </View>
            </View>
            <Icon name="ChevronRight" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('ChangePassword')}
            activeOpacity={0.82}>
            <View style={styles.actionItemLeft}>
              <View style={styles.actionIconBoxPurple}>
                <Icon name="Lock" size={16} color="#A78BFA" />
              </View>
              <View>
                <Text style={styles.actionTitle}>Cryptographic Credentials</Text>
                <Text style={styles.actionSubtitle}>Rotate master account password</Text>
              </View>
            </View>
            <Icon name="ChevronRight" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.82}>
            <View style={styles.actionItemLeft}>
              <View style={styles.actionIconBoxGray}>
                <Icon name="Shield" size={16} color={Colors.textSecondary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Security Preferences</Text>
                <Text style={styles.actionSubtitle}>Threat sensitivity, telemetry & cache</Text>
              </View>
            </View>
            <Icon name="ChevronRight" size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {/* Sign Out */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Sign Out">
            <Icon name="LogOut" size={16} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={styles.logoutBtnText}>TERMINATE SESSION (SIGN OUT)</Text>
          </TouchableOpacity>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Spacing.xxxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
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
  settingsHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Avatar Card
  avatarCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  roleBadge: {
    backgroundColor: '#0B132B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },

  // Stats Card
  statsCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  statsMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  statMetricCol: {
    alignItems: 'center',
    flex: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statMetricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statMetricLbl: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: Colors.border,
  },

  // Account Card
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  cardSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    maxWidth: '55%',
    textAlign: 'right',
  },

  // Actions List
  actionsList: {
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionIconBoxBlue: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconBoxPurple: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconBoxGray: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    height: 48,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.error,
  },
});

export default ProfileScreen;
