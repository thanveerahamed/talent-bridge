/**
 * One-time script to seed the first admin user.
 *
 * Usage:
 *   1. Download your Firebase service account key from:
 *      Firebase Console → Project Settings → Service accounts → Generate new private key
 *   2. Save it as `scripts/service-account.json`
 *   3. Run: npx tsx scripts/seed-admin.ts your@email.com
 *   4. Delete this script and the service account key after use.
 *
 * Emulator mode:
 *   Run against local emulators (no service account needed):
 *   npx tsx scripts/seed-admin.ts your@email.com --emulator
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/seed-admin.ts <email> [--emulator] [--only]');
  process.exit(1);
}

const useEmulator = process.argv.includes('--emulator');

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (useEmulator) {
  // Point Firebase Admin SDK to the local emulators
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

  initializeApp({ projectId: 'im-nl-talent-bridge' });
  console.log('🔧 Running against local emulators');
} else {
  const serviceAccountPath = resolve(__dirname, 'service-account.json');
  let serviceAccount: Record<string, string>;
  try {
    serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
  } catch {
    console.error(`Service account key not found at: ${serviceAccountPath}`);
    console.error('Download it from Firebase Console → Project Settings → Service accounts');
    console.error('Or use --emulator flag to run against local emulators.');
    process.exit(1);
  }

  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const authAdmin = getAuth();

async function seedAdmin() {
  // Look up the Firebase Auth user to get the UID
  let authUser;
  try {
    authUser = await authAdmin.getUserByEmail(email);
  } catch {
    console.error(`No Firebase Auth user found with email: ${email}`);
    console.error('Make sure the user has registered first.');
    process.exit(1);
  }

  const userRef = db.collection('users').doc(authUser.uid);
  const userSnap = await userRef.get();

  const adminOnly = process.argv.includes('--only');

  if (userSnap.exists) {
    const userData = userSnap.data()!;
    const currentRoles: string[] = userData.roles ?? ['seeker'];

    if (!adminOnly && currentRoles.includes('admin')) {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    const newRoles = adminOnly ? ['admin'] : [...new Set([...currentRoles, 'admin'])];

    await userRef.update({
      roles: newRoles,
      activeRole: 'admin',
      updatedAt: new Date(),
    });

    console.log(`✅ Successfully set ${email} as admin.`);
    console.log(`   Roles: [${newRoles.join(', ')}]`);
  } else {
    // Create the missing Firestore document
    console.log(`Firestore document missing for ${email} — creating it now.`);
    const newRoles = adminOnly ? ['admin'] : ['seeker', 'admin'];
    await userRef.set({
      uid: authUser.uid,
      email: authUser.email,
      displayName: authUser.displayName ?? email.split('@')[0],
      roles: newRoles,
      activeRole: 'admin',
      emailVerified: authUser.emailVerified,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`✅ Created Firestore doc and set ${email} as admin.`);
    console.log(`   Roles: [${newRoles.join(', ')}]`);
  }

  if (!useEmulator) {
    console.log('');
    console.log('⚠️  Remember to delete service-account.json when done!');
  }
}

try {
  await seedAdmin();
} catch (err) {
  console.error('Error:', err);
  process.exit(1);
}
