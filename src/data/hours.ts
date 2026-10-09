/**
 * Opening hours.
 *
 * NOT APPROVED. Until the manager confirms every day and any exceptions, the site shows
 * `fallbackMessage` instead of a timetable, and no hours are added to structured data.
 *
 * Research candidates (do not publish without confirmation):
 *  - Maxol location page: store 07:00–22:00 daily; deli 07:00–17:00 daily.
 *  - An earlier brief reported Google hours of 06:00–22:00 — NOT independently reconfirmed.
 *  - A dated Facebook post headline mentions "Breakfast from 6am Mon to Sat and 7am on Sunday" —
 *    a historical post, not a current timetable.
 *
 * To publish: fill in `store` (and `deli` if wanted) for all seven days, then set `approved: true`.
 * Day codes follow schema.org: Mo Tu We Th Fr Sa Su. Times are 24-hour, Europe/Dublin.
 */
export interface HoursRow {
  days: Array<'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su'>;
  opens: string; // "07:00"
  closes: string; // "22:00"
}

export const hours = {
  approved: true, // confirmed by the manager, Oct 2026
  fallbackMessage: "Please call for today's opening hours.",
  store: [{ days: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'], opens: '06:00', closes: '22:00' }] as HoursRow[],
  deli: [] as HoursRow[],
  /** Bank-holiday / Christmas exceptions, e.g. { date: '2026-12-25', label: 'Christmas Day', note: 'Closed' } */
  exceptions: [] as Array<{ date: string; label: string; note: string }>,
};

const dayNames: Record<HoursRow['days'][number], string> = {
  Mo: 'Monday',
  Tu: 'Tuesday',
  We: 'Wednesday',
  Th: 'Thursday',
  Fr: 'Friday',
  Sa: 'Saturday',
  Su: 'Sunday',
};

export function describeDays(days: HoursRow['days']): string {
  if (days.length === 7) return 'Every day';
  if (days.length > 2) return `${dayNames[days[0]]} – ${dayNames[days[days.length - 1]]}`;
  return days.map((d) => dayNames[d]).join(' & ');
}
