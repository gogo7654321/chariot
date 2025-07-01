
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Check, ArrowRight, FolderKanban, Award } from 'lucide-react';
import './courses.css';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { logUserAction } from '@/lib/logging';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, arrayRemove, setDoc, getDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { courses } from '@/lib/courses';
import { CourseIcon } from '@/components/CourseIcon';

export default function CoursesPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [animateCards, setAnimateCards] = useState(false);
  const [addedCourses, setAddedCourses] = useState(new Set<string>());

  useEffect(() => {
    if (!user) {
      setAddedCourses(new Set());
      const timer = setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => setAnimateCards(true), 100);
      }, 500);
      return () => clearTimeout(timer);
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().addedCourses) {
        setAddedCourses(new Set(docSnap.data().addedCourses));
      } else {
        setAddedCourses(new Set());
      }
      setIsLoading(false);
      setTimeout(() => setAnimateCards(true), 100);
    });

    return () => unsubscribe();
  }, [user]);

  const handleToggleCourse = async (e: React.MouseEvent, courseId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    
    const userDocRef = doc(db, 'users', user.uid);
    const isAdding = !addedCourses.has(courseId);

    try {
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        await setDoc(userDocRef, { addedCourses: [] });
      }

      await updateDoc(userDocRef, {
        addedCourses: isAdding ? arrayUnion(courseId) : arrayRemove(courseId),
      });
      
      logUserAction(user ? { uid: user.uid, email: user.email } : null, isAdding ? 'add_course' : 'remove_course', { courseId });
    } catch (error) {
      console.error("Error updating courses:", error);
    }
  };

  const subjectCount = new Set(courses.map(c => c.subject)).size;
  const apCourseCount = courses.filter(c => c.name.startsWith('AP')).length;
  const honorsCourseCount = courses.filter(c => c.name.startsWith('Honors')).length;

  // Filter courses based on search term
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    
    const searchLower = searchTerm.toLowerCase();
    return courses.filter(course =>
      course.name.toLowerCase().includes(searchLower) ||
      course.description.toLowerCase().includes(searchLower) ||
      course.subject.toLowerCase().includes(searchLower)
    );
  }, [searchTerm]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="loading-grid">
      {[...Array(12)].map((_, index) => (
        <div key={index} className="loading-card">
          <div className="loading-image"></div>
          <div className="loading-content">
            <div className="loading-title"></div>
            <div className="loading-text"></div>
            <div className="loading-text short"></div>
            <div className="loading-text shorter"></div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="courses-page">
      {/* Header Section */}
      <div className={`courses-header ${animateCards ? 'animate-in' : ''}`}>
        <h1 className="courses-title">AP & Honors Courses</h1>
        <div className="underline"></div>
        <p className="courses-subtitle">
          Excel in your studies with our vast collection of AP and Honors courses. Get a head start with early access to upcoming AP courses, giving you a competitive edge. Each course features rigorous curriculum, expert instruction, and resources to help you succeed.
        </p>
        <div className="stats-container">
          <div className="stat-item">
            <Award className="stat-icon" />
            <span className="stat-number">{apCourseCount}</span>
            <span className="stat-label">AP Courses</span>
          </div>
          <div className="stat-item">
            <BookOpen className="stat-icon" />
            <span className="stat-number">{honorsCourseCount}</span>
            <span className="stat-label">Honors Courses</span>
          </div>
          <div className="stat-item">
            <FolderKanban className="stat-icon" />
            <span className="stat-number">{subjectCount}</span>
            <span className="stat-label">Subject Areas</span>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className={`search-section ${animateCards ? 'animate-in' : ''}`}>
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Search courses by name, description, or subject..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </div>
        )}
      </div>

      {/* Courses Grid */}
      <div className="courses-container">
        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid">
            {filteredCourses.map((course, index) => (
              <Link
                href={`/classes/${course.slug}`}
                key={course.id}
                className={`course-card group ${animateCards ? 'animate-in' : ''}`}
                style={{
                  animationDelay: `${Math.min(index * 0.05, 2)}s`
                }}
              >
                <div className="course-image-container">
                  <div className="course-icon-wrapper">
                    <CourseIcon iconName={course.icon} className="h-[60px] w-[60px]" />
                  </div>
                  <div className="subject-badge">{course.subject}</div>
                </div>
                <div className="course-content">
                  <h3 className="course-title">{course.name}</h3>
                  <p className="course-description">{course.description}</p>
                  <div className="course-footer">
                    {user ? (
                       <div className="flex items-center justify-between w-full gap-2">
                         <div className="flex-1">
                           <span className="font-semibold text-primary inline-flex items-center gap-1">
                             Learn More
                             <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                           </span>
                         </div>
                         {course.comingSoon ? (
                           <Badge variant="outline" className="font-semibold">Coming Soon</Badge>
                         ) : addedCourses.has(course.id) ? (
                           <Button
                             variant="secondary"
                             className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50"
                             onClick={(e) => handleToggleCourse(e, course.id)}
                           >
                             <Check className="mr-2 h-4 w-4" />
                             Added
                           </Button>
                         ) : (
                           <Button onClick={(e) => handleToggleCourse(e, course.id)}>
                             Add Course
                           </Button>
                         )}
                       </div>
                    ) : (
                      course.comingSoon ? (
                        <>
                          <div className="learn-more-btn mr-4">
                            Learn More
                            <span className="btn-arrow">→</span>
                          </div>
                          <Badge variant="outline" className="font-semibold">Coming Soon</Badge>
                        </>
                      ) : (
                        <div className="learn-more-btn">
                          Learn More
                          <span className="btn-arrow">→</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <h3>No courses found</h3>
            <p>
              We couldn't find any courses matching "{searchTerm}". 
              Try adjusting your search terms or browse all available courses.
            </p>
            <button 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              Show All Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
