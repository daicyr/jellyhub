import { describe, expect, test } from "bun:test";
import {
  addServerSchema,
  addSsoSchema,
  deleteAccountSchema,
  editProfileSchema,
  resetPasswdSchema,
} from "../src/schemas/settings.schema";

describe("Jellyfin server validation", () => {
  const server = {
    url: "https://jellyfin.example.com",
    username: "alice",
    password: "password123",
  };

  test("accepts a server URL with credentials", () => {
    expect(addServerSchema.safeParse(server).success).toBe(true);
  });

  test.each([
    { ...server, url: "not-a-url" },
    { ...server, username: "" },
    { ...server, password: "" },
  ])("rejects invalid connection details", (input) => {
    expect(addServerSchema.safeParse(input).success).toBe(false);
  });
});

describe("profile image validation", () => {
  test("extracts the base64 payload from a data URL", () => {
    expect(
      editProfileSchema.parse({ image: "data:image/png;base64,aGVsbG8=" }),
    ).toEqual({ image: "aGVsbG8=" });
  });

  test("accepts an existing base64 payload", () => {
    expect(editProfileSchema.parse({ image: "aGVsbG8=" })).toEqual({
      image: "aGVsbG8=",
    });
  });

  test("allows removing the image or leaving it unchanged", () => {
    expect(editProfileSchema.parse({ image: null })).toEqual({ image: null });
    expect(editProfileSchema.parse({})).toEqual({});
  });

  test("rejects an image that is not valid base64", () => {
    expect(editProfileSchema.safeParse({ image: "invalid!" }).success).toBe(
      false,
    );
  });
});

describe("password reset validation", () => {
  const passwords = {
    currentPassword: "old-password",
    password: "new-password",
    confirmPassword: "new-password",
  };

  test("accepts matching new passwords", () => {
    expect(resetPasswdSchema.safeParse(passwords).success).toBe(true);
  });

  test("requires the current password", () => {
    expect(
      resetPasswdSchema.safeParse({ ...passwords, currentPassword: "" })
        .success,
    ).toBe(false);
  });

  test("reports a mismatch on the confirmation field", () => {
    const result = resetPasswdSchema.safeParse({
      ...passwords,
      confirmPassword: "different-password",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
      "confirmPassword",
    ]);
  });
});

describe("account deletion validation", () => {
  test("accepts the explicit confirmation phrase", () => {
    expect(
      deleteAccountSchema.safeParse({ confirm: "delete my account" }).success,
    ).toBe(true);
  });

  test.each(["", "delete", "Delete my account", "delete my account "])(
    "rejects an inexact confirmation: %s",
    (confirm) => {
      expect(deleteAccountSchema.safeParse({ confirm }).success).toBe(false);
    },
  );
});

describe("SSO provider validation", () => {
  const provider = {
    providerId: "my-provider_1",
    domain: "example.com",
    issuer: "https://auth.example.com",
    clientId: "jellyhub",
    clientSecret: "test-client-secret",
  };

  test("accepts an HTTP or HTTPS issuer", () => {
    expect(addSsoSchema.safeParse(provider).success).toBe(true);
    expect(
      addSsoSchema.safeParse({ ...provider, issuer: "http://localhost:8080" })
        .success,
    ).toBe(true);
  });

  test.each([
    { ...provider, issuer: "ftp://auth.example.com" },
    { ...provider, issuer: "not-a-url" },
    { ...provider, providerId: "provider with spaces" },
    { ...provider, providerId: "provider/name" },
    { ...provider, clientSecret: "" },
  ])("rejects an invalid SSO configuration", (input) => {
    expect(addSsoSchema.safeParse(input).success).toBe(false);
  });
});
