import { colors } from './colors';

export const theme = {
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: colors.primary,
    text: '#000000',
    textSecondary: '#666666',
    border: '#E0E0E0',
  },
  dark: {
    background: colors.background,
    surface: colors.surface,
    primary: colors.primary,
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
