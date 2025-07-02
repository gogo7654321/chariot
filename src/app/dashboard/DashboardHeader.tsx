
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AceMascot } from "@/components/AceMascot";
import { useEffect, useState } from "react";
import { Flame, Palette } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { timezones } from "@/lib/timezones";
import { DashboardCustomizer } from "@/components/DashboardCustomizer";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The expert in anything was once a beginner.",
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
];

const getBrowserTimezone = () => {
    if (typeof window === 'undefined') return 'UTC';
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      console.warn('Could not detect timezone, defaulting to UTC.');
      return 'UTC';
    }
};

const isValidTimezone = (tz: string) => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch (e) {
        return false;
    }
}


export function DashboardHeader() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [quote, setQuote] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [timezone, setTimezone] = useState(getBrowserTimezone());
  const streak = 3; // Mock data

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        const savedTimezone = docSnap.data()?.calendarSettings?.timezone;
        setTimezone(isValidTimezone(savedTimezone) ? savedTimezone : getBrowserTimezone());
      });
      return () => unsubscribe();
    } else {
      // Reset to browser default on logout
      setTimezone(getBrowserTimezone());
    }
  }, [user]);


  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
    
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const updateDateTime = () => {
      const now = new Date();
      const effectiveTimezone = isValidTimezone(timezone) ? timezone : 'UTC';

      try {
        setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', timeZone: effectiveTimezone }));
        setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: effectiveTimezone, hour12: true }));
      } catch (e) {
        // Fallback to local time if timezone is invalid
        console.error("Invalid timezone:", timezone, e);
        setCurrentDate(now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
        setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true }));
      }
    };

    updateDateTime();
    const timerId = setInterval(updateDateTime, 1000);

    return () => clearInterval(timerId);
  }, [timezone]);

  const displayName = user?.displayName?.split(' ')[0] || 'Student';

  return (
    <header className="flex items-center justify-between p-4">
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-foreground">
          {greeting ? `${greeting}, ${displayName} 👋` : `Welcome, ${displayName} 👋`}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {quote ? `"${quote}"` : "Let's make today productive."}
        </p>
      </div>
      <div className="flex items-center gap-2">
         <div className="hidden sm:flex items-center gap-6">
            <div className="text-right">
                <p className="font-mono text-lg font-semibold tracking-tighter text-foreground">{currentTime}</p>
                <p className="text-xs text-muted-foreground">{currentDate}</p>
            </div>
            <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-400">
                    <p className="text-2xl font-bold">{streak}</p>
                    <Flame className="h-5 w-5" />
                </div>
                <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
         </div>
         <DashboardCustomizer>
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80">
            <Palette className="h-5 w-5" />
          </button>
         </DashboardCustomizer>
         <AceMascot className="h-12 w-12 hidden sm:block" />
        <SidebarTrigger className="md:hidden" />
      </div>
    </header>
  );
}
