
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
 * This version uses a gradient background and derives solid surface colors for a layered effect.
 * @param preset - The base preset containing primary, accent, and background colors.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: typeof THEME_PRESETS[0]): CustomTheme {
    const { colors } = preset;

    const gradientStart = colors.background;
    const gradientEnd = colors.primary;

    // Use the preset's 'accent' color for primary actions.
    const primaryActionColor = colors.accent;
    
    // Determine the base foreground color from the start of the gradient for general text readability.
    const isBgDark = isColorDark(gradientStart);
    const themeForeground = isBgDark ? '#FAFAFA' : '#0A0A0A';

    // Create layered surfaces by tinting/shading the gradient's start color.
    const cardColor = isBgDark ? tint(0.08, gradientStart) : shade(0.03, gradientStart);
    const secondaryColor = isBgDark ? tint(0.05, gradientStart) : shade(0.05, gradientStart);
    const popoverColor = isBgDark ? tint(0.12, gradientStart) : shade(0.08, gradientStart);
    const mutedColor = isBgDark ? tint(0.15, gradientStart) : shade(0.07, gradientStart);
    const borderColor = isBgDark ? tint(0.2, gradientStart) : shade(0.1, gradientStart);

    return {
        id: preset.id,
        name: preset.name,
        colors: {
            // Gradient colors for the page background
            primaryGradientStart: gradientStart,
            primaryGradientEnd: gradientEnd,

            // Base colors (background is now for solid surfaces, not the page)
            background: cardColor, 
            foreground: themeForeground,

            // Primary actions
            primary: primaryActionColor,
            primaryForeground: isColorDark(primaryActionColor) ? '#FFFFFF' : '#111827',

            // Accent can be the gradient's end color for consistency
            accent: gradientEnd,
            accentForeground: isColorDark(gradientEnd) ? '#FFFFFF' : '#111827',
            
            // Layered surfaces
            card: cardColor,
            cardForeground: themeForeground,
            secondary: secondaryColor,
            secondaryForeground: themeForeground,
            popover: popoverColor,
            popoverForeground: themeForeground,

            // Utility
            muted: mutedColor,
            mutedForeground: isBgDark ? tint(0.4, themeForeground) : shade(0.4, themeForeground),
            border: borderColor,
            input: borderColor,
            ring: primaryActionColor,
        }
    };
}
