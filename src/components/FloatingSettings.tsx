'use client';

import { Palette, LogIn } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { useAppearance } from '@/contexts/AppearanceContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Separator } from './ui/separator';
import Link from 'next/link';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";

export function FloatingSettings() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { theme: accessibilityTheme, setTheme: setAccessibilityTheme } = useAppearance();

  const onLandingPage = pathname.startsWith('/landing');
  const isDashboardPage = pathname.startsWith('/dashboard') || pathname.startsWith('/auth');

  if (isDashboardPage) {
    return null;
  }

  const isDarkModeEnabled = theme === 'dark';
  
  let darkModeControl: React.ReactNode;
  
  if (onLandingPage) {
      darkModeControl = (
        <div className="space-y-2 rounded-lg border bg-secondary/50 p-3 text-center">
            <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode-switch-disabled" className="text-muted-foreground/80">
                    Dark Mode
                </Label>
                <Switch id="dark-mode-switch-disabled" disabled checked={false} />
            </div>
            <p className="text-xs text-muted-foreground">
                Dark mode is disabled on the landing page to preserve its unique design.
            </p>
        </div>
      );
  } else if (user) {
      darkModeControl = (
          <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode-switch">
                  Dark Mode
              </Label>
              <Switch
                  id="dark-mode-switch"
                  checked={isDarkModeEnabled}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  aria-label="Toggle dark mode"
              />
          </div>
      );
  } else {
      darkModeControl = (
          <div className="space-y-3 rounded-lg border bg-secondary/50 p-4">
              <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode-switch-disabled" className="text-muted-foreground/80">
                      Dark Mode
                  </Label>
                  <Switch id="dark-mode-switch-disabled" disabled />
              </div>
              <p className="text-xs text-muted-foreground">Log in to enable dark mode and save your theme preferences.</p>
              <Button asChild className="w-full">
                  <Link href="/auth">
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In or Sign Up
                  </Link>
              </Button>
          </div>
      );
  }


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-5 right-5 z-50 rounded-full h-14 w-14 shadow-lg border bg-card hover:bg-card/90"
          aria-label="Open appearance settings"
        >
          <Palette className="h-6 w-6" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mb-2" side="top" align="end">
        <div className="grid gap-4">
          <div className="space-y-1">
            <h4 className="font-medium leading-none">Appearance</h4>
            <p className="text-sm text-muted-foreground">
              Customize the look and feel of the site.
            </p>
          </div>
          <Separator />
          <div className="grid gap-4">
            {darkModeControl}
            <div className="space-y-2">
                <Label>Colorblind Mode</Label>
                <RadioGroup
                    value={accessibilityTheme}
                    onValueChange={(value) => setAccessibilityTheme(value as AccessibilityTheme)}
                    className="space-y-1"
                >
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1" className="font-normal">Default</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="protanopia" id="r2" />
                        <Label htmlFor="r2" className="font-normal">Protanopia (Red-Blind)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="deuteranopia" id="r3" />
                        <Label htmlFor="r3" className="font-normal">Deuteranopia (Green-Blind)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tritanopia" id="r4" />
                        <Label htmlFor="r4" className="font-normal">Tritanopia (Blue-Yellow-Blind)</Label>
                    </div>
                </RadioGroup>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
