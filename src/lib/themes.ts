
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
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
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { background: '#000000', primary: '#555555', accent: '#ffffff' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { background: '#000033', primary: '#66ffe6', accent: '#4e4eff' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { background: '#001f3f', primary: '#d4ff00', accent: '#ff00ff' } },
    { id: 'starlight-void', name: '🌌 Starlight Void', colors: { background: '#0f0c29', primary: '#f400a1', accent: '#00f2fe' } },
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

    // Use the preset's 'primary' color for primary actions.
    const primaryActionColor = colors.primary;
    // Use the preset's 'accent' color for accents.
    const accentColor = colors.accent;
    
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
            accent: accentColor,
            accentForeground: isColorDark(accentColor) ? '#FFFFFF' : '#111827',
            
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
