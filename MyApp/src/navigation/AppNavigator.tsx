
/**
 * App Navigator — FraudShield Cyber Edition
 * Premium 5-Tab Cyber Navigation
 * Jet Black background, Cerulean Blue active, Neon Rose accents
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/home/HomeScreen';
import MessageCheckerScreen from '../screens/home/MessageCheckerScreen';
import DetectionHistoryScreen from '../screens/history/DetectionHistoryScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import ChangePasswordScreen from '../screens/settings/ChangePasswordScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AssistantChatScreen from '../screens/assistant/AssistantChatScreen';
import NetworkAnalysisScreen from '../screens/network/NetworkAnalysisScreen';
import PermissionSecurityScreen from '../screens/permissions/PermissionSecurityScreen';

import { Colors, Typography, Shadows } from '../theme/theme';
import Icon, { IconName } from '../components/Icon';

// ─── Assistant Parameters ─────────────────────────────

export interface AssistantChatParams {
  mode?: 'detection_explanation' | 'general_help';
  detectionContext?: {
    detectionId?: string;
    source?: string;
    classification?: string;
    riskScore?: number;
    reasons?: string[];
    safePreview?: string;
    permissionType?: string;
    domain?: string;
    trustLevel?: string;
    browser?: string;
  };
  initialPrompt?: string;
}

// ─── Navigation Types ──────────────────────────────────

export type HomeStackParamList = {
  HomeMain: undefined;
  MessageChecker?: { initialMode?: 'paste' | 'upload' };
  DetectionHistory: undefined;
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  AssistantChat?: AssistantChatParams;
  NetworkAnalysis?: undefined;
  PermissionSecurity: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  PermissionSecurity: undefined;
};

export type SettingsStackParamList = ProfileStackParamList;

export type CheckStackParamList = {
  CheckMain?: { initialMode?: 'paste' | 'upload' };
  AssistantChat?: AssistantChatParams;
};

export type AssistantStackParamList = {
  AssistantMain?: AssistantChatParams;
};

export type HistoryStackParamList = {
  HistoryMain: undefined;
  AssistantChat?: AssistantChatParams;
};

// ─── Tab Icon Component ────────────────────────────────

interface TabIconProps {
  name: IconName;
  focused: boolean;
  isAI?: boolean;
}

const TabBarIcon: React.FC<TabIconProps> = ({ name, focused, isAI }) => (
  <View
    style={[
      styles.iconWrapper,
      focused &&
        (isAI ? styles.iconWrapperFocusedAI : styles.iconWrapperFocused),
    ]}
  >
    <Icon
      name={name}
      size={20}
      color={
        focused
          ? isAI
            ? Colors.secondary
            : Colors.primary
          : Colors.textTertiary
      }
      strokeWidth={focused ? 2.5 : 2}
    />
  </View>
);

// ─── Shared Stack Options ──────────────────────────────

const stackScreenOptions = {
  headerStyle: {
    backgroundColor: Colors.background,
  },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: {
    ...Typography.styles.bodySemibold,
    color: Colors.textPrimary,
  },
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: Colors.background,
  },
  animation: 'slide_from_right' as const,
};

// ─── 1. Home Stack ─────────────────────────────────────

const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeStackScreen: React.FC = () => (
  <HomeStack.Navigator screenOptions={stackScreenOptions}>
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{ headerShown: false }}
    />

    <HomeStack.Screen
      name="MessageChecker"
      component={MessageCheckerScreen}
      options={{ title: 'AI Fraud Scanner', headerBackTitle: 'Home' }}
    />

    <HomeStack.Screen
      name="DetectionHistory"
      component={DetectionHistoryScreen}
      options={{ title: 'Detection History', headerBackTitle: 'Home' }}
    />

    <HomeStack.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ title: 'My Profile', headerBackTitle: 'Home' }}
    />

    <HomeStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />

    <HomeStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile', headerBackTitle: 'Profile' }}
    />

    <HomeStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />

    <HomeStack.Screen
      name="AssistantChat"
      component={AssistantChatScreen}
      options={{ headerShown: false }}
    />

    <HomeStack.Screen
      name="NetworkAnalysis"
      component={NetworkAnalysisScreen}
      options={{
        title: 'Transaction Network Analysis',
        headerBackTitle: 'Home',
      }}
    />

    <HomeStack.Screen
      name="PermissionSecurity"
      component={PermissionSecurityScreen}
      options={{ headerShown: false }}
    />
  </HomeStack.Navigator>
);

// ─── 2. Scan Stack ─────────────────────────────────────

const CheckStack = createNativeStackNavigator<CheckStackParamList>();

const CheckStackScreen: React.FC = () => (
  <CheckStack.Navigator screenOptions={stackScreenOptions}>
    <CheckStack.Screen
      name="CheckMain"
      component={MessageCheckerScreen}
      options={{ title: 'AI Fraud Scanner', headerShown: false }}
    />

    <CheckStack.Screen
      name="AssistantChat"
      component={AssistantChatScreen}
      options={{ headerShown: false }}
    />
  </CheckStack.Navigator>
);

// ─── 3. AI Assistant Stack ─────────────────────────────

const AssistantStack =
  createNativeStackNavigator<AssistantStackParamList>();

const AssistantStackScreen: React.FC = () => (
  <AssistantStack.Navigator screenOptions={stackScreenOptions}>
    <AssistantStack.Screen
      name="AssistantMain"
      component={AssistantChatScreen}
      options={{ headerShown: false }}
    />
  </AssistantStack.Navigator>
);

// ─── 4. History Stack ──────────────────────────────────

const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

const HistoryStackScreen: React.FC = () => (
  <HistoryStack.Navigator screenOptions={stackScreenOptions}>
    <HistoryStack.Screen
      name="HistoryMain"
      component={DetectionHistoryScreen}
      options={{ title: 'Detection History', headerShown: false }}
    />

    <HistoryStack.Screen
      name="AssistantChat"
      component={AssistantChatScreen}
      options={{ headerShown: false }}
    />
  </HistoryStack.Navigator>
);

// ─── 5. Profile & Settings Stack ───────────────────────

const ProfileStack =
  createNativeStackNavigator<ProfileStackParamList>();

const ProfileStackScreen: React.FC = () => (
  <ProfileStack.Navigator screenOptions={stackScreenOptions}>
    <ProfileStack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />

    <ProfileStack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ headerShown: false }}
    />

    <ProfileStack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: 'Edit Profile', headerBackTitle: 'Profile' }}
    />

    <ProfileStack.Screen
      name="ChangePassword"
      component={ChangePasswordScreen}
      options={{ headerShown: false }}
    />

    <ProfileStack.Screen
      name="PermissionSecurity"
      component={PermissionSecurityScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

// ─── Bottom Tab Navigator ──────────────────────────────

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="Home" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Scan"
        component={CheckStackScreen}
        options={{
          tabBarLabel: 'Scan',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="Scan" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Assistant"
        component={AssistantStackScreen}
        options={{
          tabBarLabel: 'AI Assistant',
          tabBarActiveTintColor: Colors.secondary,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="Bot" focused={focused} isAI={true} />
          ),
        }}
      />

      <Tab.Screen
        name="History"
        component={HistoryStackScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="Clock" focused={focused} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name="User" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ─── Styles ────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0E0E14',
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 84 : 64,
    ...Shadows.lg,
  },

  tabBarLabel: {
    ...Typography.styles.small,
    fontWeight: '600',
    marginTop: 2,
    fontSize: 11,
    letterSpacing: 0.2,
  },

  iconWrapper: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconWrapperFocused: {
    backgroundColor: 'rgba(0, 123, 167, 0.12)',
  },

  iconWrapperFocusedAI: {
    backgroundColor: 'rgba(255, 45, 149, 0.12)',
  },
});

export default AppNavigator;
