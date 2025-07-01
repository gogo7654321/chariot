
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

type AppearanceContextType = {
  theme: AccessibilityTheme;
  setTheme: (theme: AccessibilityTheme) => void;
  sidebarPosition: SidebarPosition;
  setSidebarPosition: (position: SidebarPosition) => void;
};

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<AccessibilityTheme>('default');
  const [sidebarPosition, setSidebarPosition] = useState<SidebarPosition>('left');

  useEffect(() => {
    // This effect simply applies the current theme to the DOM.
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = { theme, setTheme, sidebarPosition, setSidebarPosition };

  return (
    <AppearanceContext.Provider value={value}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = (): AppearanceContextType => {
    const context = useContext(AppearanceContext);
    if (context === undefined) {
        throw new Error("useAppearance must be used within an AppearanceProvider");
    }
    return context;
}

// Kept for backwards compatibility for now
export const useAccessibility = () => {
    const context = useAppearance();
    return {
        theme: context.theme,
        setTheme: context.setTheme
    }
}
