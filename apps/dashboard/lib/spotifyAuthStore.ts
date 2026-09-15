import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const ENCRYPTION_SALT = "tomos-gig-radar-spotify-token-v1";
const ENVELOPE_VERSION = "v1";

export type StoredSpotifyAuth = {
  refreshToken: string;
  scope: string;
  spotifyUser: string | null;
  connectedAt: string;
  updatedAt: string;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is not configured");
  return url;
}

function clientSecret(): string {
  const secret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!secret) throw new Error("SPOTIFY_CLIENT_SECRET is not configured");
  return secret;
}

/**
 * The token is encrypted at rest with a key derived from the Spotify client
 * secret. The database alone therefore yields nothing usable — and note a
 * refresh token already requires the client secret to redeem, so this is
 * defence in depth rather than the only barrier. Rotating the client secret
 * invalidates stored tokens, which is the correct behaviour: a rotated secret
 * means reconnecting anyway.
 */
function encryptionKey(): Buffer {
  return scryptSync(clientSecret(), ENCRYPTION_SALT, 32);
}

export function encryptToken(plaintext: string, key: Buffer = encryptionKey()): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return [ENVELOPE_VERSION, iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decryptToken(envelope: string, key: Buffer = encryptionKey()): string {
  const [version, iv, tag, ciphertext] = envelope.split(":");
  if (version !== ENVELOPE_VERSION) throw new Error(`Unsupported token envelope version: ${version}`);
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}

export async function readSpotifyAuth(): Promise<StoredSpotifyAuth | null> {
  const sql = neon(databaseUrl());
  const rows = (await sql`
    select refresh_token, scope, spotify_user, connected_at, updated_at
    from spotify_auth where id = 'singleton'
  `) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return null;
  return {
    refreshToken: decryptToken(String(row.refresh_token)),
    scope: String(row.scope ?? ""),
    spotifyUser: row.spotify_user === null || row.spotify_user === undefined ? null : String(row.spotify_user),
    connectedAt: new Date(String(row.connected_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function saveSpotifyAuth(input: { refreshToken: string; scope: string; spotifyUser: string | null }): Promise<void> {
  const sql = neon(databaseUrl());
  const encrypted = encryptToken(input.refreshToken);
  await sql`
    insert into spotify_auth (id, refresh_token, scope, spotify_user, connected_at, updated_at)
    values ('singleton', ${encrypted}, ${input.scope}, ${input.spotifyUser}, now(), now())
    on conflict (id) do update set
      refresh_token = excluded.refresh_token,
      scope         = excluded.scope,
      spotify_user  = excluded.spotify_user,
      updated_at    = now()
  `;
}

export async function clearSpotifyAuth(): Promise<void> {
  const sql = neon(databaseUrl());
  await sql`delete from spotify_auth where id = 'singleton'`;
}

export function isSpotifyStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
