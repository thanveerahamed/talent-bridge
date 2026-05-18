import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  startAfter,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  ReferrerProfile,
  ContactLog,
  AdminLog,
  UserRole,
  ListingStatus,
  ContactMethod,
  AdminAction,
} from '@/types';

// ─── Users ──────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

export async function updateActiveRole(uid: string, role: UserRole) {
  await updateDoc(doc(db, 'users', uid), {
    activeRole: role,
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserRoles(uid: string, roles: UserRole[]) {
  await updateDoc(doc(db, 'users', uid), {
    roles,
    updatedAt: serverTimestamp(),
  });
}

export async function updateEmailVerified(uid: string, verified: boolean) {
  await updateDoc(doc(db, 'users', uid), {
    emailVerified: verified,
    updatedAt: serverTimestamp(),
  });
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as UserProfile);
}

// ─── Referrers ──────────────────────────────────────

export async function getReferrerProfile(uid: string): Promise<ReferrerProfile | null> {
  const snap = await getDoc(doc(db, 'referrers', uid));
  if (!snap.exists()) return null;
  return snap.data() as ReferrerProfile;
}

export async function saveReferrerProfile(
  profile: Omit<ReferrerProfile, 'createdAt' | 'updatedAt'>,
) {
  const existing = await getReferrerProfile(profile.uid);
  if (existing) {
    await updateDoc(doc(db, 'referrers', profile.uid), {
      ...profile,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(doc(db, 'referrers', profile.uid), {
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export async function searchReferrersByCompany(searchTerm: string): Promise<ReferrerProfile[]> {
  const lower = searchTerm.toLowerCase().trim();
  if (!lower) return [];

  const q = query(
    collection(db, 'referrers'),
    where('status', '==', 'approved'),
    where('visible', '==', true),
    where('companyNameLower', '>=', lower),
    where('companyNameLower', '<=', lower + '\uf8ff'),
    orderBy('companyNameLower'),
    limit(50),
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ReferrerProfile);
}

export interface PaginatedResult {
  referrers: ReferrerProfile[];
  lastDoc: unknown;
  hasMore: boolean;
}

const PAGE_SIZE = 12;

export async function getVisibleReferrers(cursor?: unknown): Promise<PaginatedResult> {
  const q = cursor
    ? query(
        collection(db, 'referrers'),
        where('status', '==', 'approved'),
        where('visible', '==', true),
        orderBy('companyNameLower', 'desc'),
        startAfter(cursor),
        limit(PAGE_SIZE + 1),
      )
    : query(
        collection(db, 'referrers'),
        where('status', '==', 'approved'),
        where('visible', '==', true),
        orderBy('companyNameLower', 'desc'),
        limit(PAGE_SIZE + 1),
      );

  const snap = await getDocs(q);
  const docs = snap.docs;
  const hasMore = docs.length > PAGE_SIZE;
  const sliced = hasMore ? docs.slice(0, PAGE_SIZE) : docs;

  return {
    referrers: sliced.map((d) => d.data() as ReferrerProfile),
    lastDoc: sliced.length > 0 ? sliced[sliced.length - 1] : null,
    hasMore,
  };
}

export async function getAllReferrers(statusFilter?: ListingStatus): Promise<ReferrerProfile[]> {
  let q;
  if (statusFilter) {
    q = query(
      collection(db, 'referrers'),
      where('status', '==', statusFilter),
      orderBy('companyNameLower'),
    );
  } else {
    q = query(collection(db, 'referrers'), orderBy('companyNameLower'));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ReferrerProfile);
}

export async function updateReferrerStatus(
  uid: string,
  status: ListingStatus,
  rejectionReason?: string,
) {
  const data: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (status === 'rejected' && rejectionReason) {
    data.rejectionReason = rejectionReason;
  }
  if (status === 'approved') {
    data.rejectionReason = '';
  }
  await updateDoc(doc(db, 'referrers', uid), data);
}

export async function deleteReferrer(uid: string) {
  await deleteDoc(doc(db, 'referrers', uid));
}

export async function toggleReferrerVisibility(uid: string, visible: boolean) {
  await updateDoc(doc(db, 'referrers', uid), {
    visible,
    updatedAt: serverTimestamp(),
  });
}

// ─── Contact Logs ───────────────────────────────────

export async function logContact(
  seekerUid: string,
  referrerUid: string,
  contactMethod: ContactMethod,
) {
  await addDoc(collection(db, 'contactLogs'), {
    seekerUid,
    referrerUid,
    contactMethod,
    createdAt: serverTimestamp(),
  });
}

export async function getContactLogs(limitCount = 100): Promise<ContactLog[]> {
  const q = query(collection(db, 'contactLogs'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ContactLog);
}

// ─── Admin Logs ─────────────────────────────────────

export async function logAdminAction(
  adminUid: string,
  action: AdminAction,
  targetUid: string,
  metadata?: Record<string, string>,
) {
  await addDoc(collection(db, 'adminLogs'), {
    adminUid,
    action,
    targetUid,
    metadata: metadata ?? null,
    createdAt: serverTimestamp(),
  });
}

export async function getAdminLogs(limitCount = 100): Promise<AdminLog[]> {
  const q = query(collection(db, 'adminLogs'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AdminLog);
}
