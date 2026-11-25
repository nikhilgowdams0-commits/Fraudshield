/**
 * Premium AI Cybersecurity Dashboard — HomeScreen
 *
 * Redesigned with:
 * - Animated AI Scanner as hero visual
 * - Animated Cyber Shield
 * - Premium FraudShield branding
 * - Cerulean Blue + Neon Rose palette
 * - Smooth entrance animations
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Alert,
  AppState,
  AppStateStatus,
  Platform,
  RefreshControl,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, Shadows } from '../../theme/theme';
import Icon from '../../components/Icon';
import { AnimatedAIScanner } from '../../components/animations';
import {
  checkAllServiceStatus,
  openOverlaySettings,
  ServiceStatus,
  showFloatingBot,
  hideFloatingBot,
  isFloatingBotVisible,
} from '../../utils/accessibilityService';

// Dashboard Modular Components
import DashboardHeader from './components/DashboardHeader';
import ProtectionStatusCard from './components/ProtectionStatusCard';
import FraudHelpAssistantCard from './components/FraudHelpAssistantCard';
import QuickActionsGrid from './components/QuickActionsGrid';
import RecentDetectionsSection from './components/RecentDetectionsSection';
import SecurityInsightsCard from './components/SecurityInsightsCard';

export const HomeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    accessibilityEnabled: false,
    overlayGranted: false,
    notificationListenerEnabled: false,
  });

  const [floatingBotActive, setFloatingBotActive] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Entrance animations
  const heroFade = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.8)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Stagger entrance animations
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(heroScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(contentFade, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ─── Real-Time Permission & Service Verification ──────────────────────────

  const refreshStatus = useCallback(async () => {
    if (Platform.OS === 'android') {
      const status = await checkAllServiceStatus();
      setServiceStatus(status);
      const isVisible = await isFloatingBotVisible();
      setFloatingBotActive(isVisible);
    }
  }, []);

  const onPullRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshStatus();
    setRefreshing(false);
  }, [refreshStatus]);

  const handleToggleFloatingBot = async () => {
    if (!serviceStatus.overlayGranted) {
      Alert.alert(
        'Permission Required',
        'Display Over Other Apps permission is required to display the floating FraudShield bot.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: openOverlaySettings },
        ],
      );
      return;
    }

    if (floatingBotActive) {
      await hideFloatingBot();
      setFloatingBotActive(false);
    } else {
      await showFloatingBot();
      setFloatingBotActive(true);
    }
  };

  useEffect(() => {
    refreshStatus();

    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          refreshStatus();
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [refreshStatus]);

  // ─── Navigation Handlers ──────────────────────────────────────────────────

  const handleOpenProfile = () => {
    navigation.navigate('Profile');
  };

  const handleNotificationPress = () => {
    Alert.alert(
      'Security Feed',
      'All AI detection models and background interception services are operating nominally.',
      [{ text: 'Dismiss', style: 'cancel' }],
    );
  };

  const handleCheckMessage = () => {
    navigation.navigate('MessageChecker', { initialMode: 'paste' });
  };

  const handleScanScreenshot = () => {
    navigation.navigate('MessageChecker', { initialMode: 'upload' });
  };

  const handleViewHistory = () => {
    navigation.navigate('DetectionHistory');
  };

  const handleOpenSettings = () => {
    navigation.navigate('Settings');
  };

  const handleOpenAssistant = () => {
    navigation.navigate('AssistantChat', { mode: 'general_help' });
  };

  const handleOpenNetworkAnalysis = () => {
    navigation.navigate('NetworkAnalysis');
  };

  const handleSelectAssistantPrompt = (prompt: string) => {
    navigation.navigate('AssistantChat', {
      mode: 'general_help',
      initialPrompt: prompt,
    });
  };

  const isProtectionFullyActive =
    serviceStatus.accessibilityEnabled &&
    serviceStatus.overlayGranted &&
    serviceStatus.notificationListenerEnabled;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }>
        {/* ─── Section A: Header ─────────────────────────────────────── */}
        <DashboardHeader
          userName={user?.name || 'User'}
          onPressProfile={handleOpenProfile}
          onPressNotification={handleNotificationPress}
        />

        {/* ─── Section B: Animated AI Scanner Hero ────────────────────── */}
        <Animated.View
          style={[
            styles.scannerContainer,
            {
              opacity: heroFade,
              transform: [{ scale: heroScale }],
            },
          ]}>
          <AnimatedAIScanner size={136} showParticles={true} />
          <Text style={styles.scannerLabel}>AI Threat Detection Engine</Text>
          <Text style={styles.scannerSublabel}>
            Analyzing messages, links & network patterns in real-time
          </Text>
        </Animated.View>

        <Animated.View style={{ opacity: contentFade }}>
          {/* ─── Section C: Protection Status Card ─────────────────────── */}
          <ProtectionStatusCard
            status={serviceStatus}
            floatingBotActive={floatingBotActive}
            onToggleFloatingBot={handleToggleFloatingBot}
          />

          {/* ─── Section D: Quick Detection Actions ──────────────────────── */}
          <QuickActionsGrid
            onCheckMessage={handleCheckMessage}
            onScanScreenshot={handleScanScreenshot}
            onViewHistory={handleViewHistory}
            onOpenSettings={handleOpenSettings}
            onOpenAssistant={handleOpenAssistant}
            onOpenNetworkAnalysis={handleOpenNetworkAnalysis}
          />

          {/* ─── Section F: Security Overview Statistics ───────────────── */}
          <SecurityInsightsCard isProtectionActive={isProtectionFullyActive} />

{/* ─── Section G: Fraud Help Assistant Card ──────────────────── */}
          <FraudHelpAssistantCard
            onOpenAssistant={handleOpenAssistant}
            onSelectPrompt={handleSelectAssistantPrompt}
          />

          {/* ─── Website Permission Protection Feature Card ───────────── */}
          <TouchableOpacity
            style={[styles.networkCard, Shadows.card, { marginTop: 10 }]}
            onPress={() => navigation.navigate('PermissionSecurity')}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Open Website Permission Protection">
            <View style={styles.networkCardLeft}>
              <View style={[styles.networkIconBox, { backgroundColor: '#ECFDF5' }]}>
                <Icon name="Shield" size={20} color="#10B981" strokeWidth={2.4} />
              </View>
              <View style={styles.networkTextCol}>
                <View style={styles.networkBadgeRow}>
                  <Text style={styles.networkCardTitle}>Website Permissions</Text>
                  <View style={[styles.gcnBadge, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
                    <Text style={[styles.gcnBadgeText, { color: '#059669' }]}>GUARD</Text>
                  </View>
                </View>
                <Text style={styles.networkCardSubtitle} numberOfLines={1}>
                  Protect camera, mic & location from deceptive websites
                </Text>
              </View>
            </View>
            <View style={styles.networkArrowBtn}>
              <Icon name="ChevronRight" size={18} color="#10B981" strokeWidth={2.5} />
            </View>
          </TouchableOpacity>

          {/* ─── Section H: Recent Threat Activity ─────────────────────── */}
          <RecentDetectionsSection onViewAll={handleViewHistory} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
  },
  // AI Scanner Hero
  scannerContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  scannerLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 10,
    letterSpacing: -0.3,
  },
  scannerSublabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },

});

export default HomeScreen;
