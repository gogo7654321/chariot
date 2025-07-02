
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { background: '#00f5d4', primary: '#ff00ff', accent: '#1a2b50' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { background: '#ff77cc', primary: '#00e5ff', accent: '#2d3436' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { background: '#ff4e50', primary: '#fc913a', accent: '#2c3e50' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { background: '#9b59b6', primary: '#f1c40f', accent: '#341f97' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { background: '#0c1660', primary: '#0d69ae', accent: '#65e5d5' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { background: '#ff69b4', primary: '#89cff0', accent: '#f9f9f9' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { background: '#222222', primary: '#ffffff', accent: '#555555' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { background: '#000033', primary: '#66ffe6', accent: '#4e4eff' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { background: '#001f3f', primary: '#d4ff00', accent: '#ff00ff' } },
];


/**
 * Creates a full theme object from a base preset.
 * This function uses the preset's 'accent' color for card and secondary surfaces
 * to create a more distinct and layered look.
 * @param preset - The base preset containing primary, accent, and background colors.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: typeof THEME_PRESETS[0]): CustomTheme {
    const { colors } = preset;
    
    const isBgDark = isColorDark(colors.background);
    
    // Base palette
    const themeBackground = colors.background;
    const themeForeground = isBgDark ? '#FAFAFA' : '#0A0A0A';
    const themePrimary = colors.primary;
    const themeAccent = colors.accent;

    // Determine foregrounds for primary and accent colors
    const primaryForeground = isColorDark(themePrimary) ? '#FFFFFF' : '#111827';
    const accentForeground = isColorDark(themeAccent) ? '#FFFFFF' : '#111827';

    // Derive surface colors from the main background for a layered look.
    const cardColor = isBgDark ? tint(0.05, themeBackground) : shade(0.03, themeBackground);
    const cardForeground = isColorDark(cardColor) ? '#FFFFFF' : '#111827';
    
    const secondaryColor = isBgDark ? tint(0.08, themeBackground) : shade(0.05, themeBackground);
    const secondaryForeground = isColorDark(secondaryColor) ? '#FFFFFF' : '#111827';

    const popoverColor = isBgDark ? tint(0.12, themeBackground) : shade(0.08, themeBackground);
    const popoverForeground = isColorDark(popoverColor) ? '#FFFFFF' : '#111827';

    const mutedColor = isBgDark ? tint(0.15, themeBackground) : shade(0.07, themeBackground);
    const mutedForeground = isBgDark ? shade(0.3, themeForeground) : tint(0.3, themeForeground);
    
    const borderColor = isBgDark ? tint(0.2, themeBackground) : shade(0.1, themeBackground);

    return {
        id: preset.id,
        name: preset.name,
        colors: {
            // Base
            background: themeBackground,
            foreground: themeForeground,

            // Primary Actions
            primary: themePrimary,
            primaryForeground: primaryForeground,

            // Accent for highlights
            accent: themeAccent,
            accentForeground: accentForeground,

            // Surfaces derived from background
            card: cardColor,
            cardForeground: cardForeground,
            secondary: secondaryColor,
            secondaryForeground: secondaryForeground,
            
            popover: popoverColor,
            popoverForeground: popoverForeground,

            // Utility
            muted: mutedColor,
            mutedForeground: mutedForeground,
            border: borderColor,
            input: borderColor,
            ring: themePrimary,
        }
    };
}
