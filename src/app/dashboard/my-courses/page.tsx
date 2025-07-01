
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { courses } from '@/lib/courses';
import type { Course } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseIcon } from '@/components/CourseIcon';
import { X, Loader2, Flame, Clock } from 'lucide-react';
import { AceMascot } from '@/components/AceMascot';
import { logUserAction } from '@/lib/logging';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayRemove } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';

type UserCourse = Course & {
  progress: number;
  xp: number;
  timeSpent: string;
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

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [addedCourses, setAddedCourses] = useState<UserCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAddedCourses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const addedCourseIds: string[] = docSnap.data().addedCourses || [];
        const courseProgressData = docSnap.data().courseProgress || {};
        
        const userCourses = addedCourseIds.map(id => {
            const course = courses.find(c => c.id === id);
            if (!course) return null;
            
            const progress = courseProgressData[id] || { progress: 0, xp: 0, timeSpent: 0 };
            
            return {
              ...course,
              progress: progress.progress,
              xp: progress.xp,
              timeSpent: formatTimeSpent(progress.timeSpent),
            }
          }).filter((c): c is UserCourse => c !== null);

        setAddedCourses(userCourses);
      } else {
        setAddedCourses([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user courses:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleRemoveCourse = async (courseId: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    
    try {
      await updateDoc(userDocRef, {
        addedCourses: arrayRemove(courseId)
      });
      logUserAction(user ? { uid: user.uid, email: user.email } : null, 'remove_course', { courseId });
    } catch (error) {
      console.error("Failed to remove course:", error);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-full items-center justify-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }
  
  if (addedCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 h-full">
        <AceMascot className="h-24 w-24" />
        <h2 className="text-2xl font-bold font-headline">No Courses Added Yet</h2>
        <p className="max-w-md text-muted-foreground">
          You haven't added any courses to your dashboard. Browse our full list of AP courses to get started.
        </p>
        <Button asChild>
          <Link href="/classes">Browse All Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">Here are the courses you've added to your dashboard.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addedCourses.map((course) => (
            <Card key={course.slug} className="group rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col overflow-hidden">
                <CardHeader className="p-0 border-b relative h-48 flex items-center justify-center bg-gradient-to-br from-secondary to-background/50 overflow-hidden">
                    <Link href={`/classes/${course.slug}`} className="absolute inset-0 z-0" aria-label={`View course ${course.name}`}></Link>
                    <CourseIcon iconName={course.icon} className="h-24 w-24 p-3 bg-card/80 rounded-2xl shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110" />
                </CardHeader>
                <CardContent className="flex-grow p-6 space-y-3">
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                        <Link href={`/classes/${course.slug}`} className="hover:underline">{course.name}</Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                     <div className="space-y-1 pt-2">
                        <div className="flex justify-between items-center mb-1 text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span className="font-semibold">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2" />
                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-2 border-t flex flex-wrap gap-x-4 gap-y-2 justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <div className="flex items-center gap-1.5">
                            <Flame className="h-4 w-4 text-orange-400"/>
                            <span className="font-semibold">{course.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-blue-400"/>
                            <span className="font-semibold">{course.timeSpent}</span>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemoveCourse(course.id)}
                        className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:text-destructive z-10"
                        aria-label="Remove course"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
    </div>
  );
}
