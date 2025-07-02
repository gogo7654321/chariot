
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { hexToHsl, isColorDark } from '@/lib/colorUtils';

// --- TYPES --- //
export type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
export type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

export type CustomTheme = {
  id: string;
  name: string;
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
    border: string;
    input: string;
    ring: string;
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
};

// --- CONTEXT --- //
const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// --- PROVIDER --- //
export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);

  // --- EFFECTS --- //

  // Effect to apply the accessibility theme class to the HTML element.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect to apply the custom theme as inline styles to the HTML element.
  useEffect(() => {
    const styleElementId = 'custom-dashboard-theme';
    let styleElement = document.getElementById(styleElementId) as HTMLStyleElement | null;

    if (customTheme) {
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleElementId;
        document.head.appendChild(styleElement);
      }

      const t = customTheme.colors;
      const css = `
        :root {
          --custom-primary-gradient-start: ${hexToHsl(t.primaryGradientStart)};
          --custom-primary-gradient-end: ${hexToHsl(t.primaryGradientEnd)};
          --custom-background: ${hexToHsl(t.background)};
          --custom-foreground: ${hexToHsl(t.foreground)};
          --custom-card: ${hexToHsl(t.card)};
          --custom-card-foreground: ${hexToHsl(t.cardForeground)};
          --custom-popover: ${hexToHsl(t.popover)};
          --custom-popover-foreground: ${hexToHsl(t.popoverForeground)};
          --custom-primary: ${hexToHsl(t.primary)};
          --custom-primary-foreground: ${isColorDark(t.primary) ? '0 0% 100%' : '220 49% 10%'};
          --custom-secondary: ${hexToHsl(t.secondary)};
          --custom-secondary-foreground: ${isColorDark(t.secondary) ? '0 0% 100%' : '220 49% 10%'};
          --custom-muted: ${hexToHsl(t.muted)};
          --custom-muted-foreground: ${hexToHsl(t.mutedForeground)};
          --custom-accent: ${hexToHsl(t.accent)};
          --custom-accent-foreground: ${isColorDark(t.accent) ? '0 0% 100%' : '220 49% 10%'};
          --custom-border: ${hexToHsl(t.border)};
          --custom-input: ${hexToHsl(t.input)};
          --custom-ring: ${hexToHsl(t.ring)};
        }
      `;
      styleElement.innerHTML = css;
      document.documentElement.setAttribute('data-custom-theme-active', 'true');
    } else {
      if (styleElement) {
        styleElement.remove();
      }
      document.documentElement.removeAttribute('data-custom-theme-active');
    }

    return () => {
      // Cleanup on unmount if needed, though usually we want themes to persist.
    };
  }, [customTheme]);

  // --- CALLBACKS --- //
  
  const handleSetTheme = useCallback((newTheme: AccessibilityTheme) => {
    // When an accessibility theme is applied, we must reset any custom theme.
    if (newTheme !== 'default') {
      setCustomTheme(null);
    }
    setTheme(newTheme);
  }, []);

  const handleApplyCustomTheme = useCallback((themeToApply: CustomTheme | null) => {
    setCustomTheme(themeToApply);
    // Applying a custom theme disables any active accessibility theme.
    if (themeToApply !== null) {
      setTheme('default');
    }
  }, []);

  const handleResetCustomTheme = useCallback(() => {
    setCustomTheme(null);
  }, []);

  // --- CONTEXT VALUE --- //
  const value = { 
    theme, 
    setTheme: handleSetTheme, 
    sidebarPosition, 
    setSidebarPosition,
    customTheme,
    applyCustomTheme: handleApplyCustomTheme,
    resetCustomTheme: handleResetCustomTheme,
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
