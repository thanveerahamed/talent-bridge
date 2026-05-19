import { FadeIn } from '@/components/animated/fade-in';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, Database, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';

const GITHUB_REPO = 'https://github.com/thanveerahamed/talent-bridge';

export function PrivacyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <FadeIn>
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            {isAuthenticated ? 'Back to Dashboard' : 'Back to Login'}
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold">Privacy & Data</h1>
          <p className="text-muted-foreground">How your data is used, stored, and protected.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Open Source
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              TalentBridge is a fully open-source application. You can inspect, audit, and
              contribute to the source code at any time.
            </p>
            <a
              href={GITHUB_REPO}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Where We Keep Your Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We store your information safely using Google&apos;s servers — the same technology
              used by millions of apps worldwide.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  Login
                </Badge>
                <span>
                  Your email and password are protected with strong encryption. We can&apos;t see
                  your password.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  Profile
                </Badge>
                <span>
                  The info you fill in (name, company, how to reach you) is saved so seekers can
                  find you.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="secondary" className="mt-0.5 shrink-0">
                  Activity
                </Badge>
                <span>
                  We keep a simple count of who contacted whom. We never store any messages or
                  conversations.
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              What We Do (and Don&apos;t Do) With Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Short version: we only use your data to make TalentBridge work. That&apos;s it.
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>
                Your profile only shows up in search after an admin approves it and you keep it
                visible.
              </li>
              <li>Only the contact methods you choose are shown to others.</li>
              <li>We never sell your data to anyone. Ever.</li>
              <li>We don&apos;t track you with cookies or ads.</li>
              <li>No third-party companies get access to your info.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              Deleting Your Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              You&apos;re in control. You can remove your data whenever you want:
            </p>
            <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
              <li>
                Want a break? Hide your profile from search with one click — you can turn it back on
                anytime.
              </li>
              <li>
                Want to leave? Delete your account and we&apos;ll wipe everything — your login,
                profile, and listing. Gone for good.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
