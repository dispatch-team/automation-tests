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

// helper for merchant login
export async function merchantLogin(page: Page) {
  const url = process.env.MERCHANT_URL;
  const email = process.env.MERCHANT_EMAIL;
  const password = process.env.MERCHANT_PASSWORD;

  if (!url || !email || !password) {
    throw new Error(
      "Missing MERCHANT_URL, MERCHANT_EMAIL, or MERCHANT_PASSWORD in environment variables",
    );
  }

  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => {
    sessionStorage.removeItem("dispatch_login_attempts_merchant");
  });

  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("textbox", { name: /password/i }).fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();

  try {
    await expect(page).toHaveURL(/\/merchant/, { timeout: 20000 });
  } catch {
    if (await page.getByText(/Too many failed attempts/i).isVisible()) {
      throw new Error(
        "Merchant login locked out (5 failed attempts in this browser — wait 15 minutes or clear session storage).",
      );
    }
    throw new Error(
      `Merchant login failed for ${email}. Check MERCHANT_EMAIL and MERCHANT_PASSWORD in .env.`,
    );
  }

  await expect(page.getByRole("link", { name: "Shipments" })).toBeVisible({
    timeout: 10000,
  });
}

export function getMerchantOrigin(): string {
  const url = process.env.MERCHANT_URL;
  if (!url) {
    throw new Error("Missing MERCHANT_URL in environment variables");
  }
  return new URL(url).origin;
}

export async function gotoMerchantPath(page: Page, path: string) {
  const origin = getMerchantOrigin();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  await page.goto(`${origin}${normalized}`);
  await page.waitForLoadState("domcontentloaded");
}

async function fillAddressAutocomplete(
  page: Page,
  placeholder: RegExp,
  query: string,
) {
  const input = page.getByPlaceholder(placeholder);
  await input.fill(query);
  const suggestion = page.locator("ul button").first();
  try {
    await suggestion.waitFor({ state: "visible", timeout: 10000 });
    await suggestion.click();
  } catch {
    await input.blur();
  }
}

export interface CreateShipmentResult {
  code: string;
  description: string;
}

export async function createShipmentViaUI(
  page: Page,
  options?: { courierNamePattern?: RegExp; description?: string },
): Promise<CreateShipmentResult> {
  const courierPattern = options?.courierNamePattern ?? /slow/i;
  const description =
    options?.description ?? `E2E shipment ${Date.now()}`;

  await gotoMerchantPath(page, "/merchant/shipments/new");
  await expect(page).toHaveURL(/\/merchant\/shipments\/new/, { timeout: 15000 });

  const courierSelect = page.locator('select[name="courier_company_id"]');
  await courierSelect.waitFor({ state: "visible", timeout: 15000 });
  await expect(courierSelect).toBeEnabled({ timeout: 15000 });

  const options_list = courierSelect.locator("option");
  const count = await options_list.count();
  let selected = false;
  for (let i = 0; i < count; i++) {
    const option = options_list.nth(i);
    const text = (await option.textContent()) ?? "";
    const value = await option.getAttribute("value");
    if (value && courierPattern.test(text)) {
      await courierSelect.selectOption(value);
      selected = true;
      break;
    }
  }
  if (!selected) {
    throw new Error(
      `No partner courier matching ${courierPattern}. Add Slow Track as a partner on staging.`,
    );
  }

  await fillAddressAutocomplete(
    page,
    /Search pickup location/i,
    "Bole",
  );
  await fillAddressAutocomplete(
    page,
    /Search destination location/i,
    "Bole",
  );

  await page.getByPlaceholder("Full name").fill("E2E Test Recipient");
  await page.getByPlaceholder("+251911000000").fill("+251911234567");
  await page
    .getByPlaceholder(/What details should the courier know/i)
    .fill(description);
  await page.locator('input[name="weight_kg"]').fill("1");

  await page.getByRole("button", { name: "Review Shipment Details" }).click();
  await expect(
    page.getByRole("heading", { name: "Review Shipment Details" }),
  ).toBeVisible({ timeout: 10000 });

  const createResponsePromise = page.waitForResponse(
    (res) =>
      res.url().includes("/api/shipments") &&
      res.request().method() === "POST" &&
      res.ok(),
  );

  await page.getByRole("button", { name: "Confirm & Book Delivery" }).click();

  const [createResponse] = await Promise.all([
    createResponsePromise,
    expect(
      page.getByRole("heading", { name: "Shipment Created!" }),
    ).toBeVisible({ timeout: 30000 }),
  ]);

  const created = (await createResponse.json()) as { code?: string };
  const code = created.code?.trim() ?? "";
  if (!code) {
    throw new Error("Create shipment API response did not include a tracking code");
  }

  return { code, description };
}

// helper for courier login
export async function courierLogin(
  page: Page,
  email?: string,
  password?: string,
) {
  const url = process.env.COURIER_URL;
  const resolvedEmail = email ?? process.env.COURIER_EMAIL;
  const resolvedPassword = password ?? process.env.COURIER_PASSWORD;

  if (!url || !resolvedEmail || !resolvedPassword) {
    throw new Error(
      "Missing COURIER_URL, COURIER_EMAIL, or COURIER_PASSWORD in environment variables",
    );
  }

  await page.goto(url);
  await page.waitForLoadState("networkidle");
  await page.getByRole("textbox", { name: "Email" }).fill(resolvedEmail);
  await page.getByRole("textbox", { name: "Password" }).fill(resolvedPassword);
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
