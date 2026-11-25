/**
 * Premium Cybersecurity Register Screen — FraudShield
 *
 * Design features:
 * - Ultra-deep dark cybersecurity background (#0A0A0A)
 * - Modern cybersecurity card (#14141A) with border
 * - Real-time password strength meter (Weak / Moderate / Robust) with visual progress bar
 * - High-contrast inputs with Lucide icons
 * - Cerulean Blue / Neon Rose accented buttons and links
 * - Clean error presentation and full auth validation
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordMatch,
} from '../../utils/validation';
import { extractApiError } from '../../utils/errorHandler';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

interface FieldErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { register } = useAuth();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleRegister = async () => {
    setError('');

    const errors: FieldErrors = {};
    let isValid = true;

    const nameResult = validateName(name);
    if (!nameResult.isValid) {
      errors.name = nameResult.error;
      isValid = false;
    }

    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      errors.email = emailResult.error;
      isValid = false;
    }

    const phoneResult = validatePhone(phone);
    if (!phoneResult.isValid) {
      errors.phone = phoneResult.error;
      isValid = false;
    }

    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error;
      isValid = false;
    }

    const matchResult = validatePasswordMatch(password, confirmPassword);
    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.error;
      isValid = false;
    }

    setFieldErrors(errors);
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), phone.trim(), password);
    } catch (err: any) {
      const apiError = extractApiError(err);
      if (apiError.validationErrors) {
        const fieldMap: FieldErrors = {};
        apiError.validationErrors.forEach((ve) => {
          if (['name', 'email', 'phone', 'password'].includes(ve.field)) {
            (fieldMap as any)[ve.field] = ve.message;
          }
        });
        setFieldErrors((prev) => ({ ...prev, ...fieldMap }));
      }
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  // Password criteria computation
  const isMinLength = password.length >= 6;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  // Strength score: 0 to 3
  const strengthScore =
    (isMinLength ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial && password.length >= 8 ? 1 : 0);

  const getStrengthLabel = () => {
    if (!password) return { label: 'REQUIRED', color: Colors.textTertiary, width: '0%' };
    if (strengthScore <= 1) return { label: 'WEAK', color: Colors.error, width: '33%' };
    if (strengthScore === 2) return { label: 'MODERATE', color: Colors.warning, width: '66%' };
    return { label: 'ROBUST', color: Colors.success, width: '100%' };
  };

  const strength = getStrengthLabel();

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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in">
              <Icon name="ChevronLeft" size={16} color={Colors.primaryLight} />
              <Text style={styles.backText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.titleRow}>
              <Text style={styles.heading}>Enroll Operator</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>ENCRYPTED</Text>
              </View>
            </View>
            <Text style={styles.subheading}>
              Deploy AI-powered message inspection and threat interception.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          ) : null}

          {/* Form Card */}
          <View style={styles.card}>
            <Input
              label="Full Name"
              placeholder="Alex Walker"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearFieldError('name');
              }}
              error={fieldErrors.name}
              leftIcon="User"
              autoCapitalize="words"
              returnKeyType="next"
              focusColor={Colors.primary}
            />

            <Input
              label="Email Address"
              placeholder="alex@domain.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError('email');
              }}
              error={fieldErrors.email}
              leftIcon="Mail"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              focusColor={Colors.primary}
            />

            <Input
              label="Mobile Number (SMS Protection)"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearFieldError('phone');
              }}
              error={fieldErrors.phone}
              leftIcon="Phone"
              keyboardType="phone-pad"
              returnKeyType="next"
              focusColor={Colors.primary}
            />

            <Input
              label="Password"
              placeholder="Minimum 6 characters"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError('password');
              }}
              error={fieldErrors.password}
              leftIcon="Lock"
              isPassword
              returnKeyType="next"
              focusColor={Colors.primary}
            />

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthText}>CRYPTO STRENGTH</Text>
                  <Text style={[styles.strengthValue, { color: strength.color }]}>
                    {strength.label}
                  </Text>
                </View>
                <View style={styles.strengthTrack}>
                  <View
                    style={[
                      styles.strengthBar,
                      { width: strength.width as any, backgroundColor: strength.color },
                    ]}
                  />
                </View>
              </View>
            )}

            <Input
              label="Confirm Password"
              placeholder="Repeat password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              error={fieldErrors.confirmPassword}
              leftIcon="LockKeyhole"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              focusColor={Colors.primary}
            />

            {/* Password Criteria Checklist */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Security Requirements</Text>
              
              <View style={styles.requirementRow}>
                <Icon
                  name={isMinLength ? 'CheckCircle2' : 'Clock'}
                  size={14}
                  color={isMinLength ? Colors.success : Colors.textTertiary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.requirementText,
                    isMinLength && styles.requirementMetText,
                  ]}>
                  At least 6 characters
                </Text>
              </View>

              <View style={styles.requirementRow}>
                <Icon
                  name={hasNumber ? 'CheckCircle2' : 'Clock'}
                  size={14}
                  color={hasNumber ? Colors.success : Colors.textTertiary}
                  style={{ marginRight: 8 }}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasNumber && styles.requirementMetText,
                  ]}>
                  Contains numerical character
                </Text>
              </View>

              {confirmPassword.length > 0 && (
                <View style={styles.requirementRow}>
                  <Icon
                    name={passwordsMatch ? 'CheckCircle2' : 'AlertCircle'}
                    size={14}
                    color={passwordsMatch ? Colors.success : Colors.error}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      passwordsMatch && styles.requirementMetText,
                      !passwordsMatch && styles.requirementFailText,
                    ]}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}
            </View>

            {/* Submit Button */}
            <Button
              title="INITIALIZE CYBER DEFENSE"
              onPress={handleRegister}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.registerButton}
            />
          </View>

          {/* Footer: Sign In Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already enrolled as an operator? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Sign in">
              <Text style={styles.linkText}>Sign In</Text>
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
  header: {
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backText: {
    ...Typography.styles.bodyMedium,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  heading: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  badge: {
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderColor: 'rgba(0, 123, 167, 0.35)',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    color: Colors.primaryLight,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    ...Shadows.card,
  },
  strengthWrapper: {
    marginBottom: 16,
    marginTop: -4,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  strengthText: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  strengthValue: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  strengthTrack: {
    height: 4,
    backgroundColor: '#14141A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  requirementsContainer: {
    backgroundColor: '#14141A',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  requirementText: {
    fontSize: 12,
    color: Colors.textTertiary,
  },
  requirementMetText: {
    color: Colors.success,
    fontWeight: '600',
  },
  requirementFailText: {
    color: Colors.error,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF2D95',
  },
});

export default RegisterScreen;
