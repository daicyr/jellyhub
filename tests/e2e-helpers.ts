import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

export const admin = {
  username: "e2eadmin",
  password: "E2e-admin-password-123",
};

export async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username", { exact: true }).fill(admin.username);
  await page.getByLabel("Password", { exact: true }).fill(admin.password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("heading", { name: "No Servers configured" }),
  ).toBeVisible();
}
