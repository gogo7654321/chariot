
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Palette } from "lucide-react"
import { useAppearance } from "@/contexts/AccessibilityContext"

type AccessibilityTheme = "default" | "protanopia" | "deuteranopia" | "tritanopia";

export function AccessibilitySettings({ triggerType = 'icon' }: { triggerType?: 'icon' | 'button' | 'control' }) {
  const { theme, setTheme } = useAppearance();
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMode, setSelectedMode] = React.useState<AccessibilityTheme>(theme);

  React.useEffect(() => {
    setSelectedMode(theme);
  }, [theme]);

  const handleSave = () => {
    setTheme(selectedMode);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setSelectedMode(theme); // Revert changes if cancelled
    setIsOpen(false);
  }

  const triggerMap: Record<typeof triggerType, React.ReactNode> = {
    icon: (
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Palette className="h-5 w-5" />
            <span className="sr-only">Accessibility Settings</span>
        </Button>
    ),
    button: (
        <Button variant="ghost" className="w-full justify-start gap-2 px-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <Palette className="h-4 w-4" />
            <span>Accessibility</span>
        </Button>
    ),
    control: (
        <Button variant="outline" className="h-8 w-[90px] text-xs">
            Open
        </Button>
    )
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            handleCancel();
        }
        setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        {triggerMap[triggerType] || triggerMap.icon}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Accessibility Settings</DialogTitle>
          <DialogDescription>
            Adjust color settings for better visibility. Your selection will be saved for future visits.
          </DialogDescription>
        </DialogHeader>
        <RadioGroup
            value={selectedMode}
            onValueChange={(value) => setSelectedMode(value as AccessibilityTheme)}
            className="space-y-1 pt-2"
          >
            <Label className="font-bold">Colorblind Modes</Label>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id="r1" />
              <Label htmlFor="r1">Default</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="protanopia" id="r2" />
              <Label htmlFor="r2">Protanopia (Red-Blind)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deuteranopia" id="r3" />
              <Label htmlFor="r3">Deuteranopia (Green-Blind)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="tritanopia" id="r4" />
              <Label htmlFor="r4">Tritanopia (Blue-Yellow-Blind)</Label>
            </div>
          </RadioGroup>
          <DialogFooter className="mt-4">
            <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
            <Button type="button" onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
