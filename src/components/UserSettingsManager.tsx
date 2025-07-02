
'use client';

import { useEffect } from 'react';
import { useAppearance, type CustomTheme } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useTheme as useNextTheme } from 'next-themes';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

async function saveFirestoreSettings(user: User, settings: Record<string, any>) {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, { appearance: settings }, { merge: true });
}

export function UserSettingsManager() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setTheme: setLightDarkTheme, resolvedTheme } = useNextTheme();
  const { 
    theme: accessibilityTheme, 
    setTheme: setAccessibilityTheme,
    sidebarPosition,
    setSidebarPosition,
    customTheme,
    applyCustomTheme,
  } = useAppearance();

  // Effect to load settings on mount and when user logs in/out
  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      // User is logged in, load from Firestore and listen for real-time updates
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        const data = docSnap.data();
        const settings = data?.appearance;
        if (settings) {
            if (settings.lightDarkTheme) setLightDarkTheme(settings.lightDarkTheme);
            if (settings.accessibilityTheme) setAccessibilityTheme(settings.accessibilityTheme);
            if (settings.sidebarPosition) setSidebarPosition(settings.sidebarPosition);
            if (settings.customTheme) applyCustomTheme(settings.customTheme);
        }
      });
      
      // Cleanup listener when component unmounts or user changes
      return () => unsubscribe();
    } else {
      // User is logged out, load from localStorage
      const storedAccessibilityTheme = localStorage.getItem('accessibility-theme') as AccessibilityTheme;
      if (storedAccessibilityTheme) setAccessibilityTheme(storedAccessibilityTheme);
      
      const storedSidebarPosition = localStorage.getItem('sidebar-position') as SidebarPosition;
      if (storedSidebarPosition) setSidebarPosition(storedSidebarPosition);
      
      const storedCustomTheme = localStorage.getItem('custom-theme');
      if (storedCustomTheme) applyCustomTheme(JSON.parse(storedCustomTheme));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthLoading]);

  // Effect to save settings when they change
  useEffect(() => {
    // Don't save while auth state is resolving or if there is no resolved theme yet
    if (isAuthLoading || !resolvedTheme) return;
    
    const settingsToSave = {
        lightDarkTheme: resolvedTheme,
        accessibilityTheme,
        sidebarPosition,
        customTheme,
    };

    if (user) {
        saveFirestoreSettings(user, settingsToSave);
    } else {
        localStorage.setItem('accessibility-theme', accessibilityTheme);
        localStorage.setItem('sidebar-position', sidebarPosition);
        if (customTheme) {
            localStorage.setItem('custom-theme', JSON.stringify(customTheme));
        } else {
            localStorage.removeItem('custom-theme');
        }
    }
  }, [user, resolvedTheme, accessibilityTheme, sidebarPosition, customTheme, isAuthLoading]);

  return null; // This is a manager component, it doesn't render anything
}
