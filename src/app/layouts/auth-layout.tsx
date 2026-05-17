import { Outlet, Navigate } from 'react-router';
import { useAuth } from '@/hooks/use-auth';
import { PageTransition } from '@/components/animated/page-transition';
import { Loader2 } from 'lucide-react';

export function AuthLayout() {
  const { isAuthenticated, isEmailVerified, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated && isEmailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthenticated && !isEmailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return (
    <div className="flex min-h-svh items-center justify-center px-4">
      <PageTransition className="w-full max-w-md">
        <Outlet />
      </PageTransition>
    </div>
  );
}
