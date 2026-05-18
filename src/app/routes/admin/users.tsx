import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAllUsers, updateUserRoles, logAdminAction } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/animated/fade-in';
import { AnimatedList } from '@/components/animated/animated-list';
import { Loader2, ShieldPlus, ShieldMinus, Users } from 'lucide-react';
import { toast } from 'sonner';
import type { UserProfile } from '@/types';

export function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        if (!cancelled) setUsers(data);
      } catch {
        if (!cancelled) toast.error('Failed to load users.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handlePromoteAdmin = async (targetUser: UserProfile) => {
    if (!user) return;
    setActionLoading(targetUser.uid);
    try {
      const newRoles = [...new Set([...targetUser.roles, 'admin' as const])];
      await updateUserRoles(targetUser.uid, newRoles);
      await logAdminAction(user.uid, 'promote_admin', targetUser.uid, {
        email: targetUser.email,
      });
      toast.success(`${targetUser.displayName} promoted to admin.`);
      await loadUsers();
    } catch {
      toast.error('Failed to promote user.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveAdmin = async (targetUser: UserProfile) => {
    if (!user) return;
    if (targetUser.uid === user.uid) {
      toast.error("You can't remove your own admin role.");
      return;
    }
    setActionLoading(targetUser.uid);
    try {
      const newRoles = targetUser.roles.filter((r) => r !== 'admin');
      await updateUserRoles(targetUser.uid, newRoles.length > 0 ? newRoles : ['seeker']);
      await logAdminAction(user.uid, 'remove_admin', targetUser.uid, {
        email: targetUser.email,
      });
      toast.success(`Admin role removed from ${targetUser.displayName}.`);
      await loadUsers();
    } catch {
      toast.error('Failed to update user.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FadeIn>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <p className="text-muted-foreground">View all registered users and manage admin roles.</p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No users found.</p>
          </div>
        ) : (
          <AnimatedList className="space-y-3">
            {users.map((u) => (
              <Card key={u.uid}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <CardTitle className="text-base">{u.displayName}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {u.roles.map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span>
                      Verified:{' '}
                      <span className={u.emailVerified ? 'text-emerald-600' : 'text-yellow-600'}>
                        {u.emailVerified ? 'Yes' : 'No'}
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {!u.roles.includes('admin') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePromoteAdmin(u)}
                        disabled={actionLoading === u.uid}
                      >
                        {actionLoading === u.uid ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldPlus className="mr-1 h-3 w-3" />
                        )}
                        Promote to Admin
                      </Button>
                    )}
                    {u.roles.includes('admin') && u.uid !== user?.uid && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        onClick={() => handleRemoveAdmin(u)}
                        disabled={actionLoading === u.uid}
                      >
                        {actionLoading === u.uid ? (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <ShieldMinus className="mr-1 h-3 w-3" />
                        )}
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </AnimatedList>
        )}
      </div>
    </FadeIn>
  );
}
