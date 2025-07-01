
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FocusZone() {
  const [mode, setMode] = useState<'pomodoro' | 'break'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Optional: auto-start next session
      if (mode === 'pomodoro') {
        setMode('break');
        setTimeLeft(5 * 60);
      } else {
        setMode('pomodoro');
        setTimeLeft(25 * 60);
      }
      setIsActive(false);
      // Optional: play a sound
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  };

  const switchMode = (newMode: 'pomodoro' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'pomodoro') {
      setTimeLeft(25 * 60);
    } else {
      setTimeLeft(5 * 60);
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader className="pl-10">
        <CardTitle className="font-headline">Focus Zone</CardTitle>
        <CardDescription>Pomodoro timer & study music.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <div className="flex gap-2 rounded-lg bg-secondary p-1">
          <Button variant={mode === 'pomodoro' ? 'default' : 'ghost'} size="sm" onClick={() => switchMode('pomodoro')}>Pomodoro</Button>
          <Button variant={mode === 'break' ? 'default' : 'ghost'} size="sm" onClick={() => switchMode('break')}>Short Break</Button>
        </div>
        <div className="relative h-40 w-40 rounded-full border-8 border-secondary flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-8 border-primary transition-all duration-1000" style={{ clipPath: `inset(0 ${100 - (timeLeft / (mode === 'pomodoro' ? 25*60 : 5*60)) * 100}% 0 0)`}}></div>
            <span className="text-4xl font-bold font-mono z-10">{formatTime(timeLeft)}</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-5 w-5" />
          </Button>
          <Button size="icon" className="h-16 w-16 rounded-full" onClick={toggleTimer}>
            {isActive ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
          </Button>
          <Button asChild variant="outline" size="icon" >
            <a href="https://www.youtube.com/watch?v=jfKfPfyJRdk" target="_blank" rel="noopener noreferrer">
              <Music className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
