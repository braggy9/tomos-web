import { createHmac, scryptSync, timingSafeEqual, randomBytes } from "node:crypto";

export const SPOTIFY_SCOPE = "user-follow-read";
export const SPOTIFY_AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
export const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

const STATE_TTL_SECONDS = 10 * 60;
const STATE_KEY_SALT = "tomos-gig-radar-spotify-state-v1";

function base64url(input: Buffer): string {
  return input.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * The state key is derived from the Spotify client secret rather than a second
 * env var. The secret is already required for the token exchange, so this adds
 * no new configuration and no new thing to rotate.
 */
export function stateKey(clientSecret: string): Buffer {
  return scryptSync(clientSecret, STATE_KEY_SALT, 32);
}

function sign(payload: string, key: Buffer): string {
  return base64url(createHmac("sha256", key).update(payload).digest());
}

/** Signed, expiring OAuth state. Stateless — nothing to store or clean up. */
export function createState(clientSecret: string, nowSeconds: number = Math.floor(Date.now() / 1000)): string {
  const payload = `${base64url(randomBytes(16))}.${nowSeconds + STATE_TTL_SECONDS}`;
  return `${payload}.${sign(payload, stateKey(clientSecret))}`;
}

export type StateVerdict = { valid: true } | { valid: false; reason: "malformed" | "bad_signature" | "expired" };

export function verifyState(
  state: string | null | undefined,
  clientSecret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): StateVerdict {
  if (!state) return { valid: false, reason: "malformed" };
  const parts = state.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed" };
  const [nonce, expiry, signature] = parts;
  if (!nonce || !/^\d+$/.test(expiry)) return { valid: false, reason: "malformed" };

  const expected = sign(`${nonce}.${expiry}`, stateKey(clientSecret));
  const candidate = Buffer.from(signature);
  const truth = Buffer.from(expected);
  // Compare length first: timingSafeEqual throws on a length mismatch.
  if (candidate.length !== truth.length || !timingSafeEqual(candidate, truth)) {
    return { valid: false, reason: "bad_signature" };
  }
  // Signature is verified before the expiry is trusted, so the deadline cannot
  // be extended by editing the state.
  if (Number(expiry) <= nowSeconds) return { valid: false, reason: "expired" };
  return { valid: true };
}

export function authorizeUrl(options: { clientId: string; redirectUri: string; state: string }): string {
  const query = new URLSearchParams({
    client_id: options.clientId,
    response_type: "code",
    redirect_uri: options.redirectUri,
    scope: SPOTIFY_SCOPE,
    state: options.state,
  });
  return `${SPOTIFY_AUTHORIZE_URL}?${query.toString()}`;
}

/**
 * The redirect URI must match byte-for-byte between the authorize request, the
 * token exchange, and the Spotify dashboard. Deriving it from one place keeps
 * the three in step.
 */
export function redirectUri(origin: string): string {
  return `${origin.replace(/\/+$/, "")}/api/spotify/callback`;
}

export function grantedScopes(scope: string | null | undefined): string[] {
  return (scope ?? "").split(/\s+/).filter(Boolean);
}

export function hasFollowReadScope(scope: string | null | undefined): boolean {
  return grantedScopes(scope).includes(SPOTIFY_SCOPE);
}
