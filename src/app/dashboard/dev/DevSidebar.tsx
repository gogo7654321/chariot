
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
import { Separator } from '@/components/ui/separator';

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
