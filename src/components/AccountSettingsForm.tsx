'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const accountSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, and hyphens.'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountSettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState('');

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: '',
      username: '',
    },
  });

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        setIsLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const currentUsername = userData.username || '';
          form.reset({
            firstName: user.displayName || '',
            username: currentUsername,
          });
          setInitialUsername(currentUsername);
        }
        setIsLoading(false);
      };
      fetchUserData();
    }
  }, [user, form]);

  const onSubmit = async (data: AccountFormValues) => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Check if username is taken by another user, but only if it has changed
      if (data.username !== initialUsername) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', data.username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError('This username is already taken. Please choose another.');
          setIsSaving(false);
          return;
        }
      }
      
      // Update Firebase Auth profile if the name changed
      if (data.firstName !== user.displayName) {
        await updateProfile(user, { displayName: data.firstName });
      }
      
      // Update Firestore document if username changed
      if (data.username !== initialUsername) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          username: data.username,
        });
        setInitialUsername(data.username); // update initial username after successful change
      }
      
      toast({
        title: 'Success!',
        description: 'Your account details have been updated.',
      });

    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update account details.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: 'Password Reset Email Sent',
        description: 'Check your inbox for a link to reset your password.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send password reset email. Please try again later.',
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    return <p>Please log in to manage your account.</p>;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your unique username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
      
      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-1">
          <Label className="text-base">Change Password</Label>
          <p className="text-sm text-muted-foreground">
            For security, password changes are handled via email.
          </p>
        </div>
        <Button variant="outline" onClick={handlePasswordReset}>
          Send Password Reset Email
        </Button>
      </div>
    </div>
  );
}
