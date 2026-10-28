import { expect, test } from "@playwright/test";
import { admin } from "./e2e-helpers";

test("sets up a fresh JellyHub through the browser", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/get-started\/?$/);
  await expect(
    page.getByRole("heading", { name: "Create an Admin User" }),
  ).toBeVisible();

  await page.getByLabel("Username", { exact: true }).fill(admin.username);
  await page.getByLabel("Password", { exact: true }).fill(admin.password);
  await page
    .getByLabel("Confirm Password", { exact: true })
    .fill(admin.password);
  await page.getByRole("button", { name: "Next", exact: true }).click();

  await expect(
    page.getByRole("heading", { name: "Create Users" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Add Jellyfin Servers" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
  await page.getByRole("button", { name: "Finish", exact: true }).click();

  await expect(page).toHaveURL(/\/login\/?$/);
  await expect(
    page.getByRole("heading", { name: "Login to continue" }),
  ).toBeVisible();
});
