
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { primary: '#00f5d4', accent: '#ff00ff', background: '#0c1324', secondary: '#1a2b50' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { primary: '#ff77cc', accent: '#00e5ff', background: '#1d1d3b', secondary: '#2c3e50' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { primary: '#ff4e50', accent: '#fc913a', background: '#1f1c2c', secondary: '#3d2c5a' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { primary: '#9b59b6', accent: '#f1c40f', background: '#1c1b2a', secondary: '#342f4e' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { primary: '#99d9e9', accent: '#FFFFFF', background: '#00a8cc', secondary: '#e8f7f9' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { primary: '#89cff0', accent: '#FFFFFF', background: '#ff69b4', secondary: '#f0f4ff' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { primary: '#ffffff', accent: '#555555', background: '#000000', secondary: '#222222' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { primary: '#66ffe6', accent: '#4e4eff', background: '#0c0c1c', secondary: '#000033' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { primary: '#d4ff00', accent: '#ff00ff', background: '#0b0c10', secondary: '#001f3f' } },
];

/**
 * Creates a full theme object from a base preset.
 * This function uses the preset's 'background' as the main UI color,
 * and derives other surfaces from it for a cohesive look.
 * @param preset - The base preset containing primary, accent, and background colors.
 * @returns A full CustomTheme object.
 */
export function createThemeObject(preset: typeof THEME_PRESETS[0]): CustomTheme {
    const { colors } = preset;
    const isBgDark = isColorDark(colors.background);

    // Use the preset's `background` as the main UI background.
    const themeBackground = colors.background;
    
    // Determine text color based on background brightness.
    const themeForeground = isBgDark ? '#FFFFFF' : '#111827';

    // Use preset's `primary` and `accent` for main actions.
    const themePrimary = colors.primary;
    const themeAccent = colors.accent;

    // Derive UI surfaces (cards, popovers, secondary) from the main background.
    const themeCard = isBgDark ? tint(0.05, themeBackground) : shade(0.03, themeBackground);
    const themeSecondary = themeCard;
    const themePopover = isBgDark ? tint(0.08, themeBackground) : shade(0.05, themeBackground);

    // Determine foreground for cards based on card color.
    const themeCardForeground = isColorDark(themeCard) ? '#FFFFFF' : '#111827';
    
    return {
        id: preset.id,
        name: preset.name,
        colors: {
            background: themeBackground,
            foreground: themeForeground,

            primary: themePrimary,
            accent: themeAccent,

            card: themeCard,
            cardForeground: themeCardForeground,
            
            secondary: themeSecondary,
            secondaryForeground: themeCardForeground, 

            popover: themePopover,
            popoverForeground: isColorDark(themePopover) ? '#FFFFFF' : '#111827',
            
            muted: isBgDark ? tint(0.1, themeBackground) : shade(0.07, themeBackground),
            mutedForeground: isBgDark ? tint(0.6, themeBackground) : shade(0.5, themeBackground),
            
            border: isBgDark ? tint(0.15, themeBackground) : shade(0.1, themeBackground),
            input: isBgDark ? tint(0.15, themeBackground) : shade(0.1, themeBackground),

            ring: themePrimary,
        }
    };
}
