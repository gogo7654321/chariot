
"use client";

import React, { createContext, useContext, useState, useLayoutEffect, ReactNode, useCallback } from 'react';
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
    accentForeground: string;
    border: string;
    input: string;
    ring: string;
    primaryForeground: string;
    secondaryForeground: string;
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
  // Loading state
  isAppearanceLoading: boolean;
  setIsAppearanceLoading: (loading: boolean) => void;
};

// --- CONTEXT --- //
const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// A list of all CSS custom properties we manage.
const managedCustomProperties = [
  '--custom-primary-gradient-start', '--custom-primary-gradient-end', '--custom-background',
  '--custom-foreground', '--custom-card', '--custom-card-foreground', '--custom-popover',
  '--custom-popover-foreground', '--custom-primary', '--custom-primary-foreground',
  '--custom-secondary', '--custom-secondary-foreground', '--custom-muted',
  '--custom-muted-foreground', '--custom-accent', '--custom-accent-foreground',
  '--custom-border', '--custom-input', '--custom-ring'
];


// --- PROVIDER --- //
export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [isAppearanceLoading, setIsAppearanceLoading] = useState(true);


  // --- EFFECTS --- //

  // Effect to apply the accessibility theme class to the HTML element.
  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Effect to apply the custom theme as inline styles to the HTML element.
  useLayoutEffect(() => {
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
      };

      for (const [prop, value] of Object.entries(themeValues)) {
        document.documentElement.style.setProperty(prop, value);
      }
      
      document.documentElement.setAttribute('data-custom-theme-active', 'true');
      
      // Clean up old implementation if it exists
      const oldStyleTag = document.getElementById('custom-dashboard-theme');
      if (oldStyleTag) oldStyleTag.remove();

    } else {
      // If no custom theme, remove the properties and attribute
      managedCustomProperties.forEach(prop => {
        document.documentElement.style.removeProperty(prop);
      });
      document.documentElement.removeAttribute('data-custom-theme-active');
    }
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
