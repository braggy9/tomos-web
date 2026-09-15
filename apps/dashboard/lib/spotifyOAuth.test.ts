import { describe, expect, it } from "vitest";
import {
  authorizeUrl,
  createState,
  hasFollowReadScope,
  knownSpotifyError,
  redirectUri,
  SPOTIFY_SCOPE,
  verifyState,
} from "./spotifyOAuth";
import { decryptToken, encryptToken } from "./spotifyAuthStore";
import { scryptSync } from "node:crypto";

const SECRET = "test-client-secret";

describe("spotify oauth state", () => {
  it("accepts a state it just issued", () => {
    expect(verifyState(createState(SECRET), SECRET)).toEqual({ valid: true });
  });

  it("rejects a state signed with a different client secret", () => {
    expect(verifyState(createState(SECRET), "other-secret")).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("rejects a tampered expiry rather than honouring the extension", () => {
    const issued = createState(SECRET, 1_000);
    const [nonce, , signature] = issued.split(".");
    const extended = `${nonce}.9999999999.${signature}`;
    expect(verifyState(extended, SECRET, 1_000)).toEqual({ valid: false, reason: "bad_signature" });
  });

  it("expires a state once its deadline passes", () => {
    const issued = createState(SECRET, 1_000);
    expect(verifyState(issued, SECRET, 1_000 + 10 * 60)).toEqual({ valid: false, reason: "expired" });
    expect(verifyState(issued, SECRET, 1_000 + 10 * 60 - 1)).toEqual({ valid: true });
  });

  it("rejects missing and malformed states", () => {
    expect(verifyState(null, SECRET)).toEqual({ valid: false, reason: "malformed" });
    expect(verifyState("", SECRET)).toEqual({ valid: false, reason: "malformed" });
    expect(verifyState("only.two", SECRET)).toEqual({ valid: false, reason: "malformed" });
    expect(verifyState("nonce.notanumber.sig", SECRET)).toEqual({ valid: false, reason: "malformed" });
  });

  it("does not throw when the signature length differs", () => {
    const issued = createState(SECRET);
    const [nonce, expiry] = issued.split(".");
    expect(() => verifyState(`${nonce}.${expiry}.short`, SECRET)).not.toThrow();
    expect(verifyState(`${nonce}.${expiry}.short`, SECRET)).toEqual({ valid: false, reason: "bad_signature" });
  });
});

describe("authorize url", () => {
  it("requests only the follow-read scope and carries the state", () => {
    const url = new URL(authorizeUrl({ clientId: "abc", redirectUri: "https://x.test/api/spotify/callback", state: "s1" }));
    expect(url.searchParams.get("client_id")).toBe("abc");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe(SPOTIFY_SCOPE);
    expect(url.searchParams.get("state")).toBe("s1");
    expect(url.searchParams.get("redirect_uri")).toBe("https://x.test/api/spotify/callback");
  });

  it("derives one redirect uri and strips trailing slashes so both legs match", () => {
    expect(redirectUri("https://x.test")).toBe("https://x.test/api/spotify/callback");
    expect(redirectUri("https://x.test/")).toBe("https://x.test/api/spotify/callback");
  });
});

describe("granted scope", () => {
  it("requires user-follow-read, which the artist read depends on", () => {
    expect(hasFollowReadScope("user-follow-read")).toBe(true);
    expect(hasFollowReadScope("user-read-email user-follow-read")).toBe(true);
    expect(hasFollowReadScope("user-read-email")).toBe(false);
    expect(hasFollowReadScope("")).toBe(false);
    expect(hasFollowReadScope(null)).toBe(false);
  });
});

describe("token encryption at rest", () => {
  const key = scryptSync(SECRET, "tomos-gig-radar-spotify-token-v1", 32);

  it("round-trips a token", () => {
    const token = "AQD-refresh-token-value";
    expect(decryptToken(encryptToken(token, key), key)).toBe(token);
  });

  it("produces a different envelope each time", () => {
    expect(encryptToken("same", key)).not.toBe(encryptToken("same", key));
  });

  it("refuses a token encrypted under a different client secret", () => {
    const other = scryptSync("rotated-secret", "tomos-gig-radar-spotify-token-v1", 32);
    expect(() => decryptToken(encryptToken("t", key), other)).toThrow();
  });

  it("refuses a tampered ciphertext", () => {
    const envelope = encryptToken("token", key);
    const parts = envelope.split(":");
    const flipped = Buffer.from(parts[3], "base64");
    flipped[0] ^= 0xff;
    parts[3] = flipped.toString("base64");
    expect(() => decryptToken(parts.join(":"), key)).toThrow();
  });
});

describe("spotify error reflection", () => {
  it("passes through the RFC 6749 codes", () => {
    for (const code of [
      "access_denied",
      "invalid_request",
      "invalid_scope",
      "server_error",
      "temporarily_unavailable",
      "unauthorized_client",
      "unsupported_response_type",
    ]) {
      expect(knownSpotifyError(code)).toBe(code);
    }
  });

  it("does not reflect an attacker-supplied error into the redirect", () => {
    expect(knownSpotifyError("Call 1800-NOT-SPOTIFY to restore access")).toBe("unspecified");
    expect(knownSpotifyError("<script>alert(1)</script>")).toBe("unspecified");
    expect(knownSpotifyError("")).toBe("unspecified");
  });
});
