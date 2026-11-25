/**
 * Cyber Input Component — FraudShield
 *
 * Styled TextInput with Lucide left icons, password reveal toggle (Eye / EyeOff),
 * animated electric blue focus glow, dark surface styling, and clear validation feedback.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors, Typography, Spacing } from '../theme/theme';
import Icon, { IconName } from './Icon';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  leftIcon?: IconName | React.ReactNode;
  hint?: string;
  focusColor?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  disabled = false,
  containerStyle,
  leftIcon,
  hint,
  focusColor,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const borderAnimation = useRef(new Animated.Value(0)).current;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(borderAnimation, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
    textInputProps.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(borderAnimation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
    textInputProps.onBlur?.(e);
  };

  const activeFocusColor = focusColor || Colors.primary;

  const borderColor = error
    ? Colors.error
    : borderAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [Colors.border, activeFocusColor],
      });

  const backgroundColor = disabled
    ? Colors.disabledBackground
    : isFocused
    ? '#1B1B24'
    : '#14141A';

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          <Text style={[styles.label, error && styles.labelError]}>
            {label}
          </Text>
          {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      ) : null}

      <Animated.View
        style={[
          styles.inputContainer,
          { borderColor, backgroundColor },
          isFocused && styles.inputContainerFocused,
          disabled && styles.inputContainerDisabled,
          error && styles.inputContainerError,
        ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {typeof leftIcon === 'string' ? (
              <Icon
                name={leftIcon as IconName}
                size={18}
                color={
                  error
                    ? Colors.error
                    : isFocused
                    ? activeFocusColor
                    : Colors.textSecondary
                }
              />
            ) : (
              leftIcon
            )}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithIcon : undefined,
            disabled ? styles.inputDisabled : undefined,
          ]}
          placeholderTextColor={Colors.placeholder}
          editable={!disabled}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={label}
          {...textInputProps}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }>
            <Icon
              name={isPasswordVisible ? 'EyeOff' : 'Eye'}
              size={19}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? (
        <View style={styles.errorRow}>
          <Icon
            name="AlertCircle"
            size={13}
            color={Colors.error}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  label: {
    ...Typography.styles.label,
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  labelError: {
    color: Colors.error,
  },
  hint: {
    ...Typography.styles.small,
    color: Colors.textTertiary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 14,
  },
  inputContainerFocused: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainerDisabled: {
    borderColor: Colors.borderLight,
    opacity: 0.6,
  },
  inputContainerError: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  input: {
    flex: 1,
    height: '100%',
    ...Typography.styles.body,
    color: Colors.textPrimary,
    paddingVertical: 0,
    fontSize: 15,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  inputDisabled: {
    color: Colors.textTertiary,
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  toggleButton: {
    padding: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    ...Typography.styles.caption,
    color: Colors.error,
    fontWeight: Typography.weights.medium,
  },
});

export default Input;
