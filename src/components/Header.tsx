
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import { AceMascot } from "@/components/AceMascot";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { auth } from "@/lib/firebase";
import { signOut, type User } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { logUserAction } from "@/lib/logging";


const mainRoutes = [
  { name: "Courses", href: "/classes" },
  { name: "Guides", href: "/guides" },
  { name: "AI Tools", href: "/tools" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
  { name: "Support", href: "/support" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logUserAction(user ? { uid: user.uid, email: user.email } : null, 'logout');
    await signOut(auth);
    setIsOpen(false); // Close sheet on logout
    router.push("/");
  };
  
  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isDashboard = pathname.startsWith('/dashboard');
  if (isDashboard) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-colors duration-300",
        navbarScrolled ? "border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" : "border-transparent"
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
          <AceMascot className="h-8 w-8" />
          <span>AP Ace</span>
        </Link>
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
                <Link href="/dashboard" legacyBehavior passHref>
                <NavigationMenuLink className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent hover:text-primary focus:text-primary",
                    pathname.startsWith("/dashboard") && "text-primary"
                )}>
                    Dashboard
                </NavigationMenuLink>
                </Link>
            </NavigationMenuItem>
            {mainRoutes.map((route) => (
              <NavigationMenuItem key={route.href}>
                <Link href={route.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "bg-transparent hover:text-primary focus:text-primary",
                       pathname.startsWith(route.href) && "text-primary"
                    )}
                  >
                    {route.name}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
          <UserNav user={user} isLoading={isLoading} onLogout={handleLogout} />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
               <div className="flex h-full flex-col p-6">
                 <div className="flex-1">
                    <Link href="/" className="flex items-center gap-2 font-bold font-headline text-lg">
                      <AceMascot className="h-8 w-8" />
                      <span>AP Ace</span>
                    </Link>
                    <nav className="grid gap-2 mt-6">
                      <Link
                          href="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-lg font-medium transition-colors hover:text-primary py-2",
                            pathname.startsWith('/dashboard') ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          Dashboard
                        </Link>
                      {mainRoutes.map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "text-lg font-medium transition-colors hover:text-primary py-2",
                            pathname.startsWith(route.href) ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {route.name}
                        </Link>
                      ))}
                    </nav>
                 </div>
                 <div className="mt-auto">
                    <Separator className="my-4" />
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="w-full space-y-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    ) : user ? (
                        <div className="flex flex-col gap-4">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                                  <AvatarFallback>
                                    {user.email?.charAt(0).toUpperCase() || <UserIcon/>}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden flex-1">
                                    <p className="font-semibold text-sm truncate">{user.displayName || <>AP Ace<span className="copyright-symbol">&copy;</span> Student</>}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut className="mr-2" />
                                Log Out
                            </Button>
                        </div>
                    ) : (
                         <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                            <Link href="/auth">Log In / Sign Up</Link>
                        </Button>
                    )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function UserNav({ user, isLoading, onLogout }: { user: User | null, isLoading: boolean, onLogout: () => void }) {
  const router = useRouter();
  
  if (isLoading) {
    return <Skeleton className="h-10 w-10 rounded-full hidden md:block" />;
  }

  if (user) {
    return (
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                <AvatarFallback>
                  {user.email?.charAt(0).toUpperCase() || <UserIcon/>}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard')}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <Button asChild className="hidden md:flex">
      <Link href="/auth">Login</Link>
    </Button>
  );
}
