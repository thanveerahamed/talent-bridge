import { useRole } from '@/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Search, Briefcase, Shield, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const roleConfig: Record<UserRole, { label: string; icon: typeof Search }> = {
  seeker: { label: 'Seeker', icon: Search },
  referrer: { label: 'Referrer', icon: Briefcase },
  admin: { label: 'Admin', icon: Shield },
};

export function RoleSwitcher() {
  const { activeRole, availableRoles, switchRole, hasRole, becomeReferrer } = useRole();

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex flex-1 flex-wrap items-center rounded-lg border border-border bg-muted p-1">
        {availableRoles.map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const isActive = role === activeRole;
          return (
            <button
              key={role}
              type="button"
              onClick={() => switchRole(role)}
              className={cn(
                'inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {config.label}
            </button>
          );
        })}
      </div>
      {!hasRole('referrer') && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 whitespace-nowrap text-xs"
          onClick={becomeReferrer}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Become a Referrer
        </Button>
      )}
    </div>
  );
}
