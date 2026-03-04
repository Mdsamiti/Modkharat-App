import * as twilioLib from '../lib/twilio.js';
import pino from 'pino';

const logger = pino({ name: 'twilio-service' });

/**
 * Send a family invite SMS.
 */
export async function sendInviteSms(
  phoneNumber: string,
  inviterName: string,
  householdName: string,
  language: 'en' | 'ar' = 'en',
): Promise<string> {
  const body = language === 'ar'
    ? `${inviterName} يدعوك للانضمام إلى عائلة "${householdName}" على مدخرات. حمّل التطبيق للبدء.`
    : `${inviterName} invited you to join "${householdName}" on Modkharat. Download the app to get started.`;

  const sid = await twilioLib.sendSms(phoneNumber, body);
  logger.info({ sid, phoneNumber }, 'Invite SMS sent');
  return sid;
}

/**
 * Handle Twilio status webhook callback.
 */
export async function handleStatusWebhook(data: {
  MessageSid: string;
  MessageStatus: string;
  To: string;
  ErrorCode?: string;
}): Promise<void> {
  logger.info(
    { sid: data.MessageSid, status: data.MessageStatus, to: data.To, errorCode: data.ErrorCode },
    'Twilio status update',
  );
  // For now, just log the status. Future: update family_invites.delivery_status
}
