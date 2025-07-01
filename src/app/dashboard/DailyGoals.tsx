
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore';
import { startOfDay, endOfDay } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

type Goal = {
  id: string;
  text: string;
  completed: boolean;
};

export function DailyGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');

  useEffect(() => {
    if (!user) {
        setGoals([]);
        return;
    }
    
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const goalsCollection = collection(db, 'users', user.uid, 'dailyGoals');
    const q = query(goalsCollection, where('createdAt', '>=', todayStart), where('createdAt', '<=', todayEnd), orderBy('createdAt', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals: Goal[] = [];
      snapshot.forEach(doc => {
        fetchedGoals.push({ id: doc.id, ...doc.data() } as Goal);
      });
      setGoals(fetchedGoals);
    });
    
    return () => unsubscribe();
  }, [user]);

  const toggleGoal = async (id: string) => {
    if (!user) return;
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    
    const goalDocRef = doc(db, 'users', user.uid, 'dailyGoals', id);
    await updateDoc(goalDocRef, { completed: !goal.completed });
  };

  const addGoal = async () => {
    if (newGoal.trim() === '' || !user) return;
    await addDoc(collection(db, 'users', user.uid, 'dailyGoals'), {
      text: newGoal,
      completed: false,
      createdAt: serverTimestamp(),
    });
    setNewGoal('');
  };
  
  const deleteGoal = async (id: string) => {
    if (!user) return;
    const goalDocRef = doc(db, 'users', user.uid, 'dailyGoals', id);
    await deleteDoc(goalDocRef);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pl-10">
        <CardTitle className="font-headline">Daily Goals</CardTitle>
        <CardDescription>Your daily study habits.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow min-h-0 flex flex-col">
        <ScrollArea className="flex-grow">
          <div className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`goal-${goal.id}`}
                    checked={goal.completed}
                    onCheckedChange={() => toggleGoal(goal.id)}
                  />
                  <label
                    htmlFor={`goal-${goal.id}`}
                    className={`text-sm cursor-pointer ${goal.completed ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {goal.text}
                  </label>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => deleteGoal(goal.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex-shrink-0 flex gap-2 border-t pt-4">
            <Input 
                placeholder="Add a new goal..." 
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            />
            <Button size="icon" onClick={addGoal}><PlusCircle className="h-5 w-5"/></Button>
        </div>
      </CardContent>
    </Card>
  );
}
