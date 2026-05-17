import { useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/auth-store';
import { updateActiveRole, updateUserRoles } from '@/lib/firestore';
import type { UserRole } from '@/types';

const roleDefaultRoute: Record<UserRole, string> = {
  seeker: '/search',
  referrer: '/referrer/profile',
  admin: '/admin/listings',
};

export function useRole() {
  const { userProfile, activeRole, setActiveRole, setUserProfile } = useAuthStore();
  const navigate = useNavigate();

  const switchRole = async (role: UserRole) => {
    if (!userProfile) return;
    if (!userProfile.roles.includes(role)) return;
    if (role === activeRole) return;
    setActiveRole(role);
    navigate(roleDefaultRoute[role], { replace: true });
    await updateActiveRole(userProfile.uid, role);
  };

  const becomeReferrer = async () => {
    if (!userProfile) return;
    if (userProfile.roles.includes('referrer')) return;
    const newRoles: UserRole[] = [...userProfile.roles, 'referrer'];
    await updateUserRoles(userProfile.uid, newRoles);
    setUserProfile({ ...userProfile, roles: newRoles, activeRole: 'referrer' });
    setActiveRole('referrer');
    navigate(roleDefaultRoute.referrer, { replace: true });
    await updateActiveRole(userProfile.uid, 'referrer');
  };

  const availableRoles = userProfile?.roles ?? [];
  const hasRole = (role: UserRole) => availableRoles.includes(role);

  return {
    activeRole,
    availableRoles,
    switchRole,
    hasRole,
    becomeReferrer,
  };
}
