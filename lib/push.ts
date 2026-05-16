import { query } from './db';

export interface PushSubscriptionData {
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
}

function getWebPush() {
  // Lazy import to avoid VAPID validation at build time
  const webpush = require('web-push');
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY || '';
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@shadow-fitness.app';

  if (vapidPublic && vapidPrivate) {
    try {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    } catch {
      // VAPID not configured
    }
  }
  return webpush;
}

export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  if (!vapidPublic || !vapidPrivate) return [];

  const subs = await query<PushSubscriptionData>(
    'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
    [userId]
  );

  if (subs.length === 0) return [];

  const webpush = getWebPush();

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
        },
        JSON.stringify({ title, body, data })
      )
    )
  );

  return results;
}

export async function sendPushToAllUsers(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  const users = await query<{ user_id: string }>(
    'SELECT DISTINCT user_id FROM push_subscriptions'
  );
  return Promise.all(users.map(u => sendPushToUser(u.user_id, title, body, data)));
}
