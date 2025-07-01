
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import type { Course } from '@/lib/courses';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { InteractiveFlashcards } from "./InteractiveFlashcards";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

type CourseProgressData = {
  progress: number;
  xp: number;
  timeSpent: number;
  completedUnits: string[];
};

export function CourseProgressClient({ course }: { course: Course }) {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<CourseProgressData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Effect for fetching data
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const allProgress = docSnap.data().courseProgress || {};
        const thisCourseProgress = allProgress[course.id];
        setProgressData(thisCourseProgress || { progress: 0, xp: 0, timeSpent: 0, completedUnits: [] });
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [user, course.id]);

  // Effect for tracking time spent
  useEffect(() => {
    if (!user || !progressData) return;

    const interval = setInterval(async () => {
      if (document.hidden) return; // Don't track time if tab is not active
      
      const userDocRef = doc(db, 'users', user.uid);
      const newTimeSpent = (progressData.timeSpent || 0) + 15;

      await updateDoc(userDocRef, {
        [`courseProgress.${course.id}.timeSpent`]: newTimeSpent
      });

    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [user, course.id, progressData]);

  const handleUnitOpen = useCallback(async (unitId: string) => {
    if (!user || !unitId || !progressData) return;
    if (progressData.completedUnits?.includes(unitId)) return;

    const totalUnits = course.units.length;
    if (totalUnits === 0) return;

    const newCompletedUnits = [...(progressData.completedUnits || []), unitId];
    const newProgress = Math.round((newCompletedUnits.length / totalUnits) * 100);
    const newXp = (progressData.xp || 0) + 100; // Award 100 XP per unit

    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.data()?.courseProgress) {
        await updateDoc(userDocRef, { courseProgress: {} });
    }

    await updateDoc(userDocRef, {
      [`courseProgress.${course.id}.completedUnits`]: newCompletedUnits,
      [`courseProgress.${course.id}.progress`]: newProgress,
      [`courseProgress.${course.id}.xp`]: newXp,
      [`courseProgress.${course.id}.timeSpent`]: progressData.timeSpent || 0,
    });
  }, [user, course, progressData]);

  if (isLoading) {
    return <div className="flex justify-center items-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const renderAccordion = () => (
     <Accordion type="single" collapsible defaultValue={course.units.length > 0 ? course.units[0].id : undefined} onValueChange={handleUnitOpen}>
        {course.units.map(unit => (
          <AccordionItem key={unit.id} value={unit.id}>
            <AccordionTrigger className="font-bold text-lg">{unit.title}</AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground mb-4">{unit.description}</p>
              {unit.flashcards.length > 0 && (
                <div className="mb-4">
                    <h4 className="font-semibold mb-2">Flashcards</h4>
                    <InteractiveFlashcards flashcards={unit.flashcards} />
                </div>
              )}
              {unit.questions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Practice Questions</h4>
                  <UICard className="bg-secondary/50">
                    <CardContent className="p-4">
                      <p className="font-medium">{unit.questions[0].question}</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        {unit.questions[0].options.map(opt => <li key={opt}>- {opt}</li>)}
                      </ul>
                    </CardContent>
                  </UICard>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
  );

  if (!user) {
    return renderAccordion();
  }

  return (
    <>
      <div className="mt-2">
        <p className="text-sm text-muted-foreground">Your Progress: {progressData?.progress || 0}%</p>
        <Progress value={progressData?.progress || 0} className="w-full mt-1" />
      </div>
      {renderAccordion()}
    </>
  );
}
