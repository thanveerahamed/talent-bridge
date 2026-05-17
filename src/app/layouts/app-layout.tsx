import { Outlet, Navigate, NavLink } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import { RoleSwitcher } from '@/components/role-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Search,
  Briefcase,
  Users,
  BarChart3,
  FileText,
  UserCircle,
  LogOut,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import type { UserRole } from '@/types';

const navItems: Record<UserRole, { to: string; label: string; icon: typeof Search }[]> = {
  seeker: [
    { to: '/search', label: 'Find Connectors', icon: Search },
  ],
  referrer: [
    { to: '/referrer/profile', label: 'My Profile', icon: UserCircle },
    { to: '/referrer/listing', label: 'My Listing', icon: FileText },
  ],
  admin: [
    { to: '/admin/listings', label: 'Listings', icon: FileText },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ],
};

export function AppLayout() {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();
  const { activeRole } = useRole();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Email verification gate (disabled for now)
  // if (!isEmailVerified) {
  //   return <Navigate to="/verify-email" replace />;
  // }

  const currentNav = navItems[activeRole] ?? navItems.seeker;

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">TalentBridge</span>
        </div>

        <div className="px-4 py-4">
          <RoleSwitcher />
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOutUser} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="font-semibold">TalentBridge</span>
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOutUser} aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Role Switcher — below header */}
      <div className="border-b border-border px-4 py-2 lg:hidden">
        <RoleSwitcher />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-5xl p-4 lg:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card lg:hidden">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground',
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
