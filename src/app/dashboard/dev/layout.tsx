
'use client';

import { DevSidebar } from '@/app/dashboard/dev/DevSidebar';
import { Sidebar, SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import React, { useLayoutEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { isDev } from '@/lib/authUtils';

function DevPortalLayout({ children }: { children: React.ReactNode }) {
  const { setOpen, isMobile } = useSidebar();

  const handleMouseEnter = () => {
    if (!isMobile) {
      setOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setOpen(false);
    }
  };

  return (
    <>
      <Sidebar 
        collapsible="icon"
        variant="sidebar"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DevSidebar />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </>
  );
}

export default function ProtectedDevLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  // This effect forces a default, un-themed style for the dev portal.
  useLayoutEffect(() => {
    const html = document.documentElement;
    // Forcibly remove theme-related attributes and classes.
    html.classList.remove('dark');
    html.removeAttribute('data-theme');
    html.removeAttribute('data-custom-theme-active');
    html.removeAttribute('data-theme-id');
    html.removeAttribute('data-has-full-background');
    html.removeAttribute('data-starry-night');

    // Remove any inline styles set by the theme customizer to be safe.
    html.style.cssText = '';

    // Add a specific class to the body for dev-portal-only styles if needed.
    document.body.classList.add('dev-portal-scope');

    // Cleanup when the component unmounts
    return () => {
      document.body.classList.remove('dev-portal-scope');
      // When leaving dev portal, we don't need to restore themes here,
      // as the ThemeInitializer and UserSettingsManager will handle it
      // for the next page.
    };
  }, []); // Empty dependency array ensures this runs once on mount.


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is not logged in or is not a developer, show a 404 page.
  if (!user || !isDev(user)) {
    notFound();
  }

  // If user is a developer, render the dev portal layout.
  return (
    <SidebarProvider defaultOpen={false}>
      <DevPortalLayout>
        {children}
      </DevPortalLayout>
    </SidebarProvider>
  );
}
