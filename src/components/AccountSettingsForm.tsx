
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { db, auth, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, sendPasswordResetEmail, deleteUser, verifyBeforeUpdateEmail } from 'firebase/auth';
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-4.75 2.04-5.73 0-10.37-4.64-10.37-10.37s4.64-10.37 10.37-10.37c3.25 0 5.42 1.3 6.66 2.53l2.83-2.83C19.46 2.04 16.47 0 12.48 0 5.88 0 0 5.88 0 12.48s5.88 12.48 12.48 12.48c7.38 0 12.12-4.92 12.12-12.12 0-.8-.08-1.5-.2-2.32H12.48z" fill="currentColor"/>
    </svg>
);

const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'zoho.com', 'hotmail.com'];

export function AccountSettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSuggestion, setEmailSuggestion] = useState('');
  const [emailChangeMessage, setEmailChangeMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      firstName: '',
      username: '',
    },
  });

  const isGoogleProvider = user?.providerData.some(p => p.providerId === 'google.com');

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
        setNewEmail(user.email || '');
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
    const MAX_FILE_SIZE_MB = 1;
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: (
          <div>
            Please select a PNG, JPG, GIF, or WebP file. You can use{' '}
            <a href="https://cloudconvert.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              CloudConvert
            </a>{' '}
            to convert your file.
          </div>
        )
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast({ 
        variant: 'destructive', 
        title: 'File is too large', 
        description: (
          <div>
            Please select a smaller image. You can use{' '}
            <a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer" className="underline font-semibold">
              a tool like TinyPNG
            </a>{' '}
            to resize it.
          </div>
        )
      });
      return;
    }
    
    setIsUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const avatarRef = storageRef(storage, `avatars/${user.uid}/${fileName}`);
      
      await uploadBytes(avatarRef, file);
      const photoURL = await getDownloadURL(avatarRef);
      
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
        toast({ title: "Success!", description: "Your profile picture has been updated." });
      } else {
        throw new Error("No authenticated user found for profile update.");
      }

    } catch (err: any) {
      let description = 'An unexpected error occurred. Please check the browser console for details.';
      if (err.code === 'storage/unauthorized') {
          description = 'Permission denied. Please double-check your Firebase Storage security rules and CORS configuration.';
      }
      toast({ variant: 'destructive', title: 'Upload Failed', description });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      await updateDoc(userDocRef, {
        username: data.username,
      });

      form.reset(data, { keepValues: true });
      
      toast({ title: 'Success!', description: 'Your account details have been updated.' });

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewEmail(value);
    setError(null);
    setEmailChangeMessage(null);

    if (value.includes('@') && !value.endsWith('@')) {
      const parts = value.split('@');
      const userPart = parts[0];
      const domainPart = parts[1];

      if (domainPart) {
        const suggestion = commonDomains.find(d => d.startsWith(domainPart));
        if (suggestion && suggestion !== domainPart) {
          setEmailSuggestion(userPart + '@' + suggestion);
        } else {
          setEmailSuggestion('');
        }
      } else {
        setEmailSuggestion('');
      }
    } else {
      setEmailSuggestion('');
    }
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' && emailSuggestion) {
      e.preventDefault();
      setNewEmail(emailSuggestion);
      setEmailSuggestion('');
    }
  };


  const handleRequestEmailChange = async () => {
    if (!user || !newEmail || newEmail === user.email) {
        setIsEditingEmail(false);
        return;
    }

    setIsSaving(true);
    setEmailChangeMessage(null);
    setError(null);

    try {
        await verifyBeforeUpdateEmail(auth.currentUser!, newEmail);
        setEmailChangeMessage(`Verification email sent to ${newEmail}. Please check your inbox to complete the change.`);
        toast({ title: "Verification Sent", description: `Please check ${newEmail} to confirm your new email address.` });
        setIsEditingEmail(false);
    } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
            setError("This email address is already in use by another account.");
        } else if (err.code === 'auth/requires-recent-login') {
            setError("This is a sensitive operation. Please log out and log back in before changing your email.");
        } else {
            setError(err.message || "An unknown error occurred while trying to change the email.");
        }
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
            <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/png, image/jpeg, image/gif, image/webp" className="hidden" />
            <p className="text-xs text-muted-foreground mt-2">
                File not supported?{' '}
                <a href="https://cloudconvert.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                    Use a converter.
                </a>
            </p>
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
        
        {isGoogleProvider && (
            <div className="flex items-center justify-between rounded-lg border p-3 bg-secondary/30">
                <div className="flex items-center gap-2">
                    <GoogleIcon className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium">Connected to Google</p>
                </div>
            </div>
        )}
        
        <div>
            <Label>Email</Label>
            {isGoogleProvider ? (
                <>
                    <Input readOnly disabled value={user.email || 'No email associated'} className="mt-1 bg-secondary/50" />
                    <p className="text-xs text-muted-foreground mt-2">
                        Your email is managed by your Google account and cannot be changed here.
                    </p>
                </>
            ) : isEditingEmail ? (
                <div className="space-y-2 mt-1">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input
                                value={newEmail}
                                onChange={handleEmailChange}
                                onKeyDown={handleEmailKeyDown}
                                placeholder="Enter new email"
                                className="relative z-10 bg-transparent"
                                autoComplete="off"
                            />
                            {emailSuggestion.startsWith(newEmail) && newEmail && (
                                <div className="absolute inset-y-0 left-0 z-0 flex items-center px-3 pointer-events-none text-base md:text-sm">
                                    <span className="text-transparent">{newEmail}</span>
                                    <span className="text-muted-foreground">
                                        {emailSuggestion.substring(newEmail.length)}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Button type="button" onClick={handleRequestEmailChange} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                        </Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditingEmail(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                    </div>
                    {emailSuggestion.startsWith(newEmail) && newEmail && (
                         <p className="text-xs text-muted-foreground pl-1">
                            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-sm dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500">Tab</kbd> to accept suggestion.
                        </p>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between rounded-lg border p-3 mt-1">
                        <p className="text-sm font-medium">{user.email}</p>
                        <Button variant="outline" size="sm" onClick={() => {
                            setIsEditingEmail(true);
                            setNewEmail(user.email || '');
                            setEmailChangeMessage(null);
                            setError(null);
                        }}>
                            Change Email
                        </Button>
                    </div>
                </>
            )}
             {emailChangeMessage && <p className="text-sm text-green-600 mt-2">{emailChangeMessage}</p>}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <p className="text-sm font-medium">Change Password</p>
          <Button variant="outline" size="sm" onClick={handlePasswordReset} disabled={isGoogleProvider}>Send Reset Email</Button>
        </div>
        {isGoogleProvider && (
            <p className="text-xs text-muted-foreground -mt-2 pl-1">
                Password is managed through your Google account.
            </p>
        )}
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
