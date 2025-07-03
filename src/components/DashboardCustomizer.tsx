
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppearance, type CustomTheme } from '@/contexts/AppearanceContext';
import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_PRESETS, createThemeObject } from '@/lib/themes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getContrastRatio, isColorDark } from '@/lib/colorUtils';

const ResetToDefault = () => {
    const { resetCustomTheme } = useAppearance();
    return (
     <div>
        <Separator className="my-6" />
        <h3 className="text-base font-semibold mb-3 text-muted-foreground">Reset</h3>
        <div className="flex items-center justify-between rounded-xl border p-3 bg-secondary/50">
            <div>
                <Label>Reset to Default</Label>
                <p className="text-xs text-muted-foreground">Revert all colors to the AP Ace© default.</p>
            </div>
            <Button
                variant="outline"
                onClick={resetCustomTheme}
                className="border-border bg-background text-foreground hover:bg-accent"
            >
                Reset
            </Button>
        </div>
    </div>
  )
}

const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void; }) => {
  return (
    <div className="flex items-center justify-between">
      <Label>{label}</Label>
      <div className="flex items-center gap-2 border rounded-full p-1 pr-3 bg-background">
        <div className="relative h-6 w-6 rounded-full overflow-hidden border">
          <div className="absolute inset-0" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) {
              onChange(e.target.value);
            }
          }}
          className="w-20 bg-transparent border-none focus:outline-none font-mono text-sm p-0"
        />
      </div>
    </div>
  );
};


function ManualEditor() {
    const { customTheme, applyCustomTheme, resetCustomTheme } = useAppearance();
    const [manualColors, setManualColors] = useState<CustomTheme['colors']>(
        customTheme?.colors || createThemeObject(THEME_PRESETS.find(p => p.id === 'starlight-void')!).colors
    );
    const [isWarningOpen, setWarningOpen] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    useEffect(() => {
        setManualColors(customTheme?.colors || createThemeObject(THEME_PRESETS.find(p => p.id === 'starlight-void')!).colors);
    }, [customTheme]);

    const handleColorChange = (key: keyof CustomTheme['colors'], value: string) => {
        const newColors = { ...manualColors, [key]: value };
        setManualColors(newColors);

        const newTheme: CustomTheme = {
            id: 'manual-edit',
            name: 'Manual Edit',
            colors: newColors,
        };
        applyCustomTheme(newTheme);
        checkContrast(newColors);
    };

    const checkContrast = (theme: CustomTheme['colors']) => {
        const bgFgContrast = getContrastRatio(theme.background, theme.foreground);
        if (bgFgContrast < 4.5) {
            setWarningMessage(`The contrast between your background and text color is very low (${bgFgContrast.toFixed(2)}:1). This may make text hard to read.`);
            setWarningOpen(true);
            return;
        }

        const primaryFg = isColorDark(theme.primary) ? '#FFFFFF' : '#000000';
        const primaryContrast = getContrastRatio(theme.primary, primaryFg);
        if (primaryContrast < 3) {
            setWarningMessage(`The contrast on your primary button is low (${primaryContrast.toFixed(2)}:1), which may make it hard to read.`);
            setWarningOpen(true);
            return;
        }
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3">Manual Color Editor</h3>
                <div className="space-y-4 rounded-xl border p-4">
                    <ColorInput label="Primary" value={manualColors.primary} onChange={(v) => handleColorChange('primary', v)} />
                    <ColorInput label="Accent" value={manualColors.accent} onChange={(v) => handleColorChange('accent', v)} />
                    <ColorInput label="Background" value={manualColors.background} onChange={(v) => handleColorChange('background', v)} />
                    <ColorInput label="Card / Secondary" value={manualColors.secondary} onChange={(v) => handleColorChange('secondary', v)} />
                    <ColorInput label="Text" value={manualColors.foreground} onChange={(v) => handleColorChange('foreground', v)} />
                </div>
            </div>
            <ResetToDefault />
            <AlertDialog open={isWarningOpen} onOpenChange={setWarningOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-amber-500" />
                            Contrast Warning
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {warningMessage}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Dismiss</AlertDialogCancel>
                        <AlertDialogAction onClick={resetCustomTheme} className={buttonVariants({ variant: "destructive" })}>
                            Reset Colors
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function PresetsTab() {
  const { customTheme, applyCustomTheme } = useAppearance();

  const handlePresetSelect = (presetId: string) => {
    const preset = THEME_PRESETS.find(p => p.id === presetId);
    if (preset) {
      const themeObject = createThemeObject(preset);
      applyCustomTheme(themeObject);
    }
  };

  const groupedPresets = React.useMemo(() => {
    return THEME_PRESETS.reduce((acc, preset) => {
      const category = preset.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(preset);
      return acc;
    }, {} as Record<string, typeof THEME_PRESETS>);
  }, []);
  
  const categoryOrder = ['Light', 'Dark', 'Gaming', 'Seasonal', 'General'];
  
  return (
    <div className="space-y-6">
      {categoryOrder.map(category => {
        const presetsInCategory = groupedPresets[category];
        if (!presetsInCategory || presetsInCategory.length === 0) return null;

        return (
          <div key={category}>
            <h3 className="text-base font-semibold mb-3 text-muted-foreground">{category} Themes</h3>
            <div className="grid grid-cols-2 gap-4">
              {presetsInCategory.map((preset) => {
                const themeObject = createThemeObject(preset);
                return (
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
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: themeObject.colors.background }}></div>
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: themeObject.colors.primary }}></div>
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: themeObject.colors.accent }}></div>
                      <div className="h-5 w-5 rounded-full border" style={{ backgroundColor: themeObject.colors.card }}></div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
      <ResetToDefault />
    </div>
  );
}


export function DashboardCustomizer({ children }: { children: React.ReactNode }) {
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
                    <PresetsTab />
                </ScrollArea>
            </TabsContent>
            <TabsContent value="manual" className="flex-1 overflow-auto mt-4">
                <ScrollArea className="h-full pr-4">
                     <ManualEditor />
                </ScrollArea>
            </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
