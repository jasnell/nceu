// NodeConf EU 2027, the current edition shown at the site root. Past editions
// live under app/<year>/ with their own constants (e.g. app/2026/event.ts).

/** Set to the ti.to page once tickets go on sale; until then the CTA reads "Tickets coming soon". */
export const ticketsUrl: string | null = "https://ti.to/apropos/nodeconf-eu-2027";

/** Set to e.g. "28-29 September" once the dates are confirmed. */
export const eventDates: string | null = "14-15 September";

export const venue = {
  name: "Hotel Savoia Regency",
  city: "Bologna, Italy",
  href: "https://www.savoia.eu/it/savoia-hotel-regency.html",
  map: "https://www.google.com/maps/place//data=!4m2!3m1!1s0x477e2ca643db29ab:0x19c877e26a7b7526?sa=X&ved=1t:8290&ictx=111",
};

/** Sponsor tiers for 2027; all open until the first partners are announced. */
export const sponsorTiers2027 = [
  "Diamond",
  "Platinum",
  "Gold",
  "Silver",
  "Supporting",
  "Community",
];
