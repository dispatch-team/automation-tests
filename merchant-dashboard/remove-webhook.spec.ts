import { test, expect } from "@playwright/test";
import { merchantLogin, gotoMerchantPath } from "../helpers/test-helpers";

test("test remove webhook feature", async ({ page }) => {
  test.setTimeout(60_000);

  const webhookUrl = `https://example.com/e2e-webhook-${Date.now()}`;

  await merchantLogin(page);
  await gotoMerchantPath(page, "/merchant/webhooks");

  await expect(page.getByRole("heading", { name: "Webhooks", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: "Register Webhook" }).click();

  const registerDialog = page.getByRole("dialog", { name: "Register Webhook" });
  await expect(registerDialog).toBeVisible();
  await registerDialog.locator("#webhook-url").fill(webhookUrl);

  const registerResponse = page.waitForResponse(
    (res) =>
      res.url().includes("/api/merchant/webhooks") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await registerDialog.getByRole("button", { name: "Save Webhook" }).click();
  await registerResponse;

  const successDialog = page.getByRole("dialog", {
    name: "Successfully Registered",
  });
  await expect(successDialog).toBeVisible({ timeout: 30000 });
  await successDialog.getByRole("button", { name: "I understand" }).click();

  const row = page.locator("tr").filter({ hasText: webhookUrl });
  await expect(row).toBeVisible({ timeout: 10000 });
  await row.getByRole("button").click();

  const deleteDialog = page.getByRole("dialog", { name: "Delete Webhook" });
  await expect(deleteDialog).toBeVisible();
  await deleteDialog.getByRole("button", { name: "Delete Webhook" }).click();

  await expect(page.getByText(webhookUrl)).not.toBeVisible({
    timeout: 15000,
  });
});
