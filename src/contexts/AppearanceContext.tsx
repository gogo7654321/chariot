
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
  // Loading state
  isAppearanceLoading: boolean;
  setIsAppearanceLoading: (loading: boolean) => void;
};

// --- CONTEXT --- //
const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// --- PROVIDER --- //
export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null);
  const [isAppearanceLoading, setIsAppearanceLoading] = useState(true);


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
      const primaryForeground = isColorDark(t.primary) ? '0 0% 100%' : '220 49% 10%';

      const css = `
        html[data-custom-theme-active="true"] {
          --primary-gradient-start: ${hexToHsl(t.primaryGradientStart)};
          --primary-gradient-end: ${hexToHsl(t.primaryGradientEnd)};
          --background: ${hexToHsl(t.background)};
          --foreground: ${hexToHsl(t.foreground)};
          --card: ${hexToHsl(t.card)};
          --card-foreground: ${hexToHsl(t.cardForeground)};
          --popover: ${hexToHsl(t.popover)};
          --popover-foreground: ${hexToHsl(t.popoverForeground)};
          --primary: ${hexToHsl(t.primary)};
          --primary-foreground: ${primaryForeground};
          --secondary: ${hexToHsl(t.secondary)};
          --secondary-foreground: ${hexToHsl(t.secondaryForeground)};
          --muted: ${hexToHsl(t.muted)};
          --muted-foreground: ${hexToHsl(t.mutedForeground)};
          --accent: ${hexToHsl(t.accent)};
          --accent-foreground: ${hexToHsl(t.accentForeground)};
          --destructive: 0 59% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: ${hexToHsl(t.border)};
          --input: ${hexToHsl(t.input)};
          --ring: ${hexToHsl(t.ring)};
          --radius: 0.5rem;
          /* Sidebar colors */
          --sidebar-background: ${hexToHsl(t.secondary)};
          --sidebar-foreground: ${hexToHsl(t.secondaryForeground)};
          --sidebar-accent: ${hexToHsl(t.muted)};
          --sidebar-accent-foreground: ${isColorDark(t.muted) ? '0 0% 100%' : '220 49% 10%'};
          --sidebar-border: ${hexToHsl(t.border)};
          /* Charts */
          --chart-1: ${hexToHsl(t.primary)};
          --chart-2: ${hexToHsl(t.accent)};
        }

        html[data-custom-theme-active="true"] body.dashboard-scope {
          background-image: linear-gradient(135deg, hsl(var(--primary-gradient-start)), hsl(var(--primary-gradient-end)));
          background-attachment: fixed;
        }

        html[data-custom-theme-active="true"] .dashboard-scope main {
          background-color: transparent;
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
