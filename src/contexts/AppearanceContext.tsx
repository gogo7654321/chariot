
"use client";

import React, { createContext, useContext, useState, useLayoutEffect, ReactNode, useCallback, useEffect } from 'react';
import { hexToHsl } from '@/lib/colorUtils';
import { createThemeObject, THEME_PRESETS, type PresetColorDefinition } from '@/lib/themes';

// --- TYPES --- //
export type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export type ThemeVariant = {
  id: string;
  name: string;
  colors: PresetColorDefinition;
};

export type CustomTheme = {
  id: string;
  name: string;
  variants?: ThemeVariant[];
  selectedVariantId?: string;
  colors: {
    primaryGradientStart: string;
    primaryGradientEnd: string;
    primary: string;
    secondary: string;
    background: string;
    accent: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    muted: string;
    mutedForeground: string;
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    primaryForeground: string;
    secondaryForeground: string;
    starColor: string;
  };
};

type AppearanceContextType = {
  // Accessibility theme
  theme: AccessibilityTheme;
  setTheme: (theme: AccessibilityTheme) => void;
  // Dashboard sidebar position
  sidebarPosition: SidebarPosition;
  setSidebarPosition: (position: SidebarPosition) => void;
  // Custom dashboard theme
  customTheme: CustomTheme | null;
  applyCustomTheme: (theme: CustomTheme | null) => void;
  resetCustomTheme: () => void;
  setCustomThemeVariant: (themeId: string, variantId: string) => void;
  // Starry night specific
  areShootingStarsEnabled: boolean;
  setAreShootingStarsEnabled: (enabled: boolean) => void;
  // Loading state
  isAppearanceLoading: boolean;
  setIsAppearanceLoading: (loading: boolean) => void;
};

// --- CONTEXT --- //
const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// --- PROVIDER --- //
export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  // Set default state for SSR, will be hydrated on client
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [isAppearanceLoading, setIsAppearanceLoading] = useState(true);
  const [areShootingStarsEnabled, setAreShootingStarsEnabled] = useState(true);

  // On initial client-side mount, hydrate state from localStorage to match the inline script.
  // This syncs React's state with what's already been rendered, preventing mismatches.
  useEffect(() => {
    try {
        const settingsJSON = localStorage.getItem('appearance-settings');
        if (settingsJSON) {
            const settings = JSON.parse(settingsJSON);
            setTheme(settings.accessibilityTheme || 'default');
            setSidebarPosition(settings.sidebarPosition || 'left');
            setCustomTheme(settings.customTheme || null);
            setAreShootingStarsEnabled(settings.areShootingStarsEnabled ?? true);
        }
    } catch(e) {
        console.error("Failed to parse settings from localStorage", e);
    }
  }, []);


  // --- DYNAMIC STYLE APPLICATION --- //
  // This effect runs whenever the custom theme changes in React's state. It applies the styles
  // for real-time updates when a user interacts with the customizer UI.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (customTheme) {
      const t = customTheme.colors;
      
      const themeValues: { [key: string]: string } = {
        '--custom-primary-gradient-start': hexToHsl(t.primaryGradientStart),
        '--custom-primary-gradient-end': hexToHsl(t.primaryGradientEnd),
        '--custom-background': hexToHsl(t.background),
        '--custom-foreground': hexToHsl(t.foreground),
        '--custom-card': hexToHsl(t.card),
        '--custom-card-foreground': hexToHsl(t.cardForeground),
        '--custom-popover': hexToHsl(t.popover),
        '--custom-popover-foreground': hexToHsl(t.popoverForeground),
        '--custom-primary': hexToHsl(t.primary),
        '--custom-primary-foreground': hexToHsl(t.primaryForeground),
        '--custom-secondary': hexToHsl(t.secondary),
        '--custom-secondary-foreground': hexToHsl(t.secondaryForeground),
        '--custom-muted': hexToHsl(t.muted),
        '--custom-muted-foreground': hexToHsl(t.mutedForeground),
        '--custom-accent': hexToHsl(t.accent),
        '--custom-accent-foreground': hexToHsl(t.accentForeground),
        '--custom-border': hexToHsl(t.border),
        '--custom-input': hexToHsl(t.input),
        '--custom-ring': hexToHsl(t.ring),
        '--custom-star-color': hexToHsl(t.starColor),
      };

      for (const [prop, value] of Object.entries(themeValues)) {
        root.style.setProperty(prop, value);
      }
      root.setAttribute('data-custom-theme-active', 'true');
      root.setAttribute('data-theme-id', customTheme.id);

      const preset = THEME_PRESETS.find(p => p.id === customTheme.id);
      if (preset?.hasFullScreenBackground) {
        root.setAttribute('data-has-full-background', 'true');
      } else {
        root.removeAttribute('data-has-full-background');
      }

      if (customTheme.id === 'starry-night') {
        root.setAttribute('data-starry-night', 'true');
      } else {
        root.removeAttribute('data-starry-night');
      }

    } else {
      root.removeAttribute('data-custom-theme-active');
      root.removeAttribute('data-theme-id');
      root.removeAttribute('data-has-full-background');
      root.removeAttribute('data-starry-night');
    }
  }, [customTheme]);

  // Effect to apply the accessibility theme class to the HTML element.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  // --- CALLBACKS --- //
  
  const handleSetTheme = useCallback((newTheme: AccessibilityTheme) => {
    if (newTheme !== 'default') {
      setCustomTheme(null);
    }
    setTheme(newTheme);
  }, [setCustomTheme]);

  const handleApplyCustomTheme = useCallback((themeToApply: CustomTheme | null) => {
    setCustomTheme(themeToApply);
    if (themeToApply !== null) {
      setTheme('default');
    }
  }, [setTheme]);

  const handleResetCustomTheme = useCallback(() => {
    setCustomTheme(null);
  }, [setCustomTheme]);

  const handleSetCustomThemeVariant = useCallback((themeId: string, variantId: string) => {
    const mainThemePreset = THEME_PRESETS.find(p => p.id === themeId);
    if (!mainThemePreset || !mainThemePreset.variants) return;

    const variant = mainThemePreset.variants.find(v => v.id === variantId);
    if (!variant) return;

    // Create a new theme object based on the variant's colors
    const variantThemeObject = createThemeObject({
        ...mainThemePreset, // carry over id, name, category
        colors: variant.colors
    });

    // Apply it, but preserve the main theme's identity and variant list
    setCustomTheme({
        ...variantThemeObject,
        id: mainThemePreset.id, // IMPORTANT: Keep the main theme ID for CSS selectors
        name: mainThemePreset.name,
        variants: mainThemePreset.variants,
        selectedVariantId: variantId,
    });

  }, [setCustomTheme]);

  // --- CONTEXT VALUE --- //
  const value = { 
    theme, 
    setTheme: handleSetTheme, 
    sidebarPosition, 
    setSidebarPosition,
    customTheme,
    applyCustomTheme: handleApplyCustomTheme,
    resetCustomTheme: handleResetCustomTheme,
    setCustomThemeVariant: handleSetCustomThemeVariant,
    areShootingStarsEnabled,
    setAreShootingStarsEnabled,
    isAppearanceLoading,
    setIsAppearanceLoading,
  };

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};

// --- HOOK --- //
export const useAppearance = (): AppearanceContextType => {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error("useAppearance must be used within an AppearanceProvider");
    }
    return context;
}
