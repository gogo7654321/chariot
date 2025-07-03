
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { darken, lighten } from 'polished';

type PresetColorDefinition = {
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    primaryForeground: string;
    secondaryForeground: string;
};

type Preset = {
    id: string;
    name: string;
    colors: PresetColorDefinition;
};

export const THEME_PRESETS: Preset[] = [
  // --- DARK THEMES ---
  {
    id: 'aurora-borealis',
    name: '🌌 Aurora Borealis',
    colors: {
      primary: '#8A2BE2', // BlueViolet
      secondary: '#1A1A2D', // Dark Slate Blue
      background: '#0D0D1A', // Very Dark Blue
      accent: '#00BFFF', // DeepSkyBlue
      foreground: '#E0E0E0',
      card: '#1A1A2D',
      cardForeground: '#E0E0E0',
      popover: '#1A1A2D',
      popoverForeground: '#E0E0E0',
      muted: '#2A2A4D',
      mutedForeground: '#A0A0C0',
      accentForeground: '#FFFFFF',
      border: '#2A2A4D',
      input: '#2A2A4D',
      ring: '#00BFFF',
      primaryForeground: '#FFFFFF',
      secondaryForeground: '#E0E0E0',
    },
  },
  {
    id: 'psychedelic-planet',
    name: '🪐 Psychedelic Planet',
    colors: {
        primary: '#FF00FF', // Magenta
        secondary: '#1A001A', // Dark Magenta
        background: '#000000', // Black
        accent: '#00FFFF', // Cyan/Aqua
        foreground: '#F0F0F0',
        card: '#1A001A',
        cardForeground: '#F0F0F0',
        popover: '#1A001A',
        popoverForeground: '#F0F0F0',
        muted: '#330033',
        mutedForeground: '#CC00CC',
        accentForeground: '#000000',
        border: '#330033',
        input: '#330033',
        ring: '#00FFFF',
        primaryForeground: '#FFFFFF',
        secondaryForeground: '#F0F0F0'
    }
  },
  {
    id: 'sunset-heat',
    name: '🌅 Sunset Heat',
    colors: {
      primary: '#FF4500', // OrangeRed
      secondary: '#2B1200',
      background: '#1A0A00',
      accent: '#FFD700', // Gold
      foreground: '#FFDAB9', // PeachPuff
      card: '#2B1200',
      cardForeground: '#FFDAB9',
      popover: '#2B1200',
      popoverForeground: '#FFDAB9',
      muted: '#452A00',
      mutedForeground: '#FFA500', // Orange
      accentForeground: '#000000',
      border: '#452A00',
      input: '#452A00',
      ring: '#FFD700',
      primaryForeground: '#FFFFFF',
      secondaryForeground: '#FFDAB9',
    },
  },
  {
    id: 'golden-hour',
    name: '🌇 Golden Hour',
    colors: {
      primary: '#FFD700', // Gold
      secondary: '#2C3E50', // Dark Slate Blue
      background: '#1A2430',
      accent: '#E67E22', // Carrot Orange
      foreground: '#ECF0F1',
      card: '#2C3E50',
      cardForeground: '#ECF0F1',
      popover: '#2C3E50',
      popoverForeground: '#ECF0F1',
      muted: '#34495E',
      mutedForeground: '#BDC3C7',
      accentForeground: '#FFFFFF',
      border: '#34495E',
      input: '#34495E',
      ring: '#FFD700',
      primaryForeground: '#1A2430',
      secondaryForeground: '#ECF0F1',
    },
  },
  {
    id: 'vaporwave',
    name: '🌴 Vaporwave',
    colors: {
        primary: '#FF00C1', // Neon Pink
        secondary: '#2C003E',
        background: '#1A0024',
        accent: '#00F2FF', // Bright Cyan
        foreground: '#D4D4D8',
        card: '#2C003E',
        cardForeground: '#D4D4D8',
        popover: '#2C003E',
        popoverForeground: '#D4D4D8',
        muted: '#3E005A',
        mutedForeground: '#A559C8',
        accentForeground: '#000000',
        border: '#3E005A',
        input: '#3E005A',
        ring: '#00F2FF',
        primaryForeground: '#FFFFFF',
        secondaryForeground: '#D4D4D8'
    }
  },
  {
    id: 'starlight-void',
    name: '✨ Starlight Void',
    colors: {
      primary: '#9B59B6', // Amethyst
      secondary: '#2C3A47',
      background: '#1C2833',
      accent: '#3498DB', // Peter River Blue
      foreground: '#F2F2F2',
      card: '#2C3A47',
      cardForeground: '#F2F2F2',
      popover: '#2C3A47',
      popoverForeground: '#F2F2F2',
      muted: '#34495E',
      mutedForeground: '#95A5A6',
      accentForeground: '#FFFFFF',
      border: '#34495E',
      input: '#34495E',
      ring: '#3498DB',
      primaryForeground: '#FFFFFF',
      secondaryForeground: '#F2F2F2',
    },
  },
   {
    id: 'cosmic-grape',
    name: '🍇 Cosmic Grape',
    colors: {
      primary: '#6A0DAD', // Grape
      secondary: '#240030',
      background: '#120018',
      accent: '#FF00FF', // Magenta
      foreground: '#E6E6FA', // Lavender
      card: '#240030',
      cardForeground: '#E6E6FA',
      popover: '#240030',
      popoverForeground: '#E6E6FA',
      muted: '#360048',
      mutedForeground: '#C080FF',
      accentForeground: '#FFFFFF',
      border: '#360048',
      input: '#360048',
      ring: '#FF00FF',
      primaryForeground: '#FFFFFF',
      secondaryForeground: '#E6E6FA',
    },
  },
  {
    id: 'obsidian-mind',
    name: '🪨 Obsidian Mind',
    colors: {
      primary: '#444444',
      secondary: '#111111',
      background: '#0a0a0a',
      accent: '#2e2e2e',
      foreground: '#f5f5f5',
      card: '#1a1a1a',
      cardForeground: '#f5f5f5',
      popover: '#1a1a1a',
      popoverForeground: '#f5f5f5',
      muted: '#222222',
      mutedForeground: '#b8b8b8',
      accentForeground: '#f5f5f5',
      border: '#2e2e2e',
      input: '#2a2a2a',
      ring: '#444444',
      primaryForeground: '#f5f5f5',
      secondaryForeground: '#f5f5f5',
    },
  },

  // --- LIGHT THEMES ---
  {
    id: 'arctic-drift',
    name: '🧊 Arctic Drift',
    colors: {
      primary: '#2980B9', // Belize Hole Blue
      secondary: '#EAF2F8',
      background: '#F8F9F9',
      accent: '#3498DB', // Peter River Blue
      foreground: '#2C3E50', // Wet Asphalt
      card: '#FFFFFF',
      cardForeground: '#2C3E50',
      popover: '#FFFFFF',
      popoverForeground: '#2C3E50',
      muted: '#EAF2F8',
      mutedForeground: '#7F8C8D',
      accentForeground: '#FFFFFF',
      border: '#D6EAF8',
      input: '#EAF2F8',
      ring: '#3498DB',
      primaryForeground: '#FFFFFF',
      secondaryForeground: '#2C3E50',
    },
  },
];

export const createThemeObject = (preset: Preset): CustomTheme => {
  const { id, name, colors } = preset;
  
  // Auto-calculate gradient colors based on the primary color for a cohesive look.
  const primaryGradientStart = darken(0.05, colors.primary);
  const primaryGradientEnd = lighten(0.05, colors.primary);

  return {
    id,
    name,
    colors: {
      ...colors,
      primaryGradientStart,
      primaryGradientEnd,
    },
  };
};
