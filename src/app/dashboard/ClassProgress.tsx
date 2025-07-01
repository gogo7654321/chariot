
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { courses, type Course } from "@/lib/courses";
import { CourseIcon } from "@/components/CourseIcon";
import { Flame, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { CountdownTimer } from "../classes/[slug]/CountdownTimer";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";

type UserProgressCourse = Course & {
  progress: number;
  xp: number;
  timeSpent: string;
  customExamDate?: string;
};

function formatTimeSpent(totalSeconds: number = 0): string {
  if (totalSeconds < 60) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function ClassProgress() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgressCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUserProgress([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const addedCourseIds: string[] = data.addedCourses || [];
        const courseProgressData = data.courseProgress || {};
        const userCourseSettings = data.userCourseSettings || {};

        const userCoursesData = addedCourseIds.map(id => {
          const course = courses.find(c => c.id === id);
          if (!course) return null;
          
          const progress = courseProgressData[id] || { progress: 0, xp: 0, timeSpent: 0 };
          const customExamDate = userCourseSettings[id]?.customExamDate;
          
          return {
            ...course,
            progress: progress.progress,
            xp: progress.xp,
            timeSpent: formatTimeSpent(progress.timeSpent),
            customExamDate: customExamDate ? customExamDate.toDate().toISOString() : undefined,
          }
        }).filter((c): c is UserProgressCourse => c !== null);

        setUserProgress(userCoursesData);
      } else {
        setUserProgress([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Failed to fetch courses:", error);
      setUserProgress([]);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  if (isLoading) {
    return (
      <Card className="col-span-full h-full">
        <CardHeader className="pl-10">
          <CardTitle className="font-headline">AP Class Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }


  if (userProgress.length === 0) {
    return (
      <Card className="col-span-full h-full">
        <CardHeader className="pl-10">
          <CardTitle className="font-headline">AP Class Progress</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center h-full">
          <p className="font-semibold text-lg">No courses added yet!</p>
          <p className="text-sm mt-1">Visit the courses page to start tracking your progress.</p>
          <Button asChild variant="default" className="mt-4">
            <Link href="/classes">Browse Courses</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full flex flex-col h-full">
      <CardHeader className="pl-10">
        <CardTitle className="font-headline">AP Class Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow min-h-0">
        <ScrollArea className="h-full w-full">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-6 p-1">
            {userProgress.map((course) => (
               <Link href={`/classes/${course.slug}`} key={course.slug} className="block group">
                <div className="rounded-xl border bg-card transition-all duration-200 flex flex-col overflow-hidden h-full shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 focus-within:ring-2 focus-within:ring-ring">
                    <div className="h-36 bg-secondary/30 flex items-center justify-center p-4 relative overflow-hidden">
                        <div className="absolute top-2 right-2 z-10">
                            <div className="bg-background/70 p-1.5 rounded-lg backdrop-blur-sm shadow">
                                <CountdownTimer examDate={course.customExamDate || course.examDate} compact />
                            </div>
                        </div>
                        <CourseIcon iconName={course.icon} className="h-20 w-20 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div className="p-4 space-y-3 border-t flex flex-col flex-grow bg-card">
                        <h4 className="font-bold truncate text-lg group-hover:text-primary">{course.name}</h4>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className="font-semibold">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
                            <div className="flex items-center gap-1.5">
                                <Flame className="h-4 w-4 text-orange-400"/>
                                <span className="font-semibold">{course.xp} XP</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-blue-400"/>
                                <span className="font-semibold">{course.timeSpent}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
