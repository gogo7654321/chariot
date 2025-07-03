
'use client';

import { useEffect } from 'react';
import { useAppearance, type CustomTheme } from '@/contexts/AppearanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { useTheme as useNextTheme } from 'next-themes';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
type SidebarPosition = 'left' | 'right' | 'top' | 'bottom';

// This is the settings structure that will be saved to localStorage and Firestore.
export type AppearanceSettings = {
    updatedAt?: number;
    lightDarkTheme: 'light' | 'dark' | 'system';
    accessibilityTheme: AccessibilityTheme;
    sidebarPosition: SidebarPosition;
    customTheme: CustomTheme | null;
    areShootingStarsEnabled: boolean;
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
        areShootingStarsEnabled,
        setAreShootingStarsEnabled,
        isAppearanceLoading,
        setIsAppearanceLoading,
    } = useAppearance();

    // Effect for LOADING settings from Firestore for logged-in users
    useEffect(() => {
        const loadSettings = async () => {
            setIsAppearanceLoading(true);
            
            const localSettingsJSON = localStorage.getItem('appearance-settings');
            const localSettings = localSettingsJSON ? JSON.parse(localSettingsJSON) as AppearanceSettings : null;

            let finalSettings: AppearanceSettings | null = localSettings;

            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);
                    const firestoreSettings = docSnap.exists() ? docSnap.data().appearance as AppearanceSettings | undefined : undefined;

                    if (firestoreSettings) {
                        // If firestore is newer or local doesn't exist, use firestore
                        if (!localSettings || (firestoreSettings.updatedAt || 0) > (localSettings.updatedAt || 0)) {
                            finalSettings = firestoreSettings;
                        }
                    }
                } catch (error) {
                    console.error("Failed to load user settings from Firestore:", error);
                }
            }

            if (finalSettings) {
                setNextTheme(finalSettings.lightDarkTheme || 'light');
                setAccessibilityTheme(finalSettings.accessibilityTheme || 'default');
                setSidebarPosition(finalSettings.sidebarPosition || 'left');
                applyCustomTheme(finalSettings.customTheme || null);
                setAreShootingStarsEnabled(finalSettings.areShootingStarsEnabled ?? true);
            }

            setIsAppearanceLoading(false);
        };

        if (!isAuthLoading) {
            loadSettings();
        }
    }, [user, isAuthLoading, setIsAppearanceLoading, setNextTheme, setAccessibilityTheme, setSidebarPosition, applyCustomTheme, setAreShootingStarsEnabled]);


    // Effect for SAVING settings to localStorage and Firestore
    useEffect(() => {
        if (isAppearanceLoading) return; // Don't save anything while initial settings are still loading.

        const currentSettings: AppearanceSettings = {
            updatedAt: Date.now(),
            lightDarkTheme: nextTheme as AppearanceSettings['lightDarkTheme'],
            accessibilityTheme: accessibilityTheme,
            sidebarPosition: sidebarPosition,
            customTheme: customTheme,
            areShootingStarsEnabled: areShootingStarsEnabled,
        };
        
        localStorage.setItem('appearance-settings', JSON.stringify(currentSettings));

        if (user) {
            // Debounce Firestore writes to avoid excessive updates
            const timer = setTimeout(() => {
                saveFirestoreSettings(user, currentSettings);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [user, isAppearanceLoading, nextTheme, accessibilityTheme, sidebarPosition, customTheme, areShootingStarsEnabled]);

    return null;
}
