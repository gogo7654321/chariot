
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { background: '#00f5d4', primary: '#ff00ff', accent: '#1a2b50' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { background: '#ff77cc', primary: '#00e5ff', accent: '#2d3436' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { background: '#ff4e50', primary: '#fc913a', accent: '#2c3e50' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { background: '#9b59b6', primary: '#f1c40f', accent: '#341f97' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { background: '#00a8cc', primary: '#f0f4f8', accent: '#99d9e9' } },
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
    // The third color from the preset will now define the card background.
    const cardAndSecondaryColor = colors.accent;

    // Determine foregrounds based on background brightness
    const primaryForeground = isColorDark(themePrimary) ? '#FFFFFF' : '#111827';
    const cardAndSecondaryForeground = isColorDark(cardAndSecondaryColor) ? '#FFFFFF' : '#111827';

    // Derive other surface colors
    const popoverColor = isBgDark ? tint(0.05, cardAndSecondaryColor) : shade(0.05, cardAndSecondaryColor);
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

            // Accent for highlights (now uses the primary color for pop)
            accent: themePrimary,
            accentForeground: primaryForeground,

            // Surfaces
            card: cardAndSecondaryColor,
            cardForeground: cardAndSecondaryForeground,
            secondary: cardAndSecondaryColor,
            secondaryForeground: cardAndSecondaryForeground,
            
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
