/**
 * NotificationService — schedule and cancel all app notifications.
 *
 * Pure TypeScript module. Wraps expo-notifications with adab-safe copy
 * from notification-copy.ts and prayer windows from prayer-times.ts.
 *
 * iOS 64-notification limit strategy:
 * - Only today's prayer notifications are scheduled
 * - Call rescheduleAll on each app launch to stay current
 *
 * No React imports — fully unit-testable.
 */
import * as Notifications from 'expo-notifications';
import { getPrayerWindows } from './prayer-times';
import {
  getPrayerReminderTitle,
  getPrayerReminderBody,
  getFollowUpTitle,
  getFollowUpBody,
  getMuhasabahTitle,
  getMuhasabahBody,
} from '../domain/notification-copy';
import type { PrayerName, CalcMethodKey } from '../types/habits';
import type { PrayerReminderConfig } from '../stores/settingsStore';

// ─── Types ────────────────────────────────────────────────────────────

export interface NotificationPrefs {
  prayerReminders: Record<PrayerName, PrayerReminderConfig>;
  muhasabahNotifEnabled: boolean;
  muhasabahReminderTime: string; // "HH:mm"
  streakMilestonesEnabled: boolean;
  questExpiringEnabled: boolean;
  morningMotivationEnabled: boolean;
}

// ─── Permissions ──────────────────────────────────────────────────────

/**
 * Request notification permissions from the OS.
 * Returns true if granted, false otherwise.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Cancel All ───────────────────────────────────────────────────────

/** Cancel all currently scheduled notifications */
export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Reschedule All ───────────────────────────────────────────────────

/**
 * Cancel all existing notifications, then schedule today's prayer reminders
 * and the daily Muhasabah trigger based on current preferences.
 *
 * Only schedules notifications whose trigger time is in the future.
 */
export async function rescheduleAll(
  lat: number,
  lng: number,
  calcMethod: CalcMethodKey,
  prefs: NotificationPrefs,
): Promise<void> {
  // Always cancel first
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const today = new Date(now);
  const prayerWindows = getPrayerWindows(lat, lng, today, calcMethod, now);

  // Schedule prayer reminders
  for (const window of prayerWindows) {
    const prayerPrefs = prefs.prayerReminders[window.name];
    if (!prayerPrefs.enabled) continue;

    const leadMs = prayerPrefs.leadMinutes * 60 * 1000;

    // Reminder: prayerStart - leadMinutes
    const reminderTime = new Date(window.start.getTime() - leadMs);
    if (reminderTime > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getPrayerReminderTitle(window.name),
          body: getPrayerReminderBody(window.name),
          sound: true,
        },
        trigger: {
          type: 'date',
          date: reminderTime,
        } as any,
      });
    }

    // Follow-up: prayerStart + 30 minutes
    if (prayerPrefs.followUpEnabled) {
      const followUpTime = new Date(window.start.getTime() + 30 * 60 * 1000);
      if (followUpTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: getFollowUpTitle(window.name),
            body: getFollowUpBody(window.name),
            sound: true,
          },
          trigger: {
            type: 'date',
            date: followUpTime,
          } as any,
        });
      }
    }
  }

  // Schedule daily Muhasabah trigger
  if (prefs.muhasabahNotifEnabled) {
    const [hourStr, minuteStr] = prefs.muhasabahReminderTime.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: getMuhasabahTitle(),
        body: getMuhasabahBody(),
        sound: true,
      },
      trigger: {
        type: 'daily',
        hour,
        minute,
      } as any,
    });
  }
}
