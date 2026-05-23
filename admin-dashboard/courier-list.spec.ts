import { test, expect } from "@playwright/test";
import { adminLogin, navigateTo } from "../helpers/test-helpers";

test("test view courier feature", async ({ page }) => {
  await adminLogin(page);
  await page.waitForLoadState("networkidle");
  await navigateTo(page, "Couriers");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Couriers" })).toBeVisible({
    timeout: 20000,
  });
  await expect(
    page.getByRole("columnheader", { name: "Courier List" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Rating" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Actions" }),
  ).toBeVisible();
});
