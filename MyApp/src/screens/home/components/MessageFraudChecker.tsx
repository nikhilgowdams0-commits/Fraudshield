/**
 * AI Message Scanner Component — FraudShield Cyber Edition
 *
 * Dedicated interface for checking suspicious messages & screenshot OCR:
 * 1. Direct Text / SMS typing & Paste action
 * 2. On-device Screenshot OCR extraction with review & edit
 * 3. Real-time AI analysis with radar scan animation
 * 4. Premium Result Card:
 *    - Green for Safe (#22C55E)
 *    - Orange for Suspicious (#F59E0B)
 *    - Red for Potential Fraud (#EF4444)
 *    - Confidence / Risk percentage meter
 *    - AI-generated reasoning breakdown & warning chips
 *    - Direct AI Assistant explanation link
 *    - Scan Again reset action
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from '../../../components/Icon';
import Badge from '../../../components/Badge';
import { Colors, Typography, Spacing, Shadows } from '../../../theme/theme';
import { pickScreenshot, extractTextFromScreenshot } from '../../../services/ocrService';
import {
  checkMessageForFraud,
  MessageCheckResult,
} from '../../../fraudDetection/messageCheckerHandler';

type CheckerStep =
  | 'INPUT'        // Direct typing & upload choice
  | 'OCR_READING'  // OCR in progress
  | 'OCR_REVIEW'   // OCR completed, user reviewing text
  | 'ANALYZING'    // AI analysis running
  | 'RESULT';      // Result card displayed

interface MessageFraudCheckerProps {
  onScanComplete?: (result: MessageCheckResult) => void;
  initialMode?: 'paste' | 'upload' | 'url';
}

export const MessageFraudChecker: React.FC<MessageFraudCheckerProps> = ({
  onScanComplete,
  initialMode,
}) => {
  const navigation = useNavigation<any>();

  // State
  const [inputText, setInputText] = useState('');
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [step, setStep] = useState<CheckerStep>('INPUT');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');

  // Analysis result & error
  const [checkResult, setCheckResult] = useState<MessageCheckResult | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const textInputRef = useRef<any>(null);

  // Pulse animation for radar scanning state
  

  useEffect(() => {
    if (initialMode === 'upload') {
      setActiveTab('image');
      handlePickScreenshot();
    } else if (initialMode === 'paste') {
      setActiveTab('text');
      setTimeout(() => textInputRef.current?.focus(), 300);
    } else if (initialMode === 'url') {
      setActiveTab('text');
      setTimeout(() => textInputRef.current?.focus(), 300);
    }
  }, [initialMode]);

  // ─── Screenshot Picking & OCR Extraction ────────────────────────────────────

  const handlePickScreenshot = async () => {
    try {
      setOcrError(null);
      const picked = await pickScreenshot();
      if (!picked || !picked.uri) {
        return;
      }

      setSelectedImageUri(picked.uri);
      setStep('OCR_READING');

      const ocrResult = await extractTextFromScreenshot(picked.uri);

      if (ocrResult.success && ocrResult.text) {
        setInputText(ocrResult.text);
        setStep('OCR_REVIEW');
      } else {
        const errorMsg =
          ocrResult.error || 'No readable text was detected in this screenshot.';
        setOcrError(errorMsg);
        setStep('INPUT');
        Alert.alert(
          'OCR Notice',
          `${errorMsg}\n\nYou can still paste or type the message manually.`,
          [{ text: 'OK' }],
        );
      }
    } catch (err: any) {
      console.warn('[FraudShield Checker] Screenshot picker error:', err);
      setOcrError(err?.message || 'Failed to open image picker.');
      setStep('INPUT');
      Alert.alert(
        'Upload Failed',
        err?.message || 'Could not select screenshot from gallery.',
        [{ text: 'OK' }],
      );
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageUri(null);
    setOcrError(null);
    if (step === 'OCR_REVIEW') {
      setStep('INPUT');
    }
  };

  // ─── Fraud Analysis Execution ───────────────────────────────────────────────

  const handleRunFraudCheck = async () => {
    const textToAnalyze = inputText.trim();
    if (!textToAnalyze || textToAnalyze.length < 5) {
      Alert.alert(
        'Message Too Short',
        'Please enter or paste at least 5 characters to analyze for potential fraud.',
        [{ text: 'OK' }],
      );
      return;
    }

    setStep('ANALYZING');

    try {
      const result = await checkMessageForFraud(textToAnalyze);
      setCheckResult(result);
      setStep('RESULT');

      if (onScanComplete) {
        onScanComplete(result);
      }
    } catch (err: any) {
      console.error('[FraudShield Checker] Check error:', err);
      setCheckResult({
        state: 'ERROR',
        riskScore: 0,
        scorePercentage: 0,
        title: 'Unable to check this message',
        summary:
          'A system error occurred during analysis. Please verify your connection and try again.',
        reasons: [],
        cached: false,
        hasUrl: false,
        analyzedText: textToAnalyze,
        error: err?.message || 'Unexpected failure',
      });
      setStep('RESULT');
    }
  };

  const handleReset = () => {
    setInputText('');
    setSelectedImageUri(null);
    setCheckResult(null);
    setOcrError(null);
    setStep('INPUT');
  };

  const handlePasteHelper = () => {
    // If input is empty, load a sample or focus
    if (!inputText) {
      setInputText(
        'URGENT: Your State Bank account is temporarily locked due to failed KYC. Click http://sbi-kyc-update.xyz/verify immediately to avoid suspension. Do not share your OTP.',
      );
    } else {
      textInputRef.current?.focus();
    }
  };

  const handleLoadSample = (type: 'scam' | 'safe') => {
    if (type === 'scam') {
      setInputText(
        'URGENT: Your bank account has been locked due to suspicious activity. Verify your KYC immediately at http://secure-banking-alert.xyz/verify to avoid permanent suspension. Do not share your OTP with anyone.',
      );
    } else {
      setInputText(
        'Hi, your package order #48291 has been dispatched and will arrive tomorrow via standard delivery. Thank you for shopping with us!',
      );
    }
    setStep('INPUT');
  };

  const handleExplainDetection = () => {
    if (!checkResult) return;
    const isThreat = checkResult.riskScore >= 0.70;
    const isSuspicious = !isThreat && checkResult.riskScore >= 0.40;

    navigation.navigate('AssistantChat', {
      mode: 'detection_explanation',
      detectionContext: {
        detectionId: `scan_${Date.now()}`,
        source: selectedImageUri ? 'OCR' : 'MANUAL_CHECK',
        classification: isThreat ? 'FRAUD' : isSuspicious ? 'SUSPICIOUS' : 'LEGITIMATE',
        riskScore: checkResult.riskScore,
        reasons: checkResult.reasons || [],
        safePreview: checkResult.analyzedText
          ? checkResult.analyzedText.substring(0, 80)
          : '',
      },
      initialPrompt: isThreat
        ? 'Why was this message flagged as a threat and what signs indicate fraud?'
        : 'Can you explain the safety assessment of this message?',
    });
  };

  const canCheck =
    inputText.trim().length >= 5 &&
    step !== 'ANALYZING' &&
    step !== 'OCR_READING';

  return (
    <View style={styles.sectionContainer}>
      {/* ─── Header Section ────────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <View style={styles.headerIconWrapper}>
          <Icon name="Scan" size={22} color={Colors.secondary} strokeWidth={2.4} />
        </View>
        <View style={styles.headerTextGroup}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.heading}>AI Message Scanner</Text>
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>NLP + URL</Text>
            </View>
          </View>
          <Text style={styles.subheading}>
            Inspect SMS, WhatsApp texts, OTP phishing & on-screen screenshot OCR.
          </Text>
        </View>
      </View>

      {/* ─── Mode Selector Tabs ────────────────────────────────────── */}
      {step === 'INPUT' && (
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'text' && styles.modeTabActive]}
            onPress={() => setActiveTab('text')}
            activeOpacity={0.8}>
            <Icon
              name="FileText"
              size={15}
              color={activeTab === 'text' ? Colors.secondary : Colors.textTertiary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.modeTabText,
                activeTab === 'text' && styles.modeTabTextActive,
              ]}>
              Text / SMS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'image' && styles.modeTabActive]}
            onPress={() => {
              setActiveTab('image');
              if (!selectedImageUri) handlePickScreenshot();
            }}
            activeOpacity={0.8}>
            <Icon
              name="Image"
              size={15}
              color={activeTab === 'image' ? Colors.secondary : Colors.textTertiary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.modeTabText,
                activeTab === 'image' && styles.modeTabTextActive,
              ]}>
              Screenshot OCR
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Input & Review Body ───────────────────────────────────── */}
      {(step === 'INPUT' || step === 'OCR_REVIEW') && (
        <View style={styles.contentBody}>
          {/* OCR Review Header Banner */}
          {step === 'OCR_REVIEW' && (
            <View style={styles.reviewBanner}>
              <View style={styles.reviewBannerHeader}>
                <View style={styles.reviewBadge}>
                  <Icon name="FileText" size={13} color={Colors.secondary} strokeWidth={2.2} />
                  <Text style={styles.reviewBadgeText}>OCR Extracted Text</Text>
                </View>
                <TouchableOpacity
                  onPress={handlePickScreenshot}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.replaceImageBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Replace screenshot">
                  <Icon name="RefreshCw" size={13} color={Colors.secondary} strokeWidth={2} />
                  <Text style={styles.replaceImageText}>Replace Image</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.reviewTip}>
                Review or correct any misread digits, links, or bank names before running AI check.
              </Text>
            </View>
          )}

          {/* Screenshot Preview Card */}
          {selectedImageUri && (
            <View style={styles.imagePreviewRow}>
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.imageThumbnail}
                resizeMode="cover"
                accessibilityLabel="Selected screenshot thumbnail"
              />
              <View style={styles.imageDetailsCol}>
                <Text style={styles.imageTitle} numberOfLines={1}>
                  Screenshot attached
                </Text>
                <Text style={styles.imageSubtitle}>Text extracted via on-device OCR</Text>
              </View>
              <TouchableOpacity
                onPress={handleRemoveImage}
                style={styles.imageRemoveBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove attached screenshot"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="Trash2" size={16} color={Colors.error} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          )}

          {/* Large Multiline Message Input Box */}
          <View
            style={[
              styles.inputBox,
              isInputFocused && styles.inputBoxFocused,
              Boolean(ocrError) && styles.inputBoxError,
            ]}>
            {/* Input Header Toolbar */}
            <View style={styles.inputToolbar}>
              <Text style={styles.inputToolbarTitle}>MESSAGE CONTENT</Text>
              <View style={styles.toolbarActions}>
                <TouchableOpacity
                  style={styles.toolbarBtn}
                  onPress={handlePasteHelper}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Icon name="Sparkles" size={13} color={Colors.secondary} style={{ marginRight: 4 }} />
                  <Text style={styles.toolbarBtnText}>
                    {inputText ? 'Edit' : 'Sample / Paste'}
                  </Text>
                </TouchableOpacity>

                {inputText.length > 0 && (
                  <TouchableOpacity
                    style={styles.toolbarBtn}
                    onPress={() => setInputText('')}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Icon name="X" size={13} color={Colors.textTertiary} style={{ marginRight: 3 }} />
                    <Text style={styles.toolbarBtnTextMuted}>Clear</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TextInput
              ref={textInputRef}
              style={styles.textInput}
              multiline
              textAlignVertical="top"
              placeholder="Paste or type suspicious message payload here..."
              placeholderTextColor={Colors.placeholder}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Suspicious message text input"
            />

            {/* Input Footer */}
            <View style={styles.inputFooter}>
              <Text style={styles.charCount}>{inputText.length} characters</Text>
              <Text style={styles.securityHint}>Zero PII retained on-device</Text>
            </View>
          </View>

          {/* Screenshot Upload Card (if in image tab and no image attached) */}
          {activeTab === 'image' && !selectedImageUri && (
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={handlePickScreenshot}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Upload screenshot for OCR">
              <View style={styles.uploadIconCircle}>
                <Icon name="Upload" size={20} color={Colors.secondary} strokeWidth={2.2} />
              </View>
              <View style={styles.uploadTextContainer}>
                <Text style={styles.uploadTitle}>Choose Screenshot from Gallery</Text>
                <Text style={styles.uploadSubtitle}>
                  Automatic on-device OCR extracts text from bank SMS & WhatsApp previews
                </Text>
              </View>
              <Icon name="ChevronRight" size={18} color={Colors.textTertiary} strokeWidth={2} />
            </TouchableOpacity>
          )}

          {/* Primary Action Button: "Scan Threat with AI" */}
          <TouchableOpacity
            style={[
              styles.primaryCheckBtn,
              !canCheck && styles.primaryCheckBtnDisabled,
            ]}
            onPress={handleRunFraudCheck}
            disabled={!canCheck}
            activeOpacity={0.88}
            accessibilityRole="button"
            accessibilityLabel="Scan Threat with AI">
            <Icon name="Shield" size={18} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 8 }} />
            <Text style={styles.primaryCheckBtnText}>
              {step === 'OCR_REVIEW' ? 'ANALYZE EXTRACTED TEXT' : 'SCAN THREAT WITH AI'}
            </Text>
          </TouchableOpacity>

          {/* Quick test helpers */}
          <View style={styles.sampleRow}>
            <Text style={styles.samplePrefix}>Quick samples:</Text>
            <TouchableOpacity
              onPress={() => handleLoadSample('scam')}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
              <Text style={styles.sampleLinkScam}>Bank KYC Scam</Text>
            </TouchableOpacity>
            <Text style={styles.sampleDot}>•</Text>
            <TouchableOpacity
              onPress={() => handleLoadSample('safe')}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
              <Text style={styles.sampleLinkSafe}>Legitimate Delivery</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ─── State 2: OCR LOADING STATE ─────────────────────────────── */}
      {step === 'OCR_READING' && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingRadarCircle}>
            <Icon name="Scan" size={32} color={Colors.secondary} strokeWidth={2.4} />
          </View>
          <Text style={styles.loadingTitle}>Scanning Screenshot...</Text>
          <Text style={styles.loadingSubtitle}>
            Extracting text tokens on-device. Image data remains 100% confidential.
          </Text>
        </View>
      )}

      {/* ─── State 4: FRAUD ANALYSIS LOADING STATE ──────────────────── */}
      {step === 'ANALYZING' && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingRadarCircle}>
            <Icon name="Shield" size={32} color={Colors.primary} strokeWidth={2.4} />
          </View>
          <Text style={styles.loadingTitle}>Evaluating Threat Vectors...</Text>
          <Text style={styles.loadingSubtitle}>
            Running DistilBERT deep linguistic analysis & URL spoof verification...
          </Text>
        </View>
      )}

      {/* ─── State 5: PREMIUM RESULT STATE ──────────────────────────── */}
      {step === 'RESULT' && checkResult && (
        <View style={styles.resultContainer}>
          {(() => {
            const isFraud = checkResult.state === 'POTENTIAL_FRAUD';
            const isSafe = checkResult.state === 'LIKELY_SAFE';
            const isSuspicious = !isFraud && !isSafe && checkResult.riskScore >= 0.40;

            const bannerStyle = isFraud
              ? styles.bannerFraud
              : isSuspicious
              ? styles.bannerSuspicious
              : styles.bannerSafe;

            const iconName = isFraud
              ? 'AlertTriangle'
              : isSuspicious
              ? 'AlertCircle'
              : 'ShieldCheck';

            const iconColor = isFraud
              ? Colors.error
              : isSuspicious
              ? Colors.warning
              : Colors.success;

            const riskText = isFraud
              ? 'HIGH FRAUD THREAT'
              : isSuspicious
              ? 'SUSPICIOUS ACTIVITY'
              : 'VERIFIED LOW RISK';

            return (
              <View style={[styles.resultBanner, bannerStyle, Shadows.card]}>
                {/* Status Header */}
                <View style={styles.resultHeaderRow}>
                  <View
                    style={[
                      styles.statusIconBox,
                      {
                        backgroundColor: isFraud
                          ? 'rgba(239, 68, 68, 0.15)'
                          : isSuspicious
                          ? 'rgba(245, 158, 11, 0.15)'
                          : 'rgba(34, 197, 94, 0.15)',
                        borderColor: isFraud
                          ? 'rgba(239, 68, 68, 0.35)'
                          : isSuspicious
                          ? 'rgba(245, 158, 11, 0.35)'
                          : 'rgba(34, 197, 94, 0.35)',
                      },
                    ]}>
                    <Icon name={iconName} size={24} color={iconColor} strokeWidth={2.5} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <View style={styles.verdictBadgeRow}>
                      <Text
                        style={[
                          styles.resultVerdictTitle,
                          { color: iconColor },
                        ]}>
                        {checkResult.title}
                      </Text>
                    </View>
                    <Text style={styles.resultSummary}>{checkResult.summary}</Text>
                  </View>
                </View>

                {/* Risk Score Progress Bar & Percentage */}
                <View style={styles.riskMeterSection}>
                  <View style={styles.riskMeterTop}>
                    <Text style={styles.riskMeterLabel}>AI THREAT CONFIDENCE</Text>
                    <Text style={[styles.riskMeterValue, { color: iconColor }]}>
                      {checkResult.scorePercentage}% RISK
                    </Text>
                  </View>
                  <View style={styles.riskTrack}>
                    <View
                      style={[
                        styles.riskFill,
                        {
                          width: `${Math.max(checkResult.scorePercentage, 6)}%`,
                          backgroundColor: iconColor,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Key Indicators / Reasons Breakdown */}
                {checkResult.reasons && checkResult.reasons.length > 0 && (
                  <View style={styles.reasonsBox}>
                    <Text style={styles.reasonsHeader}>SUSPICIOUS INDICATORS IDENTIFIED:</Text>
                    {checkResult.reasons.map((reason, idx) => (
                      <View key={`reason-${idx}`} style={styles.reasonItemRow}>
                        <Icon name="AlertCircle" size={13} color={iconColor} style={{ marginRight: 8, marginTop: 2 }} />
                        <Text style={styles.reasonText}>{reason}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Safe Advice Box */}
                {isSafe && (
                  <View style={styles.safeNoticeBox}>
                    <Icon name="Info" size={14} color={Colors.success} strokeWidth={2} style={{ marginRight: 8 }} />
                    <Text style={styles.safeNoticeText}>
                      Probabilistic evaluation indicates genuine syntax. Remember never to disclose PINs or OTPs.
                    </Text>
                  </View>
                )}
              </View>
            );
          })()}

          {/* Analyzed Message Preview Card */}
          <View style={styles.analyzedMessageBox}>
            <Text style={styles.analyzedMessageLabel}>SCANNED PAYLOAD:</Text>
            <Text style={styles.analyzedMessageContent} numberOfLines={4}>
              "{checkResult.analyzedText}"
            </Text>
          </View>

          {/* Action Buttons: Consult AI Assistant & Scan Again */}
          <View style={styles.resultActionsRow}>
            <TouchableOpacity
              style={styles.assistantBtn}
              onPress={handleExplainDetection}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Ask AI Assistant to Explain">
              <Icon name="Bot" size={17} color="#FFFFFF" strokeWidth={2.4} style={{ marginRight: 8 }} />
              <Text style={styles.assistantBtnText}>EXPLAIN WITH AI ASSISTANT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.scanAgainBtn}
              onPress={handleReset}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Scan another message">
              <Icon name="RefreshCw" size={16} color={Colors.textSecondary} strokeWidth={2.2} style={{ marginRight: 6 }} />
              <Text style={styles.scanAgainBtnText}>Scan Another Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  aiBadge: {
    backgroundColor: 'rgba(0, 123, 167, 0.15)',
    borderColor: 'rgba(0, 123, 167, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
  },

  // Mode Selector Tabs
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#0B132B',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  modeTabActive: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
  },
  modeTabTextActive: {
    color: Colors.secondary,
    fontWeight: '700',
  },

  contentBody: {
    gap: 12,
  },

  // OCR Review Banner
  reviewBanner: {
    backgroundColor: 'rgba(0, 123, 167, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 167, 0.25)',
    padding: 12,
  },
  reviewBannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.secondary,
  },
  replaceImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replaceImageText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
  },
  reviewTip: {
    fontSize: 11,
    lineHeight: 16,
    color: Colors.textSecondary,
  },

  // Image Preview Row
  imagePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#0B132B',
    marginRight: 10,
  },
  imageDetailsCol: {
    flex: 1,
  },
  imageTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  imageSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  imageRemoveBtn: {
    padding: 8,
  },

  // Input Box
  inputBox: {
    backgroundColor: '#0B132B',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: Colors.border,
    padding: 14,
  },
  inputBoxFocused: {
    borderColor: Colors.secondary,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  inputBoxError: {
    borderColor: Colors.error,
  },
  inputToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 240, 255, 0.18)',
    marginBottom: 8,
  },
  inputToolbarTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toolbarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.secondary,
  },
  toolbarBtnTextMuted: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
  },
  textInput: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textPrimary,
    minHeight: 120,
    paddingVertical: 0,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 240, 255, 0.18)',
    marginTop: 8,
  },
  charCount: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  securityHint: {
    fontSize: 10,
    color: Colors.textTertiary,
  },

  // Upload Card
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  uploadTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    lineHeight: 15,
  },

  // Primary Check Button
  primaryCheckBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
    marginTop: 4,
  },
  primaryCheckBtnDisabled: {
    opacity: 0.5,
  },
  primaryCheckBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Samples
  sampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  samplePrefix: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  sampleLinkScam: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  sampleLinkSafe: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16A34A',
  },
  sampleDot: {
    color: Colors.textTertiary,
  },

  // Loading State
  loadingContainer: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingRadarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0B132B',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 240, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  loadingSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Result Card Container
  resultContainer: {
    gap: 12,
  },
  resultBanner: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.2,
  },
  bannerFraud: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  bannerSuspicious: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  bannerSafe: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  resultHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  statusIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  verdictBadgeRow: {
    marginBottom: 3,
  },
  resultVerdictTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  resultSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textSecondary,
  },

  // Risk Meter
  riskMeterSection: {
    backgroundColor: '#0B132B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  riskMeterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskMeterLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
  },
  riskMeterValue: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  riskTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 240, 255, 0.18)',
    overflow: 'hidden',
  },
  riskFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Reasons Box
  reasonsBox: {
    backgroundColor: '#0B132B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  reasonsHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  reasonItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 5,
  },
  reasonText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textPrimary,
  },

  safeNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    marginTop: 4,
  },
  safeNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#16A34A',
  },

  analyzedMessageBox: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  analyzedMessageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  analyzedMessageContent: {
    fontSize: 13,
    lineHeight: 19,
    color: Colors.textPrimary,
    fontStyle: 'italic',
  },

  resultActionsRow: {
    gap: 10,
    marginTop: 4,
  },
  assistantBtn: {
    backgroundColor: '#000000',
    borderRadius: 14,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.4)',
  },
  assistantBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  scanAgainBtn: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  scanAgainBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MessageFraudChecker;
