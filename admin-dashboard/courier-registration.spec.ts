import { test, expect } from "@playwright/test";
import { adminLogin, courierLogin, navigateTo } from "../helpers/test-helpers";

test("test courier registration feature", async ({ page }) => {
  await adminLogin(page);
  await navigateTo(page, "Couriers");

  await page.getByRole("button", { name: "Create Courier" }).click();
  await page.waitForLoadState("networkidle");

  const unixTimestamp: number = Math.floor(Date.now() / 10);
  const companyEmail = `info@fasttracklogistics${unixTimestamp}.com`;
  const courierDetails = {
    companyName: "Fast track Logistics",
    address: "Bole Road",
    phone: "+2511111111",
    email: companyEmail,
    firstName: "John",
    lastName: "Haile",
    password: "dev123456",
  };

  await page
    .getByRole("textbox", { name: "Company Name" })
    .fill(courierDetails.companyName);
  await page
    .getByRole("textbox", { name: "Company Address" })
    .fill(courierDetails.address);
  await page
    .getByRole("textbox", { name: "Phone Number" })
    .fill(courierDetails.phone);
  await page
    .getByRole("textbox", { name: "Email Address" })
    .fill(courierDetails.email);
  await page
    .getByRole("textbox", { name: "Owner First Name" })
    .fill(courierDetails.firstName);
  await page
    .getByRole("textbox", { name: "Owner Last Name" })
    .fill(courierDetails.lastName);
  await page
    .getByRole("textbox", { name: "Owner Password" })
    .fill(courierDetails.password);
  await page
    .getByRole("textbox", { name: "Confirm Password" })
    .fill(courierDetails.password);

  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForLoadState("networkidle");

  await expect(
    page.getByRole("button", { name: "Confirm & Register" }),
  ).toBeVisible();
  await expect(page.getByText(courierDetails.companyName)).toBeVisible();
  await expect(page.getByText(courierDetails.firstName)).toBeVisible();
  await expect(page.getByText(courierDetails.lastName)).toBeVisible();
  await expect(page.getByText(courierDetails.address)).toBeVisible();
  await expect(page.getByText(companyEmail)).toBeVisible();

  await page.getByRole("button", { name: "Back to Edit" }).click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("textbox", { name: "Email Address" }).fill(companyEmail);
  await page.getByRole("button", { name: "Next" }).click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "Confirm & Register" }).click();
  await page.waitForLoadState("networkidle");

  await expect(page.getByText("Courier company created")).toBeVisible();
  await expect(page.getByText(companyEmail)).toBeVisible();

  // login as the new courier supervisor using the helper
  await courierLogin(page, companyEmail, courierDetails.password);

  await expect(
    page.getByRole("heading", {
      name: `Welcome back, ${courierDetails.firstName}`,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Shipments" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Drivers" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
});
