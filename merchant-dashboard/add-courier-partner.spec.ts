import { test, expect } from "@playwright/test";
import { merchantLogin, gotoMerchantPath } from "../helpers/test-helpers";

test("test add courier partner feature", async ({ page }) => {
  test.setTimeout(60_000);

  await merchantLogin(page);
  await gotoMerchantPath(page, "/merchant/couriers");

  await expect(
    page.getByRole("heading", { name: "Courier Partners", level: 1 }),
  ).toBeVisible();

  const availableCard = page
    .locator("div:has(a:has-text('View Details')):has-text('Available')")
    .first();

  await expect(availableCard).toBeVisible({ timeout: 10000 });
  const availableDetailLink = availableCard.getByRole("link", {
    name: "View Details",
  });
  await expect(availableDetailLink).toBeVisible({ timeout: 10000 });
  await availableDetailLink.click();
  await page.waitForURL(/\/merchant\/couriers\/\d+/, { timeout: 15000 });

  const courierName = (await page
    .getByRole("heading", { level: 1 })
    .first()
    .innerText()).trim();

  await expect(
    page.getByRole("heading", { name: courierName }),
  ).toBeVisible();

  const addButton = page.getByRole("button", { name: "Add as partner" });
  await expect(addButton).toBeVisible();

  const addResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/merchant/couriers") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await addButton.click();
  await addResponse;

  // After adding, the button flips to "End partnership"
  await expect(
    page.getByRole("button", { name: "End partnership" }),
  ).toBeVisible({ timeout: 15000 });

  // Verify the courier now appears in the partners tab
  await gotoMerchantPath(page, "/merchant/couriers");
  await page.getByRole("tab", { name: "My Partners" }).click();
  await expect(page.getByText(courierName)).toBeVisible({ timeout: 10000 });
});
