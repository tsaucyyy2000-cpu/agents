/**
 * Local-only notification preference stubs for the patient dashboard shell.
 * Not synced to any server — durable prefs need a future backend.
 */

export const NOTIF_PREFS_KEY = "ro-clone-account-notif-prefs-v1";

export type NotificationPrefs = {
  careReminders: boolean;
  orderUpdates: boolean;
  membershipTips: boolean;
  productEducation: boolean;
};

export const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  careReminders: false,
  orderUpdates: false,
  membershipTips: false,
  productEducation: false,
};

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIF_PREFS_KEY);
    if (!raw) return { ...DEFAULT_NOTIF_PREFS };
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    return {
      careReminders: Boolean(parsed.careReminders),
      orderUpdates: Boolean(parsed.orderUpdates),
      membershipTips: Boolean(parsed.membershipTips),
      productEducation: Boolean(parsed.productEducation),
    };
  } catch {
    return { ...DEFAULT_NOTIF_PREFS };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  localStorage.setItem(NOTIF_PREFS_KEY, JSON.stringify(prefs));
}
