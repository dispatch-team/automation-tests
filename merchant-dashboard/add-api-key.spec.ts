import { test, expect } from "@playwright/test";
import { merchantLogin, gotoMerchantPath } from "../helpers/test-helpers";

test("test add api key feature", async ({ page }) => {
  test.setTimeout(60_000);

  await merchantLogin(page);
  await gotoMerchantPath(page, "/merchant/api-keys");

  await expect(
    page.getByRole("heading", { name: "API Keys", level: 1 }),
  ).toBeVisible();

  const keyTableRows = page.locator("tbody tr");
  await expect(keyTableRows.first()).toBeVisible({ timeout: 15000 });
  const keyRowsBefore = await keyTableRows.count();

  const generateResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/merchant/api-keys") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await page.getByRole("button", { name: "Generate New Key" }).first().click();
  await generateResponse;

  // Success dialog with the freshly generated key (shown once).
  const successDialog = page.getByRole("dialog").filter({
    hasText: "API key generated successfully!",
  });
  await expect(successDialog).toBeVisible({ timeout: 30000 });

  const apiKeyTextbox = successDialog.getByRole("textbox", { name: "API Key" });
  await expect(apiKeyTextbox).toBeVisible({ timeout: 5000 });
  await expect(apiKeyTextbox).toHaveValue(/dsp_/, { timeout: 5000 });

  const saveButton = successDialog.getByRole("button", { name: /saved the key/i });
  await expect(saveButton).toBeVisible({ timeout: 30000 });
  await expect(saveButton).toBeEnabled({ timeout: 30000 });
  await saveButton.click({ timeout: 120000 });
  await expect(successDialog).not.toBeVisible({ timeout: 10000 });

  // The new key should be reflected in the table.
  const keyRowsAfter = await keyTableRows.count();
  expect(keyRowsAfter).toBeGreaterThan(keyRowsBefore);
  await expect(keyTableRows.first().getByText("Active", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Active", { exact: true }).first(),
  ).toBeVisible();
});
