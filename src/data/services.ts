import type { ContentStatus } from './site';

/**
 * Forecourt and store services.
 *
 * Source: Maxol's public location page for "Healy's Maxol Service Station / Healy's Spar Express"
 * (evidence snapshot 9 Oct 2026). These are CANDIDATES awaiting manager confirmation — a
 * public listing is not the same as a confirmed, currently available service.
 *
 * Air, water and vacuum were mentioned in an earlier brief only; they need fresh verification
 * and stay hidden until confirmed.
 *
 * icon: one of the keys in src/components/Icon.astro
 */
export interface Service {
  id: string;
  label: string;
  detail: string;
  icon: string;
  status: ContentStatus;
  source: string;
}

export const services: Service[] = [
  {
    id: 'fuel',
    label: 'Fuel',
    detail: 'Maxol forecourt',
    icon: 'fuel',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'pay-at-pump',
    label: 'Pay at pump',
    detail: 'Fill up and go',
    icon: 'card',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'atm',
    label: 'ATM',
    detail: 'Cash machine on site',
    icon: 'atm',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'bill-payments',
    label: 'Bill & toll payments',
    detail: 'Pay at the counter',
    icon: 'receipt',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'off-licence',
    label: 'Off-licence',
    detail: 'Over-18s only',
    icon: 'bottle',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'seating',
    label: 'Seating',
    detail: 'Sit down with your coffee',
    icon: 'seat',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'toilets',
    label: 'Customer toilets',
    detail: 'For customers',
    icon: 'toilet',
    status: 'review',
    source: 'Maxol location page',
  },
  {
    id: 'air-water',
    label: 'Air & water',
    detail: 'Tyre air and water',
    icon: 'air',
    status: 'hidden',
    source: 'Earlier brief only — needs fresh verification',
  },
  {
    id: 'vacuum',
    label: 'Vacuum',
    detail: 'Car vacuum',
    icon: 'vacuum',
    status: 'hidden',
    source: 'Earlier brief only — needs fresh verification',
  },
];
