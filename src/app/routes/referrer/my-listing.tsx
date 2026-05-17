import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getReferrerProfile } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FadeIn } from '@/components/animated/fade-in';
import { Loader2, Pencil, Building2, Mail, Phone, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router';
import type { ReferrerProfile, ContactMethod, ListingStatus } from '@/types';

const statusStyles: Record<ListingStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const contactIcons: Record<ContactMethod, typeof Mail> = {
  email: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  linkedin: LinkIcon,
};

export function MyListingPage() {
  const { user } = useAuth();
  const [referrer, setReferrer] = useState<ReferrerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const profile = await getReferrerProfile(user.uid);
      setReferrer(profile);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!referrer) {
    return (
      <FadeIn>
        <div className="text-center py-20 space-y-4">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">No listing yet</h2>
          <p className="text-muted-foreground">Create your Talent Connector profile to get started.</p>
          <Link to="/referrer/profile" className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80">
            Create Profile
          </Link>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">My Listing</h1>
            <p className="text-muted-foreground">Preview how seekers see your contact card.</p>
          </div>
          <Link to="/referrer/profile" className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted">
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl">
                  {referrer.firstName} {referrer.lastName}
                </CardTitle>
                <p className="text-muted-foreground">
                  {referrer.companyRole} at{' '}
                  <span className="font-medium text-foreground">{referrer.companyName}</span>
                </p>
              </div>
              <Badge className={statusStyles[referrer.status]}>{referrer.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Preferred Contact Methods</p>
              <div className="flex flex-wrap gap-2">
                {referrer.preferredContact.map((method) => {
                  const Icon = contactIcons[method];
                  return (
                    <Badge key={method} variant="secondary" className="gap-1.5 py-1">
                      <Icon className="h-3.5 w-3.5" />
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {referrer.status === 'pending' && (
              <p className="text-sm text-yellow-600 bg-yellow-500/10 rounded-lg p-3">
                Your listing is under review. It will be visible to seekers once approved by an admin.
              </p>
            )}
            {referrer.status === 'rejected' && (
              <p className="text-sm text-red-600 bg-red-500/10 rounded-lg p-3">
                Your listing was not approved. Please update your profile and resubmit.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
