import type { ContentStatus } from './site';

/**
 * "Our local shop" section. Concise, factual copy only: no founding dates, staff names,
 * quotes, customer counts or invented community claims.
 */
export const local = {
  heading: 'Proud to be part of Cloghan',
  headingStatus: 'review' as ContentStatus,
  body: "You'll find us on Hill Street, Cloghan — the SPAR Express shop on the Healy's forecourt. Pop in for the deli, a coffee or the everyday bits.",
  bodyStatus: 'review' as ContentStatus,

  facts: [
    { icon: 'pin', label: 'Hill Street, Cloghan', status: 'review' as ContentStatus },
    { icon: 'bag', label: 'SPAR Express shop', status: 'review' as ContentStatus },
    { icon: 'fuel', label: 'Maxol forecourt', status: 'review' as ContentStatus },
    { icon: 'cup', label: 'Deli, coffee & bakery', status: 'review' as ContentStatus },
  ],

  /**
   * Historical news — keep the year and exact award name. Source: Offaly Independent,
   * 3 July 2024, "Four Offaly SPAR stores receive retail excellence accolades".
   * Do NOT reuse the article's group photograph as a photo of this shop or team.
   * Requires manager approval before launch.
   */
  award: {
    year: '2024',
    name: 'SPAR 365 Retailing Standards Award',
    note: "Healy's SPAR, Cloghan — as reported by the Offaly Independent, July 2024.",
    status: 'review' as ContentStatus,
  },
};
