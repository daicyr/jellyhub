import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { decrypt, encrypt, ticksToDuration } from "../src/utils";

describe("ticksToDuration", () => {
  test.each([
    { seconds: 0, expected: "00:00" },
    { seconds: 9, expected: "00:09" },
    { seconds: 65, expected: "01:05" },
    { seconds: 3599, expected: "59:59" },
    { seconds: 3600, expected: "1:00:00" },
    { seconds: 3723, expected: "1:02:03" },
    { seconds: 90061, expected: "25:01:01" },
  ])("formats $seconds seconds as $expected", ({ seconds, expected }) => {
    expect(ticksToDuration(seconds * 10_000_000)).toBe(expected);
  });

  test.each([
    { seconds: 9, expected: "9s" },
    { seconds: 65, expected: "1m 5s" },
    { seconds: 3603, expected: "1h 3s" },
    { seconds: 3723, expected: "1h 2m 3s" },
  ])("formats $seconds seconds in detail", ({ seconds, expected }) => {
    expect(ticksToDuration(seconds * 10_000_000, true)).toBe(expected);
  });
});

describe("token encryption", () => {
  let originalSecretKey: string | undefined;

  beforeEach(() => {
    originalSecretKey = process.env.SECRET_KEY;
    process.env.SECRET_KEY = Buffer.alloc(32, 7).toString("base64");
  });

  afterEach(() => {
    if (originalSecretKey === undefined) {
      delete process.env.SECRET_KEY;
    } else {
      process.env.SECRET_KEY = originalSecretKey;
    }
  });

  test.each(["jellyfin-token-123", "jeton avec accents éà et 🔑", ""])(
    "decrypts the original value: %s",
    (value) => {
      const encrypted = encrypt(value);

      expect(encrypted).not.toBe(value);
      expect(decrypt(encrypted)).toBe(value);
    },
  );

  test("encrypts the same token differently on each call", () => {
    const first = encrypt("same-token");
    const second = encrypt("same-token");

    expect(first).not.toBe(second);
    expect(decrypt(first)).toBe("same-token");
    expect(decrypt(second)).toBe("same-token");
  });

  test("rejects a token whose ciphertext was altered", () => {
    const [iv, tag, ciphertext] = encrypt("secret-token").split(":");
    const altered = Buffer.from(ciphertext, "hex");
    altered[0] ^= 1;

    expect(() => decrypt(`${iv}:${tag}:${altered.toString("hex")}`)).toThrow();
  });

  test("rejects decryption with a different key", () => {
    const encrypted = encrypt("secret-token");
    process.env.SECRET_KEY = Buffer.alloc(32, 8).toString("base64");

    expect(() => decrypt(encrypted)).toThrow();
  });

  test("rejects malformed encrypted input", () => {
    expect(() => decrypt("not-an-encrypted-token")).toThrow();
  });
});
