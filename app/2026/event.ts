// Event-wide constants shared by the home page and the attendee app (/2026/app).

// From this moment (midnight in Bologna) the ticket CTAs become livestream CTAs.
export const liveSwitchDate = new Date("2026-09-27T00:00:00+02:00");

export const liveCta = {
  href: "https://live.nodeconf.eu",
  label: "Watch Live!",
};

// The 2026 talk recordings on YouTube. Each talk's video id is the `video`
// field of its file in content/2026/talks/.
export const playlistId = "PLHJJhUxJCR0c";

export const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;

/** A talk's recording, opened inside the 2026 playlist. */
export const videoUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&list=${playlistId}`;
