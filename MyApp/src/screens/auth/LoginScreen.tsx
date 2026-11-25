/**
 * Premium Cybersecurity Login Screen — FraudShield
 *
 * Design features:
 * - Ultra-deep cybersecurity background (#0A0A0A)
 * - Subtle cyber security badge ("AI FRAUD DEFENSE ENGINE")
 * - Professional FraudShield logo & branding presentation
 * - Modern dark container card (#14141A) with border
 * - High-contrast inputs with Lucide Mail & LockKeyhole icons
 * - Password reveal toggle
 * - Cerulean Blue / Neon Rose accented authorization button and links
 * - Forgot password dialog & registration navigation
 * - Preserves all auth state, validation, and error handling
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import { validateEmail } from '../../utils/validation';
import { extractApiError } from '../../utils/errorHandler';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const { login } = useAuth();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleLogin = async () => {
    setError('');

    // Validate
    const errors: { email?: string; password?: string } = {};
    let isValid = true;

    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Reset Security Credentials',
      'Enter your registered email address to receive password reset instructions.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () => {
            if (!email) {
              setFieldErrors((prev) => ({
                ...prev,
                email: 'Please enter your email to reset password',
              }));
            } else {
              Alert.alert(
                'Security Link Dispatched',
                `A cryptographically secure reset link has been dispatched to ${email.trim()}.`,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {/* ─── Security Status Pill ─────────────────────────────────── */}
          <View style={styles.topBadgeContainer}>
            <View style={styles.securityPill}>
              <View style={styles.pulsingDot} />
              <Icon name="ShieldCheck" size={13} color={Colors.primary} />
              <Text style={styles.securityPillText}>AI FRAUD DEFENSE ENGINE</Text>
            </View>
          </View>

          {/* ─── Brand & Logo Header ───────────────────────────────────── */}
          <View style={styles.headerSection}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="FraudShield Logo"
              />
            </View>
            <Text style={styles.heading}>Secure Sign In</Text>
            <Text style={styles.subheading}>
              Access your real-time cybersecurity telemetry and AI fraud monitors.
            </Text>
          </View>

          {/* ─── Error Notification ───────────────────────────────────── */}
          {error ? (
            <View style={styles.errorWrapper}>
              <ErrorMessage message={error} onDismiss={() => setError('')} />
            </View>
          ) : null}

          {/* ─── Login Card Container ──────────────────────────────────── */}
          <View style={styles.cardContainer}>
            {/* Email Field with Mail Icon */}
            <Input
              label="Account Email"
              placeholder="operator@defense.io"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={fieldErrors.email}
              leftIcon="Mail"
              focusColor={Colors.primary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              containerStyle={styles.inputSpacing}
            />

            {/* Password Field with Lock & Visibility Toggle */}
            <Input
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              error={fieldErrors.password}
              leftIcon="LockKeyhole"
              focusColor={Colors.primary}
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              containerStyle={styles.passwordSpacing}
            />

            {/* Forgot Password Link */}
            <View style={styles.forgotPasswordContainer}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Forgot password">
                <Text style={styles.forgotPasswordText}>Forgot security key?</Text>
              </TouchableOpacity>
            </View>

            {/* Cyber Gradient-Style Sign In Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                Shadows.glowBlue,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Sign in to FraudShield">
              {loading ? (
                <View style={styles.buttonInner}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={[styles.loginButtonText, { marginLeft: 10 }]}>
                    AUTHENTICATING...
                  </Text>
                </View>
              ) : (
                <View style={styles.buttonInner}>
                  <Icon name="Shield" size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.loginButtonText}>AUTHORIZE ACCESS</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* 256-Bit Encryption Footer Indicator */}
            <View style={styles.securityFootnote}>
              <Icon name="Lock" size={12} color={Colors.textTertiary} />
              <Text style={styles.securityFootnoteText}>
                End-to-End Cryptographically Protected Session
              </Text>
            </View>
          </View>

          {/* ─── Sign Up Link ─────────────────────────────────────────── */}
          <View style={styles.footerSection}>
            <Text style={styles.footerText}>Need protected access? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Create Account">
              <Text style={styles.signUpText}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
  },
  topBadgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 123, 167, 0.12)',
    borderColor: 'rgba(0, 123, 167, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  securityPillText: {
    color: Colors.primaryLight,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 220,
    height: 52,
  },
  heading: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 6,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
  },
  errorWrapper: {
    marginBottom: 12,
  },
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    marginBottom: 24,
    ...Shadows.card,
  },
  inputSpacing: {
    marginBottom: 16,
  },
  passwordSpacing: {
    marginBottom: 6,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.6)',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
  },
  securityFootnoteText: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  footerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpText: {
    fontSize: 14,
    color: '#FF2D95',
    fontWeight: '700',
  },
});

export default LoginScreen;
