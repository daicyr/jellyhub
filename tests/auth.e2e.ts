import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { admin, login } from "./e2e-helpers";

for (const path of ["/", "/settings/profile", "/settings/users"]) {
  test(`redirects anonymous visitors from ${path} to login`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\/?$/);
    await expect(
      page.getByRole("heading", { name: "Login to continue" }),
    ).toBeVisible();
  });
}

test("shows validation errors for short login credentials", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill("ab");
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Login", exact: true }).click();

  await expect(
    page.getByText("Username must be at least 3 characters long"),
  ).toBeVisible();
  await expect(
    page.getByText("Password must be at least 6 characters long"),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/login\/?$/);
});

test("rejects an incorrect password without creating a session", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill(admin.username);
  await page.getByLabel("Password", { exact: true }).fill("wrong-password-123");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Login Failed" }),
  ).toBeVisible();
  await expect(
    page.getByText("Invalid username or password", { exact: true }),
  ).toBeVisible();

  await page.goto("/settings/profile");
  await expect(page).toHaveURL(/\/login\/?$/);
});

test("logs in an administrator and keeps the session after a reload", async ({
  page,
}) => {
  await login(page);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "No Servers configured" }),
  ).toBeVisible();

  await page.goto("/settings/users");
  await expect(page).toHaveURL(/\/settings\/users\/?$/);
  await expect(
    page.getByRole("heading", { name: "Users", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(admin.username, { exact: true })).toBeVisible();
});

test("shows a password mismatch when registering", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Register", exact: true }).click();
  await expect(page).toHaveURL(/\/register\/?$/);
  await page.getByLabel("Username", { exact: true }).fill("newuser");
  await page.getByLabel("Password", { exact: true }).fill("password123");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("different123");
  await page.getByRole("button", { name: "Register", exact: true }).click();

  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await expect(page).toHaveURL(/\/register\/?$/);
});

test("registers a regular user and denies access to admin pages", async ({
  page,
}) => {
  const username = `e2e${randomUUID().replaceAll("-", "").slice(0, 10)}`;
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page
    .getByLabel("Password", { exact: true })
    .fill("E2e-user-password-123");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("E2e-user-password-123");
  await page.getByRole("button", { name: "Register", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "No Servers configured" }),
  ).toBeVisible();

  for (const path of ["/settings/users", "/settings/sso"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/settings\/profile\/?$/);
    await expect(
      page.getByRole("heading", { name: "Profile", exact: true, level: 3 }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Users", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "SSO", exact: true }),
    ).toHaveCount(0);
  }
});

test("rejects registering an existing username", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Username", { exact: true }).fill(admin.username);
  await page
    .getByLabel("Password", { exact: true })
    .fill("another-password-123");
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill("another-password-123");
  await page.getByRole("button", { name: "Register", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Register Failed" }),
  ).toBeVisible();
  await expect(
    page.getByText("Username is already taken. Please try another.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/register\/?$/);
});
