import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserProfile, updateEmailVerified } from '@/lib/firestore';
import { useAuthStore } from '@/stores/auth-store';

export function useAuth() {
  const {
    firebaseUser,
    userProfile,
    activeRole,
    loading,
    setFirebaseUser,
    setUserProfile,
    setLoading,
    reset,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            // Sync emailVerified status from Firebase Auth to Firestore
            if (user.emailVerified && !profile.emailVerified) {
              await updateEmailVerified(user.uid, true);
              profile.emailVerified = true;
            }
            setUserProfile(profile);
          }
        } catch {
          // Firestore may not have the auth token yet (race during signup).
          // The next auth state change or navigation will retry.
        }
      } else {
        reset();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setFirebaseUser, setUserProfile, setLoading, reset]);

  return {
    user: firebaseUser,
    profile: userProfile,
    activeRole,
    loading,
    isAuthenticated: !!firebaseUser,
    isEmailVerified: firebaseUser?.emailVerified ?? false,
  };
}
