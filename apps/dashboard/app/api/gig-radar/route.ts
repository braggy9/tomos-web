import { NextResponse } from "next/server";
import { getGigRadarData } from "../../../lib/gigRadar";
import { isValidTrainingRadarReadToken } from "../../../lib/trainingRadarAuth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!isValidTrainingRadarReadToken(bearer)) {
    return NextResponse.json({ error: "gig_radar_unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
  }
  return NextResponse.json(await getGigRadarData(), { headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" } });
}
