
'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAppearance } from '@/contexts/AccessibilityContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

// This function now only reads data.
async function getFirestoreSettings(user: User) {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
        return docSnap.data();
    }
    // No need to create the doc here, saving will handle it.
    return null;
}

async function saveFirestoreSettings(user: User, settings: Record<string, string>) {
    const userDocRef = doc(db, 'users', user.uid);
    // { merge: true } is crucial here. It creates the document if it doesn't exist,
    // or updates it without overwriting other fields.
    await setDoc(userDocRef, settings, { merge: true });
}

export function UserSettingsManager() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { setTheme: setLightDarkTheme, resolvedTheme } = useTheme();
  const { 
    theme: accessibilityTheme, 
    setTheme: setAccessibilityTheme,
    sidebarPosition,
    setSidebarPosition
  } = useAppearance();

  // Effect to load settings on mount and when user logs in/out
  useEffect(() => {
    if (isAuthLoading) return;

    if (user) {
      // User is logged in, load from Firestore
      getFirestoreSettings(user).then(settings => {
        if (settings) {
            if (settings.lightDarkTheme) setLightDarkTheme(settings.lightDarkTheme);
            if (settings.accessibilityTheme) setAccessibilityTheme(settings.accessibilityTheme);
            if (settings.sidebarPosition) setSidebarPosition(settings.sidebarPosition);
        }
      });
    } else {
      // User is logged out, load from localStorage
      const storedAccessibilityTheme = localStorage.getItem('accessibility-theme') as AccessibilityTheme;
      if (storedAccessibilityTheme) {
        setAccessibilityTheme(storedAccessibilityTheme);
      }
      const storedSidebarPosition = localStorage.getItem('sidebar-position') as SidebarPosition;
      if (storedSidebarPosition) {
        setSidebarPosition(storedSidebarPosition);
      }
      // next-themes handles its own localStorage for light/dark theme
    }
  }, [user, isAuthLoading, setLightDarkTheme, setAccessibilityTheme, setSidebarPosition]);

  // Effect to save settings when they change
  useEffect(() => {
    // Don't save while auth state is resolving or if there is no resolved theme yet
    if (isAuthLoading || !resolvedTheme) return;
    
    if (user) {
        // User is logged in, save to Firestore.
        saveFirestoreSettings(user, { 
            lightDarkTheme: resolvedTheme, 
            accessibilityTheme,
            sidebarPosition,
        });
    } else {
        // User is logged out, save to localStorage.
        localStorage.setItem('accessibility-theme', accessibilityTheme);
        localStorage.setItem('sidebar-position', sidebarPosition);
        // next-themes handles its own localStorage saving.
    }
  }, [user, resolvedTheme, accessibilityTheme, sidebarPosition, isAuthLoading]);

  return null; // This is a manager component, it doesn't render anything
}
