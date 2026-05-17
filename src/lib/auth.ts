import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  type ActionCodeSettings,
  type User,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserRole } from '@/types';

function getVerificationActionSettings(): ActionCodeSettings {
  const origin = globalThis.location?.origin ?? 'http://localhost:4011';

  return {
    // Return users to the verification screen in this app after clicking the email link.
    url: `${origin}/verify-email`,
  };
}

export async function signUp(email: string, password: string, displayName: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // Wait for the auth token to propagate to Firestore
  await user.getIdToken(true);

  // Create user document in Firestore
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    displayName,
    roles: ['seeker'] as UserRole[],
    activeRole: 'seeker' as UserRole,
    emailVerified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Send verification email (disabled for now)
  // await sendEmailVerification(user, getVerificationActionSettings());

  return user;
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOutUser() {
  await firebaseSignOut(auth);
}

export async function resendVerificationEmail(user: User) {
  const currentUser = auth.currentUser ?? user;
  if (!currentUser) {
    throw new Error('Please sign in again before resending verification email.');
  }

  await sendEmailVerification(currentUser, getVerificationActionSettings());
}
