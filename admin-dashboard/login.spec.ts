import { test, expect } from "@playwright/test";
import { adminLogin } from "../helpers/test-helpers";

test("test admin login feature", async ({ page }) => {
  await adminLogin(page);

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible({
    timeout: 10000,
  });
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
});
