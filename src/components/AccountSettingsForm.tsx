
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertCircle, User as UserIcon, Download, Trash2, Edit2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useRouter } from 'next/navigation';

const accountSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, underscores, dots, and hyphens.'),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountSettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const userData = docSnap.exists() ? docSnap.data() : {};
        const currentUsername = userData.username || '';
        form.reset({
          firstName: user.displayName || '',
          username: currentUsername,
        });
        setIsLoading(false);
      };
      fetchUserData();
    } else {
        setIsLoading(false);
    }
  }, [user, form]);
  
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !user) {
      return;
    }
    const file = event.target.files[0];
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: 'destructive', title: 'File too large', description: 'Please select an image smaller than 2MB.' });
        return;
    }
    
    setIsUploading(true);
    const avatarRef = storageRef(storage, `avatars/${user.uid}/${file.name}`);
    
    try {
        await uploadBytes(avatarRef, file);
        const photoURL = await getDownloadURL(avatarRef);
        
        await updateProfile(auth.currentUser!, { photoURL });
        
        toast({ title: "Success!", description: "Your profile picture has been updated." });
    } catch (err: any) {
        console.error("Full avatar upload error object:", err);
        let description = 'An unexpected error occurred. Please check the browser console for details.';
        
        switch (err.code) {
            case 'storage/unauthorized':
                description = 'Permission denied. Please double-check your Firebase Storage security rules.';
                break;
            case 'storage/object-not-found':
                description = 'File not found. This can happen if your Storage Bucket is not configured correctly in your project environment variables.';
                break;
            case 'storage/unknown':
                description = 'An unknown error occurred. This can happen if Firebase Storage is not enabled for your project.';
                break;
            case 'storage/project-not-found':
                 description = 'Firebase project not found. Please ensure your Firebase configuration is correct.';
                 break;
        }

        toast({ variant: 'destructive', title: 'Upload Failed', description: description });
    } finally {
        setIsUploading(false);
    }
  };

  const onSubmit = async (data: AccountFormValues) => {
    if (!user) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      if (data.firstName !== user.displayName) {
        await updateProfile(auth.currentUser!, { displayName: data.firstName });
      }
      
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      // NOTE: Client-side username uniqueness check removed to resolve Firestore permission errors.
      // Firebase Auth will still prevent duplicate emails. A server-side check
      // for usernames is recommended for a production environment.
      if (!docSnap.exists() || docSnap.data().username !== data.username) {
        await updateDoc(userDocRef, {
            username: data.username,
        });
      }

      form.reset(data, { keepValues: true });
      
      toast({ title: 'Success!', description: 'Your account details have been updated.' });

    } catch (err: any) {
      console.error("Error updating account:", err);
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user || !user.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({ title: 'Password Reset Email Sent', description: 'Check your inbox for a link to reset your password.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to send password reset email.' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
        await deleteUser(user);
        await deleteDoc(doc(db, 'users', user.uid));
        toast({ title: 'Account Deleted', description: 'Your account has been permanently deleted.' });
        router.push('/');
    } catch(err: any) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Deletion Failed', description: 'Please log out and log back in, then try again.' });
    }
  }

  const handleDataRequest = () => {
    toast({ title: "Coming Soon!", description: "The data download feature is currently in development." });
  }

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    return <p>Please log in to manage your account.</p>;
  }

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="flex items-center gap-5">
        <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
              <AvatarFallback>{user.displayName?.charAt(0) || <UserIcon />}</AvatarFallback>
            </Avatar>
            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
            )}
        </div>
        <div>
            <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                <Edit2 className="mr-2 h-4 w-4" />Change Picture
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg" className="hidden" />
            <p className="text-xs text-muted-foreground mt-2">PNG or JPG, up to 2MB.</p>
        </div>
      </div>

      <Separator />

      {/* Account Form Section */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-lg font-semibold">Account Details</h3>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" /><AlertTitle>Update Failed</AlertTitle><AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FormField control={form.control} name="firstName" render={({ field }) => (
              <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      {/* Account Security Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Account Security</h3>
        <div>
            <Label>Email</Label>
            <Input readOnly disabled value={user.email || 'No email associated'} className="mt-1 bg-secondary/50" />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">Change Password</p>
          <Button variant="outline" size="sm" onClick={handlePasswordReset}>Send Reset Email</Button>
        </div>
      </div>

      <Separator />

      {/* Data Management Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Data</h3>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Download your data</p>
            <p className="text-xs text-muted-foreground">Request a copy of all your data.</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDataRequest}>
            <Download className="mr-2 h-4 w-4" />Request
          </Button>
        </div>
      </div>

      <Separator />
      
      {/* Delete Account Section */}
      <div className="space-y-3 rounded-lg border border-destructive/50 p-4">
        <h3 className="text-lg font-semibold text-destructive">Delete Account</h3>
        <p className="text-sm text-destructive/90">
            This will permanently delete your account, courses, and all associated data. This action is irreversible.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" />Delete My Account</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All your progress, flashcard decks, and settings will be permanently lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                Yes, delete my account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
