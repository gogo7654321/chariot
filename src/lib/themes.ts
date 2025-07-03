
import { type CustomTheme, type ThemeVariant } from '@/contexts/AppearanceContext';
import { mix } from 'polished';
import { isColorDark } from './colorUtils';

export type PresetColorDefinition = {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    muted: string;
    border: string;
    input: string;
    ring: string;
    primaryGradientStart?: string;
    primaryGradientEnd?: string;
    mutedForeground?: string;
};

export type Preset = {
    id: string;
    name: string;
    category: 'Light' | 'Dark' | 'Gaming' | 'Seasonal';
    variants?: ThemeVariant[];
    colors: PresetColorDefinition;
};

export const THEME_PRESETS: Preset[] = [
  // 🌸 LIGHT THEMES
  {
    id: 'pastel-soft',
    name: '🌸 Pastel Soft',
    category: 'Light',
    colors: {
      background: '#fff8f5',
      foreground: '#6b4e3d',
      primary: '#ffb6c1',
      secondary: '#ffeef2',
      accent: '#98d8c8',
      card: '#ffffff',
      muted: '#ffeef2',
      border: '#f7c2cc',
      input: '#ffeef2',
      ring: '#ffb6c1',
    },
  },
  {
    id: 'cloudy-cocoa',
    name: '☁️ Cloudy Cocoa',
    category: 'Light',
    colors: {
      background: '#917156',
      foreground: '#2b1c1c',
      primary: '#5a3b2e',
      secondary: '#7e5c45',
      accent: '#4b3621',
      card: '#a88a72',
      muted: '#7b5c49',
      border: '#5a3b2e',
      input: '#7c5f4a',
      ring: '#4b3621',
    },
  },
  {
    id: 'matcha-study',
    name: '🍵 Matcha Study',
    category: 'Light',
    colors: {
      background: '#e0f2e9',
      foreground: '#1b4332',
      primary: '#95d5b2',
      secondary: '#b7e4c7',
      accent: '#74c69d',
      card: '#ffffff',
      muted: '#cfe7d6',
      border: '#a3cbb3',
      input: '#bce0cd',
      ring: '#95d5b2',
    },
  },
  
  // 🌙 DARK THEMES
  {
    id: 'cosmic-grape',
    name: '🍇 Cosmic Grape',
    category: 'Dark',
    colors: {
      background: '#231942',
      foreground: '#f1f1f1',
      primary: '#be95c4',
      secondary: '#5e548e',
      accent: '#9f86c0',
      card: '#2c2250',
      muted: '#3c316f',
      border: '#4a3d8a',
      input: '#3c316f',
      ring: '#be95c4',
    },
  },
  {
    id: 'obsidian-mind',
    name: '🪨 Obsidian Mind',
    category: 'Dark',
    colors: {
        primaryGradientStart: '#0a0a0a',
        primaryGradientEnd: '#0a0a0a',
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        primary: '#e5e5e5',
        secondary: '#111111',
        accent: '#555555',
        card: '#1a1a1a',
        muted: '#555555',
        border: '#2e2e2e',
        input: '#2a2a2a',
        ring: '#e5e5e5',
    },
  },

  // 🕹️ GAMING THEMES
  {
    id: 'starry-night',
    name: '✨ Starry Night',
    category: 'Gaming',
    colors: { // Base/Classic variant colors
      primaryGradientStart: '#000000',
      primaryGradientEnd: '#142b44',
      background: '#152238',
      foreground: '#FFFFFF',
      primary: '#89ddff',
      secondary: '#191919',
      accent: '#e1adff',
      card: '#152238',
      muted: '#ADB5BD',
      border: '#30363d',
      input: '#191919',
      ring: '#89ddff',
    },
    variants: [
      {
        id: 'classic',
        name: 'Classic',
        colors: {
          primaryGradientStart: '#000000',
          primaryGradientEnd: '#142b44',
          background: '#152238',
          foreground: '#FFFFFF',
          primary: '#89ddff',
          secondary: '#191919',
          accent: '#e1adff',
          card: '#152238',
          muted: '#ADB5BD',
          border: '#30363d',
          input: '#191919',
          ring: '#89ddff',
        }
      },
      {
        id: 'cotton-candy',
        name: '🍭 Cotton Candy Sky',
        colors: {
          primaryGradientStart: '#ff71b2',
          primaryGradientEnd: '#509be1',
          background: '#9f45b0',
          foreground: '#ffffff',
          primary: '#d3e9ff',
          secondary: '#a763b6',
          accent: '#7f78be',
          card: '#9f45b0',
          muted: '#fff4f4',
          border: '#a763b6',
          input: '#a763b6',
          ring: '#d3e9ff',
        },
      },
      {
        id: 'forest',
        name: '🌲 Forest Night',
        colors: {
          primaryGradientStart: '#000000',
          primaryGradientEnd: '#14442b',
          background: '#011502',
          foreground: '#ffffff',
          primary: '#c4c6ff',
          secondary: '#191919',
          accent: '#77be80',
          card: '#011502',
          muted: '#adb5bd',
          border: '#191919',
          input: '#191919',
          ring: '#c4c6ff',
        },
      },
      {
        id: 'galaxy',
        name: '🔮 Galaxy Dream',
        colors: {
          primaryGradientStart: '#00076f',
          primaryGradientEnd: '#b133c9',
          background: '#9f45b0',
          foreground: '#ffe4f2',
          primary: '#fff3c4',
          secondary: '#9d00ff',
          accent: '#9d00ff',
          card: '#9f45b0',
          muted: '#ffffff',
          border: '#9d00ff',
          input: '#9d00ff',
          ring: '#fff3c4',
        },
      },
      {
        id: 'sunrise',
        name: '🌅 Sunrise Fade',
        colors: {
          primaryGradientStart: '#FFAE41',
          primaryGradientEnd: '#F83D41',
          background: '#C49C48',
          foreground: '#FFFFFF',
          primary: '#FFF3C4',
          secondary: '#191919',
          accent: '#C49C48',
          card: '#C49C48',
          muted: '#E0E0E0',
          border: '#C49C48',
          input: '#C49C48',
          ring: '#FFF3C4',
        },
      },
    ]
  },
  {
    id: 'vaporwave-dream',
    name: '🕹️ Vaporwave Dream',
    category: 'Gaming',
    colors: {
      background: '#1a1a2e',
      foreground: '#e6e6fa',
      primary: '#ff79c6',
      secondary: '#282a36',
      accent: '#8be9fd',
      card: '#282a36',
      muted: '#44475a',
      border: '#44475a',
      input: '#44475a',
      ring: '#ff79c6',
    },
  },

  // 🍂 SEASONAL THEMES
  {
    id: 'pumpkin-spice',
    name: '🎃 Pumpkin Spice',
    category: 'Seasonal',
    colors: {
      background: '#2e1a1b',
      foreground: '#ffdab9',
      primary: '#ff7518',
      secondary: '#3c2f2f',
      accent: '#800080',
      card: '#3c2f2f',
      muted: '#4a3c3c',
      border: '#5c4a4a',
      input: '#4a3c3c',
      ring: '#ff7518',
    },
  },
  {
    id: 'frostbite-winter',
    name: '❄️ Frostbite Winter',
    category: 'Seasonal',
    colors: {
      background: '#e0f7fa',
      foreground: '#004d40',
      primary: '#81d4fa',
      secondary: '#b2ebf2',
      accent: '#00bcd4',
      card: '#ffffff',
      muted: '#d0f0f3',
      border: '#a2d9e4',
      input: '#c9f2f9',
      ring: '#81d4fa',
    },
  }
];

