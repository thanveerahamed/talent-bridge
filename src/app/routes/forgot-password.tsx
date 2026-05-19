import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim(), {
        url: `${globalThis.location?.origin ?? 'http://localhost:5173'}/login`,
        handleCodeInApp: true,
      });
      setSent(true);
    } catch {
      // Don't reveal if the email exists or not
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {sent
              ? 'Check your inbox for the reset link.'
              : 'Enter your email to receive a password reset link.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sent ? (
            <>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                <p className="font-medium">📬 Check your spam folder</p>
                <p className="mt-1">
                  The password reset email is sent from{' '}
                  <span className="font-mono text-xs">
                    noreply@im-nl-talent-bridge.firebaseapp.com
                  </span>{' '}
                  and may end up in your Spam or Junk folder.
                </p>
              </div>

              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="text-primary hover:underline">
                  Back to Sign In
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </FadeIn>
  );
}
