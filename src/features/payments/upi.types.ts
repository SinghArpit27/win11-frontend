export type UpiAppId = 'google_pay' | 'phonepe' | 'paytm' | 'bhim' | 'other';

export interface UpiAppOption {
  id: UpiAppId;
  label: string;
  /** Tailwind gradient classes for the app tile */
  gradient: string;
  /** Short badge text on the tile */
  badge: string;
}

export const UPI_APP_OPTIONS: UpiAppOption[] = [
  {
    id: 'google_pay',
    label: 'Google Pay',
    gradient: 'from-[#4285F4] via-[#34A853] to-[#FBBC05]',
    badge: 'GPay',
  },
  {
    id: 'phonepe',
    label: 'PhonePe',
    gradient: 'from-[#5f259f] to-[#7b3fe4]',
    badge: 'Pe',
  },
  {
    id: 'paytm',
    label: 'Paytm',
    gradient: 'from-[#00BAF2] to-[#002970]',
    badge: 'Paytm',
  },
  {
    id: 'bhim',
    label: 'BHIM UPI',
    gradient: 'from-[#00897B] to-[#004D40]',
    badge: 'BHIM',
  },
  {
    id: 'other',
    label: 'Other UPI app',
    gradient: 'from-primary to-accent',
    badge: 'UPI',
  },
];

export const upiAppLabel = (id: UpiAppId): string =>
  UPI_APP_OPTIONS.find((a) => a.id === id)?.label ?? 'UPI';

/** Try opening the UPI app; returns false if the environment blocks custom schemes. */
export const openUpiDeepLink = (deepLink: string): void => {
  window.location.href = deepLink;
};
