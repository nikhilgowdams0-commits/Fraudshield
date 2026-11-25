/**
 * FraudShield Cybersecurity Design System — Color Palette
 *
 * Premium futuristic cybersecurity aesthetic:
 * Jet Black backgrounds, Cerulean Blue primary accent,
 * Neon Rose AI highlights, controlled glow effects.
 */

const Colors = {
  // Core Surfaces & Backgrounds
  background: '#0A0A0A',           // Jet Black — main background
  backgroundSecondary: '#101014',   // Slightly elevated dark
  surface: '#14141A',              // Card background
  card: '#14141A',                 // Card background
  cardElevated: '#1B1B24',         // Elevated surface
  surfaceSecondary: '#111116',     // Recessed surfaces / input backgrounds
  surfaceTertiary: '#1E1E28',      // Highlighted containers
  surfaceHover: '#1A1A24',

  // Primary Brand — Cerulean Blue
  primary: '#007BA7',              // Cerulean Blue primary accent
  primaryHover: '#006B94',
  primaryLight: '#00A0D6',
  primaryDark: '#005F80',
  primaryFaded: 'rgba(0, 123, 167, 0.15)',
  primaryBorder: 'rgba(0, 123, 167, 0.35)',

  // Secondary Accent — Neon Rose (AI Highlights)
  secondary: '#FF2D95',            // Neon Rose accent
  neonRose: '#FF2D95',             // Direct Neon Rose alias
  secondaryLight: '#FF5DAF',
  secondaryDark: '#D6207A',
  secondaryFaded: 'rgba(255, 45, 149, 0.14)',
  secondaryBorder: 'rgba(255, 45, 149, 0.35)',

  // Semantic: Success / Safe
  success: '#20D98A',
  successDark: '#18B874',
  successLight: 'rgba(32, 217, 138, 0.14)',
  successBorder: 'rgba(32, 217, 138, 0.35)',

  // Semantic: Warning / Suspicious
  warning: '#F5A623',
  warningDark: '#D68F1D',
  warningLight: 'rgba(245, 166, 35, 0.14)',
  warningBorder: 'rgba(245, 166, 35, 0.35)',

  // Semantic: Danger / Fraud / Threat
  error: '#FF4545',
  danger: '#FF4545',
  errorDark: '#E03030',
  errorLight: 'rgba(255, 69, 69, 0.15)',
  errorBorder: 'rgba(255, 69, 69, 0.4)',

  // Semantic: Info
  info: '#007BA7',
  infoDark: '#005F80',
  infoLight: 'rgba(0, 123, 167, 0.14)',
  infoBorder: 'rgba(0, 123, 167, 0.35)',

  // Borders & Dividers
  border: '#1E1E28',
  borderLight: '#1A1A24',
  borderFocus: '#007BA7',
  borderCyanFocus: '#007BA7',
  divider: '#1E1E28',

  // Text Hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#636370',
  textMuted: '#4A4A55',
  textInverse: '#0A0A0A',
  textLink: '#007BA7',
  textCyan: '#007BA7',

  // Neon Rose text
  textNeonRose: '#FF2D95',

  // Glowing & Atmospheric Effects
  glowPrimary: 'rgba(0, 123, 167, 0.3)',
  glowCyan: 'rgba(0, 123, 167, 0.3)',
  glowNeonRose: 'rgba(255, 45, 149, 0.3)',
  glowSuccess: 'rgba(32, 217, 138, 0.25)',
  glowDanger: 'rgba(255, 69, 69, 0.28)',

  // Utility
  white: '#FFFFFF',
  overlay: 'rgba(10, 10, 10, 0.75)',
  shadow: 'rgba(0, 0, 0, 0.5)',
  disabled: '#4A4A55',
  disabledBackground: '#111116',
  placeholder: '#636370',

  // Deterministic Avatar Colors
  avatarColors: [
    '#007BA7', '#FF2D95', '#8B5CF6', '#20D98A',
    '#F5A623', '#00A0D6', '#6366F1', '#EC4899',
  ],

  // Glassmorphism
  glass: 'rgba(20, 20, 26, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',
};

export default Colors;
