import { Page, expect } from "@playwright/test";

// helper for admin login
export async function adminLogin(page: Page) {
  const url = process.env.ADMIN_URL;
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !username || !password) {
    throw new Error(
      "Missing ADMIN_URL, ADMIN_USERNAME, or ADMIN_PASSWORD in environment variables",
    );
  }

  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForLoadState("networkidle");
}

// helper for courier login
export async function courierLogin(
  page: Page,
  email: string,
  password: string,
) {
  const url = process.env.COURIER_URL;
  if (!url) {
    throw new Error("Missing COURIER_URL in environment variables");
  }

  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForLoadState("networkidle", { timeout: 20000 });
}

// helper to navigate to a page
export async function navigateTo(page: Page, menuName: string) {
  const link = page.getByRole("link", { name: menuName });
  await link.waitFor({ state: "visible" });

  await expect(async () => {
    await link.click();
    await expect(page).toHaveURL(new RegExp(menuName.toLowerCase()), {
      timeout: 3000,
    });
  }).toPass({ timeout: 15000 });

  await page.waitForLoadState("domcontentloaded");
}

// helper to switch the language to amharic in the admin dashboard
export async function adminSwitchLanguage(page: Page, language: string) {
  await page.getByRole("button", { name: "Switch language" }).click();
  await page.getByRole("menuitem", { name: language }).click();
  await page.waitForLoadState("networkidle");
}
