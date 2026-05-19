import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { applyActionCode, checkActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { CheckCircle2, XCircle, Loader2, Briefcase } from 'lucide-react';

type ActionStatus = 'loading' | 'success' | 'error';

export function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ActionStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    async function handleAction() {
      if (!oobCode) {
        setErrorMessage('Invalid or missing action code.');
        setStatus('error');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail': {
            // Verify the code is valid first
            await checkActionCode(auth, oobCode);
            // Apply the action
            await applyActionCode(auth, oobCode);
            // Reload user to update emailVerified
            if (auth.currentUser) {
              await auth.currentUser.reload();
            }
            setStatus('success');
            break;
          }
          case 'resetPassword': {
            // For password reset, redirect to a reset password page with the code
            // You can create a dedicated reset-password page later
            navigate(`/reset-password?oobCode=${oobCode}`, { replace: true });
            return;
          }
          default: {
            setErrorMessage(`Unsupported action: ${mode}`);
            setStatus('error');
          }
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong. The link may have expired.';
        setErrorMessage(message);
        setStatus('error');
      }
    }

    handleAction();
  }, [mode, oobCode, navigate]);

  return (
    <div className="flex min-h-svh items-center justify-center px-4 bg-background text-foreground">
      <FadeIn className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">TalentBridge</span>
            </div>

            {status === 'loading' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <CardTitle className="text-2xl">Verifying...</CardTitle>
                <CardDescription>Please wait while we verify your email.</CardDescription>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">Email Verified!</CardTitle>
                <CardDescription>
                  Your email has been successfully verified. You can now access all features.
                </CardDescription>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/50">
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl">Verification Failed</CardTitle>
                <CardDescription>{errorMessage}</CardDescription>
              </>
            )}
          </CardHeader>

          {status !== 'loading' && (
            <CardContent>
              <Button
                className="w-full"
                onClick={() =>
                  navigate(status === 'success' ? '/dashboard' : '/verify-email', { replace: true })
                }
              >
                {status === 'success' ? 'Continue to Dashboard' : 'Back to Verification'}
              </Button>
            </CardContent>
          )}
        </Card>
      </FadeIn>
    </div>
  );
}
