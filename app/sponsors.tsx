// Sponsor tiers, shared by the home page (#partners) and the attendee app's
// Sponsors tab. Logo sizing comes from each tier's --logo-h (see
// .sponsor-logo* in globals.css), so either page can scale a tier as a whole.

export type Sponsor = {
  name: string;
  href: string;
  logo: string;
  // Set when the sponsor only ships single-color art: `logo` is then the
  // light-theme asset and this one is swapped in for dark.
  logoDark?: string;
  logoClassName: string;
  logoFrameClassName: string;
};

export type SponsorTier = {
  tier: string;
  logoHeight: number;
  layoutCols?: "4cols";
  sponsors: Sponsor[];
};

export const sponsorTiers: SponsorTier[] = [
  {
    tier: "Diamond",
    logoHeight: 84,
    sponsors: [
      {
        name: "Cloudflare",
        href: "https://www.cloudflare.com/",
        logo: "/cloudflare.svg",
        logoClassName: "sponsor-logo sponsor-logo-cloudflare",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Platinum",
    logoHeight: 72,
    sponsors: [
      {
        name: "Platformatic",
        href: "https://platformatic.dev/",
        logo: "/platformatic-text-light.svg",
        logoDark: "/platformatic-text-dark.svg",
        logoClassName: "sponsor-logo sponsor-logo-platformatic",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Gold",
    logoHeight: 60,
    sponsors: [
      {
        name: "Socket",
        href: "https://socket.dev/",
        logo: "/socket.svg",
        logoClassName: "sponsor-logo sponsor-logo-socket",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-socket",
      },
      {
        name: "nxtedition",
        href: "https://nxtedition.com/",
        logo: "/nxtedition.gif",
        logoClassName: "sponsor-logo sponsor-logo-nxtedition",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-nxtedition",
      },
      {
        name: "Zephyr Cloud",
        href: "https://zephyr-cloud.io/",
        logo: "/zephyr-light.svg",
        logoDark: "/zephyr-dark.svg",
        logoClassName: "sponsor-logo sponsor-logo-zephyr",
        logoFrameClassName: "sponsor-logo-frame",
      },
      {
        name: "Tether",
        href: "https://tether.io/data/",
        logo: "/tether-light.svg",
        logoDark: "/tether-dark.svg",
        logoClassName: "sponsor-logo sponsor-logo-tether",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Silver",
    logoHeight: 48,
    sponsors: [
      {
        name: "Igalia",
        href: "https://www.igalia.com/",
        logo: "/igalia.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame",
      },
      {
        name: "Typesense",
        href: "https://typesense.org/",
        logo: "/typesense-light.svg",
        logoDark: "/typesense-dark.svg",
        logoClassName: "sponsor-logo sponsor-logo-typesense",
        logoFrameClassName: "sponsor-logo-frame",
      },
      {
        name: "vlt",
        href: "https://www.vlt.io/",
        logo: "/vlt-light.svg",
        logoDark: "/vlt-dark.svg",
        logoClassName: "sponsor-logo sponsor-logo-vlt",
        logoFrameClassName: "sponsor-logo-frame",
      },
    ],
  },
  {
    tier: "Supporting",
    logoHeight: 40,
    layoutCols: '4cols',
    sponsors: [
      {
        name: "OpenJS Foundation",
        href: "https://openjsf.org/",
        logo: "https://openjsf.org/logo.svg",
        logoClassName: "sponsor-logo sponsor-logo-openjs",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "Sentry",
        href: "https://sentry.io/",
        logo: "https://sentry-brand.storage.googleapis.com/sentry-wordmark-dark-280x84.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "Datadog",
        href: "https://www.datadoghq.com/",
        logo: "https://imgix.datadoghq.com/img/about/presskit/logo-h/dd_horizontal_purple.png",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "HeroDevs",
        href: "https://www.herodevs.com/support/node-nes?utm_source=event&utm_medium=speaker&utm_campaign=2026q3_node-v20-eol_emea",
        logo: "https://cdn.prod.website-files.com/62865614b39c464b76d339aa/668c0ec8bc50d24d58a40475_Logo%20Gradient%20Darkmode.svg",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-herodevs",
      },
      {
        name: "Nearform",
        href: "https://nearform.com/",
        logo: "/nearform.svg",
        logoClassName: "sponsor-logo",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
    ],
  },
  {
    tier: "Community",
    logoHeight: 56,
    sponsors: [
      {
        name: "CityJS London",
        href: "https://london.cityjsconf.org/",
        logo: "https://static.wixstatic.com/media/7f99d3_743fcaf8491a40b59263c7b46a53db9d~mv2.png/v1/fill/w_146,h_146,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/GENERAL_LOGO_FINAL_23.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-circle",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
      {
        name: "ZurichJS",
        href: "https://conf.zurichjs.com/?utm_source=nodeconf_eu&utm_medium=website&utm_campaign=community_partner",
        logo: "https://conf.zurichjs.com/images/logo/zurichjs-square.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-contrast",
      },
      {
        name: "BolognaJS",
        href: "https://www.bolognajs.com/",
        logo: "https://www.bolognajs.com/android-chrome-512x512.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-contrast",
      },
      {
        name: "GrUSP",
        href: "https://www.grusp.org/conferenze/",
        logo: "https://www.grusp.org/wp-content/uploads/2026/05/grusp-logo.png",
        logoClassName: "sponsor-logo community-partner-logo community-partner-logo-square",
        logoFrameClassName: "sponsor-logo-frame sponsor-logo-frame-quiet",
      },
    ],
  },
];

/** A sponsor's logo, swapping light/dark assets for single-color art. */
export function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  if (!sponsor.logoDark) {
    return <img className={sponsor.logoClassName} src={sponsor.logo} alt="" loading="lazy" />;
  }
  return (
    <span className={sponsor.logoClassName} aria-hidden="true">
      <img className="sponsor-logo-variant sponsor-logo-variant-light" src={sponsor.logo} alt="" loading="lazy" />
      <img className="sponsor-logo-variant sponsor-logo-variant-dark" src={sponsor.logoDark} alt="" loading="lazy" />
    </span>
  );
}

/** Every logo URL (both theme variants), for the attendee app's offline cache. */
export const sponsorLogoUrls: string[] = [
  ...new Set(
    sponsorTiers.flatMap((tier) =>
      tier.sponsors.flatMap((sponsor) =>
        sponsor.logoDark ? [sponsor.logo, sponsor.logoDark] : [sponsor.logo],
      ),
    ),
  ),
];
