import admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
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
    if (!invitation) {
      logger.warn('Invitation document missing payload.');
      return;
    }

    if (!invitation.parentEmail || !invitation.token || invitation.status !== 'pending') {
      logger.warn('Invitation missing required email fields or not pending.', { invitationId: event.params.invitationId });
      return;
    }

    const baseUrl = appBaseUrl.value() || 'http://localhost:5173';
    const acceptUrl = `${baseUrl}/accept-parent-invite?token=${encodeURIComponent(invitation.token)}`;

    const transporter = createTransport();
    if (!transporter) {
      logger.warn('SMTP config missing. Invitation email was not sent.', {
        invitationId: event.params.invitationId,
        parentEmail: invitation.parentEmail,
        acceptUrl
      });
      return;
    }

    const teenName = invitation.teenName || 'Your teen';

    await transporter.sendMail({
      from: smtpFrom.value(),
      to: invitation.parentEmail,
      subject: `${teenName} invited you to Churro`,
      text: `${teenName} asked you to verify and link accounts on Churro. Open this link to accept: ${acceptUrl}`,
      html: `<p>${teenName} asked you to verify and link accounts on Churro.</p><p><a href="${acceptUrl}">Accept parent invitation</a></p>`
    });

    logger.info('Parent invitation email sent.', { invitationId: event.params.invitationId, parentEmail: invitation.parentEmail });
  }
);
