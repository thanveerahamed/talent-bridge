import { useState } from 'react';
import { useNavigate } from 'react-router';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/hooks/use-auth';
import { resendVerificationEmail } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { MailCheck, RefreshCw, Loader2 } from 'lucide-react';
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

export function VerifyEmailPage() {
  const { user, isEmailVerified } = useAuth();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
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
    } catch (err: unknown) {
      toast.error(getVerificationErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

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
            <p className="text-center text-sm text-muted-foreground">
              Click the link in the email to verify your account, then use the button below to continue.
            </p>

            <div className="flex flex-col gap-2">
              <Button onClick={handleCheckNow} disabled={checking} className="w-full">
                {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                I&apos;ve verified - check now
              </Button>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={resending || isEmailVerified || !user}
                className="w-full"
              >
                {resending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isEmailVerified ? 'Email verified' : 'Resend verification email'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
