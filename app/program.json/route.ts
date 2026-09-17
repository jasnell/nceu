import program from "@/content/program.yaml";

type Speaker = { name: string };

const speakerModules = import.meta.glob<{ default: Speaker }>(
  "../../content/speakers/*.md",
  { eager: true },
);

const speakerNames: Record<string, string> = Object.fromEntries(
  Object.entries(speakerModules)
    .filter(([path]) => !(path.split("/").pop() ?? "").startsWith("_"))
    .map(([path, mod]) => [
      (path.split("/").pop() ?? "").replace(/\.md$/, ""),
      mod.default.name,
    ]),
);

const publicProgram = {
  ...program,
  schemaVersion: 1,
  timeZone: "Europe/Rome",
  speakerNames,
};

export function GET(): Response {
  return Response.json(publicProgram, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Language": "en",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
