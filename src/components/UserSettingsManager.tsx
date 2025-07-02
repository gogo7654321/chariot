
'use client';

import { useEffect, useRef } from 'react';
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
    } = useNextTheme();
    const {
        theme: accessibilityTheme,
        setTheme: setAccessibilityTheme,
        sidebarPosition,
        setSidebarPosition,
        customTheme,
        applyCustomTheme,
        setIsAppearanceLoading,
    } = useAppearance();

    const isFirestoreInitialized = useRef(false);

    // Effect for loading settings from storage (localStorage or Firestore)
    useEffect(() => {
        // If auth is still loading, we wait. The appearance is also considered loading.
        if (isAuthLoading) {
            return;
        }

        // If not logged in, load from localStorage and finish.
        if (!user) {
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
            setIsAppearanceLoading(false);
            return;
        }

        // If logged in, subscribe to Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            const savedSettings = docSnap.exists() ? docSnap.data()?.appearance as AppearanceSettings | undefined : undefined;

            if (savedSettings) {
                // Apply saved settings
                setNextTheme(savedSettings.lightDarkTheme || 'light');
                setAccessibilityTheme(savedSettings.accessibilityTheme || 'default');
                setSidebarPosition(savedSettings.sidebarPosition || 'left');
                applyCustomTheme(savedSettings.customTheme || null);
            }
            
            // Mark as initialized and stop loading after the first data check
            if (!isFirestoreInitialized.current) {
                setIsAppearanceLoading(false);
                isFirestoreInitialized.current = true;
            }
        }, (error) => {
            console.error("Failed to load user settings:", error);
            setIsAppearanceLoading(false); // Stop loading even on error
        });

        return () => {
            unsubscribe();
            isFirestoreInitialized.current = false; // Reset on user change/logout
        };
    }, [user, isAuthLoading, setNextTheme, setAccessibilityTheme, setSidebarPosition, applyCustomTheme, setIsAppearanceLoading]);

    // Effect for saving settings to storage
    useEffect(() => {
        // Do not save anything until the initial settings have been loaded
        if (!isFirestoreInitialized.current && !user) return; // For logged-out, wait for localStorage load
        if (user && !isFirestoreInitialized.current) return; // For logged-in, wait for Firestore load
        
        const currentSettings: AppearanceSettings = {
            lightDarkTheme: nextTheme as AppearanceSettings['lightDarkTheme'],
            accessibilityTheme: accessibilityTheme,
            sidebarPosition: sidebarPosition,
            customTheme: customTheme,
        };

        if (user) {
            // Logged-in: save to Firestore
            saveFirestoreSettings(user, currentSettings);
        } else {
            // Logged-out: save to localStorage
            localStorage.setItem('accessibility-theme', currentSettings.accessibilityTheme);
            localStorage.setItem('sidebar-position', currentSettings.sidebarPosition);
            if (currentSettings.customTheme) {
                localStorage.setItem('custom-theme', JSON.stringify(currentSettings.customTheme));
            } else {
                localStorage.removeItem('custom-theme');
            }
        }
    }, [user, nextTheme, accessibilityTheme, sidebarPosition, customTheme]);

    return null; // This component does not render anything.
}
