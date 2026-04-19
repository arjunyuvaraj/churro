import admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { onDocumentCreated, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { defineSecret, defineString } from 'firebase-functions/params';
import nodemailer from 'nodemailer';

admin.initializeApp();

const appBaseUrl = defineString('APP_BASE_URL', { default: 'http://localhost:5173' });
const smtpHost = defineString('SMTP_HOST', { default: '' });
const smtpPort = defineString('SMTP_PORT', { default: '587' });
const smtpSecure = defineString('SMTP_SECURE', { default: 'false' });
const smtpUser = defineSecret('SMTP_USER');
const smtpPass = defineSecret('SMTP_PASS');
const smtpFrom = defineString('SMTP_FROM', { default: 'noreply@churro.app' });

function createTransport() {
  if (!smtpHost.value() || !smtpUser.value() || !smtpPass.value()) {
    return null;
  }

  return nodemailer.createTransport({
    host: smtpHost.value(),
    port: Number.parseInt(smtpPort.value() || '587', 10),
    secure: smtpSecure.value() === 'true',
    auth: {
      user: smtpUser.value(),
      pass: smtpPass.value()
    }
  });
}

export const sendParentInvitationEmail = onDocumentCreated(
  {
    document: 'invitations/{invitationId}',
    region: 'us-central1',
    secrets: [smtpUser, smtpPass]
  },
  async (event) => {
    const invitation = event.data?.data();
    if (!invitation) return;

    if (!invitation.parentEmail || !invitation.token || invitation.status !== 'pending') return;

    const baseUrl = appBaseUrl.value() || 'http://localhost:5173';
    const acceptUrl = `${baseUrl}/accept-parent-invite?token=${encodeURIComponent(invitation.token)}`;

    const transporter = createTransport();
    if (!transporter) return;

    const teenName = invitation.teenName || 'Your teen';

    await transporter.sendMail({
      from: smtpFrom.value(),
      to: invitation.parentEmail,
      subject: `${teenName} invited you to Churro`,
      text: `${teenName} asked you to verify and link accounts on Churro. Open this link to accept: ${acceptUrl}`,
      html: `<p>${teenName} asked you to verify and link accounts on Churro.</p><p><a href="${acceptUrl}">Accept parent invitation</a></p>`
    });
  }
);

export const onTaskUpdated = onDocumentUpdated(
  { document: 'tasks/{taskId}', region: 'us-central1' },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    // We only care about status changes
    if (before.status === after.status) return;

    const db = admin.firestore();
    const batch = db.batch();

    function addNotification(uid, role, title, message) {
      if (!uid) return;
      const ref = db.collection('notifications').doc();
      batch.set(ref, {
        uid,
        role,
        title,
        message,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        referenceId: event.params.taskId,
        type: 'task_update'
      });
    }

    const title = after.title || 'A task';

    // 1. Teen applies -> Needs Parent Approval
    if (before.status === 'open' && after.status === 'pending_parent_approval') {
      addNotification(after.parentUid, 'parent', 'Task Approval Required', `Your teen applied for "${title}". Please review it.`);
      addNotification(after.neighborUid, 'neighbor', 'New Applicant', `A teen applied for "${title}". Awaiting their parent's approval.`);
    }

    // 2. Parent approves -> Needs Neighbor Approval (Wait, let's treat "active" directly if auto-approve etc. In our system, parent approves -> active or pending_neighbor based on logic. Let's just catch active)
    if (before.status === 'pending_parent_approval' && after.status === 'active') {
      addNotification(after.applicantTeenUid, 'teen', 'Application Approved!', `Your application for "${title}" was approved. You can view the details now.`);
      addNotification(after.neighborUid, 'neighbor', 'Teen is Ready!', `The parent approved the application. "${title}" is now active.`);
    }

    // 3. Teen checks in -> In progress
    if (before.status === 'active' && after.status === 'in_progress') {
      addNotification(after.neighborUid, 'neighbor', 'Teen arrived', `The teen has arrived and checked in for "${title}".`);
      addNotification(after.parentUid, 'parent', 'Teen arrived safely', `Your teen has arrived at the neighbor's house for "${title}".`);
    }

    // 4. Teen completes -> Pending Confirmation
    if (before.status === 'in_progress' && after.status === 'pending_confirmation') {
      addNotification(after.neighborUid, 'neighbor', 'Task completed', `The teen marked "${title}" as done. Please review and release payment.`);
      addNotification(after.parentUid, 'parent', 'Task finished', `Your teen has finished "${title}" and is heading back.`);
    }

    // 5. Neighbor confirms -> Completed
    if (before.status === 'pending_confirmation' && after.status === 'completed') {
      addNotification(after.applicantTeenUid, 'teen', 'Payment Released', `The neighbor confirmed "${title}". Payment of ${after.pay} has been released to your account.`);
      addNotification(after.parentUid, 'parent', 'Payment Released', `The neighbor released payment to your teen for "${title}".`);
    }

    await batch.commit();
  }
);
