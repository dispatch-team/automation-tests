import { test, expect } from "@playwright/test";
import { courierLogin } from "../helpers/test-helpers";

test("test courier login feature", async ({ page }) => {
  await courierLogin(page);

  await expect(
    page.getByRole("heading", { name: /Welcome back/ }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("link", { name: "Shipments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Drivers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
});
