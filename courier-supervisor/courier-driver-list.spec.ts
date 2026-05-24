import { test, expect } from "@playwright/test";
import { courierLogin, navigateTo } from "../helpers/test-helpers";

test("test view courier drivers feature", async ({ page }) => {
  await courierLogin(page);
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();

  await navigateTo(page, "Drivers");

  await expect(
    page.getByRole("heading", { name: "Drivers" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Driver", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Phone" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Rating" }),
  ).toBeVisible();
});
