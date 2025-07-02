
'use client';

import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Sidebar, SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect } from 'react';
import { LogIn, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AceMascot } from "@/components/AceMascot";
import { usePathname } from 'next/navigation';
import { useAppearance } from '@/contexts/AppearanceContext';

function DashboardWithSidebar({ children }: { children: React.ReactNode }) {
  const { setOpen, isMobile } = useSidebar();
  const { sidebarPosition } = useAppearance();

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
        variant="floating"
        side={sidebarPosition}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </>
  );
}

function DashboardWithSidebarAndContext({ children }: { children: React.ReactNode }) {
  const { sidebarPosition } = useAppearance();

  return (
    <SidebarProvider defaultOpen={false} side={sidebarPosition}>
      <DashboardWithSidebar>
        {children}
      </DashboardWithSidebar>
    </SidebarProvider>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { isAppearanceLoading } = useAppearance();
  const pathname = usePathname();

  // This effect adds a scoping class to the body tag when this layout is active.
  useEffect(() => {
    document.body.classList.add('dashboard-scope');
    // Cleanup function to remove the class when the layout unmounts
    return () => {
      document.body.classList.remove('dashboard-scope');
    }
  }, []);

  const isLoading = isAuthLoading || isAppearanceLoading;

  // Routes that should NOT have the main dashboard sidebar
  const isDevPortal = pathname.startsWith('/dashboard/dev');
  const isFullPage = pathname.startsWith('/dashboard/ace-os/create') || pathname.startsWith('/dashboard/ace-os/study');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background p-4 md:p-8">
        <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader className="p-8">
                <AceMascot className="mx-auto h-20 w-20" />
                <CardTitle className="font-headline text-3xl mt-4">Access Your Dashboard</CardTitle>
                <CardDescription className="pt-2 text-base text-muted-foreground">
                    Please log in to view your personalized dashboard, track your progress, and use our AI tools.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0">
                <Button asChild size="lg" className="w-full font-bold">
                    <Link href="/auth">
                        <LogIn className="mr-2 h-5 w-5" />
                        Log In or Sign Up
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isDevPortal || isFullPage) {
    return <>{children}</>;
  }

  // If user is logged in and not on a special page, render the dashboard with the sidebar.
  return (
    <DashboardWithSidebarAndContext>
      {children}
    </DashboardWithSidebarAndContext>
  );
}
