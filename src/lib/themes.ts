
import { type CustomTheme } from '@/contexts/AppearanceContext';
import { tint, shade } from 'polished';

export const THEME_PRESETS = [
    { id: 'neo-future', name: '✨ Neo Future', colors: { primary: '#0fffc1', secondary: '#0a1f44', background: '#020617', accent: '#f97316' } },
    { id: 'vaporwave', name: '🩵 Vaporwave', colors: { primary: '#ff8ff4', secondary: '#8ffaff', background: '#2d0037', accent: '#c2f750' } },
    { id: 'sunset-heat', name: '🔥 Sunset Heat', colors: { primary: '#ff5e3a', secondary: '#ff9500', background: '#2c2c54', accent: '#ffc048' } },
    { id: 'cosmic-grape', name: '🪐 Cosmic Grape', colors: { primary: '#a18cd1', secondary: '#fbc2eb', background: '#1e1e2f', accent: '#ff9ff3' } },
    { id: 'arctic-drift', name: '🌊 Arctic Drift', colors: { primary: '#00796b', secondary: '#e0f7fa', background: '#f0f0f0', accent: '#00acc1' } },
    { id: 'candy-pop', name: '🍭 Candy Pop', colors: { primary: '#f06292', secondary: '#ba68c8', background: '#fff0f6', accent: '#ff4081' } },
    { id: 'monochrome', name: '🕶️ Monochrome', colors: { primary: '#ffffff', secondary: '#cfcfcf', background: '#1a1a1a', accent: '#999999' } },
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
    const isDark = (shade(0.1, colors.background) === colors.background); // A simple check if the background is dark

    return {
        id: preset.id,
        name: preset.name,
        colors: {
            ...colors,
            // Base colors
            foreground: isDark ? tint(0.9, colors.background) : shade(0.8, colors.background),
            
            // Cards & Popovers often use the secondary color as a base
            card: colors.secondary,
            cardForeground: isDark ? tint(0.9, colors.secondary) : shade(0.8, colors.secondary),
            popover: colors.secondary,
            popoverForeground: isDark ? tint(0.9, colors.secondary) : shade(0.8, colors.secondary),
            
            // Muted colors are tinted/shaded versions of the background
            muted: isDark ? tint(0.1, colors.background) : shade(0.05, colors.background),
            mutedForeground: isDark ? tint(0.5, colors.background) : shade(0.4, colors.background),
            
            // Borders and inputs are slightly different from the background
            border: isDark ? tint(0.15, colors.background) : shade(0.1, colors.background),
            input: isDark ? tint(0.18, colors.background) : shade(0.12, colors.background),

            // Ring color is often the primary color for focus states
            ring: colors.primary,
        }
    };
}
