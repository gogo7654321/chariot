
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue, SelectLabel, SelectGroup } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { courses } from '@/lib/courses';
import { ScrollArea } from '@/components/ui/scroll-area';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  course: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
};

export function TodoList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');
  const [userCourses, setUserCourses] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setUserCourses([]);
      return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().addedCourses) {
        const addedCourseIds: string[] = docSnap.data().addedCourses;
        const courseNames = addedCourseIds.map(id => {
          const slug = id.replace(/_/g, '-');
          return courses.find(c => c.slug === slug)?.name;
        }).filter((name): name is string => !!name);
        setUserCourses(courseNames);
      } else {
        setUserCourses([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      return;
    }
    
    const tasksCollection = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = [];
      snapshot.forEach(doc => {
        fetchedTasks.push({ id: doc.id, ...doc.data() } as Task);
      });
      setTasks(fetchedTasks);
    });
    
    return () => unsubscribe();
  }, [user]);


  const toggleTask = async (id: string) => {
    if (!user) return;
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
    await updateDoc(taskDocRef, { completed: !task.completed });
  };
  
  const addTask = async () => {
    if (newTask.trim() === '' || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'tasks'), {
      text: newTask,
      completed: false,
      course: 'General',
      priority: 'Medium',
      dueDate: 'Soon',
      createdAt: serverTimestamp(),
    });
    setNewTask('');
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    const taskDocRef = doc(db, 'users', user.uid, 'tasks', id);
    await deleteDoc(taskDocRef);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.course === filter;
  });

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pl-10">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-headline">Assignment Tracker</CardTitle>
            <CardDescription>Manage your tasks and deadlines.</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by course..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="General">General</SelectItem>
              {userCourses.map(courseName => (
                <SelectItem key={courseName} value={courseName}>{courseName}</SelectItem>
              ))}
              {userCourses.length === 0 && (
                <>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel className="p-0 text-center">
                      <Link
                        href="/classes"
                        className="text-sm font-medium text-primary hover:underline underline-offset-4 block py-1.5"
                      >
                        Add courses to filter
                      </Link>
                    </SelectLabel>
                  </SelectGroup>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 flex flex-col">
        <ScrollArea className="flex-grow">
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                  />
                  <div>
                    <label htmlFor={`task-${task.id}`} className={cn("text-sm cursor-pointer", task.completed && "line-through text-muted-foreground")}>
                      {task.text}
                    </label>
                    <div className="text-xs text-muted-foreground">
                      <span>{task.course}</span> &middot; <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteTask(task.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
         <div className="mt-4 flex-shrink-0 flex gap-2 border-t pt-4">
            <Input 
                placeholder="Add a new task..." 
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <Button size="icon" onClick={addTask}><PlusCircle className="h-5 w-5"/></Button>
        </div>
      </CardContent>
    </Card>
  );
}
