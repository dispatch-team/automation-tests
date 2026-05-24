import { test, expect } from "@playwright/test";
import {
  merchantLogin,
  createShipmentViaUI,
  courierLogin,
  navigateTo,
} from "../helpers/test-helpers";

test.describe.serial("merchant create and courier assign shipment", () => {
  let shipmentCode = "";

  test("test create shipment for assign flow", async ({ page }) => {
    await merchantLogin(page);
    const result = await createShipmentViaUI(page);
    shipmentCode = result.code;
    expect(shipmentCode.length).toBeGreaterThan(0);
  });

  test("test assign shipment feature", async ({ page }) => {
    test.setTimeout(60_000);

    if (!shipmentCode) {
      throw new Error("shipmentCode not set — run merchant create test first");
    }

    await courierLogin(page);
    await page.waitForLoadState("networkidle");

    await navigateTo(page, "Shipments");

    await expect(
      page.getByRole("heading", { name: "Shipments" }),
    ).toBeVisible();

    const search = page.getByPlaceholder("Search Shipments...");
    await search.fill(shipmentCode);

    const row = page
      .getByRole("row")
      .filter({ hasText: shipmentCode })
      .filter({ has: page.getByRole("checkbox") });
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.hover();

    const actionsMenu = row.locator("td").last().getByRole("button");
    await expect(actionsMenu).toBeVisible({ timeout: 5000 });
    await actionsMenu.click();
    await page.getByRole("menuitem", { name: "Assign Driver" }).click();

    const assignDialog = page.getByRole("dialog");
    await expect(
      assignDialog.getByRole("heading", { name: "Assign Driver" }),
    ).toBeVisible();

    await expect(assignDialog.getByText("Loading drivers...")).not.toBeVisible({
      timeout: 30000,
    });

    const driverSelect = assignDialog.locator("select");
    await expect(driverSelect).toBeVisible({ timeout: 10000 });
    const driverOptions = driverSelect.locator("option");
    const optionCount = await driverOptions.count();
    let picked = false;
    for (let i = 0; i < optionCount; i++) {
      const value = await driverOptions.nth(i).getAttribute("value");
      if (value && value !== "") {
        await driverSelect.selectOption(value);
        picked = true;
        break;
      }
    }
    if (!picked) {
      throw new Error(
        "No active drivers available for Slow Track — add an active driver on staging",
      );
    }

    await assignDialog
      .getByRole("button", { name: "Assign Driver", exact: true })
      .click();

    await expect(assignDialog.getByText(/Assigned to/i)).toBeVisible({
      timeout: 20000,
    });
  });
});
