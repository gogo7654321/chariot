"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

const scheduleItems = [
    { time: '09:00 AM', task: 'AP Calculus BC', id: 'calc' },
    { time: '10:30 AM', task: 'Review Unit 5 Flashcards', id: 'flashcards' },
    { time: '01:00 PM', task: 'AP Physics C: Mechanics', id: 'physics' },
    { time: '03:00 PM', task: 'Work on History Essay', id: 'history' },
    { time: '07:00 PM', task: 'Practice FRQ questions', id: 'frq' },
];

export default function ScheduleCard() {
    const [currentDate, setCurrentDate] = useState('');

    useEffect(() => {
        setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Today’s Schedule</CardTitle>
                <p className="text-sm text-muted-foreground">{currentDate}</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {scheduleItems.map((item, index) => (
                        <div key={item.id}>
                            <div className="flex items-start gap-4">
                                <p className="text-sm font-medium text-muted-foreground w-20 pt-1">{item.time}</p>
                                <div className="flex items-center space-x-2 pt-1">
                                    <Checkbox id={item.id} />
                                    <Label htmlFor={item.id} className="text-base font-normal">{item.task}</Label>
                                </div>
                            </div>
                            {index < scheduleItems.length - 1 && <Separator className="my-4 ml-24" />}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
