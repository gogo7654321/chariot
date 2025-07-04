
'use client';

import React from 'react';

// This function is stringified and must be self-contained.
// It runs before React hydrates to prevent any theme flashing.
const initializerFunction = () => {
  try {
    const settingsJSON = localStorage.getItem('appearance-settings');
    if (!settingsJSON) {
      return;
    }

    const settings = JSON.parse(settingsJSON);
    const root = document.documentElement;

    // --- Helper function (must be embedded) ---
    const hexToHsl = (hex) => {
      if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return '0 0% 0%';
      let r = 0, g = 0, b = 0;
      if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16);
      } else if (hex.length === 7) {
        r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16);
      }
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // --- Apply Themes ---
    // Note: The `next-themes` package handles the 'dark' class separately, so we don't touch it here.

    // 1. Accessibility Theme
    if (settings.accessibilityTheme) {
      root.setAttribute('data-theme', settings.accessibilityTheme);
    }

    // 2. Custom Dashboard Theme
    if (settings.customTheme && settings.customTheme.colors) {
      const colors = settings.customTheme.colors;
      const themeValues = {
          '--custom-primary-gradient-start': hexToHsl(colors.primaryGradientStart),
          '--custom-primary-gradient-end': hexToHsl(colors.primaryGradientEnd),
          '--custom-background': hexToHsl(colors.background),
          '--custom-foreground': hexToHsl(colors.foreground),
          '--custom-card': hexToHsl(colors.card),
          '--custom-card-foreground': hexToHsl(colors.cardForeground),
          '--custom-popover': hexToHsl(colors.popover),
          '--custom-popover-foreground': hexToHsl(colors.popoverForeground),
          '--custom-primary': hexToHsl(colors.primary),
          '--custom-primary-foreground': hexToHsl(colors.primaryForeground),
          '--custom-secondary': hexToHsl(colors.secondary),
          '--custom-secondary-foreground': hexToHsl(colors.secondaryForeground),
          '--custom-muted': hexToHsl(colors.muted),
          '--custom-muted-foreground': hexToHsl(colors.mutedForeground),
          '--custom-accent': hexToHsl(colors.accent),
          '--custom-accent-foreground': hexToHsl(colors.accentForeground),
          '--custom-border': hexToHsl(colors.border),
          '--custom-input': hexToHsl(colors.input),
          '--custom-ring': hexToHsl(colors.ring),
          '--custom-star-color': hexToHsl(colors.starColor),
      };
      
      for (const [prop, value] of Object.entries(themeValues)) {
        root.style.setProperty(prop, value);
      }
      
      // Set the theme attributes
      root.setAttribute('data-custom-theme-active', 'true');
      if (settings.customTheme.id) {
        root.setAttribute('data-theme-id', settings.customTheme.id);
      }
      
      // Handle full background themes
      const themesWithFullBackground = ['catpuccin', 'starry-night', 'midnight-office', 'parisian-daydream'];
      if (settings.customTheme.id && themesWithFullBackground.includes(settings.customTheme.id)) {
        root.setAttribute('data-has-full-background', 'true');
      } else {
        root.removeAttribute('data-has-full-background');
      }
      
      // Handle starry night specifically
      if (settings.customTheme.id === 'starry-night') {
        root.setAttribute('data-starry-night', 'true');
      } else {
        root.removeAttribute('data-starry-night');
      }
    } else {
      root.removeAttribute('data-custom-theme-active');
      root.removeAttribute('data-starry-night');
      root.removeAttribute('data-theme-id');
      root.removeAttribute('data-has-full-background');
    }
  } catch (e) {
    // If something goes wrong, we don't want to break the page render.
    console.error("AP Ace©: Error applying initial theme from script.", e);
  }
};

const blockingScript = `(${initializerFunction.toString()})()`;

export function ThemeInitializer() {
  return <script dangerouslySetInnerHTML={{ __html: blockingScript }} />;
}
