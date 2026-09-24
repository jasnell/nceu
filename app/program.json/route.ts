import { publicProgram } from "../program-data";

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