/**
 * Creates a full theme object from a base preset.
 * This version uses the detailed properties from the preset and calculates
 * foreground colors to ensure text readability.
 * @param preset - The base preset containing detailed color definitions.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: Preset): CustomTheme {
  const { colors } = preset;

  const fullColors: CustomTheme['colors'] = {
    primaryGradientStart: colors.primaryGradientStart || colors.background,
    primaryGradientEnd: colors.primaryGradientEnd || mix(0.2, '#000000', colors.background),

    background: colors.background,
    foreground: colors.foreground,

    card: colors.card,
    cardForeground: colors.foreground,

    popover: colors.secondary,
    popoverForeground: colors.foreground,

    primary: colors.primary,
    primaryForeground: isColorDark(colors.primary) ? '#f5f5f5' : '#111827',

    secondary: colors.secondary,
    secondaryForeground: isColorDark(colors.secondary)
      ? colors.foreground
      : mix(0.8, colors.foreground, colors.secondary),

    muted: colors.muted,
    mutedForeground: colors.mutedForeground || mix(0.5, colors.foreground, colors.muted),

    accent: colors.accent,
    accentForeground: isColorDark(colors.accent) ? '#FFFFFF' : '#111827',

    border: colors.border,
    input: colors.input,
    ring: colors.ring,
  };

  return {
    id: preset.id,
    name: preset.name,
    variants: preset.variants,
    selectedVariantId: preset.variants ? preset.variants[0].id : undefined,
    colors: fullColors,
  };
}
