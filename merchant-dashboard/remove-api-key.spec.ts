import { test, expect } from "@playwright/test";
import { merchantLogin, gotoMerchantPath } from "../helpers/test-helpers";

test("test remove api key feature", async ({ page }) => {
  test.setTimeout(60_000);

  await merchantLogin(page);
  await gotoMerchantPath(page, "/merchant/api-keys");

  await expect(
    page.getByRole("heading", { name: "API Keys", level: 1 }),
  ).toBeVisible();

  // Ensure at least one active key exists by generating one first.
  const generateResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/merchant/api-keys") &&
      res.request().method() === "POST" &&
      res.ok(),
  );
  await page.getByRole("button", { name: "Generate New Key" }).first().click();
  await generateResponse;

  const successDialog = page.getByRole("dialog").filter({
    hasText: "API key generated successfully!",
  });
  await expect(successDialog).toBeVisible({ timeout: 30000 });
  await successDialog.getByRole("button", { name: /saved the key/i }).click();
  await expect(successDialog).not.toBeVisible({ timeout: 10000 });

  // Find the first row whose status is "Active" and trigger its delete action.
  const activeRow = page
    .locator("tbody tr")
    .filter({ has: page.getByText("Active", { exact: true }) })
    .first();
  await expect(activeRow).toBeVisible({ timeout: 10000 });

  const keyIdCell = (await activeRow.locator("td").first().innerText()).trim();

  const deleteButton = activeRow.locator("button").nth(1);
  await expect(deleteButton).toBeVisible({ timeout: 10000 });
  await deleteButton.click();

  const confirmDialog = page.getByRole("dialog").filter({
    hasText: "Are you sure you want to delete this API key?",
  });
  await expect(confirmDialog).toBeVisible({ timeout: 15000 });

  const deleteResponsePromise = page.waitForResponse((res) =>
    res.url().includes("/api/merchant/api-keys") &&
    res.request().method() === "DELETE",
  );

  await Promise.all([
    deleteResponsePromise,
    confirmDialog.getByRole("button", { name: /delete/i }).click(),
  ]);

  const deleteResponse = await deleteResponsePromise;
  expect(deleteResponse.status()).toBeLessThan(300);

  await expect(confirmDialog).not.toBeVisible({ timeout: 10000 });

  const specificRow = page.locator("tbody tr").filter({ hasText: keyIdCell });
  await expect(specificRow).toBeHidden({ timeout: 15000 });
});
