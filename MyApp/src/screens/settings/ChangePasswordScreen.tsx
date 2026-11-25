/**
 * FraudShield Cyber Change Password Screen
 *
 * Professional cybersecurity credential rotation screen:
 * - Real-time password strength indicator (Weak, Fair, Good, Robust)
 * - Criteria validation checklist
 * - Secure JWT token rotation
 * - Premium dark cybersecurity UI with glowing focus and badges
 */

import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../context/AuthContext';
import authApi from '../../api/authApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Badge from '../../components/Badge';
import Icon from '../../components/Icon';
import {Colors, Typography, Spacing} from '../../theme/theme';
import {validatePassword, validatePasswordMatch} from '../../utils/validation';
import {extractApiError} from '../../utils/errorHandler';

const ChangePasswordScreen: React.FC = () => {
  const {updateTokens} = useAuth();
  const navigation = useNavigation();

  // Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const clearFieldError = (field: string) => {
    setFieldErrors(prev => ({...prev, [field]: undefined}));
  };

  // Password strength calculation
  const strength = useMemo(() => {
    if (!newPassword) return {score: 0, label: 'None', color: Colors.border};
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 10) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[A-Z]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 1;

    switch (score) {
      case 1:
        return {score: 1, label: 'Weak', color: Colors.error};
      case 2:
        return {score: 2, label: 'Fair', color: Colors.warning};
      case 3:
        return {score: 3, label: 'Good', color: Colors.primary};
      case 4:
        return {score: 4, label: 'Robust', color: Colors.success};
      default:
        return {score: 0, label: 'None', color: Colors.border};
    }
  }, [newPassword]);

  const isMinLength = newPassword.length >= 6;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecialOrUpper = /[A-Z]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const validate = (): boolean => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!currentPassword) {
      errors.currentPassword = 'Current password is required';
      isValid = false;
    }

    const passwordResult = validatePassword(newPassword);
    if (!passwordResult.isValid) {
      errors.newPassword = passwordResult.error;
      isValid = false;
    }

    const matchResult = validatePasswordMatch(newPassword, confirmPassword);
    if (!matchResult.isValid) {
      errors.confirmPassword = matchResult.error;
      isValid = false;
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      errors.newPassword = 'New password must be different from current password';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleChangePassword = useCallback(async () => {
    setError('');
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      const {accessToken, refreshToken} = response.data;
      await updateTokens(accessToken, refreshToken);

      Alert.alert(
        'Credentials Rotated',
        'Your security password has been updated and active sessions re-authenticated with fresh cryptographic tokens.',
        [
          {
            text: 'Return to Settings',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err) {
      const apiError = extractApiError(err);
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [currentPassword, newPassword, confirmPassword, updateTokens, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ─── Top Header ────────────────────────────────────────────── */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityLabel="Back">
            <Icon name="ChevronLeft" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.screenTitle}>Change Password</Text>
            <Text style={styles.screenSubtitle}>Rotate cryptographic access keys</Text>
          </View>
        </View>
        <Badge text="ENCRYPTED" variant="cyan" />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* ─── Security Callout Header ───────────────────────────── */}
          <View style={styles.securityHeader}>
            <View style={styles.securityIconBox}>
              <Icon name="KeyRound" size={22} color={Colors.primary} strokeWidth={2.4} />
            </View>
            <View style={styles.securityHeaderText}>
              <Text style={styles.securityTitle}>Key Rotation Protocol</Text>
              <Text style={styles.securitySubtitle}>
                Rotating passwords revokes previously issued OAuth tokens across devices.
              </Text>
            </View>
          </View>

          {/* ─── Error Notification ────────────────────────────────── */}
          {error ? (
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          ) : null}

          {/* ─── Main Form Card ────────────────────────────────────── */}
          <View style={styles.card}>
            {/* ─── Current Password ──────────────────────────────────── */}
            <Input
              label="Current Master Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChangeText={text => {
                setCurrentPassword(text);
                clearFieldError('currentPassword');
              }}
              error={fieldErrors.currentPassword}
              leftIcon="Lock"
              isPassword
              returnKeyType="next"
            />

            {/* ─── New Password ──────────────────────────────────────── */}
            <Input
              label="New Master Password"
              placeholder="Enter minimum 6 characters"
              value={newPassword}
              onChangeText={text => {
                setNewPassword(text);
                clearFieldError('newPassword');
              }}
              error={fieldErrors.newPassword}
              leftIcon="LockKeyhole"
              isPassword
              returnKeyType="next"
            />

            {/* ─── Password Strength Meter ───────────────────────────── */}
            {newPassword.length > 0 && (
              <View style={styles.strengthWrapper}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthCaption}>Password Strength</Text>
                  <Text style={[styles.strengthValue, {color: strength.color}]}>
                    {strength.label}
                  </Text>
                </View>
                <View style={styles.strengthBarContainer}>
                  {[1, 2, 3, 4].map(idx => (
                    <View
                      key={idx}
                      style={[
                        styles.strengthSegment,
                        {
                          backgroundColor:
                            idx <= strength.score ? strength.color : Colors.cardElevated,
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* ─── Confirm New Password ──────────────────────────────── */}
            <Input
              label="Confirm New Password"
              placeholder="Re-enter new password to verify"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                clearFieldError('confirmPassword');
              }}
              error={fieldErrors.confirmPassword}
              leftIcon="Lock"
              isPassword
              returnKeyType="done"
              onSubmitEditing={handleChangePassword}
            />

            {/* ─── Security Criteria Checklist ───────────────────────── */}
            <View style={styles.requirementsContainer}>
              <View style={styles.requirementsHeaderRow}>
                <Icon name="Shield" size={13} color={Colors.primary} style={{marginRight: 6}} />
                <Text style={styles.requirementsTitle}>Security Specifications</Text>
              </View>

              <View style={styles.requirementRow}>
                <Icon
                  name={isMinLength ? 'CheckCircle2' : 'Clock'}
                  size={14}
                  color={isMinLength ? Colors.success : Colors.textTertiary}
                  style={styles.reqIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    isMinLength && styles.requirementMetText,
                  ]}>
                  Minimum length of 6 characters
                </Text>
              </View>

              <View style={styles.requirementRow}>
                <Icon
                  name={hasNumber ? 'CheckCircle2' : 'Clock'}
                  size={14}
                  color={hasNumber ? Colors.success : Colors.textTertiary}
                  style={styles.reqIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasNumber && styles.requirementMetText,
                  ]}>
                  Includes at least one numeric digit (0–9)
                </Text>
              </View>

              <View style={styles.requirementRow}>
                <Icon
                  name={hasSpecialOrUpper ? 'CheckCircle2' : 'Clock'}
                  size={14}
                  color={hasSpecialOrUpper ? Colors.success : Colors.textTertiary}
                  style={styles.reqIcon}
                />
                <Text
                  style={[
                    styles.requirementText,
                    hasSpecialOrUpper && styles.requirementMetText,
                  ]}>
                  Contains uppercase or special character (Recommended)
                </Text>
              </View>

              {confirmPassword.length > 0 && (
                <View style={styles.requirementRow}>
                  <Icon
                    name={passwordsMatch ? 'CheckCircle2' : 'AlertCircle'}
                    size={14}
                    color={passwordsMatch ? Colors.success : Colors.error}
                    style={styles.reqIcon}
                  />
                  <Text
                    style={[
                      styles.requirementText,
                      passwordsMatch && styles.requirementMetText,
                      !passwordsMatch && styles.requirementFailText,
                    ]}>
                    {passwordsMatch
                      ? 'New passwords match perfectly'
                      : 'Passwords do not match yet'}
                  </Text>
                </View>
              )}
            </View>

            {/* ─── Submit Actions ────────────────────────────────────── */}
            <Button
              title="Update Credentials"
              onPress={handleChangePassword}
              loading={loading}
              variant="primary"
              style={styles.submitButton}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
              disabled={loading}
            />
          </View>

          {/* ─── Token Rotation Notice ─────────────────────────────── */}
          <View style={styles.noticeContainer}>
            <Icon name="Info" size={14} color={Colors.textTertiary} />
            <Text style={styles.noticeText}>
              FraudShield uses SHA-256 password hashing with salt before transmission. Plain passwords are never stored.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
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
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    backgroundColor: Colors.card,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  securityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.35)',
  },
  securityHeaderText: {
    flex: 1,
  },
  securityTitle: {
    ...Typography.styles.bodySemibold,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  securitySubtitle: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: Spacing.cardPadding,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  strengthWrapper: {
    marginBottom: Spacing.md,
    marginTop: -Spacing.xs,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  strengthCaption: {
    ...Typography.styles.caption,
    color: Colors.textSecondary,
    fontSize: 11,
  },
  strengthValue: {
    ...Typography.styles.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  strengthBarContainer: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: '100%',
    borderRadius: 2,
  },
  requirementsContainer: {
    backgroundColor: Colors.cardElevated,
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  requirementsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  requirementsTitle: {
    ...Typography.styles.small,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 10,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  reqIcon: {
    marginRight: 8,
  },
  requirementText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    fontSize: 12,
  },
  requirementMetText: {
    color: Colors.success,
    fontWeight: '600',
  },
  requirementFailText: {
    color: Colors.error,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  noticeText: {
    ...Typography.styles.caption,
    color: Colors.textTertiary,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
    fontSize: 11,
  },
});

export default ChangePasswordScreen;
