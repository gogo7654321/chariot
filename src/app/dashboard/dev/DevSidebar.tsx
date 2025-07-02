
'use client';

import * as React from "react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  MessageSquareWarning,
  Inbox,
  TestTube2,
  LogOut,
  User as UserIcon,
  BookCopy,
  Sun,
  Moon,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { AceMascot } from '@/components/AceMascot';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { AccessibilitySettings } from '@/components/AccessibilitySettings';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const devMenuItems = [
  { href: '/dashboard/dev', label: 'Dashboard Home', icon: Home },
  { href: '/dashboard/dev/user-search', label: 'User Search', icon: Users },
  { href: '/dashboard/dev/moderation', label: 'Question Moderation', icon: MessageSquareWarning },
  { href: '/dashboard/dev/feedback', label: 'Feedback Inbox', icon: Inbox },
  { href: '/dashboard/dev/logs', label: 'Logs & System Tools', icon: TestTube2 },
];

export function DevSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleIsActive = (href: string) => {
    if (href === '/dashboard/dev') {
      return pathname === '/dashboard/dev';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <SidebarHeader>
        <a href="/" className="flex items-center gap-2">
          <AceMascot className="w-8 h-8 flex-shrink-0" />
          <span className="font-bold text-lg whitespace-nowrap transition-opacity duration-500 group-data-[state=collapsed]:opacity-0">
            AP Ace<span className="copyright-symbol">&copy;</span>
          </span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {devMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                href={item.href}
                isActive={handleIsActive(item.href)}
                asChild
                tooltip={item.label}
              >
                <a href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton href="/dashboard" tooltip="Exit Dev Portal" asChild>
              <a href="/dashboard">
                <BookCopy />
                <span>Student Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        
        <div className="relative h-[72px]">
            {/* Expanded view */}
            <div className="absolute inset-0 space-y-1 p-2 transition-opacity duration-200 group-data-[state=collapsed]:pointer-events-none group-data-[state=collapsed]:opacity-0">
                <div className="flex items-center justify-between">
                    <Label htmlFor="dev-theme-switch" className="flex cursor-pointer items-center gap-2 text-sm">
                        <div className="relative flex h-4 w-4 items-center justify-center">
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        </div>
                        <span className="whitespace-nowrap">Dark Mode</span>
                    </Label>
                    <Switch
                        id="dev-theme-switch"
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    />
                </div>
                <AccessibilitySettings triggerType="button" />
            </div>

            {/* Collapsed view */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-1 transition-opacity duration-200 group-data-[state=expanded]:pointer-events-none group-data-[state=expanded]:opacity-0">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            >
                            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">Toggle Theme</TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                    <AccessibilitySettings triggerType="icon" />
                    </TooltipTrigger>
                    <TooltipContent side="right" align="center">Accessibility</TooltipContent>
                </Tooltip>
            </div>
        </div>
        
        {user && <UserInfo user={user} />}
      </SidebarFooter>
    </>
  );
}

function UserInfo({ user }: { user: User }) {
  const { state } = useSidebar();
  const [username, setUsername] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists() && docSnap.data().username) {
            setUsername(docSnap.data().username);
        } else {
            setUsername(null);
        }
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div
      data-state={state}
      className={cn(
        'flex items-center rounded-lg mt-2 transition-all duration-500',
        'data-[state=expanded]:p-2 data-[state=expanded]:gap-3',
        'data-[state=collapsed]:justify-center'
      )}
    >
      <Avatar
        data-state={state}
        className={cn(
          'flex-shrink-0 transition-all duration-500',
          'data-[state=expanded]:h-10 data-[state=expanded]:w-10',
          'data-[state=collapsed]:h-8 data-[state=collapsed]:w-8'
        )}
      >
        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
        <AvatarFallback>{user.email?.charAt(0).toUpperCase() || <UserIcon />}</AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'overflow-hidden transition-opacity duration-200',
          'data-[state=collapsed]:w-0 data-[state=collapsed]:opacity-0'
        )}
      >
        <p className="font-semibold text-sm truncate whitespace-nowrap">{user.displayName || <><span className="whitespace-nowrap">AP Ace<span className="copyright-symbol">&copy;</span></span> Developer</>}</p>
        <p className="text-xs text-muted-foreground truncate whitespace-nowrap">{username ? `@${username}` : (user.email || 'No username')}</p>
      </div>
    </div>
  );
}
