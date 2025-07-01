'use client';

import { DevSidebar } from '@/app/dashboard/dev/DevSidebar';
import { Sidebar, SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
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
