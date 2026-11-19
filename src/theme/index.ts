import { Appearance } from 'react-native';

const light = {
  bg: '#F3F7F4',
  bgElevated: '#FFFFFF',
  bgCard: '#FFFFFF',
  bgCardLight: '#EFF5F1',
  bgGlass: '#EFF5F1',
  backdrop: '#FFFFFF',

  rose: '#D23B50',
  roseDark: '#B22E42',
  roseGlow: '#FBEAEC',
  lavender: '#168253',
  lavenderDark: '#0E6941',
  lavenderGlow: '#E4F3E9',
  mint: '#24845B',
  mintGlow: '#E6F4EB',
  gold: '#946300',
  goldGlow: '#F8F0DD',
  cyan: '#26749A',

  white: '#1D2721',
  textSecondary: '#56645B',
  textMuted: '#748077',
  border: '#DFE8E1',
  borderStrong: '#C8D5CB',
  borderActive: '#168253',
  danger: '#B83243',
  dangerGlow: '#FBEAEC',
  safe: '#24845B',
  warning: '#946300',
  disabled: '#D7DBE0',
  track: '#E7E9ED',
  overlay: 'rgba(16,24,19,0.45)',

  gradPrimary: ['#168253', '#168253'] as [string, string],
  gradAurora: ['#FFFFFF', '#FFFFFF'] as [string, string],
  gradMint: ['#24845B', '#24845B'] as [string, string],
  gradDanger: ['#B83243', '#B83243'] as [string, string],
  gradDark: ['#59616B', '#59616B'] as [string, string],
};

const dark: typeof light = {
  bg: '#0E1411',
  bgElevated: '#161E1A',
  bgCard: '#18211C',
  bgCardLight: '#1F2A24',
  bgGlass: '#1F2A24',
  backdrop: '#161E1A',

  rose: '#F0697B',
  roseDark: '#D84A5E',
  roseGlow: '#3A1E24',
  lavender: '#45C389',
  lavenderDark: '#2EA06C',
  lavenderGlow: '#183327',
  mint: '#4CC58A',
  mintGlow: '#183022',
  gold: '#E2B24C',
  goldGlow: '#3A3020',
  cyan: '#62B6DD',

  white: '#E8EFEA',
  textSecondary: '#AAB7AE',
  textMuted: '#88958C',
  border: '#26322B',
  borderStrong: '#36453C',
  borderActive: '#45C389',
  danger: '#E8596C',
  dangerGlow: '#3A1E24',
  safe: '#4CC58A',
  warning: '#E2B24C',
  disabled: '#3A433E',
  track: '#2A342E',
  overlay: 'rgba(0,0,0,0.6)',

  // Filled buttons keep white labels, so their fills stay dark enough for contrast.
  gradPrimary: ['#168253', '#168253'],
  gradAurora: ['#18211C', '#18211C'],
  gradMint: ['#1F7A52', '#1F7A52'],
  gradDanger: ['#C23A4C', '#C23A4C'],
  gradDark: ['#4A525B', '#4A525B'],
};

/**
 * Picked once at launch from the system setting. Styles are built with StyleSheet.create at
 * import time, so switching appearance while the app is running applies on the next launch.
 */
export const isDark = Appearance.getColorScheme() === 'dark';
export const Colors = isDark ? dark : light;

export const Spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const Radius = { sm: 6, md: 10, lg: 14, xl: 18, full: 999 };
