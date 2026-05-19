import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { KeyRound, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const resetSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ResetForm = z.infer<typeof resetSchema>;

type PageState = 'validating' | 'form' | 'success' | 'error';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get('oobCode');
  const [pageState, setPageState] = useState<PageState>('validating');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  useEffect(() => {
    async function validateCode() {
      if (!oobCode) {
        setErrorMessage('Invalid or missing reset code.');
        setPageState('error');
        return;
      }

      try {
        const email = await verifyPasswordResetCode(auth, oobCode);
        setUserEmail(email);
        setPageState('form');
      } catch {
        setErrorMessage('This password reset link has expired or already been used.');
        setPageState('error');
      }
    }

    validateCode();
  }, [oobCode]);

  const onSubmit = async (data: ResetForm) => {
    if (!oobCode) return;

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setPageState('success');
      toast.success('Password reset successfully!');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to reset password. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4 bg-background text-foreground">
      <FadeIn className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            {pageState === 'validating' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl">Validating...</CardTitle>
                <CardDescription>Checking your reset link.</CardDescription>
              </>
            )}

            {pageState === 'form' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Set New Password</CardTitle>
                <CardDescription>
                  Enter a new password for{' '}
                  <span className="font-medium text-foreground">{userEmail}</span>
                </CardDescription>
              </>
            )}

            {pageState === 'success' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Password Reset!</CardTitle>
                <CardDescription>
                  Your password has been updated. You can now sign in with your new password.
                </CardDescription>
              </>
            )}

            {pageState === 'error' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl">Link Expired</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {pageState === 'form' && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('password')}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reset Password
                </Button>
              </form>
            )}

            {pageState === 'success' && (
              <Button className="w-full" onClick={() => navigate('/login', { replace: true })}>
                Go to Sign In
              </Button>
            )}

            {pageState === 'error' && (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate('/forgot-password', { replace: true })}
              >
                Request a New Link
              </Button>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
