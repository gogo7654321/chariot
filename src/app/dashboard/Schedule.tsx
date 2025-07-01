
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { FunZone } from "./FunZone";
import { ScrollArea } from "@/components/ui/scroll-area";

type ScheduleTask = {
  id: string;
  time: string;
  task: string;
  color: string;
  done: boolean;
};

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  default: 'bg-gray-500'
};

function parseTimeForSort(timeStr: string): number {
    if (!timeStr) return -1;
    const normalizedTime = timeStr.toUpperCase().replace(/\./g, '');
    const modifierMatch = normalizedTime.match(/([AP]M)/);
    const modifier = modifierMatch ? modifierMatch[0] : '';
    
    const timePart = normalizedTime.replace(modifier, '').trim();
    const [hourStr, minuteStr] = timePart.split(':');
    
    let hours = parseInt(hourStr, 10);
    const minutes = minuteStr ? parseInt(minuteStr, 10) : 0;
  
    if (isNaN(hours) || isNaN(minutes)) {
      return -1;
    }
  
    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
  
    return hours * 60 + minutes;
}


export function Schedule() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState<ScheduleTask[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setTasks([]);
            setIsLoading(false);
            return;
        }

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        const eventsCollection = collection(db, 'users', user.uid, 'events');
        
        const q = query(
            eventsCollection,
            where('date', '>=', todayStart),
            where('date', '<=', todayEnd)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedTasks: ScheduleTask[] = [];
            snapshot.forEach(docSnap => {
                const data = docSnap.data();
                fetchedTasks.push({
                    id: docSnap.id,
                    task: data.title,
                    time: data.time,
                    done: data.done ?? false,
                    color: colorMap[data.color] || colorMap.default,
                });
            });
            fetchedTasks.sort((a, b) => parseTimeForSort(a.time) - parseTimeForSort(b.time));
            setTasks(fetchedTasks);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching schedule:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const toggleTask = async (id: string, currentDoneState: boolean) => {
        if (!user) return;
        const taskDocRef = doc(db, 'users', user.uid, 'events', id);
        await updateDoc(taskDocRef, { done: !currentDoneState });
    };

    const formattedDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    if (isLoading) {
        return (
             <Card className="flex flex-col h-full">
                <CardHeader className="pl-10">
                    <CardTitle className="font-headline">Today's Schedule</CardTitle>
                    <CardDescription>{formattedDate}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow min-h-0 flex items-center justify-center">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pl-10">
                <CardTitle className="font-headline">Today's Schedule</CardTitle>
                <CardDescription>{formattedDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow min-h-0">
                <ScrollArea className="h-full w-full">
                    <div className="relative">
                        {tasks.length > 0 ? (
                            <div className="space-y-6">
                                <div className="absolute left-3.5 top-2 h-full w-0.5 bg-border"></div>
                                {tasks.map((item) => (
                                     <div key={item.id} className="relative flex items-start gap-4">
                                        <div className="relative z-10">
                                            <div className={cn("h-8 w-8 rounded-full flex items-center justify-center", item.color)}>
                                                <Checkbox 
                                                    checked={item.done} 
                                                    onCheckedChange={() => toggleTask(item.id, item.done)}
                                                    className="h-4 w-4 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">{item.time}</p>
                                            <p className={cn("font-medium", item.done && "line-through text-muted-foreground")}>{item.task}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <FunZone />
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
