import { test, expect } from "@playwright/test";
import { courierLogin, navigateTo } from "../helpers/test-helpers";

test("test courier revenue page", async ({ page }) => {
  await courierLogin(page);
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible();

  await navigateTo(page, "Revenue");

  
  await expect(
    page.getByRole("heading", { name: "Revenue", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Earnings from delivered shipments with period comparison"),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "7d" })).toBeVisible();
  await expect(page.getByRole("button", { name: "30d" })).toBeVisible();
  await expect(page.getByRole("button", { name: "90d" })).toBeVisible();


  await expect(page.getByText("Total Revenue")).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("Deliveries", { exact: true })).toBeVisible();
  await expect(page.getByText("Avg per Delivery")).toBeVisible();

  
  await expect(
    page.getByText(/ETB[\s\d,]+/).first(),
  ).toBeVisible();

  
  await expect(
    page.getByRole("heading", { name: "Revenue Trend", exact: true }),
  ).toBeVisible();

  
  await expect(
    page.getByRole("heading", {
      name: "Top Revenue-Generating Drivers",
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByRole("button", { name: "Export" })).toBeEnabled();
});
