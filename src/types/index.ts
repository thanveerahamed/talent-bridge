// User roles
export type UserRole = 'seeker' | 'referrer' | 'admin';

// Contact method options
export type ContactMethod = 'email' | 'phone' | 'whatsapp' | 'linkedin';

// Referrer listing status
export type ListingStatus = 'pending' | 'approved' | 'rejected';

// Admin action types
export type AdminAction =
  | 'promote_admin'
  | 'remove_admin'
  | 'disable_user'
  | 'delete_user'
  | 'approve_listing'
  | 'reject_listing';

// Firestore user document
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  roles: UserRole[];
  activeRole: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore referrer document
export interface ReferrerProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedInUrl: string;
  whatsAppNumber: string;
  companyName: string;
  companyNameLower: string;
  companyRole: string;
  companyCareerLink: string;
  preferredContact: ContactMethod[];
  visible: boolean;
  status: ListingStatus;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore contact log document
export interface ContactLog {
  id?: string;
  seekerUid: string;
  referrerUid: string;
  contactMethod: ContactMethod;
  createdAt: Date;
}

// Firestore admin log document
export interface AdminLog {
  id?: string;
  adminUid: string;
  action: AdminAction;
  targetUid: string;
  metadata?: Record<string, string>;
  createdAt: Date;
}

// Feature flags stored in settings/featureFlags
export interface FeatureFlags {
  autoApproveListings: boolean;
}
