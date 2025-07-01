
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Settings,
  Sun,
  Moon,
  MoveHorizontal,
  Palette,
  Bell,
  User,
  Wrench,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTheme } from 'next-themes';
import { useAppearance } from '@/contexts/AccessibilityContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountSettingsForm } from './AccountSettingsForm';
import { ScrollArea } from '@/components/ui/scroll-area';

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";
type SidebarPosition = "left" | "right" | "top" | "bottom";


export function SettingsDialog({ trigger }: { trigger: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { 
    theme: accessibilityTheme, 
    setTheme: setAccessibilityTheme,
    sidebarPosition,
    setSidebarPosition
  } = useAppearance();

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account and appearance settings. Your preferences are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="pt-4 flex-1 min-h-0">
          <Tabs defaultValue="appearance" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Appearance</TabsTrigger>
              <TabsTrigger value="account"><User className="mr-2 h-4 w-4" />Account</TabsTrigger>
              <TabsTrigger value="notifications" disabled><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="appearance" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2"><Sun className="h-4 w-4 hidden dark:inline-block" /><Moon className="h-4 w-4 inline-block dark:hidden" /> Dark Mode</Label>
                                <p className="text-sm text-muted-foreground">Toggle between light and dark themes.</p>
                            </div>
                            <Switch
                                checked={theme === 'dark'}
                                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label className="text-base flex items-center gap-2"><MoveHorizontal className="h-4 w-4" /> Sidebar Position</Label>
                                <p className="text-sm text-muted-foreground">Choose where the dashboard sidebar appears.</p>
                            </div>
                            <Select value={sidebarPosition} onValueChange={(v) => setSidebarPosition(v as SidebarPosition)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="left">Left</SelectItem>
                                    <SelectItem value="right">Right</SelectItem>
                                    <SelectItem value="top">Top</SelectItem>
                                    <SelectItem value="bottom">Bottom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="rounded-lg border p-4">
                            <div className="space-y-1">
                                <Label className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Colorblind Mode</Label>
                                <p className="text-sm text-muted-foreground">Adjust colors for better visibility.</p>
                            </div>
                            <RadioGroup
                                value={accessibilityTheme}
                                onValueChange={(value) => setAccessibilityTheme(value as AccessibilityTheme)}
                                className="grid sm:grid-cols-2 gap-4 pt-4"
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
                </ScrollArea>
            </TabsContent>
             <TabsContent value="account" className="mt-6 flex-1 min-h-0">
                <ScrollArea className="h-full pr-4">
                    <AccountSettingsForm />
                </ScrollArea>
             </TabsContent>
             <TabsContent value="notifications">
                 <div className="text-center py-16 text-muted-foreground">
                    <Wrench className="mx-auto h-12 w-12" />
                    <h3 className="mt-4 text-lg font-semibold">Notification Controls Coming Soon</h3>
                    <p className="mt-1 text-sm">Soon you'll be able to manage your email and push notifications here.</p>
                </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
