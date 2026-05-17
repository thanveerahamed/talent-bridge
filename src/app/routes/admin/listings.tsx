import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getAllReferrers,
  updateReferrerStatus,
  logAdminAction,
} from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FadeIn } from '@/components/animated/fade-in';
import { AnimatedList } from '@/components/animated/animated-list';
import { Loader2, Check, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ReferrerProfile, ListingStatus } from '@/types';

const statusStyles: Record<ListingStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  rejected: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export function AdminListingsPage() {
  const { user } = useAuth();
  const [referrers, setReferrers] = useState<ReferrerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadReferrers = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : (filter as ListingStatus);
      const data = await getAllReferrers(status);
      setReferrers(data);
    } catch {
      toast.error('Failed to load listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrers();
  }, [filter]);

  const handleStatusChange = async (referrer: ReferrerProfile, newStatus: ListingStatus) => {
    if (!user) return;
    setActionLoading(referrer.uid);
    try {
      await updateReferrerStatus(referrer.uid, newStatus);
      await logAdminAction(
        user.uid,
        newStatus === 'approved' ? 'approve_listing' : 'reject_listing',
        referrer.uid,
        { companyName: referrer.companyName },
      );
      toast.success(`Listing ${newStatus}.`);
      await loadReferrers();
    } catch {
      toast.error('Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <FadeIn>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Listings</h1>
          <p className="text-muted-foreground">Review and moderate referrer contact cards.</p>
        </div>

        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : referrers.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No listings found.</p>
              </div>
            ) : (
              <AnimatedList className="space-y-3">
                {referrers.map((p) => (
                  <Card key={p.uid}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate">
                            {p.firstName} {p.lastName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground truncate">
                            {p.companyRole} at {p.companyName}
                          </p>
                        </div>
                        <Badge className={statusStyles[p.status]}>{p.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1 mb-3">
                        {p.preferredContact.map((m) => (
                          <Badge key={m} variant="outline" className="text-xs">
                            {m}
                          </Badge>
                        ))}
                      </div>
                      {p.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(p, 'approved')}
                            disabled={actionLoading === p.uid}
                          >
                            {actionLoading === p.uid ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="mr-1 h-3 w-3" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(p, 'rejected')}
                            disabled={actionLoading === p.uid}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {p.status === 'rejected' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(p, 'approved')}
                          disabled={actionLoading === p.uid}
                        >
                          <Check className="mr-1 h-3 w-3" />
                          Approve
                        </Button>
                      )}
                      {p.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleStatusChange(p, 'rejected')}
                          disabled={actionLoading === p.uid}
                        >
                          <X className="mr-1 h-3 w-3" />
                          Revoke
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </AnimatedList>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </FadeIn>
  );
}
