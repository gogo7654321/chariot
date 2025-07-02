
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade, mix } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { background: '#00f5d4', primary: '#ff00ff', accent: '#1a2b50' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { background: '#ff77cc', primary: '#00e5ff', accent: '#2d3436' } },
    
    // Enhanced sunset themes with proper color depth
    { id: 'sunset-heat', name: '🌅 Sunset Heat', colors: { background: '#ff6b35', primary: '#f7931e', accent: '#c44569' } },
    { id: 'golden-hour', name: '🌇 Golden Hour', colors: { background: '#ff9068', primary: '#ffd23f', accent: '#ee5a6f' } },
    { id: 'twilight-fire', name: '🔥 Twilight Fire', colors: { background: '#ff4757', primary: '#ffa726', accent: '#8e44ad' } },
    { id: 'desert-sunset', name: '🏜️ Desert Sunset', colors: { background: '#ff7675', primary: '#fdcb6e', accent: '#6c5ce7' } },
    
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { background: '#9b59b6', primary: '#f1c40f', accent: '#341f97' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { background: '#0c1660', primary: '#0d69ae', accent: '#65e5d5' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { background: '#ff69b4', primary: '#89cff0', accent: '#f9f9f9' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { background: '#000000', primary: '#ffffff', accent: '#555555' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { background: '#000033', primary: '#66ffe6', accent: '#4e4eff' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { background: '#001f3f', primary: '#d4ff00', accent: '#ff00ff' } },
    { id: 'aurora-borealis', name: '🌌 Aurora Borealis', colors: { background: '#000428', primary: '#f400a1', accent: '#00f2fe' } },
    { id: 'psychedelic-planet', name: '🪐 Psychedelic Planet', colors: { background: '#000000', primary: '#ff007f', accent: '#007fff' } },
];


/**
 * Creates a full theme object from a base preset.
 * This version uses a gradient background and derives solid surface colors for a layered effect.
 * @param preset - The base preset containing primary, accent, and background colors.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: typeof THEME_PRESETS[0]): CustomTheme {
    const { colors } = preset;

    const isBgDark = isColorDark(colors.background);
    const themeForeground = isBgDark ? '#FAFAFA' : '#0A0A0A';

    let cardColor, secondaryColor, popoverColor, mutedColor, borderColor;

    if (isBgDark) {
        // Create a more vibrant dark theme by mixing in the accent color
        cardColor = mix(0.92, colors.background, colors.accent);
        secondaryColor = mix(0.85, colors.background, colors.accent);
        popoverColor = mix(0.8, colors.background, colors.accent);
        mutedColor = mix(0.75, colors.background, colors.accent);
        borderColor = mix(0.8, colors.background, colors.accent);
    } else {
        // Original logic for light themes
        cardColor = shade(0.03, colors.background);
        secondaryColor = shade(0.05, colors.background);
        popoverColor = shade(0.08, colors.background);
        mutedColor = shade(0.07, colors.background);
        borderColor = shade(0.1, colors.background);
    }

    return {
        id: preset.id,
        name: preset.name,
        colors: {
            primaryGradientStart: colors.background,
            primaryGradientEnd: colors.primary,

            background: cardColor, 
            foreground: themeForeground,

            primary: colors.primary,
            primaryForeground: isColorDark(colors.primary) ? '#FFFFFF' : '#111827',

            accent: colors.accent,
            accentForeground: isColorDark(colors.accent) ? '#FFFFFF' : '#111827',
            
            card: cardColor,
            cardForeground: themeForeground,
            secondary: secondaryColor,
            secondaryForeground: themeForeground,
            popover: popoverColor,
            popoverForeground: themeForeground,

            muted: mutedColor,
            mutedForeground: isBgDark ? tint(0.4, themeForeground) : shade(0.4, themeForeground),
            border: borderColor,
            input: borderColor,
            ring: colors.primary,
        }
    };
}
