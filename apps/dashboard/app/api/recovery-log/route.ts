import { NextResponse } from "next/server";

const API = "https://tomos-task-api.vercel.app";

interface RecoveryApiResponse {
  success?: boolean;
  data?: {
    id?: string;
    sleepQuality?: number;
    soreness?: number;
    energy?: number;
    motivation?: number;
    readinessScore?: number | null;
    date?: string;
    createdAt?: string;
  };
  error?: string;
  message?: string;
}

function jsonError(reason: string, status: number) {
  return NextResponse.json(
    { ok: false, error: reason },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}

function parseScores(scores: unknown): number[] | null {
  if (typeof scores !== "string") return null;

  if (/[+-]\d/.test(scores)) return null;

  const values = scores
    .trim()
    .split(/\D+/)
    .filter(Boolean)
    .map((value) => Number(value));

  if (values.length !== 4 || values.some((value) => !Number.isInteger(value))) {
    return null;
  }

  return values;
}

function validateScores(values: number[] | null): values is [number, number, number, number] {
  return values !== null && values.length === 4 && values.every((value) => value >= 1 && value <= 5);
}

export async function POST(request: Request) {
  const expectedToken = process.env.RECOVERY_LOG_TOKEN;

  if (!expectedToken) {
    console.error("RECOVERY_LOG_TOKEN is not configured");
    return jsonError("recovery_log_not_configured", 503);
  }

  let body: { token?: unknown; scores?: unknown };

  try {
    body = (await request.json()) as { token?: unknown; scores?: unknown };
  } catch {
    return jsonError("invalid_json", 400);
  }

  if (body.token !== expectedToken) {
    return jsonError("unauthorized", 401);
  }

  const scores = parseScores(body.scores);

  if (!validateScores(scores)) {
    return jsonError("scores_must_be_four_integers_1_to_5", 400);
  }

  const [sleepQuality, soreness, energy, motivation] = scores;

  const upstream = await fetch(`${API}/api/gym/recovery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sleepQuality, soreness, energy, motivation }),
    cache: "no-store",
  });

  let result: RecoveryApiResponse | null = null;

  try {
    result = (await upstream.json()) as RecoveryApiResponse;
  } catch {
    // Keep result null; the status handling below will surface a safe error.
  }

  if (!upstream.ok || !result?.data) {
    console.error("Recovery log upstream write failed", {
      status: upstream.status,
      response: result,
    });
    return jsonError(result?.error || result?.message || "recovery_log_write_failed", upstream.ok ? 502 : upstream.status);
  }

  return NextResponse.json(
    {
      ok: true,
      readiness: result.data.readinessScore ?? null,
      id: result.data.id,
      date: result.data.date,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
      },
    }
  );
}
