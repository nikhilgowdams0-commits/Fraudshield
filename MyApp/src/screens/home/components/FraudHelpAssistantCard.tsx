/**
 * FraudHelpAssistantCard — AI Security Advisor card
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import Colors from '../../../theme/colors';
import Icon from '../../../components/Icon';

interface FraudHelpAssistantCardProps {
  onOpenAssistant: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS = [
  'How do I identify scam messages?',
  'I clicked a suspicious link',
  'How to protect my bank account?',
];

const FraudHelpAssistantCard: React.FC<FraudHelpAssistantCardProps> = ({
  onOpenAssistant,
  onSelectPrompt,
}) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.headerRow}
        onPress={onOpenAssistant}
        activeOpacity={0.8}>
        <View style={styles.aiAvatarContainer}>
          <Animated.View
            style={[styles.aiGlow, { opacity: pulseAnim }]}
          />
          <View style={styles.aiAvatar}>
            <Icon name="Bot" size={20} color={Colors.secondary} strokeWidth={2.2} />
          </View>
        </View>

        <View style={styles.textSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>AI Security Advisor</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            Ask about scams, fraud protection, or recovery steps
          </Text>
        </View>

        <View style={styles.arrowBox}>
          <Icon
            name="ChevronRight"
            size={16}
            color={Colors.secondary}
            strokeWidth={2.4}
          />
        </View>
      </TouchableOpacity>

      {/* Quick prompt chips */}
      <View style={styles.promptsContainer}>
        {PROMPTS.map((prompt, index) => (
          <TouchableOpacity
            key={index}
            style={styles.promptChip}
            onPress={() => onSelectPrompt(prompt)}
            activeOpacity={0.7}>
            <Text style={styles.promptText} numberOfLines={1}>
              {prompt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.2)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  aiAvatarContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 45, 149, 0.15)',
  },
  aiAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 45, 149, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  aiBadge: {
    backgroundColor: 'rgba(255, 45, 149, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.3)',
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  arrowBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 45, 149, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  promptChip: {
    backgroundColor: 'rgba(255, 45, 149, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 45, 149, 0.15)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  promptText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.secondary,
  },
});

export default FraudHelpAssistantCard;
