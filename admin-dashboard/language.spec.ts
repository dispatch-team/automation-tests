import { test, expect, Page } from "@playwright/test";
import { adminLogin, adminSwitchLanguage } from "../helpers/test-helpers";

async function navigateTo(page: Page, menuName: string) {
  await page.getByRole("link", { name: menuName }).click();
  await page.waitForLoadState("networkidle");
}

test("test language test feature", async ({ page }) => {
  await adminLogin(page);

  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await adminSwitchLanguage(page, "አማ አማርኛ");

  await expect(page.getByRole("heading", { name: "አጠቃላይ እይታ" })).toBeVisible();
  await expect(page.getByRole("link", { name: "ነጋዴዎች" })).toBeVisible();

  await navigateTo(page, "ነጋዴዎች");
  await expect(page.getByRole("heading", { name: "ነጋዴዎች" })).toBeVisible();

  await navigateTo(page, "ኩሪየሮች");
  await expect(page.getByRole("heading", { name: "ኩሪየሮች" })).toBeVisible();

  await navigateTo(page, "ጭነቶች");
  await expect(page.getByRole("heading", { name: "ጭነቶች" })).toBeVisible();
});
