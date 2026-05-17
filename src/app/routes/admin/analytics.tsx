import { useState, useEffect } from 'react';
import { getAllUsers, getAllReferrers, getContactLogs } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/animated/fade-in';
import { motion } from 'framer-motion';
import { Loader2, Users, Building2, Mail, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalUsers: number;
  totalReferrers: number;
  approvedReferrers: number;
  pendingReferrers: number;
  totalContacts: number;
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="text-3xl font-bold"
    >
      {value}
    </motion.span>
  );
}

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, referrers, contacts] = await Promise.all([
          getAllUsers(),
          getAllReferrers(),
          getContactLogs(),
        ]);

        setStats({
          totalUsers: users.length,
          totalReferrers: referrers.length,
          approvedReferrers: referrers.filter((p) => p.status === 'approved').length,
          pendingReferrers: referrers.filter((p) => p.status === 'pending').length,
          totalContacts: contacts.length,
        });
      } catch {
        toast.error('Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Total Connectors',
      value: stats.totalReferrers,
      icon: Building2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'Approved Listings',
      value: stats.approvedReferrers,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReferrers,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
    },
    {
      title: 'Total Reach Outs',
      value: stats.totalContacts,
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <FadeIn>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Overview of platform activity.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <div className={`rounded-lg p-2 ${card.bg}`}>
                      <Icon className={`h-4 w-4 ${card.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnimatedNumber value={card.value} />
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </FadeIn>
  );
}
