import { test, expect } from "@playwright/test";
import { merchantLogin } from "../helpers/test-helpers";

test("test merchant login feature", async ({ page }) => {
  await merchantLogin(page);

  await expect(
    page.getByRole("heading", { name: /Welcome back/i }),
  ).toBeVisible({ timeout: 10000 });
  await expect(page.getByRole("link", { name: "Shipments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Webhooks" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
});
