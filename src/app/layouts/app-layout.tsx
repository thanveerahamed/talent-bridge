import { Outlet, Navigate, NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import { useTheme } from 'next-themes';
import { RoleSwitcher } from '@/components/role-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { DeleteAccountButton } from '@/components/delete-account-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Briefcase,
  Users,
  BarChart3,
  FileText,
  UserCircle,
  LogOut,
  Loader2,
  Menu,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

import type { UserRole } from '@/types';

const navItems: Record<UserRole, { to: string; label: string; icon: typeof Search }[]> = {
  seeker: [{ to: '/search', label: 'Find Connectors', icon: Search }],
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
  const { isAuthenticated, loading } = useAuth();
  const { activeRole } = useRole();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

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
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border bg-card lg:sticky lg:top-0 lg:h-svh">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <Briefcase className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">TalentBridge</span>
        </div>

        <div className="px-4 py-4">
          <RoleSwitcher />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
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

        <div className="border-t border-border p-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/privacy')}
          >
            <ShieldCheck className="h-4 w-4" />
            Privacy & Data
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            onClick={signOutUser}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <div className="border-t border-border pt-1 mt-1">
            <DeleteAccountButton variant="full" />
          </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground outline-none">
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom" sideOffset={8}>
              <DropdownMenuItem onClick={() => navigate('/privacy')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Privacy & Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOutUser}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteAccountButton variant="menuItem" />
            </DropdownMenuContent>
          </DropdownMenu>
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
                  isActive ? 'text-primary' : 'text-muted-foreground',
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
