import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { searchReferrersByCompany, getVisibleReferrers, logContact } from '@/lib/firestore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedList } from '@/components/animated/animated-list';
import { FadeIn } from '@/components/animated/fade-in';
import {
  Search,
  Mail,
  Phone,
  MessageCircle,
  Link,
  Building2,
  Loader2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { ReferrerProfile, ContactMethod } from '@/types';

const contactConfig: Record<ContactMethod, { icon: typeof Mail; label: string; color: string }> = {
  email: { icon: Mail, label: 'Email', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
  phone: {
    icon: Phone,
    label: 'Call',
    color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20',
  },
  whatsapp: {
    icon: MessageCircle,
    label: 'WhatsApp',
    color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
  },
  linkedin: {
    icon: Link,
    label: 'LinkedIn',
    color: 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20',
  },
};

function getContactUrl(method: ContactMethod, referrer: ReferrerProfile): string | null {
  switch (method) {
    case 'email':
      return referrer.email ? `mailto:${referrer.email}` : null;
    case 'phone':
      return referrer.phone ? `tel:${referrer.phone}` : null;
    case 'whatsapp':
      return referrer.whatsAppNumber
        ? `https://wa.me/${referrer.whatsAppNumber.replace(/[^0-9]/g, '')}`
        : null;
    case 'linkedin':
      return referrer.linkedInUrl || null;
    default:
      return null;
  }
}

export function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [referrers, setReferrers] = useState<ReferrerProfile[]>([]);
  const [searchResults, setSearchResults] = useState<ReferrerProfile[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const lastDocRef = useRef<unknown>(null);

  // Load initial referrers on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await getVisibleReferrers();
        setReferrers(result.referrers);
        lastDocRef.current = result.lastDoc;
        setHasMore(result.hasMore);
      } catch {
        toast.error('Failed to load connectors.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load more (pagination)
  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await getVisibleReferrers(lastDocRef.current);
      setReferrers((prev) => [...prev, ...result.referrers]);
      lastDocRef.current = result.lastDoc;
      setHasMore(result.hasMore);
    } catch {
      toast.error('Failed to load more connectors.');
    } finally {
      setLoadingMore(false);
    }
  };

  // Search by company name
  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchReferrersByCompany(trimmed);
      setSearchResults(results);
    } catch {
      toast.error('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults(null);
  };

  const handleContact = async (referrer: ReferrerProfile, method: ContactMethod) => {
    if (!user) return;
    const url = getContactUrl(method, referrer);
    if (!url) {
      toast.error('Contact information not available.');
      return;
    }

    try {
      await logContact(user.uid, referrer.uid, method);
    } catch {
      // Non-blocking
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Determine which list to display (exclude own profile)
  const displayList = (searchResults ?? referrers).filter((r) => r.uid !== user?.uid);
  const isSearchActive = searchResults !== null;

  return (
    <FadeIn>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Find Talent Connectors</h1>
          <p className="text-muted-foreground">
            Browse active connectors or search by company name.
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" disabled={searching || !query.trim()}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
          {isSearchActive && (
            <Button type="button" variant="outline" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>

        {/* Loading state */}
        {(loading || searching) && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty state */}
        {!loading && !searching && displayList.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isSearchActive
                ? `No connectors found for "${query}"`
                : 'No active connectors yet. Check back soon!'}
            </p>
          </div>
        )}

        {/* Results grid */}
        {!loading && !searching && displayList.length > 0 && (
          <>
            {isSearchActive && (
              <p className="text-sm text-muted-foreground">
                {displayList.length} result{displayList.length !== 1 ? 's' : ''} for &ldquo;{query}
                &rdquo;
              </p>
            )}

            <AnimatedList className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {displayList.map((referrer) => (
                <Card
                  key={referrer.uid}
                  className="group flex h-full flex-col transition-shadow hover:shadow-lg hover:shadow-primary/5"
                >
                  <CardContent className="flex flex-1 flex-col pt-6 space-y-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {referrer.firstName} {referrer.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{referrer.companyRole}</p>
                      <Badge variant="secondary" className="mt-2 gap-1">
                        <Building2 className="h-3 w-3" />
                        {referrer.companyName}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Reach Out
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {referrer.preferredContact.map((method) => {
                          const config = contactConfig[method];
                          const Icon = config.icon;
                          return (
                            <Button
                              key={method}
                              variant="ghost"
                              size="sm"
                              className={`gap-1.5 ${config.color}`}
                              onClick={() => handleContact(referrer, method)}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              {config.label}
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </AnimatedList>

            {/* Pagination - Load More */}
            {!isSearchActive && hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="gap-2"
                >
                  {loadingMore ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </FadeIn>
  );
}
