
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

// This is the settings structure that will be saved to localStorage and Firestore.
export type AppearanceSettings = {
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
    const { user, isLoading: isAuthLoading } = useAuth();
    const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
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

    // Effect for LOADING settings from Firestore for logged-in users
    useEffect(() => {
        if (isAuthLoading) {
            setIsAppearanceLoading(true);
            return;
        }

        if (!user) {
            // For guests, settings are already loaded by the ThemeInitializer script.
            // We just need to signal that the loading process is complete.
            setIsAppearanceLoading(false);
            isFirestoreInitialized.current = false; // Reset for next login
            return;
        }

        // For logged-in users, subscribe to Firestore for real-time updates.
        const userDocRef = doc(db, 'users', user.uid);
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            const savedSettings = docSnap.exists() ? docSnap.data()?.appearance as AppearanceSettings | undefined : undefined;

            if (savedSettings) {
                setNextTheme(savedSettings.lightDarkTheme || 'light');
                setAccessibilityTheme(savedSettings.accessibilityTheme || 'default');
                setSidebarPosition(savedSettings.sidebarPosition || 'left');
                applyCustomTheme(savedSettings.customTheme || null);
            }
            
            isFirestoreInitialized.current = true;
            setIsAppearanceLoading(false);

        }, (error) => {
            console.error("Failed to load user settings:", error);
            setIsAppearanceLoading(false);
        });

        return () => {
            unsubscribe();
            isFirestoreInitialized.current = false;
        };
    }, [user, isAuthLoading, setNextTheme, setAccessibilityTheme, setSidebarPosition, applyCustomTheme, setIsAppearanceLoading]);

    // Effect for SAVING settings to localStorage and Firestore
    useEffect(() => {
        if (isAuthLoading) return;
        if (user && !isFirestoreInitialized.current) return;

        const currentSettings: AppearanceSettings = {
            lightDarkTheme: nextTheme as AppearanceSettings['lightDarkTheme'],
            accessibilityTheme: accessibilityTheme,
            sidebarPosition: sidebarPosition,
            customTheme: customTheme,
        };
        
        // Always save to localStorage. This acts as a cache for the initial load script.
        localStorage.setItem('appearance-settings', JSON.stringify(currentSettings));

        if (user) {
            saveFirestoreSettings(user, currentSettings);
        }
    }, [user, isAuthLoading, nextTheme, accessibilityTheme, sidebarPosition, customTheme]);

    return null;
}
