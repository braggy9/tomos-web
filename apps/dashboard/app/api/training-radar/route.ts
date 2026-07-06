import { NextResponse } from "next/server";
import { getTrainingRadarData, parseTrainingRadarOptions } from "../../../lib/trainingRadar";

function authorized(request: Request): boolean {
  const expected = process.env.TRAINING_RADAR_READ_TOKEN;

  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }

  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const header = request.headers.get("x-training-radar-token");
  const query = url.searchParams.get("token");

  return [bearer, header, query].some((token) => token === expected);
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: "training_radar_unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex",
        },
      }
    );
  }

  const data = await getTrainingRadarData(parseTrainingRadarOptions(new URL(request.url)));

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "s-maxage=60, stale-while-revalidate=180",
      "X-Robots-Tag": "noindex",
    },
  });
}
