import { NextResponse } from "next/server";
import {
  isTrainingRadarAuthConfigured,
  isValidTrainingRadarPassword,
  trainingRadarSessionValue,
  TRAINING_RADAR_SESSION_COOKIE,
} from "../../../../lib/trainingRadarAuth";
import {
  clearLoginFailures,
  loginClientKey,
  loginRetryAfterSeconds,
  recordLoginFailure,
} from "../../../../lib/loginRateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isTrainingRadarAuthConfigured()) {
    return NextResponse.json(
      { error: "training_radar_auth_not_configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  const clientKey = loginClientKey(request);
  const retryAfter = loginRetryAfterSeconds(clientKey);
  if (retryAfter > 0) {
    return NextResponse.redirect(new URL("/?auth=limited", request.url), {
      status: 303,
      headers: { "Cache-Control": "no-store", "Retry-After": String(retryAfter) },
    });
  }

  const form = await request.formData();
  const password = form.get("password");

  if (typeof password !== "string" || !isValidTrainingRadarPassword(password)) {
    recordLoginFailure(clientKey);
    await new Promise((resolve) => setTimeout(resolve, 350));
    return NextResponse.redirect(new URL("/?auth=invalid", request.url), 303);
  }

  clearLoginFailures(clientKey);

  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(TRAINING_RADAR_SESSION_COOKIE, trainingRadarSessionValue() as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
