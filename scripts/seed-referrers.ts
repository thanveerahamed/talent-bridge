/**
 * Seed 50 dummy referrer profiles into the Firestore emulator.
 *
 * Usage (emulators must be running):
 *   npx tsx scripts/seed-referrers.ts
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';

initializeApp({ projectId: 'im-nl-talent-bridge' });
const db = getFirestore();

const companies = [
  'Google',
  'Microsoft',
  'Apple',
  'Amazon',
  'Meta',
  'Netflix',
  'Spotify',
  'Uber',
  'Airbnb',
  'Stripe',
  'Shopify',
  'Salesforce',
  'Adobe',
  'Oracle',
  'IBM',
  'Tesla',
  'NVIDIA',
  'Intel',
  'Cisco',
  'LinkedIn',
  'Twitter',
  'Snap',
  'Pinterest',
  'Reddit',
  'Discord',
  'Figma',
  'Notion',
  'Slack',
  'Zoom',
  'Dropbox',
  'Atlassian',
  'Datadog',
  'Snowflake',
  'Cloudflare',
  'Vercel',
  'Supabase',
  'MongoDB',
  'Elastic',
  'GitLab',
  'GitHub',
  'Twilio',
  'SendGrid',
  'Plaid',
  'Coinbase',
  'Robinhood',
  'Square',
  'PayPal',
  'Adyen',
  'Klarna',
  'Revolut',
];

const roles = [
  'Software Engineer',
  'Engineering Manager',
  'Staff Engineer',
  'Product Manager',
  'Tech Lead',
  'Senior Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'DevOps Engineer',
  'Data Scientist',
  'ML Engineer',
  'Design Lead',
  'VP Engineering',
  'CTO',
  'Principal Engineer',
];

const firstNames = [
  'James',
  'Emma',
  'Liam',
  'Olivia',
  'Noah',
  'Sophia',
  'Lucas',
  'Ava',
  'Mason',
  'Isabella',
  'Ethan',
  'Mia',
  'Aiden',
  'Charlotte',
  'Logan',
  'Amelia',
  'Jackson',
  'Harper',
  'Sebastian',
  'Evelyn',
  'Raj',
  'Priya',
  'Chen',
  'Yuki',
  'Ahmed',
  'Fatima',
  'Carlos',
  'Maria',
  'Kevin',
  'Sarah',
  'Daniel',
  'Hannah',
  'David',
  'Anna',
  'Michael',
  'Julia',
  'Robert',
  'Elena',
  'Thomas',
  'Nina',
  'Alex',
  'Sam',
  'Jordan',
  'Taylor',
  'Morgan',
  'Casey',
  'Riley',
  'Quinn',
  'Avery',
  'Blake',
];

const lastNames = [
  'Smith',
  'Johnson',
  'Williams',
  'Brown',
  'Jones',
  'Garcia',
  'Miller',
  'Davis',
  'Rodriguez',
  'Martinez',
  'Anderson',
  'Taylor',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Clark',
  'Lewis',
  'Walker',
  'Hall',
  'Patel',
  'Kumar',
  'Singh',
  'Chen',
  'Wang',
  'Kim',
  'Lee',
  'Park',
  'Nakamura',
  'Tanaka',
  'Mueller',
  'Schmidt',
  'Fischer',
  'Weber',
  'Schneider',
  'Dubois',
  'Martin',
  'Bernard',
  'Moreau',
  'Laurent',
  'Rossi',
  'Russo',
  'Ferrari',
  'Costa',
  'Santos',
  'Silva',
  'Oliveira',
  'Almeida',
  'Ferreira',
  'Pereira',
];

const contactMethods = ['email', 'phone', 'whatsapp', 'linkedin'] as const;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickRandomSubset<T>(arr: T[], min = 1, max = 3): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function seed() {
  const batch = db.batch();

  for (let i = 0; i < 50; i++) {
    const uid = `dummy-referrer-${String(i).padStart(3, '0')}`;
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const company = companies[i];
    const role = pickRandom(roles);
    const preferred = pickRandomSubset([...contactMethods]);

    const ref = db.collection('referrers').doc(uid);
    batch.set(ref, {
      uid,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s/g, '')}.com`,
      phone: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
      linkedInUrl: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
      whatsAppNumber: `+1${String(Math.floor(Math.random() * 9000000000) + 1000000000)}`,
      companyName: company,
      companyNameLower: company.toLowerCase(),
      companyRole: role,
      companyCareerLink: `https://${company.toLowerCase().replace(/\s/g, '')}.com/careers`,
      preferredContact: preferred,
      visible: true,
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await batch.commit();
  console.log('✅ Seeded 50 dummy referrer profiles into the emulator.');
}

seed().catch((err) => {
  console.error('Error seeding:', err);
  process.exit(1);
});
