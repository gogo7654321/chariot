
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { mix } from 'polished';
import { isColorDark } from './colorUtils';

type PresetColorDefinition = {
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
};

type Preset = {
    id: string;
    name: string;
    colors: PresetColorDefinition;
};

export const THEME_PRESETS: Preset[] = [
  // Dark Themes
  {
    id: 'aurora-borealis',
    name: '🌌 Aurora Borealis',
    colors: {
      background: '#0d1a26',
      foreground: '#e0f2f1',
      primary: '#8e44ad',
      secondary: '#1a2b3c',
      accent: '#2ecc71',
      card: '#1a2b3c',
      muted: '#2c3e50',
      border: '#34495e',
      input: '#2c3e50',
      ring: '#8e44ad',
    },
  },
  {
    id: 'psychedelic-planet',
    name: '🪐 Psychedelic Planet',
    colors: {
      background: '#000000',
      foreground: '#f0f0f0',
      primary: '#ff00ff',
      secondary: '#1a1a1a',
      accent: '#00ffff',
      card: '#1a1a1a',
      muted: '#2a2a2a',
      border: '#333333',
      input: '#2a2a2a',
      ring: '#00ffff',
    },
  },
  {
    id: 'obsidian-mind',
    name: '🪨 Obsidian Mind',
    colors: {
      background: '#0a0a0a',
      foreground: '#f5f5f5',
      primary: '#e5e5e5',
      secondary: '#111111',
      accent: '#555555',
      card: '#1a1a1a',
      muted: '#444444',
      border: '#2e2e2e',
      input: '#2a2a2a',
      ring: '#e5e5e5',
    },
  },
  {
    id: 'golden-hour',
    name: '🌆 Golden Hour',
    colors: {
      background: '#1a202c',
      foreground: '#e2e8f0',
      primary: '#f6e05e',
      secondary: '#2d3748',
      accent: '#f6ad55',
      card: '#2d3748',
      muted: '#4a5568',
      border: '#4a5568',
      input: '#4a5568',
      ring: '#f6e05e',
    },
  },

  // Light Themes
  {
    id: 'sunset-heat',
    name: '🔥 Sunset Heat',
    colors: {
      background: '#fff3e0',
      foreground: '#4e342e',
      primary: '#ff7043',
      secondary: '#ffe0b2',
      accent: '#ffb74d',
      card: '#ffffff',
      muted: '#ffcc80',
      border: '#ffb74d',
      input: '#ffe0b2',
      ring: '#ff7043',
    },
  },
  {
    id: 'arctic-drift',
    name: '🧊 Arctic Drift',
    colors: {
      background: '#f0f9ff',
      foreground: '#0c4a6e',
      primary: '#38bdf8',
      secondary: '#e0f2fe',
      accent: '#7dd3fc',
      card: '#ffffff',
      muted: '#e0f2fe',
      border: '#bae6fd',
      input: '#e0f2fe',
      ring: '#38bdf8',
    },
  },
  {
    id: 'vaporwave',
    name: '🌴 Vaporwave',
    colors: {
      background: '#1a1a2e',
      foreground: '#e0e0e0',
      primary: '#e94560',
      secondary: '#16213e',
      accent: '#0f3460',
      card: '#16213e',
      muted: '#2a2a4e',
      border: '#3a3a5e',
      input: '#2a2a4e',
      ring: '#e94560',
    },
  },
  {
    id: 'starlight-void',
    name: '✨ Starlight Void',
    colors: {
      background: '#1d1233',
      foreground: '#f0e8ff',
      primary: '#c780ff',
      secondary: '#2d204d',
      accent: '#5ccfe6',
      card: '#2d204d',
      muted: '#3c2d6b',
      border: '#4a3d7d',
      input: '#3c2d6b',
      ring: '#c780ff',
    },
  },
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
    primaryGradientStart: colors.background,
    primaryGradientEnd: mix(0.2, colors.primary, colors.background),

    background: colors.background,
    foreground: colors.foreground,

    card: colors.card,
    cardForeground: colors.foreground,

    popover: colors.secondary,
    popoverForeground: colors.foreground,

    primary: colors.primary,
    primaryForeground: isColorDark(colors.primary) ? '#FFFFFF' : '#111827',

    secondary: colors.secondary,
    secondaryForeground: colors.foreground,

    muted: colors.muted,
    mutedForeground: mix(0.5, colors.foreground, colors.muted),

    accent: colors.accent,
    accentForeground: isColorDark(colors.accent) ? '#FFFFFF' : '#111827',

    border: colors.border,
    input: colors.input,
    ring: colors.ring,
  };

  return {
    id: preset.id,
    name: preset.name,
    colors: fullColors,
  };
}
