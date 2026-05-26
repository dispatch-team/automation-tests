import { test, expect } from "@playwright/test";
import { merchantLogin, gotoMerchantPath } from "../helpers/test-helpers";

test("test remove courier partner feature", async ({ page }) => {
  test.setTimeout(60_000);

  await merchantLogin(page);
  await gotoMerchantPath(page, "/merchant/couriers");

  await expect(
    page.getByRole("heading", { name: "Courier Partners", level: 1 }),
  ).toBeVisible();

  // Ensure at least one partner exists by adding one if needed.
  await page.getByRole("tab", { name: "My Partners" }).click();
  await page.waitForLoadState("networkidle");

  const noPartners = await page
    .getByText("You haven't added any partner couriers yet.")
    .isVisible()
    .catch(() => false);

  if (noPartners) {
    await page.getByRole("tab", { name: "All Couriers" }).click();
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
    await page.getByRole("button", { name: "Add as partner" }).click();
    await expect(
      page.getByRole("button", { name: "End partnership" }),
    ).toBeVisible({ timeout: 15000 });
    await gotoMerchantPath(page, "/merchant/couriers");
    await page.getByRole("tab", { name: "My Partners" }).click();
  }

  // Open the first partner courier's detail page.
  const partnerCard = page
    .locator("div:has(a:has-text('View Details')):has-text('Partner')")
    .first();

  await expect(partnerCard).toBeVisible({ timeout: 10000 });
  const partnerDetailLink = partnerCard.getByRole("link", {
    name: "View Details",
  });
  await expect(partnerDetailLink).toBeVisible({ timeout: 10000 });
  await partnerDetailLink.click();
  await page.waitForURL(/\/merchant\/couriers\/\d+/, { timeout: 15000 });

  const courierName = (await page
    .getByRole("heading", { level: 1 })
    .first()
    .innerText()).trim();

  const endButton = page.getByRole("button", { name: "End partnership" });
  await expect(endButton).toBeVisible();

  const removeResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/merchant/couriers") &&
      res.request().method() === "DELETE" &&
      res.ok(),
  );

  await endButton.click();
  await removeResponse;

  await expect(
    page.getByRole("button", { name: "Add as partner" }),
  ).toBeVisible({ timeout: 15000 });

  // Verify the courier no longer appears under My Partners.
  await gotoMerchantPath(page, "/merchant/couriers");
  await page.getByRole("tab", { name: "My Partners" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByText(courierName)).not.toBeVisible({ timeout: 10000 });
});
