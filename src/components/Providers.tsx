
"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { AppearanceProvider } from '@/contexts/AppearanceContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { UserSettingsManager } from '@/components/UserSettingsManager';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppearanceProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          storageKey="light-dark-theme"
        >
          <UserSettingsManager />
          {children}
        </ThemeProvider>
      </AppearanceProvider>
    </AuthProvider>
  );
}
