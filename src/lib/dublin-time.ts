/**
 * Calendar-date helpers for Europe/Dublin, used for offer validity.
 * Works in Node (build) and the browser via Intl, so summer time is handled correctly.
 */
const TZ = 'Europe/Dublin';

function zoneOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/** UTC instant (ms) of 00:00 Europe/Dublin on the given YYYY-MM-DD date. */
export function dublinStartOfDay(isoDate: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!m) throw new Error(`Invalid date "${isoDate}" — use YYYY-MM-DD`);
  const guess = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  // Two passes settle the offset even across a DST change.
  let t = guess - zoneOffsetMs(guess);
  t = guess - zoneOffsetMs(t);
  return t;
}

/** Exclusive UTC end (ms) for an inclusive Europe/Dublin end date: 00:00 on the following day. */
export function dublinEndExclusive(isoDate: string): number {
  const start = dublinStartOfDay(isoDate);
  const nextDay = new Date(start + 36 * 3600 * 1000); // safely inside the next calendar day
  const y = nextDay.toLocaleString('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
  return dublinStartOfDay(y);
}

/** "12 October 2026" */
export function formatDublinDate(isoDate: string): string {
  return new Date(dublinStartOfDay(isoDate) + 12 * 3600 * 1000).toLocaleDateString('en-IE', {
    timeZone: TZ,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
