import { test, expect } from "@playwright/test";
import { courierLogin, navigateTo } from "../helpers/test-helpers";

test("test create driver feature", async ({ page }) => {
  await courierLogin(page);
  await page.waitForLoadState("networkidle");

  await navigateTo(page, "Drivers");

  await page.getByRole("button", { name: "Add Driver" }).click();

  await expect(
    page.getByRole("heading", { name: "Add New Driver" }),
  ).toBeVisible();

  const timestamp = Math.floor(Date.now() / 10);
  const driverEmail = `driver${timestamp}@fasttracklogistics.com`;

  await page.getByPlaceholder("Abel").fill("John");
  await page.getByPlaceholder("Kebede").fill("Doe");
  await page.getByPlaceholder("driver@company.com").fill(driverEmail);
  await page.getByPlaceholder("+251911234567").first().fill("+251944000001");
  await page.getByPlaceholder("Motorcycle, Car, Van...").fill("Motorcycle");
  await page.getByPlaceholder("AA-12345").fill("AA-99999");
  await page.getByPlaceholder("+251911234567").last().fill("+251944000002");

  await page.getByRole("button", { name: "Regenerate" }).click();

  await page.getByRole("button", { name: "Create Driver" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Driver created successfully")).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByText(driverEmail)).toBeVisible();
});
