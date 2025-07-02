
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
}

type Preset = {
    id: string;
    name: string;
    colors: PresetColorDefinition;
};


export const THEME_PRESETS: Preset[] = [
    {
        id: 'aurora-borealis',
        name: '🌌 Aurora Borealis',
        colors: {
            background: '#0d1b2a',
            foreground: '#e0e1dd',
            primary: '#7f5af0',
            secondary: '#16293a',
            accent: '#2cb67d',
            card: '#16293a',
            muted: '#2a3b4c',
            border: '#2a3b4c',
            input: '#2a3b4c',
            ring: '#7f5af0',
        }
    },
    {
        id: 'psychedelic-planet',
        name: '🪐 Psychedelic Planet',
        colors: {
            background: '#000000',
            foreground: '#f0f0f0',
            primary: '#ff0088',
            secondary: '#1a0024',
            accent: '#00c2ff',
            card: '#1a0024',
            muted: '#2a0d35',
            border: '#3c1f4a',
            input: '#2a0d35',
            ring: '#ff0088',
        }
    },
    {
        id: 'neo-future',
        name: '✨ Neo Future',
        colors: {
            background: '#f0fdf4', // Light green-white
            foreground: '#1e293b', // Slate grey
            primary: '#ff00ff', // Magenta
            secondary: '#dcfce7', // Lighter green
            accent: '#00f5d4', // Bright cyan
            card: '#ffffff',
            muted: '#f0fdf4',
            border: '#d1fae5',
            input: '#d1fae5',
            ring: '#ff00ff',
        }
    },
    {
        id: 'vaporwave',
        name: '🩵 Vaporwave',
        colors: {
            background: '#2d3436',
            foreground: '#fdf4ff',
            primary: '#00e5ff',
            secondary: '#4834d4',
            accent: '#ff77cc',
            card: '#3b3f46',
            muted: '#52565e',
            border: '#52565e',
            input: '#52565e',
            ring: '#00e5ff',
        }
    },
    {
        id: 'sunset-heat',
        name: '🌅 Sunset Heat',
        colors: {
            background: '#fff2f0',
            foreground: '#5a2a27',
            primary: '#ff6b35',
            secondary: '#ffe8e2',
            accent: '#f7931e',
            card: '#ffffff',
            muted: '#ffe8e2',
            border: '#ffd8cf',
            input: '#ffd8cf',
            ring: '#ff6b35',
        }
    },
    {
        id: 'golden-hour',
        name: '🌇 Golden Hour',
        colors: {
            background: '#1d2b3a',
            foreground: '#fde68a',
            primary: '#ffd23f',
            secondary: '#2a3b4c',
            accent: '#ee5a6f',
            card: '#2a3b4c',
            muted: '#3c4d5e',
            border: '#3c4d5e',
            input: '#3c4d5e',
            ring: '#ffd23f',
        }
    },
    {
        id: 'cosmic-grape',
        name: '🪐 Cosmic Grape',
        colors: {
            background: '#f3e5f5',
            foreground: '#3a2e39',
            primary: '#9b59b6',
            secondary: '#e1bee7',
            accent: '#f1c40f',
            card: '#ffffff',
            muted: '#e1bee7',
            border: '#ce93d8',
            input: '#ce93d8',
            ring: '#9b59b6',
        }
    },
    {
        id: 'arctic-drift',
        name: '🌊 Arctic Drift',
        colors: {
            background: '#0c1660',
            foreground: '#dbeafe',
            primary: '#65e5d5',
            secondary: '#1e3a8a',
            accent: '#0d69ae',
            card: '#1e3a8a',
            muted: '#2b4a9a',
            border: '#2b4a9a',
            input: '#2b4a9a',
            ring: '#65e5d5',
        }
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

    const isBgDark = isColorDark(colors.background);

    const fullColors: CustomTheme['colors'] = {
        primaryGradientStart: colors.background,
        primaryGradientEnd: colors.primary,

        background: colors.background,
        foreground: colors.foreground,
        
        card: colors.card,
        cardForeground: colors.foreground,

        popover: colors.secondary,
        popoverForeground: colors.foreground,

        primary: colors.primary,
        primaryForeground: isColorDark(colors.primary) ? '#FFFFFF' : '#111827',
        
        secondary: colors.secondary,
        secondaryForeground: isColorDark(colors.secondary) ? colors.foreground : mix(0.8, colors.foreground, colors.secondary),
        
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
