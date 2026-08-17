import { NextResponse } from "next/server";
import { getTrainingRadarData, parseTrainingRadarOptions } from "../../../lib/trainingRadar";
import { isValidTrainingRadarReadToken } from "../../../lib/trainingRadarAuth";

function authorized(request: Request): boolean {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const header = request.headers.get("x-training-radar-token");
  return isValidTrainingRadarReadToken(bearer) || isValidTrainingRadarReadToken(header);
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
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
