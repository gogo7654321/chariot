
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { primary: '#00f5d4', secondary: '#1a2b50', background: '#0c1324', accent: '#ff00ff' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { primary: '#ff77cc', secondary: '#2c3e50', background: '#1d1d3b', accent: '#00e5ff' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { primary: '#ff4e50', secondary: '#3d2c5a', background: '#1f1c2c', accent: '#fc913a' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { primary: '#9b59b6', secondary: '#342f4e', background: '#1c1b2a', accent: '#f1c40f' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { primary: '#00a8cc', secondary: '#e8f7f9', background: '#f5f7fa', accent: '#99d9e9' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { primary: '#ff69b4', secondary: '#f0f4ff', background: '#ffffff', accent: '#89cff0' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { primary: '#ffffff', secondary: '#222222', background: '#000000', accent: '#555555' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { primary: '#4e4eff', secondary: '#000033', background: '#0c0c1c', accent: '#66ffe6' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { primary: '#d4ff00', secondary: '#001f3f', background: '#0b0c10', accent: '#ff00ff' } },
];

/**
 * Creates a full theme object from a base preset.
 * This function calculates derived colors for a cohesive look.
 * @param preset - The base preset containing primary, secondary, background, and accent colors.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: typeof THEME_PRESETS[0]): CustomTheme {
    const { colors } = preset;
    const isBgDark = isColorDark(colors.background);

    // Main colors are from the preset
    const themePrimary = colors.primary;
    const themeAccent = colors.accent;
    const themeBackground = colors.background;

    // "Side colors" are now derived from the background for better cohesion.
    const themeCard = isBgDark ? tint(0.05, themeBackground) : shade(0.03, themeBackground);
    const themeSecondary = themeCard;
    const themePopover = themeCard;

    // Text colors are derived from their respective backgrounds
    const themeForeground = isBgDark ? tint(0.9, themeBackground) : shade(0.8, themeBackground);
    const isCardDark = isColorDark(themeCard);
    const themeCardForeground = isCardDark ? tint(0.9, themeCard) : shade(0.8, themeCard);

    return {
        id: preset.id,
        name: preset.name,
        colors: {
            primary: themePrimary,
            accent: themeAccent,
            background: themeBackground,
            foreground: themeForeground,
            
            secondary: themeSecondary,
            // The secondary foreground is the same as the card foreground in this derived model
            card: themeCard,
            cardForeground: themeCardForeground,
            popover: themePopover,
            popoverForeground: themeCardForeground,
            
            muted: isBgDark ? tint(0.1, themeBackground) : shade(0.07, themeBackground),
            mutedForeground: isBgDark ? tint(0.5, themeBackground) : shade(0.4, themeBackground),
            
            border: isBgDark ? tint(0.15, themeBackground) : shade(0.1, themeBackground),
            input: isBgDark ? tint(0.18, themeBackground) : shade(0.12, themeBackground),

            ring: themePrimary,
        }
    };
}
