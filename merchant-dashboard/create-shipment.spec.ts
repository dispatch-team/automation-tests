import { test, expect } from "@playwright/test";
import { merchantLogin, createShipmentViaUI } from "../helpers/test-helpers";

test("test create shipment feature", async ({ page }) => {
  await merchantLogin(page);

  const { code, description } = await createShipmentViaUI(page);

  expect(code.length).toBeGreaterThan(0);
  expect(description.length).toBeGreaterThan(0);

  // Success screen shows "Shipment Created!" and numeric Shipment ID (result.id), not tracking code.
  await expect(
    page.getByRole("heading", { name: "Shipment Created!" }),
  ).toBeVisible();
  await expect(page.getByText(/Shipment ID/i)).toBeVisible();
});
