import { describe, expect, it } from "vitest";
import { clearLoginFailures, loginRetryAfterSeconds, recordLoginFailure } from "./loginRateLimit";

describe("login rate limiting", () => {
  it("blocks after five failures and can be cleared", () => {
    const key = "test-client";
    clearLoginFailures(key);
    for (let attempt = 0; attempt < 4; attempt += 1) {
      expect(recordLoginFailure(key, 1_000)).toBe(0);
    }
    expect(recordLoginFailure(key, 1_000)).toBe(900);
    expect(loginRetryAfterSeconds(key, 1_000)).toBe(900);
    clearLoginFailures(key);
    expect(loginRetryAfterSeconds(key, 1_000)).toBe(0);
  });
});
