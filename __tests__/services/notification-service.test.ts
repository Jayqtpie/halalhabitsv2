/**
 * Tests for notification-service.
 *
 * expo-notifications is mocked so tests run in Jest (no native runtime).
 * Verifies scheduling counts and permission request behavior.
 */

// Mock expo-notifications before any imports
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  setNotificationChannelAsync: jest.fn(),
}));

// Mock prayer-times service to return predictable prayer windows
jest.mock('../../src/services/prayer-times', () => ({
  getPrayerWindows: jest.fn(),
}));

import * as Notifications from 'expo-notifications';
import { getPrayerWindows } from '../../src/services/prayer-times';
import { requestPermissions, rescheduleAll, cancelAll, type NotificationPrefs } from '../../src/services/notification-service';
import type { PrayerName } from '../../src/types/habits';

const mockGetPrayerWindows = getPrayerWindows as jest.MockedFunction<typeof getPrayerWindows>;
const mockRequestPermissionsAsync = Notifications.requestPermissionsAsync as jest.MockedFunction<typeof Notifications.requestPermissionsAsync>;
const mockCancelAll = Notifications.cancelAllScheduledNotificationsAsync as jest.MockedFunction<typeof Notifications.cancelAllScheduledNotificationsAsync>;
const mockSchedule = Notifications.scheduleNotificationAsync as jest.MockedFunction<typeof Notifications.scheduleNotificationAsync>;

// Helper: create a future prayer window (1 hour from now)
function makeFuturePrayerWindow(name: PrayerName) {
  const now = Date.now();
  return {
    name,
    displayName: name,
    start: new Date(now + 60 * 60 * 1000), // 1 hour from now
    end: new Date(now + 2 * 60 * 60 * 1000), // 2 hours from now
    status: 'upcoming' as const,
  };
}

function makeDefaultPrefs(overrides: Partial<NotificationPrefs> = {}): NotificationPrefs {
  return {
    prayerReminders: {
      fajr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
      dhuhr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
      asr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
      maghrib: { enabled: true, leadMinutes: 10, followUpEnabled: true },
      isha: { enabled: true, leadMinutes: 10, followUpEnabled: true },
    },
    muhasabahNotifEnabled: false,
    muhasabahReminderTime: '21:00',
    streakMilestonesEnabled: false,
    questExpiringEnabled: false,
    morningMotivationEnabled: false,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCancelAll.mockResolvedValue(undefined);
  mockSchedule.mockResolvedValue('mock-id');
  mockRequestPermissionsAsync.mockResolvedValue({
    status: 'granted',
    granted: true,
    ios: undefined,
    android: undefined,
    canAskAgain: true,
    expires: 'never',
  } as any);

  // Default: return all 5 future prayer windows
  mockGetPrayerWindows.mockReturnValue([
    makeFuturePrayerWindow('fajr'),
    makeFuturePrayerWindow('dhuhr'),
    makeFuturePrayerWindow('asr'),
    makeFuturePrayerWindow('maghrib'),
    makeFuturePrayerWindow('isha'),
  ]);
});

describe('requestPermissions', () => {
  it('returns true when permissions are granted', async () => {
    const result = await requestPermissions();
    expect(result).toBe(true);
    expect(mockRequestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('returns false when permissions are denied', async () => {
    mockRequestPermissionsAsync.mockResolvedValueOnce({
      status: 'denied',
      granted: false,
      ios: undefined,
      android: undefined,
      canAskAgain: false,
      expires: 'never',
    } as any);
    const result = await requestPermissions();
    expect(result).toBe(false);
  });
});

describe('cancelAll', () => {
  it('calls cancelAllScheduledNotificationsAsync', async () => {
    await cancelAll();
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
  });
});

describe('rescheduleAll', () => {
  const lat = 40.7128;
  const lng = -74.0060;
  const calcMethod = 'ISNA' as const;

  it('always cancels existing notifications first', async () => {
    const prefs = makeDefaultPrefs();
    await rescheduleAll(lat, lng, calcMethod, prefs);
    expect(mockCancelAll).toHaveBeenCalledTimes(1);
  });

  it('schedules 0 notifications when all prayers disabled and muhasabah disabled', async () => {
    const prefs = makeDefaultPrefs({
      prayerReminders: {
        fajr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        dhuhr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        asr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        maghrib: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        isha: { enabled: false, leadMinutes: 10, followUpEnabled: false },
      },
      muhasabahNotifEnabled: false,
    });
    await rescheduleAll(lat, lng, calcMethod, prefs);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('schedules 2 notifications for 1 enabled prayer with followUp (reminder + follow-up)', async () => {
    const prefs = makeDefaultPrefs({
      prayerReminders: {
        fajr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
        dhuhr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        asr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        maghrib: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        isha: { enabled: false, leadMinutes: 10, followUpEnabled: false },
      },
      muhasabahNotifEnabled: false,
    });
    await rescheduleAll(lat, lng, calcMethod, prefs);
    expect(mockSchedule).toHaveBeenCalledTimes(2);
  });

  it('schedules 1 notification for 1 enabled prayer without followUp', async () => {
    const prefs = makeDefaultPrefs({
      prayerReminders: {
        fajr: { enabled: true, leadMinutes: 10, followUpEnabled: false },
        dhuhr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        asr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        maghrib: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        isha: { enabled: false, leadMinutes: 10, followUpEnabled: false },
      },
      muhasabahNotifEnabled: false,
    });
    await rescheduleAll(lat, lng, calcMethod, prefs);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
  });

  it('schedules 1 DailyTriggerInput notification when muhasabah is enabled', async () => {
    const prefs = makeDefaultPrefs({
      prayerReminders: {
        fajr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        dhuhr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        asr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        maghrib: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        isha: { enabled: false, leadMinutes: 10, followUpEnabled: false },
      },
      muhasabahNotifEnabled: true,
      muhasabahReminderTime: '21:00',
    });
    await rescheduleAll(lat, lng, calcMethod, prefs);
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    // Verify the trigger is a daily trigger
    const callArg = mockSchedule.mock.calls[0][0];
    expect(callArg.trigger).toMatchObject({ type: 'daily', hour: 21, minute: 0 });
  });

  it('does not schedule past-time prayer reminders', async () => {
    // Set prayer windows to past times
    const now = Date.now();
    mockGetPrayerWindows.mockReturnValue([
      {
        name: 'fajr',
        displayName: 'Fajr',
        start: new Date(now - 3 * 60 * 60 * 1000), // 3 hours ago
        end: new Date(now - 2 * 60 * 60 * 1000),   // 2 hours ago
        status: 'passed' as const,
      },
      makeFuturePrayerWindow('dhuhr'),
      makeFuturePrayerWindow('asr'),
      makeFuturePrayerWindow('maghrib'),
      makeFuturePrayerWindow('isha'),
    ]);

    const prefs = makeDefaultPrefs({
      prayerReminders: {
        fajr: { enabled: true, leadMinutes: 10, followUpEnabled: true },
        dhuhr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        asr: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        maghrib: { enabled: false, leadMinutes: 10, followUpEnabled: false },
        isha: { enabled: false, leadMinutes: 10, followUpEnabled: false },
      },
      muhasabahNotifEnabled: false,
    });
    await rescheduleAll(lat, lng, calcMethod, prefs);
    // Past prayer: no notifications scheduled
    expect(mockSchedule).not.toHaveBeenCalled();
  });
});
