import { SITE_MODE, type ContentStatus } from './site';

/**
 * Core business facts (name, address, phone, links).
 *
 * Evidence snapshot 9 Oct 2026 (see docs/RESEARCH-NOTES.md):
 *  - Name, address, Eircode and phone: SPAR Ireland store directory entry "SPAR Express Cloghan".
 *  - Maxol lists the same site as "Healy's Maxol Service Station / Healy's Spar Express",
 *    using "Hill Road" rather than "Hill Street". Hill Street is used here (SPAR directory).
 *  - These are publicly listed facts, not yet manager-approved launch content.
 *    Set `status: 'approved'` once the manager confirms them.
 */
export const business = {
  status: 'approved' as ContentStatus,

  name: 'SPAR Express Cloghan',
  /** Name used by the shop's own social accounts. */
  localName: "Healy's SPAR Express",
  shortLocalName: "Healy's",

  address: {
    street: 'Hill Street',
    town: 'Cloghan',
    county: 'Co. Offaly',
    countyLong: 'County Offaly',
    eircode: 'R42 R856',
    country: 'Ireland',
    countryCode: 'IE',
  },

  phone: {
    display: '090 645 7455',
    href: 'tel:+353906457455',
    international: '+353 90 645 7455',
  },

  /**
   * External directions link (no embedded map, no API key).
   * UNVERIFIED: confirm the pin lands on the shop before launch, then set `directionsVerified: true`.
   */
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=SPAR+Express+Cloghan+Hill+Street+R42+R856',
  directionsVerified: false,

  social: {
    facebook: {
      url: 'https://www.facebook.com/sparcloghan/',
      handle: '@sparcloghan',
      label: 'Healys Spar Express on Facebook',
    },
    instagram: {
      url: 'https://www.instagram.com/sparcloghan/',
      handle: '@sparcloghan',
      label: 'HealysSparExpress on Instagram',
    },
  },
};

export const addressOneLine = `${business.address.street}, ${business.address.town}, ${business.address.county}, ${business.address.eircode}`;

if (SITE_MODE === 'launch' && business.status !== 'approved') {
  throw new Error(
    '[launch build] Core business details (name, address, phone, links) are not approved. ' +
      "Confirm them with the manager and set business.status to 'approved' in src/data/business.ts.",
  );
}
