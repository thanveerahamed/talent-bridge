import { Navigate } from 'react-router';
import { useRole } from '@/hooks/use-role';

export function DashboardPage() {
  const { activeRole } = useRole();

  switch (activeRole) {
    case 'referrer':
      return <Navigate to="/referrer/profile" replace />;
    case 'admin':
      return <Navigate to="/admin/listings" replace />;
    case 'seeker':
    default:
      return <Navigate to="/search" replace />;
  }
}
