
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { DevChat } from "./DevChat";

export default function DevDashboardPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [moderationCount, setModerationCount] = useState<number | null>(null);
  
  const isLoadingUsers = userCount === null;
  const isLoadingModeration = moderationCount === null;

  useEffect(() => {
    // Fetch total user count by counting documents in the 'users' collection
    // This gives a count of users who have stored data (e.g., calendar events)
    const fetchUserCount = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const snapshot = await getDocs(usersCollectionRef);
        setUserCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching user count:", error);
        setUserCount(0); // Set to 0 on error
      }
    };

    fetchUserCount();

    // Listen for real-time updates on pending moderation items
    const moderationQuery = query(collection(db, 'question_feedback'), where('status', '==', 'pending'));
    
    const unsubscribe = onSnapshot(moderationQuery, (snapshot) => {
      setModerationCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching moderation count:", error);
      setModerationCount(0); // Set to 0 on error
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">Developer Dashboard</h1>
        <p className="text-muted-foreground mt-2 text-lg">Welcome to the AP Ace developer portal. Here you can manage users, content, and system settings.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-500 font-semibold">All Systems Operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUsers ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{userCount}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingModeration ? (
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-2xl font-bold">{moderationCount}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <DevChat />
      </div>
    </div>
  );
}
