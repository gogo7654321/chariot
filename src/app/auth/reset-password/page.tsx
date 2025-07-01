'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AceMascot } from '@/components/AceMascot';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long.' })
      .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
      .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
      .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    const checkCode = async () => {
      if (!oobCode) {
        setError('Invalid or missing reset code. Please request a new password reset link.');
        setIsLoading(false);
        return;
      }
      try {
        await verifyPasswordResetCode(auth, oobCode);
        setIsCodeValid(true);
      } catch (err: any) {
        setError('Invalid or expired password reset link. Please request a new one.');
      } finally {
        setIsLoading(false);
      }
    };
    checkCode();
  }, [oobCode]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    if (!oobCode) {
        setError('Invalid action code.');
        return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await confirmPasswordReset(auth, oobCode, values.password);
      setSuccess('Your password has been reset successfully! You will be redirected to the login page shortly.');
      setTimeout(() => {
        router.push('/auth');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. The link may have expired. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                 <AceMascot className="mx-auto h-16 w-16" />
                 <CardTitle className="font-headline text-3xl mt-4">Verifying Link</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-10">
                <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                <p>Please wait...</p>
            </CardContent>
        </Card>
    );
  }
  
  if (!isCodeValid || error) {
     return (
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                 <AceMascot className="mx-auto h-16 w-16" />
                 <CardTitle className="font-headline text-3xl mt-4">Link Invalid</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button asChild className="w-full mt-6">
                    <Link href="/auth">Return to Login</Link>
                </Button>
            </CardContent>
        </Card>
    );
  }

  if (success) {
      return (
        <Card className="w-full max-w-md shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
                 <AceMascot className="mx-auto h-16 w-16" />
                 <CardTitle className="font-headline text-3xl mt-4">Success!</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 rounded-md border border-transparent bg-secondary p-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <p className="text-sm text-secondary-foreground">{success}</p>
                </div>
            </CardContent>
        </Card>
      )
  }


  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl">
      <CardHeader className="text-center">
        <AceMascot className="mx-auto h-16 w-16" />
        <CardTitle className="font-headline text-3xl mt-4">Reset Your Password</CardTitle>
        <CardDescription>Enter and confirm your new password below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" {...form.register('password')} />
                {form.formState.errors.password && <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" {...form.register('confirmPassword')} />
                {form.formState.errors.confirmPassword && <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save New Password
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <Card className="w-full max-w-md shadow-2xl rounded-2xl">
                <CardHeader className="text-center">
                     <AceMascot className="mx-auto h-16 w-16" />
                     <CardTitle className="font-headline text-3xl mt-4">Loading</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center items-center py-10">
                    <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
                    <p>Please wait...</p>
                </CardContent>
            </Card>
        }>
            <ResetPasswordComponent />
        </Suspense>
    )
}
