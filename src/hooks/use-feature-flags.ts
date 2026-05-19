import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FeatureFlags } from '@/types';

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  autoApproveListings: true,
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FEATURE_FLAGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'featureFlags'),
      (snap) => {
        if (snap.exists()) {
          setFlags({ ...DEFAULT_FEATURE_FLAGS, ...snap.data() } as FeatureFlags);
        } else {
          setFlags(DEFAULT_FEATURE_FLAGS);
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );
    return unsub;
  }, []);

  return { flags, loading };
}
