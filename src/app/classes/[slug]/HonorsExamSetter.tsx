
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, Timestamp, setDoc } from 'firebase/firestore';
import type { Course } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setHours, setMinutes } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const periods = ['AM', 'PM'];

export function HonorsExamSetter({ course }: { course: Course }) {
  const { user } = useAuth();
  const [examDate, setExamDate] = useState<Date | null>(null);
  const [hasCustomDate, setHasCustomDate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // State for the form inside the dialog
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedPeriod, setSelectedPeriod] = useState('PM');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setExamDate(new Date(course.examDate));
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const settings = docSnap.data().userCourseSettings?.[course.id];
        if (settings?.customExamDate) {
          const date = settings.customExamDate.toDate();
          setExamDate(date);
          setHasCustomDate(true);
          // Pre-fill form with saved date
          setSelectedDate(date);
          let hour = date.getHours();
          const minute = date.getMinutes();
          const period = hour >= 12 ? 'PM' : 'AM';
          if (hour > 12) hour -= 12;
          if (hour === 0) hour = 12;
          setSelectedHour(String(hour));
          setSelectedMinute(String(minute).padStart(2, '0'));
          setSelectedPeriod(period);
        } else {
           setExamDate(new Date(course.examDate)); // fallback to default
           setHasCustomDate(false);
        }
      } else {
        setExamDate(new Date(course.examDate)); // fallback to default
        setHasCustomDate(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, course.id, course.examDate]);

  const handleSave = async () => {
    if (!user || !selectedDate) return;
    
    setIsSaving(true);
    let hour = parseInt(selectedHour, 10);
    const minute = parseInt(selectedMinute, 10);

    if (selectedPeriod === 'PM' && hour !== 12) {
      hour += 12;
    }
    if (selectedPeriod === 'AM' && hour === 12) {
      hour = 0;
    }

    let finalDate = setHours(selectedDate, hour);
    finalDate = setMinutes(finalDate, minute);
    
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await updateDoc(userDocRef, {
            [`userCourseSettings.${course.id}.customExamDate`]: Timestamp.fromDate(finalDate)
        });
    } catch (e) {
        // This might fail if the user document or userCourseSettings map doesn't exist
        // So we do a set with merge as a fallback.
        await setDoc(userDocRef, { 
            userCourseSettings: {
                [course.id]: {
                    customExamDate: Timestamp.fromDate(finalDate)
                }
            }
        }, { merge: true });
    } finally {
        setIsSaving(false);
        setIsDialogOpen(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center w-48"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  
  if (!user) {
      // For guests, just show the default countdown.
      return <CountdownTimer examDate={course.examDate} />;
  }

  return (
    <div className="text-center">
      {examDate ? <CountdownTimer examDate={examDate.toISOString()} /> : <p>Set an exam date!</p>}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
           <Button variant="link" size="sm" className="mt-1 -mb-2 h-auto p-0">
            {hasCustomDate ? "Edit Custom Date" : "Set Custom Exam Date"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Exam Date for {course.name}</DialogTitle>
            <DialogDescription>
              Select the date and time for your final exam. This will update the countdown timer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
            />
            <div className="grid grid-cols-3 gap-2">
                <Select value={selectedHour} onValueChange={setSelectedHour}>
                    <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                    <SelectContent>{hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                    <SelectTrigger><SelectValue placeholder="Minute" /></SelectTrigger>
                    <SelectContent>{minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger><SelectValue placeholder="AM/PM" /></SelectTrigger>
                    <SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
