import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRole } from '@/hooks/use-role';
import {
  getReferrerProfile,
  saveReferrerProfile,
  toggleReferrerVisibility,
  updateUserRoles,
} from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FadeIn } from '@/components/animated/fade-in';
import { Loader2, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { ContactMethod, ReferrerProfile } from '@/types';

const referrerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Enter a valid email').or(z.literal('')),
    phone: z.string(),
    linkedInUrl: z.string(),
    whatsAppNumber: z.string(),
    companyName: z.string().min(1, 'Company name is required'),
    companyRole: z.string().min(1, 'Your role at the company is required'),
    companyCareerLink: z.string(),
    preferredContact: z.array(z.string()).min(1, 'Select at least one contact method'),
  })
  .superRefine((data, ctx) => {
    if (data.preferredContact.includes('email') && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Email is required when email is a preferred contact method',
        path: ['email'],
      });
    }
    if (data.preferredContact.includes('phone') && !data.phone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone number is required when phone is a preferred contact method',
        path: ['phone'],
      });
    }
    if (data.preferredContact.includes('whatsapp') && !data.whatsAppNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'WhatsApp number is required when WhatsApp is a preferred contact method',
        path: ['whatsAppNumber'],
      });
    }
    if (data.preferredContact.includes('linkedin') && !data.linkedInUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'LinkedIn URL is required when LinkedIn is a preferred contact method',
        path: ['linkedInUrl'],
      });
    }
  });

type ReferrerForm = z.infer<typeof referrerSchema>;

const contactOptions: { value: ContactMethod; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'linkedin', label: 'LinkedIn' },
];

export function ReferrerProfilePage() {
  const { user, profile } = useAuth();
  const { hasRole } = useRole();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReferrerForm>({
    resolver: zodResolver(referrerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      linkedInUrl: '',
      whatsAppNumber: '',
      companyName: '',
      companyRole: '',
      companyCareerLink: '',
      preferredContact: [],
    },
  });

  const selectedContact = watch('preferredContact');

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const existing = await getReferrerProfile(user.uid);
        if (existing) {
          setHasExistingProfile(true);
          setProfileVisible(existing.visible ?? true);
          reset({
            firstName: existing.firstName,
            lastName: existing.lastName,
            email: existing.email,
            phone: existing.phone,
            linkedInUrl: existing.linkedInUrl,
            whatsAppNumber: existing.whatsAppNumber,
            companyName: existing.companyName,
            companyRole: existing.companyRole,
            companyCareerLink: existing.companyCareerLink ?? '',
            preferredContact: existing.preferredContact,
          });
        } else if (profile) {
          setValue('email', profile.email);
          const [first, ...rest] = profile.displayName.split(' ');
          setValue('firstName', first ?? '');
          setValue('lastName', rest.join(' '));
        }
      } catch {
        // Profile may not exist yet or permissions not ready
        if (profile) {
          setValue('email', profile.email);
          const [first, ...rest] = profile.displayName.split(' ');
          setValue('firstName', first ?? '');
          setValue('lastName', rest.join(' '));
        }
      }
      setInitialLoading(false);
    })();
  }, [user, profile, reset, setValue]);

  const onSubmit = async (data: ReferrerForm) => {
    if (!user || !profile) return;
    setLoading(true);
    try {
      const referrerData: Omit<ReferrerProfile, 'createdAt' | 'updatedAt'> = {
        uid: user.uid,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone ?? '',
        linkedInUrl: data.linkedInUrl ?? '',
        whatsAppNumber: data.whatsAppNumber ?? '',
        companyName: data.companyName,
        companyNameLower: data.companyName.toLowerCase().trim(),
        companyRole: data.companyRole,
        companyCareerLink: data.companyCareerLink ?? '',
        preferredContact: data.preferredContact as ContactMethod[],
        visible: profileVisible,
        status: 'pending',
      };

      await saveReferrerProfile(referrerData);

      // Add referrer role if not already present
      if (!hasRole('referrer')) {
        const newRoles = [...profile.roles, 'referrer' as const];
        await updateUserRoles(profile.uid, newRoles);
      }

      toast.success('Profile saved! It will be reviewed by an admin.');
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityToggle = async () => {
    if (!user) return;
    setTogglingVisibility(true);
    try {
      const newVisible = !profileVisible;
      await toggleReferrerVisibility(user.uid, newVisible);
      setProfileVisible(newVisible);
      toast.success(
        newVisible ? 'Profile is now visible to seekers.' : 'Profile is now hidden from seekers.',
      );
    } catch {
      toast.error('Failed to update visibility.');
    } finally {
      setTogglingVisibility(false);
    }
  };

  if (initialLoading) {
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
          <h1 className="text-2xl font-bold">Talent Connector Profile</h1>
          <p className="text-muted-foreground">
            Share your details so talent seekers can reach out to you.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
            <CardDescription>
              This information will be visible to seekers once approved.
            </CardDescription>
          </CardHeader>

          {hasExistingProfile && (
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {profileVisible ? (
                    <Eye className="h-5 w-5 text-green-600" />
                  ) : (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {profileVisible ? 'Profile Visible' : 'Profile Hidden'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profileVisible
                        ? 'Seekers can find you in search results.'
                        : 'Your profile is hidden from search results.'}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant={profileVisible ? 'outline' : 'default'}
                  size="sm"
                  disabled={togglingVisibility}
                  onClick={handleVisibilityToggle}
                >
                  {togglingVisibility ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : profileVisible ? (
                    'Hide Profile'
                  ) : (
                    'Show Profile'
                  )}
                </Button>
              </div>
            </div>
          )}
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name / Initials</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" placeholder="Acme Corp" {...register('companyName')} />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyRole">Your Role</Label>
                  <Input
                    id="companyRole"
                    placeholder="Engineering Manager"
                    {...register('companyRole')}
                  />
                  {errors.companyRole && (
                    <p className="text-sm text-destructive">{errors.companyRole.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyCareerLink">Company Career Page Link</Label>
                <Input
                  id="companyCareerLink"
                  placeholder="https://company.com/careers"
                  {...register('companyCareerLink')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Contact Email
                  {selectedContact.includes('email') && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number
                    {selectedContact.includes('phone') && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <Input id="phone" placeholder="+1 234 567 8900" {...register('phone')} />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsAppNumber">
                    WhatsApp Number
                    {selectedContact.includes('whatsapp') && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </Label>
                  <Input
                    id="whatsAppNumber"
                    placeholder="+1 234 567 8900"
                    {...register('whatsAppNumber')}
                  />
                  {errors.whatsAppNumber && (
                    <p className="text-sm text-destructive">{errors.whatsAppNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedInUrl">
                  LinkedIn Profile URL
                  {selectedContact.includes('linkedin') && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </Label>
                <Input
                  id="linkedInUrl"
                  placeholder="https://linkedin.com/in/yourprofile"
                  {...register('linkedInUrl')}
                />
                {errors.linkedInUrl && (
                  <p className="text-sm text-destructive">{errors.linkedInUrl.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label>Preferred Contact Methods</Label>
                <div className="flex flex-wrap gap-4">
                  {contactOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedContact.includes(option.value)}
                        onCheckedChange={(checked: boolean) => {
                          const current = selectedContact as string[];
                          const updated = checked
                            ? [...current, option.value]
                            : current.filter((v) => v !== option.value);
                          setValue('preferredContact', updated, { shouldValidate: true });
                        }}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.preferredContact && (
                  <p className="text-sm text-destructive">{errors.preferredContact.message}</p>
                )}
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeIn>
  );
}
