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

/** `revoked` means an explicit disconnect happened; `none` means never connected. */
export type SpotifyAuthState =
  | { kind: "connected"; auth: StoredSpotifyAuth }
  | { kind: "revoked" }
  | { kind: "none" };

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
 * Encryption key derivation is deliberately expensive, so it is memoised per
 * process and per secret rather than run on every call.
 */
let cachedKey: { secret: string; key: Buffer } | null = null;

function encryptionKey(): Buffer {
  const secret = clientSecret();
  if (cachedKey?.secret === secret) return cachedKey.key;
  const key = scryptSync(secret, ENCRYPTION_SALT, 32);
  cachedKey = { secret, key };
  return key;
}

/**
 * The token is encrypted at rest with a key derived from the Spotify client
 * secret. The database alone therefore yields nothing usable — and note a
 * refresh token already requires the client secret to redeem, so this is
 * defence in depth rather than the only barrier. Rotating the client secret
 * invalidates stored tokens, which is the correct behaviour: a rotated secret
 * means reconnecting anyway.
 */
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
  const authTag = Buffer.from(tag, "base64");
  // Node accepts truncated GCM tags: a 4-byte tag still decrypts, dropping
  // forgery resistance from 2^-128 to 2^-32. Require the full 16 bytes.
  if (authTag.length !== 16) throw new Error("Invalid token envelope: auth tag length");
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}

/**
 * The schema is applied on first use rather than by a separate migration step:
 * this is one table on a dashboard-owned database, and a deployment whose only
 * setup instruction is "set DATABASE_URL" must not fail with
 * `relation "spotify_auth" does not exist`. Both statements are idempotent, and
 * the work is done once per process.
 */
let schemaReady: Promise<void> | null = null;

function applySchema(): Promise<void> {
  const sql = neon(databaseUrl());
  return (async () => {
    await sql`
      create table if not exists spotify_auth (
        id             text primary key default 'singleton',
        refresh_token  text not null,
        scope          text not null default '',
        spotify_user   text,
        connected_at   timestamptz not null default now(),
        updated_at     timestamptz not null default now(),
        constraint spotify_auth_singleton check (id = 'singleton')
      )
    `;
    await sql`alter table spotify_auth add column if not exists revoked_at timestamptz`;
  })();
}

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = applySchema().catch((error) => {
      // Do not cache a failure: a transient outage must not disable the store
      // for the rest of the process lifetime.
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export async function readSpotifyAuthState(): Promise<SpotifyAuthState> {
  await ensureSchema();
  const sql = neon(databaseUrl());
  const rows = (await sql`
    select refresh_token, scope, spotify_user, connected_at, updated_at, revoked_at
    from spotify_auth where id = 'singleton'
  `) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return { kind: "none" };
  if (row.revoked_at) return { kind: "revoked" };
  return {
    kind: "connected",
    auth: {
      refreshToken: decryptToken(String(row.refresh_token)),
      scope: String(row.scope ?? ""),
      spotifyUser: row.spotify_user === null || row.spotify_user === undefined ? null : String(row.spotify_user),
      connectedAt: new Date(String(row.connected_at)).toISOString(),
      updatedAt: new Date(String(row.updated_at)).toISOString(),
    },
  };
}

export async function readSpotifyAuth(): Promise<StoredSpotifyAuth | null> {
  const state = await readSpotifyAuthState();
  return state.kind === "connected" ? state.auth : null;
}

export async function saveSpotifyAuth(input: { refreshToken: string; scope: string; spotifyUser: string | null }): Promise<void> {
  await ensureSchema();
  const sql = neon(databaseUrl());
  const encrypted = encryptToken(input.refreshToken);
  await sql`
    insert into spotify_auth (id, refresh_token, scope, spotify_user, connected_at, updated_at, revoked_at)
    values ('singleton', ${encrypted}, ${input.scope}, ${input.spotifyUser}, now(), now(), null)
    on conflict (id) do update set
      refresh_token = excluded.refresh_token,
      scope         = excluded.scope,
      spotify_user  = excluded.spotify_user,
      updated_at    = now(),
      revoked_at    = null
  `;
}

/**
 * Records an explicit disconnect instead of deleting the row. A deleted row is
 * indistinguishable from "never connected", which would let a lingering
 * SPOTIFY_REFRESH_TOKEN silently resurrect the old account after a disconnect.
 */
export async function clearSpotifyAuth(): Promise<void> {
  await ensureSchema();
  const sql = neon(databaseUrl());
  await sql`
    insert into spotify_auth (id, refresh_token, scope, spotify_user, connected_at, updated_at, revoked_at)
    values ('singleton', '', '', null, now(), now(), now())
    on conflict (id) do update set
      refresh_token = '',
      scope         = '',
      spotify_user  = null,
      updated_at    = now(),
      revoked_at    = now()
  `;
}

/**
 * A durable marker of the current credential state, for cache validation.
 * `updated_at` changes on every connect and disconnect, and "none" is distinct
 * from any timestamp, so a cached scan built under different credentials can be
 * detected from any serverless instance — clearing a module variable cannot do
 * that, since each warm instance holds its own.
 */
export async function readAuthRevision(): Promise<string> {
  await ensureSchema();
  const sql = neon(databaseUrl());
  const rows = (await sql`select updated_at, revoked_at from spotify_auth where id = 'singleton'`) as Array<Record<string, unknown>>;
  const row = rows[0];
  if (!row) return "none";
  const revoked = row.revoked_at ? "revoked" : "live";
  return `${revoked}:${new Date(String(row.updated_at)).toISOString()}`;
}

export function isSpotifyStoreConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
