
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

// This is the settings structure that will be saved to Firestore.
type AppearanceSettings = {
    lightDarkTheme: 'light' | 'dark' | 'system';
    accessibilityTheme: AccessibilityTheme;
    sidebarPosition: SidebarPosition;
    customTheme: CustomTheme | null;
};


async function saveFirestoreSettings(user: User, settings: AppearanceSettings) {
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, {
            appearance: settings
        }, {
            merge: true
        });
    } catch (error) {
        console.error("Failed to save settings to Firestore:", error);
    }
}

export function UserSettingsManager() {
    const {
        user,
        isLoading: isAuthLoading
    } = useAuth();
    const {
        theme: nextTheme,
        setTheme: setNextTheme,
        resolvedTheme
    } = useNextTheme();
    const {
        theme: accessibilityTheme,
        setTheme: setAccessibilityTheme,
        sidebarPosition,
        setSidebarPosition,
        customTheme,
        applyCustomTheme,
    } = useAppearance();

    // This effect runs once when the app loads for a logged-out user.
    // It loads any settings stored in localStorage.
    useEffect(() => {
        if (!user && !isAuthLoading) {
            const storedAccessibilityTheme = localStorage.getItem('accessibility-theme') as AccessibilityTheme | null;
            if (storedAccessibilityTheme) setAccessibilityTheme(storedAccessibilityTheme);

            const storedSidebarPosition = localStorage.getItem('sidebar-position') as SidebarPosition | null;
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
        }
    }, [user, isAuthLoading, setAccessibilityTheme, setSidebarPosition, applyCustomTheme]);


    // This effect syncs settings between Firestore and the app state for logged-in users.
    useEffect(() => {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            const savedSettings = docSnap.data()?.appearance as AppearanceSettings | undefined;

            if (docSnap.exists() && savedSettings) {
                // Firestore has settings, apply them to the context if they differ.
                // This check prevents infinite loops from the listener re-applying the same state.
                if (savedSettings.lightDarkTheme && savedSettings.lightDarkTheme !== nextTheme) {
                    setNextTheme(savedSettings.lightDarkTheme);
                }
                if (savedSettings.accessibilityTheme && savedSettings.accessibilityTheme !== accessibilityTheme) {
                    setAccessibilityTheme(savedSettings.accessibilityTheme);
                }
                if (savedSettings.sidebarPosition && savedSettings.sidebarPosition !== sidebarPosition) {
                    setSidebarPosition(savedSettings.sidebarPosition);
                }
                if (JSON.stringify(savedSettings.customTheme) !== JSON.stringify(customTheme)) {
                    applyCustomTheme(savedSettings.customTheme || null);
                }
            }
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [user, nextTheme, accessibilityTheme, sidebarPosition, customTheme, setNextTheme, setAccessibilityTheme, setSidebarPosition, applyCustomTheme]);


    // This effect SAVES any changes from the app's state to the appropriate storage.
    useEffect(() => {
        // Wait until authentication and the initial theme are resolved.
        if (isAuthLoading || !resolvedTheme) {
            return;
        }

        const currentSettings: AppearanceSettings = {
            lightDarkTheme: nextTheme as AppearanceSettings['lightDarkTheme'],
            accessibilityTheme: accessibilityTheme,
            sidebarPosition: sidebarPosition,
            customTheme: customTheme,
        };

        if (user) {
            // User is logged in, save to Firestore.
            saveFirestoreSettings(user, currentSettings);
        } else {
            // User is logged out, save to localStorage.
            localStorage.setItem('accessibility-theme', currentSettings.accessibilityTheme);
            localStorage.setItem('sidebar-position', currentSettings.sidebarPosition);
            if (currentSettings.customTheme) {
                localStorage.setItem('custom-theme', JSON.stringify(currentSettings.customTheme));
            } else {
                localStorage.removeItem('custom-theme');
            }
        }
    }, [user, isAuthLoading, nextTheme, resolvedTheme, accessibilityTheme, sidebarPosition, customTheme]);

    return null; // This component does not render anything.
}
