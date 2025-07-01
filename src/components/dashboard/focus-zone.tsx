"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Music } from "lucide-react";

export default function FocusZone() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = useCallback(() => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
    }, []);
    
    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                }
                if (seconds === 0) {
                    if (minutes === 0) {
                        clearInterval(timerRef.current!);
                        alert("Time for a break!");
                        resetTimer();
                    } else {
                        setMinutes(minutes - 1);
                        setSeconds(59);
                    }
                }
            }, 1000);
        } else {
            clearInterval(timerRef.current!);
        }

        return () => clearInterval(timerRef.current!);
    }, [isActive, seconds, minutes, resetTimer]);


    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Focus & Study Zone</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6">
                <div className="text-7xl font-bold font-mono text-primary">
                    <span>{minutes.toString().padStart(2, '0')}</span>:
                    <span>{seconds.toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="secondary" size="lg" onClick={toggleTimer}>
                        {isActive ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                        {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button variant="ghost" size="lg" onClick={resetTimer}>
                        <RotateCcw className="mr-2 h-5 w-5" />
                        Reset
                    </Button>
                </div>
                 <Button variant="outline" size="lg" className="w-full mt-4">
                    <Music className="mr-2 h-5 w-5" />
                    Lo-fi Study Beats
                </Button>
            </CardContent>
        </Card>
    );
}
