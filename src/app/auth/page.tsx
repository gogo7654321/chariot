
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Checkbox } from '@/components/ui/checkbox';
import { logUserAction } from '@/lib/logging';

const signUpSchema = z
  .object({
    firstname: z.string().min(1, { message: 'First name is required.' }),
    username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      .regex(/[0-9]/, { message: "Password must contain at least one number." })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;
type LoginFormValues = z.infer<typeof loginSchema>;

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,36.596,44,31.1,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
    </svg>
  );

export default function AuthPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);


  // Forgot Password State
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstname: '', username: '', email: '', password: '', confirmPassword: '' },
  });

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleSignUp = async (values: SignUpFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(userCredential.user, {
        displayName: values.firstname
      });
      logUserAction({ uid: userCredential.user.uid, email: userCredential.user.email }, 'signup');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      logUserAction({ uid: userCredential.user.uid, email: userCredential.user.email }, 'login');
      router.push('/dashboard');
    } catch (err: any)
     {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      logUserAction({ uid: result.user.uid, email: result.user.email }, 'login_google');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Google sign in error:', err);
      // Don't show the 'popup-closed-by-user' error as it's not a real error.
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      setResetError("Please enter your email address.");
      return;
    }
    setIsResetting(true);
    setResetError(null);
    setResetSuccess(null);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("Password reset link sent! Check your inbox (and your spam folder).");
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message);
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <Card className="w-full max-w-md shadow-2xl rounded-2xl">
      <CardHeader className="text-center">
        <AceMascot className="mx-auto h-16 w-16" />
        <CardTitle className="font-headline text-3xl mt-4">Welcome to AP Ace<span className="copyright-symbol">&copy;</span></CardTitle>
        <CardDescription>Sign in or create an account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog onOpenChange={(open) => {
            if (!open) {
              setResetError(null);
              setResetSuccess(null);
              setResetEmail('');
            }
            setIsResetDialogOpen(open);
        }} open={isResetDialogOpen}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="login" className="mt-4">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="you@example.com" autoComplete="email" {...loginForm.register('email')} />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" autoComplete="current-password" {...loginForm.register('password')} />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="remember-me" checked={rememberMe} onCheckedChange={(checked) => setRememberMe(checked as boolean)} className="h-5 w-5" />
                  <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer -translate-y-px">Remember me</Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log In
                </Button>
                 <div className="text-center">
                    <DialogTrigger asChild>
                        <Button variant="link" type="button" size="sm" className="h-auto p-0 text-sm font-normal text-muted-foreground">
                            Forgot password?
                        </Button>
                    </DialogTrigger>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-firstname">First Name</Label>
                  <Input id="signup-firstname" type="text" placeholder="Alex" autoComplete="given-name" {...signUpForm.register('firstname')} />
                  {signUpForm.formState.errors.firstname && <p className="text-sm text-destructive">{signUpForm.formState.errors.firstname.message}</p>}
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input id="signup-username" type="text" placeholder="alex_the_ace" autoComplete="username" {...signUpForm.register('username')} />
                  {signUpForm.formState.errors.username && <p className="text-sm text-destructive">{signUpForm.formState.errors.username.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input id="signup-email" type="email" placeholder="you@example.com" autoComplete="email" {...signUpForm.register('email')} />
                   {signUpForm.formState.errors.email && <p className="text-sm text-destructive">{signUpForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input id="signup-password" type="password" autoComplete="new-password" {...signUpForm.register('password')} />
                  {signUpForm.formState.errors.password && <p className="text-sm text-destructive">{signUpForm.formState.errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input id="confirm-password" type="password" autoComplete="new-password" {...signUpForm.register('confirmPassword')} />
                  {signUpForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">{signUpForm.formState.errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <DialogContent>
            <DialogHeader>
                <DialogTitle>Reset Your Password</DialogTitle>
                <DialogDescription>
                    Enter your email address and we'll send you a link to reset your password.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
                {resetError && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{resetError}</AlertDescription></Alert>}
                {resetSuccess && (
                  <div className="flex items-center gap-2 rounded-md border border-transparent bg-secondary p-3">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <p className="text-sm text-secondary-foreground">{resetSuccess}</p>
                  </div>
                )}
                
                {!resetSuccess && (
                     <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <Input 
                            id="reset-email" 
                            type="email" 
                            placeholder="you@example.com"
                            value={resetEmail}
                            onChange={(e) => {
                                setResetEmail(e.target.value)
                                setResetError(null)
                            }}
                        />
                    </div>
                )}
            </div>
            {!resetSuccess ? (
                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setIsResetDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handlePasswordReset} disabled={isResetting}>
                        {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Reset Link
                    </Button>
                </DialogFooter>
            ) : (
                <DialogFooter>
                    <Button type="button" onClick={() => setIsResetDialogOpen(false)}>Close</Button>
                </DialogFooter>
            )}
          </DialogContent>
        </Dialog>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-5 w-5" />}
            Google
        </Button>
      </CardContent>
    </Card>
  );
}
