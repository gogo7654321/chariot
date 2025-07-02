
'use client';

import { useEffect, useCallback } from 'react';
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
    try {
        await setDoc(userDocRef, { appearance: settings }, { merge: true });
    } catch (error) {
        console.error("Failed to save settings to Firestore:", error);
    }
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

  const loadSettingsFromLocalStorage = useCallback(() => {
    const storedAccessibilityTheme = localStorage.getItem('accessibility-theme') as AccessibilityTheme;
    if (storedAccessibilityTheme) setAccessibilityTheme(storedAccessibilityTheme);
    
    const storedSidebarPosition = localStorage.getItem('sidebar-position') as SidebarPosition;
    if (storedSidebarPosition) setSidebarPosition(storedSidebarPosition);
    
    const storedCustomTheme = localStorage.getItem('custom-theme');
    if (storedCustomTheme) {
        try {
            applyCustomTheme(JSON.parse(storedCustomTheme));
        } catch (e) {
            console.error("Failed to parse custom theme from localStorage", e);
            localStorage.removeItem('custom-theme');
        }
    }
  }, [setAccessibilityTheme, setSidebarPosition, applyCustomTheme]);
  

  // Effect to load settings on mount and when user logs in/out
  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      // User is logged in, load from Firestore and listen for real-time updates
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        const settings = docSnap.data()?.appearance;
        
        // If firestore has settings, apply them
        if (settings) {
            if (settings.lightDarkTheme) setLightDarkTheme(settings.lightDarkTheme);
            if (settings.accessibilityTheme) setAccessibilityTheme(settings.accessibilityTheme);
            if (settings.sidebarPosition) setSidebarPosition(settings.sidebarPosition);
            applyCustomTheme(settings.customTheme || null);
        } else {
            // If user has no settings in firestore, load from localStorage and then save it to firestore
            loadSettingsFromLocalStorage();
        }
      });
      
      // Cleanup listener when component unmounts or user changes
      return () => unsubscribe();
    } else {
      // User is logged out, load from localStorage
      loadSettingsFromLocalStorage();
    }
  }, [user, isAuthLoading, setLightDarkTheme, setAccessibilityTheme, setSidebarPosition, applyCustomTheme, loadSettingsFromLocalStorage]);

  // Effect to save settings when they change
  useEffect(() => {
    // Don't save while auth state is resolving or if there is no resolved theme yet
    if (isAuthLoading || !resolvedTheme) return;
    
    // Create a settings object that is not undefined.
    // customTheme can be null, which is intended.
    const settingsToSave = {
        lightDarkTheme: resolvedTheme || 'light',
        accessibilityTheme: accessibilityTheme || 'default',
        sidebarPosition: sidebarPosition || 'left',
        customTheme: customTheme,
    };

    if (user) {
        saveFirestoreSettings(user, settingsToSave);
    } else {
        localStorage.setItem('accessibility-theme', settingsToSave.accessibilityTheme);
        localStorage.setItem('sidebar-position', settingsToSave.sidebarPosition);
        if (settingsToSave.customTheme) {
            localStorage.setItem('custom-theme', JSON.stringify(settingsToSave.customTheme));
        } else {
            localStorage.removeItem('custom-theme');
        }
    }
  }, [user, resolvedTheme, accessibilityTheme, sidebarPosition, customTheme, isAuthLoading]);

  return null; // This is a manager component, it doesn't render anything
}
