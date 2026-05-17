/**
 * One-time script to set a Firebase Auth user as email-verified.
 *
 * Usage:
 *   1. Download your Firebase service account key from:
 *      Firebase Console -> Project Settings -> Service accounts -> Generate new private key
 *   2. Save it as `scripts/service-account.json`
 *   3. Run one of:
 *      pnpm verify:user -- --uid <uid>
 *      pnpm verify:user -- --email <email>
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

type CliArgs = {
  uid?: string;
  email?: string;
};

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};

  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    const next = argv[i + 1];

    if (current === '--uid' && next) {
      args.uid = next;
      i += 1;
      continue;
    }

    if (current === '--email' && next) {
      args.email = next;
      i += 1;
    }
  }

  return args;
}

function printUsageAndExit() {
  console.error('Usage:');
  console.error('  pnpm verify:user -- --uid <uid>');
  console.error('  pnpm verify:user -- --email <email>');
  process.exit(1);
}

const { uid, email } = parseArgs(process.argv.slice(2));

if ((!uid && !email) || (uid && email)) {
  printUsageAndExit();
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccountPath = resolve(__dirname, 'service-account.json');
let serviceAccount: Record<string, string>;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));
} catch {
  console.error(`Service account key not found at: ${serviceAccountPath}`);
  console.error('Download it from Firebase Console -> Project Settings -> Service accounts');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function verifyUser() {
  let userRecord;
  if (uid) {
    userRecord = await auth.getUser(uid);
  } else if (email) {
    userRecord = await auth.getUserByEmail(email);
  } else {
    printUsageAndExit();
    return;
  }

  if (userRecord.emailVerified) {
    console.log(`User ${userRecord.uid} (${userRecord.email ?? 'no-email'}) is already verified.`);
  } else {
    await auth.updateUser(userRecord.uid, { emailVerified: true });
    console.log(`Verified Firebase Auth email for user ${userRecord.uid}.`);
  }

  const userDocRef = db.collection('users').doc(userRecord.uid);
  const userDoc = await userDocRef.get();

  if (userDoc.exists) {
    await userDocRef.update({
      emailVerified: true,
      updatedAt: new Date(),
    });
    console.log('Updated Firestore users.emailVerified = true.');
  } else {
    console.log('No Firestore users document found; skipped Firestore update.');
  }

  console.log('Done.');
}

try {
  await verifyUser();
} catch (err) {
  console.error('Error verifying user:', err instanceof Error ? err.message : err);
  process.exit(1);
}
