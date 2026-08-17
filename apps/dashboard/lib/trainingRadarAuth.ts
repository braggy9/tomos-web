import { createHash, timingSafeEqual } from "node:crypto";

export const TRAINING_RADAR_SESSION_COOKIE = "training_radar_session";

function configuredToken(): string | null {
  const token = process.env.TRAINING_RADAR_PAGE_PASSWORD || process.env.TRAINING_RADAR_READ_TOKEN;
  return token?.trim() || null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function equalSecret(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

export function isTrainingRadarAuthConfigured(): boolean {
  return configuredToken() !== null;
}

export function trainingRadarSessionValue(): string | null {
  const token = configuredToken();
  return token ? digest(token).toString("hex") : null;
}

export function isValidTrainingRadarPassword(candidate: string): boolean {
  const token = configuredToken();
  return token !== null && equalSecret(candidate, token);
}

export function isValidTrainingRadarSession(candidate?: string): boolean {
  const expected = trainingRadarSessionValue();
  return expected !== null && candidate !== undefined && equalSecret(candidate, expected);
}

