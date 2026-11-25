/**
 * Modern Error Banner Component — FraudShield Cyber Edition
 *
 * Polished alert banner with Lucide AlertCircle icon, optional retry/dismiss actions.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import Icon from './Icon';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  if (!message) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconContainer}>
          <Icon name="AlertCircle" size={18} color={Colors.error} />
        </View>
        <Text style={styles.message}>{message}</Text>
        {onDismiss && (
          <TouchableOpacity
            onPress={onDismiss}
            style={styles.dismissButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Dismiss error">
            <Icon name="X" size={16} color="#F87171" />
          </TouchableOpacity>
        )}
      </View>
      {onRetry && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onRetry}
            style={styles.retryButton}
            accessibilityRole="button"
            accessibilityLabel="Retry action">
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    padding: 14,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 1,
  },
  message: {
    ...Typography.styles.caption,
    color: '#FCA5A5',
    fontWeight: '500',
    flex: 1,
    lineHeight: 19,
    fontSize: 13,
  },
  dismissButton: {
    marginLeft: Spacing.sm,
    padding: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
  },
  retryButton: {
    backgroundColor: '#1B1B24',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  retryText: {
    ...Typography.styles.caption,
    color: '#F87171',
    fontWeight: '600',
  },
});

export default ErrorMessage;
