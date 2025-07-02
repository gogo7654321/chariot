
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';
import { isColorDark } from './colorUtils';

export const THEME_PRESETS = [
    // Rule: The 'background' color should be the most dominant/characteristic color of the theme.
    // 'Primary' and 'Accent' are for highlights, buttons, etc.
    { id: 'neo-future', name: '✨ Neo Future', colors: { background: '#1a2b50', primary: '#00f5d4', accent: '#ff00ff', secondary: '#1a2b50' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { background: '#2c3e50', primary: '#ff77cc', accent: '#00e5ff', secondary: '#2c3e50' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { background: '#3d2c5a', primary: '#ff4e50', accent: '#fc913a', secondary: '#3d2c5a' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { background: '#342f4e', primary: '#9b59b6', accent: '#f1c40f', secondary: '#342f4e' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { background: '#00a8cc', primary: '#99d9e9', accent: '#FFFFFF', secondary: '#e8f7f9' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { background: '#ff69b4', primary: '#89cff0', accent: '#FFFFFF', secondary: '#f0f4ff' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { background: '#000000', primary: '#ffffff', accent: '#555555', secondary: '#222222' } },
    { id: 'midnight-club', name: '🟣 Midnight Club', colors: { background: '#000033', primary: '#66ffe6', accent: '#4e4eff', secondary: '#000033' } },
    { id: 'neon-racer', name: '⚡ Neon Racer', colors: { background: '#001f3f', primary: '#d4ff00', accent: '#ff00ff', secondary: '#001f3f' } },
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
    const themeBackground = colors.background;
    const themeForeground = isBgDark ? '#FFFFFF' : '#111827';

    // Derive UI surfaces (cards, popovers, secondary) from the main background.
    const themeCard = isBgDark ? tint(0.05, themeBackground) : shade(0.03, themeBackground);
    const themePopover = isBgDark ? tint(0.08, themeBackground) : shade(0.05, themeBackground);
    
    return {
        id: preset.id,
        name: preset.name,
        colors: {
            background: themeBackground,
            foreground: themeForeground,

            primary: colors.primary,
            accent: colors.accent,

            card: themeCard,
            cardForeground: isColorDark(themeCard) ? '#FFFFFF' : '#111827',
            
            secondary: themeCard, // Secondary surfaces like sidebars will match cards.
            secondaryForeground: isColorDark(themeCard) ? '#FFFFFF' : '#111827', 

            popover: themePopover,
            popoverForeground: isColorDark(themePopover) ? '#FFFFFF' : '#111827',
            
            muted: isBgDark ? tint(0.1, themeBackground) : shade(0.07, themeBackground),
            mutedForeground: isBgDark ? tint(0.6, themeBackground) : shade(0.5, themeBackground),
            
            border: isBgDark ? tint(0.15, themeBackground) : shade(0.1, themeBackground),
            input: isBgDark ? tint(0.15, themeBackground) : shade(0.1, themeBackground),

            ring: colors.primary,
        }
    };
}
