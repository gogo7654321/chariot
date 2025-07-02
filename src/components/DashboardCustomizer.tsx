
'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppearance, type CustomTheme } from '@/contexts/AppearanceContext';
import { Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_PRESETS, createThemeObject } from '@/lib/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ResetToDefault = () => {
    const { resetCustomTheme } = useAppearance();
    return (
     <div>
        <Separator className="my-6" />
        <h3 className="text-lg font-semibold mb-2">Reset</h3>
        <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
                <Label>Reset to Default</Label>
                <p className="text-xs text-muted-foreground">Revert all colors to the AP Ace© default.</p>
            </div>
            <Button variant="outline" onClick={resetCustomTheme}>Reset</Button>
        </div>
    </div>
  )
}

export function DashboardCustomizer({ children }: { children: React.ReactNode }) {
  const { customTheme, applyCustomTheme } = useAppearance();

  const handlePresetSelect = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const themeObject = createThemeObject(preset);
      applyCustomTheme(themeObject);
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Dashboard Customizer</SheetTitle>
          <SheetDescription>
            Personalize your dashboard experience. Changes are saved automatically.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs defaultValue="presets" className="flex-1 flex flex-col min-h-0 pt-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="presets">Presets</TabsTrigger>
                <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>
            <TabsContent value="presets" className="flex-1 overflow-auto mt-4">
                 <ScrollArea className="h-full pr-4">
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Theme Presets</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {THEME_PRESETS.map((preset) => (
                                    <button
                                        key={preset.id}
                                        onClick={() => handlePresetSelect(preset.id)}
                                        className={cn(
                                            "relative rounded-xl border-2 p-3 text-left transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                            customTheme?.id === preset.id ? "border-primary" : "border-border"
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{preset.name}</span>
                                            {customTheme?.id === preset.id && (
                                                <Check className="h-5 w-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="mt-2 flex gap-1">
                                            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.colors.primary }}></div>
                                            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.colors.accent }}></div>
                                            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.colors.secondary }}></div>
                                            <div className="h-5 w-5 rounded-full" style={{ backgroundColor: preset.colors.background }}></div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <ResetToDefault />
                    </div>
                </ScrollArea>
            </TabsContent>
            <TabsContent value="manual" className="flex-1 overflow-auto mt-4">
                <ScrollArea className="h-full pr-4">
                     <div className="space-y-6">
                         <div>
                            <h3 className="text-lg font-semibold mb-3">Manual Color Editor</h3>
                            <div className="space-y-4 rounded-xl border bg-secondary/50 p-4">
                                <Info className="mx-auto h-8 w-8 text-muted-foreground" />
                                <p className="text-center text-sm text-muted-foreground">
                                    The advanced manual color editor with sliders and pickers is coming soon!
                                </p>
                            </div>
                        </div>
                        <ResetToDefault />
                    </div>
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
