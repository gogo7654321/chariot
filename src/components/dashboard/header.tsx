"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Smile, Sun } from "lucide-react";

export default function Header() {
    const [greeting, setGreeting] = useState('');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good Morning');
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }
        
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);

    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(prev => !prev);
    };

    return (
        <header className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <SidebarTrigger className="block md:hidden" />
                 <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        {greeting}, Alex <Smile className="text-accent-foreground w-7 h-7" />
                    </h1>
                    <p className="text-muted-foreground">"Success is the sum of small efforts, repeated day in and day out."</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
        </header>
    );
}
