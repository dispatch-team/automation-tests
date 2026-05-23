import { test, expect } from "@playwright/test";
import { adminLogin, navigateTo } from "../helpers/test-helpers";

test("test view merchant feature", async ({ page }) => {
  await adminLogin(page);
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Active Shipments")).toBeVisible();

  await navigateTo(page, "Merchants");

  await expect(page.getByRole("heading", { name: "Merchants" })).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Merchant List" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Industry" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Status" }),
  ).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Actions" }),
  ).toBeVisible();
});
