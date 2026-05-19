import { useState } from 'react';
import { useFeatureFlags } from '@/hooks/use-feature-flags';
import { updateFeatureFlag } from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FadeIn } from '@/components/animated/fade-in';
import { Loader2, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface FlagConfig {
  key: keyof ReturnType<typeof useFeatureFlags>['flags'];
  label: string;
  description: string;
}

const FLAG_CONFIGS: FlagConfig[] = [
  {
    key: 'autoApproveListings',
    label: 'Auto-approve new listings',
    description:
      'When enabled, new referrer listings are automatically approved. When disabled, they require admin approval.',
  },
];

export function AdminSettingsPage() {
  const { flags, loading } = useFeatureFlags();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (key: keyof typeof flags) => {
    setUpdating(key);
    try {
      await updateFeatureFlag(key, !flags[key]);
      toast.success('Setting updated.');
    } catch {
      toast.error('Failed to update setting.');
    } finally {
      setUpdating(null);
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
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage feature flags and platform settings.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Toggle features on or off. Changes take effect immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FLAG_CONFIGS.map(({ key, label, description }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-lg border p-4"
              >
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={flags[key]}
                  disabled={updating === key}
                  onClick={() => handleToggle(key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    flags[key] ? 'bg-primary' : 'bg-input'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                      flags[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
