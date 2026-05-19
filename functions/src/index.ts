import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { Resend } from 'resend';

initializeApp();
const db = getFirestore();

const RESEND_API_KEY = defineSecret('RESEND_API_KEY');
const ADMIN_EMAIL = 'thanveerahamed.developer@gmail.com';

/**
 * Send a contact email from a seeker to a referrer via Resend.
 */
export const sendContactEmail = onCall(
  { secrets: [RESEND_API_KEY], region: 'europe-west1' },
  async (request) => {
    // Verify authenticated
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in.');
    }

    const { referrerUid, seekerName, seekerEmail, message } = request.data;

    if (!referrerUid || !seekerName || !seekerEmail || !message) {
      throw new HttpsError('invalid-argument', 'Missing required fields.');
    }

    // Fetch referrer profile
    const referrerSnap = await db.doc(`referrers/${referrerUid}`).get();
    if (!referrerSnap.exists) {
      throw new HttpsError('not-found', 'Referrer not found.');
    }

    const referrer = referrerSnap.data()!;

    if (referrer.status !== 'approved') {
      throw new HttpsError('permission-denied', 'Referrer is not approved.');
    }

    if (!referrer.preferredContact?.includes('email')) {
      throw new HttpsError('failed-precondition', 'Referrer does not accept email contact.');
    }

    // Send email via Resend
    const resend = new Resend(RESEND_API_KEY.value());

    const { error } = await resend.emails.send({
      from: 'TalentBridge <noreply@talentbridge.app>',
      to: [referrer.email],
      subject: `${seekerName} wants to connect with you on TalentBridge`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">New Connection Request</h2>
          <p><strong>${seekerName}</strong> (${seekerEmail}) would like to connect with you.</p>
          <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0;">${message}</p>
          </div>
          <p>You can reply directly to this person at <a href="mailto:${seekerEmail}">${seekerEmail}</a>.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">Sent via TalentBridge</p>
        </div>
      `,
      replyTo: seekerEmail,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new HttpsError('internal', 'Failed to send email.');
    }

    // Log the contact
    await db.collection('contactLogs').add({
      seekerUid: request.auth.uid,
      referrerUid,
      contactMethod: 'email',
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  },
);

/**
 * Promote a user to admin. Only callable by existing admins.
 */
export const setAdminRole = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Must be logged in.');
  }

  const callerUid = request.auth.uid;
  const { targetUid } = request.data;

  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'Missing targetUid.');
  }

  // Verify caller is admin
  const callerSnap = await db.doc(`users/${callerUid}`).get();
  if (!callerSnap.exists || !callerSnap.data()!.roles?.includes('admin')) {
    throw new HttpsError('permission-denied', 'Only admins can promote users.');
  }

  // Verify target exists and is verified
  const targetSnap = await db.doc(`users/${targetUid}`).get();
  if (!targetSnap.exists) {
    throw new HttpsError('not-found', 'Target user not found.');
  }

  const targetData = targetSnap.data()!;
  if (!targetData.emailVerified) {
    throw new HttpsError('failed-precondition', 'User must be email verified.');
  }

  // Add admin role
  const currentRoles: string[] = targetData.roles ?? ['seeker'];
  if (currentRoles.includes('admin')) {
    return { success: true, message: 'User is already an admin.' };
  }

  await db.doc(`users/${targetUid}`).update({
    roles: [...new Set([...currentRoles, 'admin'])],
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Audit log
  await db.collection('adminLogs').add({
    adminUid: callerUid,
    action: 'promote_admin',
    targetUid,
    metadata: { email: targetData.email },
    createdAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});

/**
 * Notify admin via email when a new referrer listing is created.
 */
export const onNewReferrerListing = onDocumentCreated(
  { document: 'referrers/{uid}', secrets: [RESEND_API_KEY], region: 'europe-west1' },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const referrer = snap.data();
    const resend = new Resend(RESEND_API_KEY.value());

    const { error } = await resend.emails.send({
      from: 'TalentBridge <noreply@im-nl-talent-bridge.creativetechstudio.dev>',
      to: [ADMIN_EMAIL],
      subject: `New Referrer Listing: ${referrer.firstName} ${referrer.lastName} (${referrer.companyName})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Referrer Listing Created</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Name</td>
              <td style="padding: 8px 12px;">${referrer.firstName} ${referrer.lastName}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Company</td>
              <td style="padding: 8px 12px;">${referrer.companyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Role</td>
              <td style="padding: 8px 12px;">${referrer.companyRole}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Email</td>
              <td style="padding: 8px 12px;">${referrer.email || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Status</td>
              <td style="padding: 8px 12px;">${referrer.status}</td>
            </tr>
            <tr style="background: #f9fafb;">
              <td style="padding: 8px 12px; font-weight: 600; color: #374151;">Preferred Contact</td>
              <td style="padding: 8px 12px;">${(referrer.preferredContact || []).join(', ')}</td>
            </tr>
          </table>
          <p style="margin-top: 16px;">
            <a href="https://im-nl-talent-bridge.creativetechstudio.dev/admin/listings" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
              View in Admin Panel
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #6b7280; font-size: 12px;">TalentBridge Admin Notification</p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send admin notification:', error);
    }
  },
);
