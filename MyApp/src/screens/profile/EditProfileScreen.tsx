/**
 * Modern Edit Profile Screen — FraudShield Cyber Edition
 *
 * Polished form for updating user profile info (name, phone).
 * Displays read-only email with security lock badge and avatar presentation.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorMessage from '../../components/ErrorMessage';
import Icon from '../../components/Icon';
import UserAvatar from '../../components/UserAvatar';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import { validateName, validatePhone } from '../../utils/validation';
import { extractApiError } from '../../utils/errorHandler';

const EditProfileScreen: React.FC = () => {
  const { user, updateStoredUser } = useAuth();
  const navigation = useNavigation();

  // Pre-fill with current profile data
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  const validate = (): boolean => {
    const errors: { name?: string; phone?: string } = {};
    let isValid = true;

    if (name.trim()) {
      const nameResult = validateName(name);
      if (!nameResult.isValid) {
        errors.name = nameResult.error;
        isValid = false;
      }
    }

    if (phone.trim()) {
      const phoneResult = validatePhone(phone);
      if (!phoneResult.isValid) {
        errors.phone = phoneResult.error;
        isValid = false;
      }
    }

    if (name.trim() === user?.name && phone.trim() === user?.phone) {
      setError('No profile modifications detected.');
      return false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSave = useCallback(async () => {
    setError('');
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      const updateData: { name?: string; phone?: string } = {};
      if (name.trim() !== user?.name) {
        updateData.name = name.trim();
      }
      if (phone.trim() !== user?.phone) {
        updateData.phone = phone.trim();
      }

      const response = await authApi.updateProfile(updateData);
      await updateStoredUser(response.data);

      Alert.alert(
        'Profile Updated',
        'Your cryptographic security credentials have been updated successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }],
      );
    } catch (err) {
      const apiError = extractApiError(err);
      if (apiError.validationErrors) {
        const fieldMap: { name?: string; phone?: string } = {};
        apiError.validationErrors.forEach((ve) => {
          if (ve.field === 'name' || ve.field === 'phone') {
            fieldMap[ve.field] = ve.message;
          }
        });
        setFieldErrors((prev) => ({ ...prev, ...fieldMap }));
      }
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }, [name, phone, user, updateStoredUser, navigation]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <UserAvatar name={name || 'User'} size={76} showRing />
            <Text style={styles.avatarHint}>Verified Operator</Text>
          </View>

          {/* Info Callout */}
          <View style={styles.infoCallout}>
            <Icon name="Info" size={16} color={Colors.primary} style={styles.calloutIcon} />
            <Text style={styles.calloutText}>
              You can update your display name and verified mobile number. Your account email address is cryptographically anchored and cannot be modified.
            </Text>
          </View>

          {/* Error Banner */}
          {error ? (
            <ErrorMessage message={error} onDismiss={() => setError('')} />
          ) : null}

          {/* Form Card */}
          <View style={[styles.card, Shadows.card]}>
            <Input
              label="Email Address (Anchored)"
              value={user?.email || ''}
              disabled
              leftIcon="Mail"
              placeholder=""
            />

            <Input
              label="Full Name"
              placeholder="Your full name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={fieldErrors.name}
              leftIcon="User"
              autoCapitalize="words"
              returnKeyType="next"
              focusColor={Colors.primary}
            />

            <Input
              label="Mobile Number (SMS Defense)"
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={fieldErrors.phone}
              leftIcon="Phone"
              keyboardType="phone-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
              focusColor={Colors.primary}
            />

            <Button
              title="SAVE CHANGES"
              onPress={handleSave}
              loading={loading}
              variant="primary"
              size="lg"
              style={styles.saveButton}
            />

            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="ghost"
              disabled={loading}
            />
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Spacing.xxxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 8,
    fontWeight: '600',
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0, 123, 167, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.3)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  calloutIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  calloutText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    flex: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveButton: {
    marginTop: 6,
    marginBottom: 4,
  },
});

export default EditProfileScreen;
