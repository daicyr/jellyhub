import { describe, expect, test } from "bun:test";
import {
  editUserSchema,
  loginSchema,
  registerSchema,
} from "../src/schemas/auth.schema";

describe("login validation", () => {
  test.each([
    { username: "abc", password: "123456" },
    { username: "a".repeat(15), password: "p".repeat(50) },
  ])("accepts credentials at the length limits", (credentials) => {
    expect(loginSchema.safeParse(credentials).success).toBe(true);
  });

  test.each([
    { username: "ab", password: "123456" },
    { username: "a".repeat(16), password: "123456" },
    { username: "alice", password: "12345" },
    { username: "alice", password: "p".repeat(51) },
    { username: "", password: "" },
  ])("rejects credentials outside the length limits", (credentials) => {
    expect(loginSchema.safeParse(credentials).success).toBe(false);
  });
});

describe("registration validation", () => {
  test("accepts matching passwords", () => {
    expect(
      registerSchema.safeParse({
        username: "alice",
        password: "password123",
        confirmPassword: "password123",
      }).success,
    ).toBe(true);
  });

  test("reports a password mismatch on the confirmation field", () => {
    const result = registerSchema.safeParse({
      username: "alice",
      password: "password123",
      confirmPassword: "different123",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
      "confirmPassword",
    ]);
  });
});

describe("user editing validation", () => {
  const user = {
    username: "alice",
    password: "",
    confirmPassword: "",
    role: "user",
    image: null,
  };

  test("allows editing a user without changing their password", () => {
    expect(editUserSchema.safeParse(user).success).toBe(true);
  });

  test.each([
    { password: "short", confirmPassword: "short", field: "password" },
    { password: "password123", confirmPassword: "", field: "confirmPassword" },
    {
      password: "password123",
      confirmPassword: "different123",
      field: "confirmPassword",
    },
  ])("validates a password change", ({ password, confirmPassword, field }) => {
    const result = editUserSchema.safeParse({
      ...user,
      password,
      confirmPassword,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.path)).toContainEqual([
      field,
    ]);
  });

  test("accepts a confirmed password change", () => {
    expect(
      editUserSchema.safeParse({
        ...user,
        password: "password123",
        confirmPassword: "password123",
      }).success,
    ).toBe(true);
  });

  test("rejects an unsupported role", () => {
    expect(
      editUserSchema.safeParse({ ...user, role: "superadmin" }).success,
    ).toBe(false);
  });
});
