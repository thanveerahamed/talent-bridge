import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  deleteUser as firebaseDeleteUser,
  type ActionCodeSettings,
  type User,
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserRole } from '@/types';

function getVerificationActionSettings(): ActionCodeSettings {
  const origin = globalThis.location?.origin ?? 'http://localhost:4011';

  return {
    // After Firebase processes the action, redirect users back to our app.
    url: `${origin}/dashboard`,
    handleCodeInApp: true,
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

  // Send verification email
  await sendEmailVerification(user, getVerificationActionSettings());

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

export async function deleteAccount() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No authenticated user found.');
  }

  const uid = currentUser.uid;

  // Delete Firestore documents (ignore if they don't exist)
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch {
    /* may not exist */
  }
  try {
    await deleteDoc(doc(db, 'referrers', uid));
  } catch {
    /* may not exist */
  }

  // Delete Firebase Auth account
  await firebaseDeleteUser(currentUser);
}
