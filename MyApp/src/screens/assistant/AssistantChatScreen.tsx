/**
 * Premium AI Cybersecurity Assistant — FraudShield Redesign
 *
 * Cerulean Blue + Neon Rose theme with:
 * - Animated AI avatar with pulsing neon rings
 * - Typing indicator animation
 * - Modern chat bubbles with glassmorphism
 * - Smooth message entrance animations
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  StatusBar,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from '../../components/Icon';
import { Colors, Typography, Spacing, Shadows } from '../../theme/theme';
import { TypingIndicator } from '../../components/animations';
import assistantApi, {
  AssistantDetectionContext,
  AssistantChatResponse,
} from '../../api/assistantApi';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  suggestedFollowUps?: string[];
  actionChecklist?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'immediate';
  isError?: boolean;
}

export type AssistantChatRouteParams = {
  mode?: 'detection_explanation' | 'general_help';
  detectionContext?: AssistantDetectionContext;
  initialPrompt?: string;
};

const DEFAULT_GENERAL_SUGGESTIONS = [
  'Is this message a scam?',
  'How do I identify fake websites?',
  'How can I protect my bank account?',
  'I clicked a suspicious link.',
  'I shared an OTP or password.',
  'I sent money to a scammer.',
];

const DEFAULT_DETECTION_SUGGESTIONS = [
  'Why was this message flagged?',
  'How do I identify fake websites?',
  'What should I do next?',
  'How do I report this sender safely?',
];

const DEFAULT_PERMISSION_SUGGESTIONS = [
  'Why did this website request this permission?',
  'How do I revoke permissions in Chrome?',
  'Can a website record me in the background?',
  'How do I block permissions in Android Settings?',
  'Is it safe to allow camera access for video calls?',
];

export const AssistantChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: AssistantChatRouteParams }, 'params'>>();

  const mode =
    route.params?.mode ||
    (route.params?.detectionContext ? 'detection_explanation' : 'general_help');
  const detectionContext = route.params?.detectionContext;
  const initialPrompt = route.params?.initialPrompt;

  const [conversationId, setConversationId] = useState<string>(
    () => `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [activeSuggestions, setActiveSuggestions] = useState<string[]>(
    detectionContext?.permissionType
      ? DEFAULT_PERMISSION_SUGGESTIONS
      : mode === 'detection_explanation'
      ? DEFAULT_DETECTION_SUGGESTIONS
      : DEFAULT_GENERAL_SUGGESTIONS,
  );
  const [isContextCollapsed, setIsContextCollapsed] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  

  // Initialize initial greeting & prompt
  useEffect(() => {
    let initialGreetingText = '';

    if (detectionContext?.permissionType) {
      initialGreetingText = `Hello! I'm your FraudShield Assistant. I see that ${
        detectionContext.domain || 'a website'
      } requested ${detectionContext.permissionType} permission (Trust: ${
        detectionContext.trustLevel || 'UNVERIFIED'
      }). Ask me about the risks, whether to allow or deny, or how to manage site permissions safely in Chrome and Android.`;
    } else if (mode === 'detection_explanation' && detectionContext) {
      const isThreat = detectionContext.classification === 'FRAUD' || (detectionContext.riskScore || 0) >= 0.70;
      const scorePct = Math.round((detectionContext.riskScore || 0) * 100);
      initialGreetingText = `Hello! I'm your FraudShield AI Assistant. I have evaluated this detection (${scorePct}% threat confidence). Ask me why this message was flagged, what suspicious indicators were found, or how to protect yourself.`;
    } else {
      initialGreetingText = `Hello! I'm your FraudShield AI Cybersecurity Assistant. If you received a suspicious message, clicked an unverified link, or want to protect your accounts from fraud, I'm here 24/7 to guide you through recovery steps.`;
    }

    const initialMsg: ChatMessage = {
      id: `bot_init_${Date.now()}`,
      sender: 'assistant',
      text: initialGreetingText,
      timestamp: Date.now(),
      suggestedFollowUps:
        detectionContext?.permissionType
          ? DEFAULT_PERMISSION_SUGGESTIONS
          : mode === 'detection_explanation'
          ? DEFAULT_DETECTION_SUGGESTIONS
          : DEFAULT_GENERAL_SUGGESTIONS,
    };

    setMessages([initialMsg]);

    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!rawText || isLoading) return;

    if (textToSend === undefined) {
      setInputText('');
    }

    const userMsgId = `user_${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: rawText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      }));

      const res: AssistantChatResponse = await assistantApi.sendMessage({
        message: rawText,
        mode,
        conversationId,
        detectionContext,
        history,
      });

      if (res && res.conversationId) {
        setConversationId(res.conversationId);
      }

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'assistant',
        text: res.response || "I'm here to assist. Could you provide a bit more detail?",
        timestamp: Date.now(),
        suggestedFollowUps: res.suggestedFollowUps || [],
        actionChecklist: res.actionChecklist || [],
        urgency: res.urgency,
      };

      setMessages((prev) => [...prev, botMsg]);

      if (res.suggestedFollowUps && res.suggestedFollowUps.length > 0) {
        setActiveSuggestions(res.suggestedFollowUps);
      }
    } catch (err: any) {
      console.warn('[AssistantChatScreen] API error:', err);
      const errorMsg: ChatMessage = {
        id: `bot_err_${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to reach the assistant service at this moment. If you have transferred funds or shared bank credentials, call the National Cybercrime Helpline 1930 immediately.',
        timestamp: Date.now(),
        isError: true,
        actionChecklist: [
          'Call National Cybercrime Helpline 1930',
          'Contact your bank 24x7 fraud desk to freeze transactions',
        ],
        urgency: 'high',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }
  };

  const handleClearConversation = () => {
    Alert.alert(
      'Clear Conversation',
      'Are you sure you want to start a fresh chat session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`);
            setMessages([
              {
                id: `bot_init_${Date.now()}`,
                sender: 'assistant',
                text: "Conversation reset. How can I assist with your cybersecurity protection today?",
                timestamp: Date.now(),
                suggestedFollowUps: DEFAULT_GENERAL_SUGGESTIONS,
              },
            ]);
            setActiveSuggestions(DEFAULT_GENERAL_SUGGESTIONS);
          },
        },
      ],
    );
  };

  const toggleChecklistStep = (stepText: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepText]: !prev[stepText],
    }));
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:1930').catch(() => {});
  };

  // Render individual message item
  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.sender === 'user';
    const isUrgent = item.urgency === 'immediate' || item.urgency === 'high';

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}>
        {!isUser && (
          <View style={styles.assistantAvatar}>
            <Icon name="Bot" size={16} color={Colors.secondary} strokeWidth={2.4} />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
            item.isError && styles.errorBubble,
          ]}>
          {/* Urgent Warning Header */}
          {!isUser && isUrgent && (
            <View style={styles.urgentBadgeRow}>
              <Icon name="AlertTriangle" size={13} color={Colors.error} strokeWidth={2.4} style={{ marginRight: 6 }} />
              <Text style={styles.urgentBadgeText}>URGENT ACTION REQUIRED</Text>
            </View>
          )}

          <Text
            style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.assistantMessageText,
            ]}>
            {item.text}
          </Text>

          {/* Action Checklist */}
          {item.actionChecklist && item.actionChecklist.length > 0 && (
            <View style={styles.checklistContainer}>
              <Text style={styles.checklistTitle}>RECOMMENDED RECOVERY ACTIONS:</Text>
              {item.actionChecklist.map((step, idx) => {
                const isChecked = !!completedSteps[step];
                return (
                  <TouchableOpacity
                    key={`${step}_${idx}`}
                    style={[styles.checklistItem, isChecked && styles.checklistItemDone]}
                    activeOpacity={0.8}
                    onPress={() => toggleChecklistStep(step)}>
                    <View
                      style={[
                        styles.checkboxBox,
                        isChecked && styles.checkboxBoxChecked,
                      ]}>
                      {isChecked && (
                        <Icon name="Check" size={11} color="#FFFFFF" strokeWidth={3} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checklistText,
                        isChecked && styles.checklistTextDone,
                      ]}>
                      {step}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Time & status */}
          <Text
            style={[
              styles.timestampText,
              isUser ? styles.userTimestampText : styles.assistantTimestampText,
            ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" />

      {/* ─── Screen Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Back">
          <Icon name="ChevronLeft" size={20} color={Colors.textPrimary} strokeWidth={2.4} />
        </TouchableOpacity>

        <View style={styles.headerTitleGroup}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitle}>FraudShield AI</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            {mode === 'detection_explanation'
              ? 'Analyzing Detection Findings'
              : 'Cyber Defense & Scam Triage'}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={handleClearConversation}
            accessibilityRole="button"
            accessibilityLabel="Clear chat">
            <Icon name="Trash2" size={16} color={Colors.textTertiary} strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helplineQuickBtn}
            onPress={handleCallHelpline}
            accessibilityRole="button"
            accessibilityLabel="Dial 1930 Cybercrime Helpline">
            <Icon name="Phone" size={12} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 3 }} />
            <Text style={styles.helplineQuickBtnText}>1930</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Detection / Permission Context Banner ─────────────────────── */}
      {detectionContext && (
        <View style={styles.detectionBanner}>
          <TouchableOpacity
            style={styles.detectionBannerHeader}
            activeOpacity={0.85}
            onPress={() => setIsContextCollapsed(!isContextCollapsed)}>
            <View style={styles.detectionBannerTitleRow}>
              <Icon
                name={
                  detectionContext.permissionType
                    ? 'Lock'
                    : (detectionContext.riskScore || 0) >= 0.70
                    ? 'AlertTriangle'
                    : 'CheckCircle2'
                }
                size={16}
                color={
                  detectionContext.permissionType
                    ? PRIMARY_COLOR
                    : (detectionContext.riskScore || 0) >= 0.70
                    ? '#DC2626'
                    : '#059669'
                }
                strokeWidth={2.4}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.detectionBannerTitle}>
                {detectionContext.permissionType
                  ? `Website Permission: ${detectionContext.permissionType}`
                  : `Referenced Detection (${detectionContext.source || 'Manual Scan'})`}
              </Text>
            </View>

            <View style={styles.detectionBannerRight}>
              <View
                style={[
                  styles.detectionScoreBadge,
                  detectionContext.permissionType
                    ? detectionContext.trustLevel === 'SUSPICIOUS'
                      ? styles.badgeDanger
                      : styles.badgeSafe
                    : (detectionContext.riskScore || 0) >= 0.70
                    ? styles.badgeDanger
                    : styles.badgeSafe,
                ]}>
                <Text
                  style={
                    detectionContext.permissionType
                      ? detectionContext.trustLevel === 'SUSPICIOUS'
                        ? styles.badgeDangerText
                        : styles.badgeSafeText
                      : (detectionContext.riskScore || 0) >= 0.70
                      ? styles.badgeDangerText
                      : styles.badgeSafeText
                  }>
                  {detectionContext.permissionType
                    ? (detectionContext.trustLevel || 'UNVERIFIED')
                    : `${Math.round((detectionContext.riskScore || 0) * 100)}% Risk`}
                </Text>
              </View>
              <Icon
                name={isContextCollapsed ? 'ChevronRight' : 'X'}
                size={13}
                color={Colors.textTertiary}
                strokeWidth={2}
                style={{ marginLeft: 6 }}
              />
            </View>
          </TouchableOpacity>

          {!isContextCollapsed && (
            <View style={styles.detectionBannerBody}>
              {detectionContext.permissionType ? (
                <Text style={styles.detectionPreviewText} numberOfLines={2}>
                  {detectionContext.domain ? `Website: ${detectionContext.domain}` : ''}
                  {detectionContext.safePreview ? ` — ${detectionContext.safePreview}` : ''}
                </Text>
              ) : (
                <>
                  {!!detectionContext.safePreview && (
                    <Text style={styles.detectionPreviewText} numberOfLines={2}>
                      "{detectionContext.safePreview}"
                    </Text>
                  )}
                  {detectionContext.reasons && detectionContext.reasons.length > 0 && (
                    <View style={styles.reasonsList}>
                      {detectionContext.reasons.slice(0, 2).map((r, i) => (
                        <Text key={i} style={styles.reasonBullet} numberOfLines={1}>
                          • {r}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      )}

      {/* ─── Chat Message Feed ───────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.assistantAvatar}>
                  <Icon name="Bot" size={16} color={Colors.secondary} strokeWidth={2.4} />
                </View>
                <View style={styles.typingBubble}>
                  <TypingIndicator color={Colors.secondary} />
                  <Text style={styles.typingText}>Analyzing...</Text>
                </View>
              </View>
            ) : undefined
          }
        />

        {/* ─── Suggested Prompt Chips ─────────────────────────────────── */}
        {activeSuggestions.length > 0 && (
          <View style={styles.chipsSection}>
            <FlatList
              horizontal
              data={activeSuggestions}
              keyExtractor={(item, index) => `${item}_${index}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsContainer}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.chipButton}
                  onPress={() => handleSendMessage(item)}
                  activeOpacity={0.8}
                  disabled={isLoading}>
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* ─── Message Composer ───────────────────────────────────────── */}
        <View style={styles.composerContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask a question or describe what happened..."
              placeholderTextColor={Colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1500}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Send message">
            <Icon name="Send" size={17} color="#FFFFFF" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#030712',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 45, 149, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.secondary,
  },
  liveText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helplineQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  helplineQuickBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Detection Context Banner
  detectionBanner: {
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  detectionBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detectionBannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detectionBannerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  detectionBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectionScoreBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeDanger: {
    backgroundColor: 'rgba(255, 69, 69, 0.15)',
    borderColor: 'rgba(255, 69, 69, 0.35)',
  },
  badgeDangerText: {
    color: Colors.error,
    fontSize: 10,
    fontWeight: '700',
  },
  badgeSafe: {
    backgroundColor: 'rgba(32, 217, 138, 0.15)',
    borderColor: 'rgba(32, 217, 138, 0.35)',
  },
  badgeSafeText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '700',
  },
  detectionScoreBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detectionBannerBody: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  detectionPreviewText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  reasonsList: {
    gap: 2,
  },
  reasonBullet: {
    fontSize: 11,
    color: Colors.textTertiary,
  },

  // Message List
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 13,
    borderRadius: 16,
  },
  assistantBubble: {
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#0066FF',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  errorBubble: {
    borderColor: 'rgba(255, 69, 69, 0.4)',
    backgroundColor: 'rgba(255, 69, 69, 0.08)',
  },
  urgentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  urgentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  assistantMessageText: {
    color: Colors.textPrimary,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timestampText: {
    fontSize: 10,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  assistantTimestampText: {
    color: Colors.textTertiary,
  },
  userTimestampText: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Checklist inside AI Bubble
  checklistContainer: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checklistTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  checklistItemDone: {
    opacity: 0.6,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
  },
  checklistText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
  },
  checklistTextDone: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },

  // Loading indicator
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  typingText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Suggested Prompts Chips
  chipsSection: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chipButton: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Bottom Composer
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#030712',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 44,
    maxHeight: 100,
    justifyContent: 'center',
  },
  textInput: {
    fontSize: 14,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});

export default AssistantChatScreen;
