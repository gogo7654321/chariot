
"use client";

import * as React from "react";
import {
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    BookCopy,
    ListTodo,
    Calendar,
    Settings,
    LifeBuoy,
    LogOut,
    User as UserIcon,
    Wrench,
    FolderKanban,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { AceMascot } from "./AceMascot";
import { useAuth } from "@/contexts/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut, type User } from "firebase/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { isDev } from "@/lib/authUtils";
import { logUserAction } from "@/lib/logging";
import { Separator } from "./ui/separator";
import { SettingsDialog } from "./SettingsDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";


const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/ace-os", label: <>Ace OS<span className="copyright-symbol">&copy;</span></>, icon: BookCopy },
    { href: "/dashboard/my-courses", label: "My Courses", icon: FolderKanban },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/assignments", label: "Assignments", icon: ListTodo },
];


export function DashboardSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { side } = useSidebar();
    const isDeveloper = isDev(user);
    const isHorizontal = side === 'top' || side === 'bottom';

    const handleLogout = async () => {
        await logUserAction(user ? { uid: user.uid, email: user.email } : null, 'logout');
        await signOut(auth);
        router.push("/");
    };

    const handleIsActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    };

    if (isHorizontal) {
        return (
            <div className="flex h-full w-full items-center justify-between px-4">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    <SidebarHeader className="p-0">
                         <a href="/" className="flex items-center gap-2">
                            <AceMascot className="w-8 h-8 flex-shrink-0" />
                            <span className="font-bold text-lg whitespace-nowrap">AP Ace<span className="copyright-symbol">&copy;</span></span>
                        </a>
                    </SidebarHeader>
                    <Separator orientation="vertical" className="h-6" />
                    <SidebarMenu className="flex-row gap-1">
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <SidebarMenuButton
                                    href={item.href}
                                    isActive={handleIsActive(item.href)}
                                    asChild
                                    className="h-9"
                                    tooltip={typeof item.label === 'string' ? item.label : 'Ace OS©'}
                                >
                                    <a href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    <SidebarMenu className="flex-row gap-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/support" isActive={pathname.startsWith('/support')} asChild tooltip="Support" className="h-9 px-3">
                                <a href="/support">
                                    <LifeBuoy />
                                    <span>Support</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SettingsDialog trigger={
                                <SidebarMenuButton tooltip="Settings" className="h-9 px-3">
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            } />
                        </SidebarMenuItem>
                        {isDeveloper && (
                            <SidebarMenuItem>
                                <SidebarMenuButton href="/dashboard/dev" isActive={pathname.startsWith('/dashboard/dev')} asChild tooltip="Dev Portal" className="h-9 px-3">
                                    <a href="/dashboard/dev">
                                        <Wrench />
                                        <span>Dev Portal</span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                    <Separator orientation="vertical" className="h-6" />
                    {user && <UserInfo user={user} onLogout={handleLogout} />}
                </div>
            </div>
        );
    }

    return (
        <>
            <SidebarHeader>
                 <a href="/" className="flex items-center gap-2">
                    <AceMascot className="w-8 h-8 flex-shrink-0" />
                    <span className="font-bold text-lg whitespace-nowrap transition-opacity duration-500 group-data-[state=collapsed]:opacity-0">AP Ace<span className="copyright-symbol">&copy;</span></span>
                </a>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {menuItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                href={item.href}
                                isActive={handleIsActive(item.href)}
                                asChild
                                tooltip={typeof item.label === 'string' ? item.label : 'Ace OS©'}
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
                        <SidebarMenuButton href="/support" isActive={pathname.startsWith('/support')} asChild tooltip="Support">
                            <a href="/support">
                                <LifeBuoy />
                                <span>Support</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SettingsDialog trigger={
                            <SidebarMenuButton tooltip="Settings">
                                <Settings />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        } />
                    </SidebarMenuItem>
                    {isDeveloper && (
                        <SidebarMenuItem>
                            <SidebarMenuButton href="/dashboard/dev" isActive={pathname.startsWith('/dashboard/dev')} asChild tooltip="Dev Portal">
                                <a href="/dashboard/dev">
                                    <Wrench />
                                    <span>Dev Portal</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                     <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <Separator className="my-2" />
                {user && <UserInfo user={user} onLogout={handleLogout} />}
            </SidebarFooter>
        </>
    );
}

function UserInfo({ user, onLogout }: { user: User, onLogout?: () => void }) {
    const { state, side } = useSidebar();
    const router = useRouter();
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

    if (side === 'top' || side === 'bottom') {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                            <AvatarFallback>{user.email?.charAt(0).toUpperCase() || <UserIcon />}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">{username ? `@${username}` : (user.email || 'No username')}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {onLogout && (
                        <DropdownMenuItem onClick={onLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div data-state={state} className={cn(
            "flex items-center rounded-lg mt-2 transition-all duration-500",
            "data-[state=expanded]:p-2 data-[state=expanded]:gap-3",
            "data-[state=collapsed]:justify-center"
        )}>
             <Avatar data-state={state} className={cn(
                "flex-shrink-0 transition-all duration-500",
                "data-[state=expanded]:h-10 data-[state=expanded]:w-10",
                "data-[state=collapsed]:h-8 data-[state=collapsed]:w-8"
            )}>
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
              <AvatarFallback>
                {user.email?.charAt(0).toUpperCase() || <UserIcon/>}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
                "overflow-hidden transition-opacity duration-200",
                "data-[state=collapsed]:w-0 data-[state=collapsed]:opacity-0"
            )}>
                <p className="font-semibold text-sm truncate whitespace-nowrap">{user.displayName || <>AP Ace<span className="copyright-symbol">&copy;</span> Student</>}</p>
                <p className="text-xs text-muted-foreground truncate whitespace-nowrap">{username ? `@${username}` : (user.email || 'No username')}</p>
            </div>
        </div>
    )
}
