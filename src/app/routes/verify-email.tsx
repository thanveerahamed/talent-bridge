import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/hooks/use-auth';
import { resendVerificationEmail, signOutUser } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { DeleteAccountButton } from '@/components/delete-account-button';
import { MailCheck, RefreshCw, Loader2, LogOut } from 'lucide-react';
import { toast } from 'sonner';

function getVerificationErrorMessage(err: unknown): string {
  if (!(err instanceof FirebaseError)) {
    return 'Failed to send email. Try again later.';
  }

  switch (err.code) {
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';
    case 'auth/user-token-expired':
    case 'auth/requires-recent-login':
      return 'Your session expired. Please sign in again and retry.';
    case 'auth/invalid-continue-uri':
    case 'auth/unauthorized-continue-uri':
      return 'Verification link settings are invalid. Contact support.';
    default:
      return 'Failed to send email. Try again later.';
  }
}

const COOLDOWN_SECONDS = 60;

export function VerifyEmailPage() {
  const { user, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    const currentUser = auth.currentUser ?? user;
    if (!currentUser) {
      toast.error('Please sign in again before resending verification email.');
      navigate('/login', { replace: true });
      return;
    }

    if (isEmailVerified) {
      toast.success('Your email is already verified.');
      return;
    }

    setResending(true);
    try {
      await resendVerificationEmail(currentUser);
      toast.success('Verification email sent!');
      setCooldown(COOLDOWN_SECONDS);
    } catch (err: unknown) {
      toast.error(getVerificationErrorMessage(err));
    } finally {
      setResending(false);
    }
  }, [user, isEmailVerified, navigate]);

  const handleCheckNow = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in again to check verification status.');
      navigate('/login', { replace: true });
      return;
    }

    setChecking(true);
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) {
          navigate('/dashboard', { replace: true });
        } else {
          toast.info('Email not verified yet. Check your inbox.');
        }
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <FadeIn className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <MailCheck className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a verification link to{' '}
              <span className="font-medium text-foreground">{user?.email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-medium">📬 Check your spam folder</p>
              <p className="mt-1">
                The verification email is sent from{' '}
                <span className="font-mono text-xs">
                  noreply@im-nl-talent-bridge.firebaseapp.com
                </span>{' '}
                and may end up in your Spam or Junk folder.
              </p>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to verify your account, then use the button below to
              continue.
            </p>

            <div className="flex flex-col gap-2">
              <Button onClick={handleCheckNow} disabled={checking} className="w-full">
                {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                I&apos;ve verified - check now
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending || isEmailVerified || !user || cooldown > 0}
                className="w-full"
              >
                {resending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isEmailVerified
                  ? 'Email verified'
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend verification email'}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Want to use a different account?
            </p>
            <div className="flex w-full gap-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={signOutUser}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <DeleteAccountButton variant="full" />
            </div>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
}
