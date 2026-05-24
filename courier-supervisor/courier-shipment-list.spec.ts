import { test, expect } from "@playwright/test";
import { courierLogin, navigateTo } from "../helpers/test-helpers";

test("test view courier shipments feature", async ({ page }) => {
  await courierLogin(page);
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();

  await navigateTo(page, "Shipments");

  await expect(
    page.getByRole("heading", { name: "Shipments" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "ID" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Recipient" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Driver" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Created" }),
  ).toBeVisible();
});
