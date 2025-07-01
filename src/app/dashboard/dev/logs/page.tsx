
'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Log = {
  id: string;
  userEmail: string;
  action: string;
  details: Record<string, any>;
  timestamp: Date | null;
};

const actionDisplay: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    login: { label: 'User Login', variant: 'default' },
    login_google: { label: 'Google Login', variant: 'default' },
    signup: { label: 'User Signup', variant: 'default' },
    logout: { label: 'User Logout', variant: 'outline' },
    generate_test: { label: 'Test Generated', variant: 'secondary' },
    grade_essay: { label: 'Essay Graded', variant: 'secondary' },
    explain_this: { label: 'Explanation Provided', variant: 'secondary' },
    add_course: { label: 'Course Added', variant: 'secondary' },
    remove_course: { label: 'Course Removed', variant: 'destructive' },
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const logsQuery = query(collection(db, 'user_logs'), orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const fetchedLogs: Log[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        fetchedLogs.push({
          id: doc.id,
          userEmail: data.userEmail,
          action: data.action,
          details: data.details,
          timestamp: data.timestamp?.toDate() || null
        });
      });
      setLogs(fetchedLogs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching logs:", error);
      setIsLoading(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load user activity logs.'
      });
    });

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-headline text-4xl font-bold">Logs & System Tools</h1>
        <p className="text-muted-foreground mt-2 text-lg">Monitor user activity and manage system configurations.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Showing the last 50 user actions in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[600px] border rounded-md">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : logs.length === 0 ? (
                             <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">No user activity recorded yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead className="text-right">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.userEmail}</TableCell>
                                            <TableCell>
                                                <Badge variant={actionDisplay[log.action]?.variant || 'outline'}>
                                                    {actionDisplay[log.action]?.label || log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                                                {Object.keys(log.details).length > 0 ? JSON.stringify(log.details) : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {log.timestamp ? formatDistanceToNow(log.timestamp, { addSuffix: true }) : '...'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1 space-y-8">
             <Card className="border-orange-500/50 bg-orange-500/5">
                <CardHeader className="flex-row items-start gap-4">
                    <AlertTriangle className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                        <CardTitle className="text-orange-600">More Tools Coming Soon</CardTitle>
                        <CardDescription className="text-orange-600/80">
                            We're building more tools, like re-generating course content and managing user roles.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        </div>
      </div>
    </div>
  );
}
